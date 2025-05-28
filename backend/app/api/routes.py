# app/api/routes.py

"""
Principy a důležité body
------------------------
1. JWT autorizace (@jwt_required)
   - Každý chráněný endpoint vyžaduje platný JWT token v hlavičce
     Authorization: Bearer <token>.
   - Token se získá přes /api/auth/login a obsahuje zakódované identity
     (ID zákazníka).
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

4. Transakce a IntegrityError
   - V POST/PUT metodách může db.session.commit() vyhodit IntegrityError
     (např. unikátní omezení, cizí klíč).
   - Zachytíme výjimku, zavoláme rollback() (vrátí změny) a vrátíme 409 Conflict.

5. db.session.flush() vs db.session.commit()
   - flush(): zapíše změny do DB, ale neukončí transakci → PK je dostupné
     (např. id_zakaznika) před commit().
   - commit(): uloží a ukončí transakci.

6. Generický register_crud
   - Snižuje duplicitu: automaticky vytváří GET/POST/PUT/DELETE pro libovolný model.
   - Stačí zavolat register_crud(route_base, model, schema, create_schema, pk_name).
"""

from flask.views import MethodView                       # Class-based views
from flask_smorest import abort                          # Jednoduché JSON chybové odpovědi
from sqlalchemy.exc import IntegrityError                # Zachycení DB chyb
from datetime import date                                # Práce s datem
from flask_jwt_extended import jwt_required              # Dekorátor JWT ochrany

