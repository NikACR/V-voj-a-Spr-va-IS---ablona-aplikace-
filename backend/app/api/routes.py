# app/api/routes.py

"""
Principy a důležité body
------------------------
1. JWT autorizace (@jwt_required)
   - Každý chráněný endpoint vyžaduje platný JWT token v hlavičce
     Authorization: Bearer <token>.
   - Token se získá přes /api/auth/login a obsahuje zakódované identity
     (ID zákazníka) a pole roles.
   - Pokud token chybí nebo je neplatný, flask-jwt-extended vrátí 401 Unauthorized.

2. Validace a serializace (@api_bp.arguments, @api_bp.response)
   - @arguments(SomeSchema): validuje vstupní JSON podle zadaného schématu;
     výsledná data jako dict se předávají metodě.
   - @response(status, SomeSchema): objekt vrácený metodou se serializuje
     dle schématu a odešle s příslušným HTTP statusem.

3. Chybové stavy (abort)
   - abort(code, message="...") vrátí JSON
     { "message": "...", "code": code } a odpovídající HTTP status.
   - Používá se např. pro 404 Not Found, 409 Conflict (duplicitní záznam),
     401 Unauthorized apod.

4. Role-based Access Control
   - Každý endpoint si vyžaduje vhodnou roli: "user", "staff", "admin".
   - Role se načítají z claimu get_jwt()["roles"].

5. Transakce a IntegrityError
   - V POST/PUT metodách může db.session.commit() vyhodit IntegrityError
     (např. unikátní omezení, cizí klíč).
   - Zachytíme výjimku, zavoláme rollback() (vrátí změny) a vrátíme 409 Conflict.

6. db.session.flush() vs db.session.commit()
   - flush(): zapíše změny do DB, ale neukončí transakci → PK je dostupné
     (např. id_zakaznika) před commit().
   - commit(): uloží a ukončí transakci.

7. Generický register_crud
   - Snižuje duplicitu: automaticky vytváří GET/POST/PUT/DELETE pro libovolný model.
   - Stačí zavolat register_crud(route_base, model, schema, create_schema, pk_name).
"""

from functools import wraps
from flask.views import MethodView
from flask_smorest import abort
from sqlalchemy.exc import IntegrityError
from datetime import date
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from ..db import db
from ..models import (
    Zakaznik, VernostniUcet, Stul, Salonek, PodnikovaAkce,
    Objednavka, PolozkaObjednavky, Platba, Hodnoceni,
    PolozkaMenu, PolozkaMenuAlergen, JidelniPlan,
    PolozkaJidelnihoPlanu, Alergen, Notifikace, Rezervace
)
from ..schemas import (
    ZakaznikSchema, ZakaznikCreateSchema,
    VernostniUcetSchema, VernostniUcetCreateSchema,
    StulSchema, StulCreateSchema,
    SalonekSchema, SalonekCreateSchema,
    PodnikovaAkceSchema, PodnikovaAkceCreateSchema,
    ObjednavkaSchema, ObjednavkaCreateSchema,
    PolozkaObjednavkySchema, PolozkaObjednavkyCreateSchema,
    PlatbaSchema, PlatbaCreateSchema,
    HodnoceniSchema, HodnoceniCreateSchema,
    PolozkaMenuSchema, PolozkaMenuCreateSchema,
    PolozkaMenuAlergenSchema, PolozkaMenuAlergenCreateSchema,
    JidelniPlanSchema, JidelniPlanCreateSchema,
    PolozkaJidelnihoPlanuSchema, PolozkaJidelnihoPlanuCreateSchema,
    AlergenSchema, AlergenCreateSchema,
    NotifikaceSchema, NotifikaceCreateSchema,
    RezervaceSchema, RezervaceCreateSchema
)
from . import api_bp

# ──────────────────────────────────────────────────────────────────────────────
# Dekorátor pro omezení přístupu: vlastní záznam nebo staff/admin
# ──────────────────────────────────────────────────────────────────────────────
def must_be_self_or_admin(param_name="id_zakaznika"):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            current_id = int(get_jwt_identity())
            roles = set(get_jwt().get("roles", []))
            target_id = int(kwargs.get(param_name))
            # staff může stejně jako admin přistupovat ke všem záznamům
            if current_id != target_id and not roles.intersection({"staff", "admin"}):
                abort(403, message="Nemáte oprávnění.")
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# ──────────────────────────────────────────────────────────────────────────────
# 1) CRUD PRO ZÁKAZNÍKA S ROLE-CHECKEM
# ──────────────────────────────────────────────────────────────────────────────

@api_bp.route("/zakaznik")
class ZakaznikList(MethodView):
    """
    GET /api/zakaznik:
      - @jwt_required(): vyžaduje validní JWT token
      - povoleno staff i admin
    POST /api/zakaznik:
      - povoleno staff i admin
    """
    @jwt_required()
    @api_bp.response(200, ZakaznikSchema(many=True))
    def get(self):
        roles = set(get_jwt().get("roles", []))
        if not roles.intersection({"staff", "admin"}):
            abort(403, message="Nemáte oprávnění zobrazit všechny zákazníky.")
        return db.session.scalars(db.select(Zakaznik)).all()

    @jwt_required()
    @api_bp.arguments(ZakaznikCreateSchema)
    @api_bp.response(201, ZakaznikSchema)
    def post(self, new_data):
        roles = set(get_jwt().get("roles", []))
        if not roles.intersection({"staff", "admin"}):
            abort(403, message="Nemáte oprávnění vytvářet zákazníky.")
        zak = Zakaznik(**new_data)
        try:
            db.session.add(zak)
            db.session.flush()
            ucet = VernostniUcet(
                body=0,
                datum_zalozeni=date.today(),
                zakaznik=zak
            )
            db.session.add(ucet)
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            abort(409, message="Duplicitní nebo neplatný záznam.")
        return zak

