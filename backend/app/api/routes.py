# app/api/routes.py

from flask.views import MethodView
from flask_smorest import abort
from sqlalchemy.exc import IntegrityError
from datetime import date
from flask_jwt_extended import jwt_required    # ← přidáno

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
from . import api_bp  # náš blueprint

#
# 1) Vlastní CRUD pro Zakaznik, který při POST vytvoří i VernostniUcet
#
@api_bp.route("/zakaznik")
class ZakaznikList(MethodView):
    @jwt_required()                          # ← nyní chráněno
    @api_bp.response(200, ZakaznikSchema(many=True))
    def get(self):
        return db.session.scalars(db.select(Zakaznik)).all()

    @api_bp.arguments(ZakaznikCreateSchema)
    @api_bp.response(201, ZakaznikSchema)
    def post(self, new_data):
        zak = Zakaznik(**new_data)
        try:
            db.session.add(zak)
            db.session.flush()  # aby zak.id_zakaznika byl dostupný
            # vytvoříme mu okamžitý prázdný věrnostní účet
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
    @jwt_required()                          # ← nyní chráněno
    @api_bp.response(200, ZakaznikSchema)
    def get(self, id_zakaznika):
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")
        return zak

    @jwt_required()                          # ← nyní chráněno
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

    @jwt_required()                          # ← nyní chráněno
    @api_bp.response(204)
    def delete(self, id_zakaznika):
        zak = db.session.get(Zakaznik, id_zakaznika)
        if not zak:
            abort(404, message="Zakaznik nenalezen.")
        db.session.delete(zak)
        db.session.commit()
        return ""

#
# 2) Generický register_crud pro zbytek modelů
#    (ostatní endpointy zůstávají veřejné)
#
def register_crud(route_base, model, schema_cls, create_schema_cls, pk_name):
    list_route = f"/{route_base}"
    item_route = f"/{route_base}/<int:{pk_name}>"

    @api_bp.route(list_route)
    class ListView(MethodView):
        @api_bp.response(200, schema_cls(many=True))
        def get(self):
            return db.session.scalars(db.select(model)).all()

        @api_bp.arguments(create_schema_cls)
        @api_bp.response(201, schema_cls)
        def post(self, new_data):
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
        @api_bp.response(200, schema_cls)
        def get(self, **kwargs):
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            return obj

        @api_bp.arguments(schema_cls(partial=True))
        @api_bp.response(200, schema_cls)
        def put(self, data, **kwargs):
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            for k, v in data.items():
                setattr(obj, k, v)
            db.session.commit()
            return obj

        @api_bp.response(204)
        def delete(self, **kwargs):
            obj = db.session.get(model, kwargs[pk_name])
            if not obj:
                abort(404, message=f"{model.__tablename__.capitalize()} nenalezen.")
            db.session.delete(obj)
            db.session.commit()
            return ""

# zaregistrujeme CRUDy
register_crud('ucet',                VernostniUcet,       VernostniUcetSchema,       VernostniUcetCreateSchema,       'id_ucet')
register_crud('stul',                Stul,                StulSchema,                StulCreateSchema,                'id_stul')
register_crud('salonek',             Salonek,             SalonekSchema,             SalonekCreateSchema,             'id_salonek')
register_crud('akce',                PodnikovaAkce,       PodnikovaAkceSchema,       PodnikovaAkceCreateSchema,       'id_akce')
register_crud('objednavka',          Objednavka,          ObjednavkaSchema,          ObjednavkaCreateSchema,          'id_objednavky')
register_crud('polozka-objednavky',  PolozkaObjednavky,   PolozkaObjednavkySchema,   PolozkaObjednavkyCreateSchema,   'id_polozky_obj')
register_crud('platba',              Platba,              PlatbaSchema,              PlatbaCreateSchema,              'id_platba')
register_crud('hodnoceni',           Hodnoceni,           HodnoceniSchema,           HodnoceniCreateSchema,           'id_hodnoceni')
register_crud('menu',                PolozkaMenu,         PolozkaMenuSchema,         PolozkaMenuCreateSchema,         'id_menu_polozka')
register_crud('menu-alergeny',       PolozkaMenuAlergen,  PolozkaMenuAlergenSchema,  PolozkaMenuAlergenCreateSchema,  'id_menu_polozka')
register_crud('plan',                JidelniPlan,         JidelniPlanSchema,         JidelniPlanCreateSchema,         'id_plan')
register_crud('plan-polozka',        PolozkaJidelnihoPlanu, PolozkaJidelnihoPlanuSchema, PolozkaJidelnihoPlanuCreateSchema, 'id_polozka_jid_pl')
register_crud('alergeny',            Alergen,             AlergenSchema,             AlergenCreateSchema,             'id_alergenu')
register_crud('notifikace',          Notifikace,          NotifikaceSchema,          NotifikaceCreateSchema,          'id_notifikace')
register_crud('rezervace',           Rezervace,           RezervaceSchema,           RezervaceCreateSchema,           'id_rezervace')