from ..db import db                                      # SQLAlchemy session + ORM
from ..models import (                                   # Import všech entit
    Zakaznik, VernostniUcet, Stul, Salonek, PodnikovaAkce,
    Objednavka, PolozkaObjednavky, Platba, Hodnoceni,
    PolozkaMenu, PolozkaMenuAlergen, JidelniPlan,
    PolozkaJidelnihoPlanu, Alergen, Notifikace, Rezervace
)
from ..schemas import (                                  # Příslušná schémata
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
from . import api_bp                                     # Blueprint (url_prefix="/api")


# ──────────────────────────────────────────────────────────────────────────────
# 1) CRUD PRO ZÁKAZNÍKA S AUTOMATICKÝM VYTVOŘENÍM VĚRNOSTNÍHO ÚČTU
# ──────────────────────────────────────────────────────────────────────────────

@api_bp.route("/zakaznik")
class ZakaznikList(MethodView):
    """
    GET /api/zakaznik:
      - @jwt_required(): vyžaduje validní JWT token
      - vrací seznam ZakaznikSchema(many=True)
    POST /api/zakaznik:
      - @arguments(ZakaznikCreateSchema): validuje jmeno, prijmeni, email, password
      - load_only=True u password: heslo přijmeme, ale nevrátíme
      - flush(): zaregistruje Zakaznik, získáme id_zakaznika
      - commit(): uloží i nový VernostniUcet
      - IntegrityError → rollback() + abort(409)
    """
    @jwt_required()  # Vyžaduje platný JWT token v hlavičce Authorization: Bearer <token>
    @api_bp.response(200, ZakaznikSchema(many=True))
    def get(self):
        # Vracím všechny zákazníky (ORM: SELECT * FROM zakaznik)
        return db.session.scalars(db.select(Zakaznik)).all()

    @api_bp.arguments(ZakaznikCreateSchema)  # Validuje jméno, příjmení, email a heslo
    @api_bp.response(201, ZakaznikSchema)
    def post(self, new_data):
        # new_data = ověřená data (dict)
        zak = Zakaznik(**new_data)            # Vytvoří objekt Zakaznik
        try:
            db.session.add(zak)               # Přidá do transakce
            db.session.flush()                # Provede INSERT, ale necommitne—získáme id_zakaznika
            ucet = VernostniUcet(
                body=0,                       # Výchozí body
                datum_zalozeni=date.today(), # Dnešní datum
                zakaznik=zak                 # Propojení se zákazníkem
            )
            db.session.add(ucet)             # Přidá účet
            db.session.commit()              # Uloží oba záznamy najednou
        except IntegrityError:
            db.session.rollback()            # Vrátí změny, pokud selže (např. duplicitní email)
            abort(409, message="Duplicitní nebo neplatný záznam.")
        return zak                            # Vrací nového zákazníka jako JSON


@api_bp.route("/zakaznik/<int:id_zakaznika>")
class ZakaznikItem(MethodView):
    """
    GET    → načte Zakaznik podle id_zakaznika (404, pokud neexistuje)
    PUT    → @arguments(ZakaznikSchema(partial=True)): částečná aktualizace
    DELETE → smaže Zakaznik, vrátí 204 No Content
    """
    @jwt_required()  # Vyžaduje platný JWT token v hlavičce Authorization: Bearer <token>
    @api_bp.response(200, ZakaznikSchema)
    def get(self, id_zakaznika):
        # Načítá jednoho zákazníka podle jeho ID (ORM: SELECT * FROM zakaznik WHERE id_zakaznika = …)
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")  # 404, pokud neexistuje
        return zak

    @jwt_required()  # Vyžaduje platný JWT token
    @api_bp.arguments(ZakaznikSchema(partial=True))  # Validuje zaslaná pole, partial=True dovolí částečnou aktualizaci
    @api_bp.response(200, ZakaznikSchema)
    def put(self, data, id_zakaznika):
        # data = ověřená část dat pro aktualizaci
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")
        for k, v in data.items():
            setattr(zak, k, v)  # Aktualizuje každé zaslané pole
        db.session.commit()     # Uloží změny do DB
        return zak

    @jwt_required()  # Vyžaduje platný JWT token
    @api_bp.response(204)
    def delete(self, id_zakaznika):
        # Smaže zákazníka s daným ID
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")
        db.session.delete(zak)  # Označí pro smazání
        db.session.commit()      # Provede DELETE
        return ""                # 204 No Content


# ──────────────────────────────────────────────────────────────────────────────
# 2) GENERICKÝ register_crud
# ──────────────────────────────────────────────────────────────────────────────

def register_crud(route_base, model, schema_cls, create_schema_cls, pk_name):
    """
    Automaticky vygeneruje dva endpointy (ListView a ItemView) pro CRUD operace nad libovolným modelem.

    Parametry:
      - route_base       (str): základem URL (např. 'stul' → '/stul' a '/stul/<int:id_stul>')
      - model            (db.Model): SQLAlchemy třída, nad kterou chceme CRUD
      - schema_cls       (Schema): Marshmallow schema pro serializaci GET/PUT výstupů
      - create_schema_cls(Schema): Marshmallow schema pro validaci POST vstupů
      - pk_name          (str): název URL parametru / pole s primárním klíčem (např. 'id_stul')
    """
    list_route = f"/{route_base}"                     # např. "/stul"
    item_route = f"/{route_base}/<int:{pk_name}>"     # např. "/stul/<int:id_stul>"

    @api_bp.route(list_route)
    class ListView(MethodView):
        @api_bp.response(200, schema_cls(many=True))
        def get(self):
            # Vrací všechny záznamy modelu (ORM: SELECT * FROM <table>)
            return db.session.scalars(db.select(model)).all()

        @api_bp.arguments(create_schema_cls)  # Validuje vstupní data podle create_schema_cls
        @api_bp.response(201, schema_cls)
        def post(self, new_data):
            # new_data = ověřená data (dict)
            obj = model(**new_data)            # Vytvoří instanci modelu
            try:
                db.session.add(obj)            # Přidá do transakce
                db.session.commit()            # Uloží nový záznam
            except IntegrityError:
                db.session.rollback()          # Zruší transakci při konfliktu
                abort(409, message="Duplicitní nebo neplatný záznam.")
            return obj  # Vrací nově vytvořený objekt

    @api_bp.route(item_route)
    class ItemView(MethodView):
        @api_bp.response(200, schema_cls)
        def get(self, **kwargs):
            # Načte jeden záznam podle primárního klíče
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            return obj

        @api_bp.arguments(schema_cls(partial=True))  # Validuje a umožňuje částečnou aktualizaci
        @api_bp.response(200, schema_cls)
        def put(self, data, **kwargs):
            # Aktualizuje záznam
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            for k, v in data.items():
                setattr(obj, k, v)  # Nastaví novou hodnotu každého pole
            db.session.commit()    # Uloží změny
            return obj

        @api_bp.response(204)
        def delete(self, **kwargs):
            # Smaže záznam
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            db.session.delete(obj)
            db.session.commit()
            return ""  # 204 No Content


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