@api_bp.route("/zakaznik/<int:id_zakaznika>")
class ZakaznikItem(MethodView):
    """
    GET    → vlastní záznam, staff, admin
    PUT    → vlastní záznam nebo staff/admin
    DELETE → vlastní záznam nebo staff/admin
    """
    @jwt_required()
    @api_bp.response(200, ZakaznikSchema)
    def get(self, id_zakaznika):
        current_id = int(get_jwt_identity())
        roles = set(get_jwt().get("roles", []))
        if current_id != id_zakaznika and not roles.intersection({"staff", "admin"}):
            abort(403, message="Nemáte oprávnění zobrazit tohoto zákazníka.")
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")
        return zak

    @jwt_required()
    @must_be_self_or_admin("id_zakaznika")
    @api_bp.arguments(ZakaznikSchema(partial=True))
    @api_bp.response(200, ZakaznikSchema)
    def put(self, data, id_zakaznika):
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")
        for k, v in data.items():
            setattr(zak, k, v)
        db.session.commit()
        return zak

    @jwt_required()
    @must_be_self_or_admin("id_zakaznika")
    @api_bp.response(204)
    def delete(self, id_zakaznika):
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")
        db.session.delete(zak)
        db.session.commit()
        return ""

# ──────────────────────────────────────────────────────────────────────────────
# 2) GENERICKÝ register_crud S RBAC (STAFF MÁ TEĎ PLNÁ PRÁVA)
# ──────────────────────────────────────────────────────────────────────────────

def register_crud(
    route_base,
    model,
    schema_cls,
    create_schema_cls,
    pk_name,
    roles_list=("staff", "admin"),
    roles_create=("staff", "admin"),
    roles_item_get=("staff", "admin"),
    roles_update=("staff", "admin"),
    roles_delete=("staff", "admin")
):
    list_route = f"/{route_base}"
    item_route = f"/{route_base}/<int:{pk_name}>"

    def check_roles(allowed):
        roles = set(get_jwt().get("roles", []))
        if not roles.intersection(allowed):
            abort(403, message="Nemáte oprávnění.")

    @api_bp.route(list_route)
    class ListView(MethodView):
        @jwt_required()
        @api_bp.response(200, schema_cls(many=True))
        def get(self):
            check_roles(roles_list)
            return db.session.scalars(db.select(model)).all()

        @jwt_required()
        @api_bp.arguments(create_schema_cls)
        @api_bp.response(201, schema_cls)
        def post(self, new_data):
            check_roles(roles_create)
            obj = model(**new_data)
            try:
                db.session.add(obj)
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                abort(409, message="Duplicitní nebo neplatný záznam.")
            return obj

    @api_bp.route(item_route)
    class ItemView(MethodView):
        @jwt_required()
        @api_bp.response(200, schema_cls)
        def get(self, **kwargs):
            check_roles(roles_item_get)
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            return obj

        @jwt_required()
        @api_bp.arguments(schema_cls(partial=True))
        @api_bp.response(200, schema_cls)
        def put(self, data, **kwargs):
            check_roles(roles_update)
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            for k, v in data.items():
                setattr(obj, k, v)
            db.session.commit()
            return obj

        @jwt_required()
        @api_bp.response(204)
        def delete(self, **kwargs):
            check_roles(roles_delete)
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            db.session.delete(obj)
            db.session.commit()
            return ""

# ──────────────────────────────────────────────────────────────────────────────
# 3) Registrace CRUD endpointů pro zbývající entity
# ──────────────────────────────────────────────────────────────────────────────

register_crud('ucet',               VernostniUcet,       VernostniUcetSchema,       VernostniUcetCreateSchema,       'id_ucet')
register_crud('stul',               Stul,                StulSchema,                StulCreateSchema,                'id_stul')
register_crud('salonek',            Salonek,             SalonekSchema,             SalonekCreateSchema,             'id_salonek')
register_crud('akce',               PodnikovaAkce,       PodnikovaAkceSchema,       PodnikovaAkceCreateSchema,       'id_akce')
register_crud('objednavka',         Objednavka,          ObjednavkaSchema,          ObjednavkaCreateSchema,          'id_objednavky')
register_crud('polozka-objednavky', PolozkaObjednavky,   PolozkaObjednavkySchema,   PolozkaObjednavkyCreateSchema,   'id_polozky_obj')
register_crud('platba',             Platba,              PlatbaSchema,              PlatbaCreateSchema,              'id_platba')
register_crud('hodnoceni',          Hodnoceni,           HodnoceniSchema,           HodnoceniCreateSchema,           'id_hodnoceni')
register_crud('menu',               PolozkaMenu,         PolozkaMenuSchema,         PolozkaMenuCreateSchema,         'id_menu_polozka')
register_crud('menu-alergeny',      PolozkaMenuAlergen,  PolozkaMenuAlergenSchema,  PolozkaMenuAlergenCreateSchema,  'id_menu_polozka')
register_crud('plan',               JidelniPlan,         JidelniPlanSchema,         JidelniPlanCreateSchema,         'id_plan')
register_crud('plan-polozka',       PolozkaJidelnihoPlanu, PolozkaJidelnihoPlanuSchema, PolozkaJidelnihoPlanuCreateSchema, 'id_polozka_jid_pl')
register_crud('alergeny',           Alergen,             AlergenSchema,             AlergenCreateSchema,             'id_alergenu')
register_crud('notifikace',         Notifikace,          NotifikaceSchema,          NotifikaceCreateSchema,          'id_notifikace')
register_crud('rezervace',          Rezervace,           RezervaceSchema,           RezervaceCreateSchema,           'id_rezervace')