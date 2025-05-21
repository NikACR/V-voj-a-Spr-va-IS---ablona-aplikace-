# backend/app/api/routes.py

from flask.views import MethodView
from flask_smorest import abort
from sqlalchemy.exc import IntegrityError

from ..db import db
from ..models import (
    Zakaznik, VernostniUcet, Rezervace, Stul, Salonek,
    PodnikovaAkce, Objednavka, PolozkaObjednavky,
    Platba, Hodnoceni, PolozkaMenu, JidelniPlan,
    PolozkaJidelnihoPlanu, Alergen, Notifikace, PolozkaMenuAlergen
)
from ..schemas import (
    ZakaznikSchema, ZakaznikCreateSchema,
    VernostniUcetSchema, VernostniUcetCreateSchema,
    RezervaceSchema, RezervaceCreateSchema,
    StulSchema, StulCreateSchema,
    SalonekSchema, SalonekCreateSchema,
    PodnikovaAkceSchema, PodnikovaAkceCreateSchema,
    ObjednavkaSchema, ObjednavkaCreateSchema,
    PolozkaObjednavkySchema, PolozkaObjednavkyCreateSchema,
    PlatbaSchema, PlatbaCreateSchema,
    HodnoceniSchema, HodnoceniCreateSchema,
    PolozkaMenuSchema, PolozkaMenuCreateSchema,
    JidelniPlanSchema, JidelniPlanCreateSchema,
    PolozkaJidelnihoPlanuSchema, PolozkaJidelnihoPlanuCreateSchema,
    AlergenSchema, AlergenCreateSchema,
    NotifikaceSchema, NotifikaceCreateSchema,
    PolozkaMenuAlergenSchema, PolozkaMenuAlergenCreateSchema
)
from . import api_bp


def _register_crud(model, schema, create_schema, url_prefix, pk_field):
    @api_bp.route(url_prefix)
    class ListResource(MethodView):
        @api_bp.response(200, schema(many=True))
        def get(self):
            return db.session.scalars(db.select(model)).all()

        @api_bp.arguments(create_schema)
        @api_bp.response(201, schema)
        def post(self, data):
            obj = model(**data)
            try:
                db.session.add(obj)
                db.session.commit()
            except IntegrityError:
                db.session.rollback()
                abort(409, message="Duplicitní nebo neplatný záznam.")
            return obj

    @api_bp.route(f"{url_prefix}/<int:{pk_field}>")
    class ItemResource(MethodView):
        @api_bp.response(200, schema)
        def get(self, **kwargs):
            obj = db.session.get(model, kwargs[pk_field])
            if not obj:
                abort(404, message=f"{model.__name__} nenalezen.")
            return obj

        @api_bp.arguments(schema)
        @api_bp.response(200, schema)
        def put(self, data, **kwargs):
            obj = db.session.get(model, kwargs[pk_field])
            if not obj:
                abort(404, message=f"{model.__name__} nenalezen.")
            for k, v in data.items():
                setattr(obj, k, v)
            db.session.commit()
            return obj

        @api_bp.response(204)
        def delete(self, **kwargs):
            obj = db.session.get(model, kwargs[pk_field])
            if not obj:
                abort(404, message=f"{model.__name__} nenalezen.")
            db.session.delete(obj)
            db.session.commit()
            return ""


# Registrace 15 entit s jednoduchým PK
_register_crud(Zakaznik, ZakaznikSchema, ZakaznikCreateSchema,
               "/zakaznik", "id_zakaznika")
# … tady pokračuj zbylými 14 …
_register_crud(Notifikace, NotifikaceSchema,
               NotifikaceCreateSchema, "/notifikace", "id_notifikace")

# Manuální CRUD pro composite-key entitu PolozkaMenuAlergen
pma_schema = PolozkaMenuAlergenSchema()
pma_schema_list = PolozkaMenuAlergenSchema(many=True)
pma_schema_partial = PolozkaMenuAlergenSchema(partial=True)
pma_schema_create = PolozkaMenuAlergenCreateSchema()


@api_bp.route("/polozkaMenuAlergen")
class PolozkaMenuAlergenList(MethodView):
    @api_bp.response(200, pma_schema_list)
    def get(self):
        return PolozkaMenuAlergen.query.all()

    @api_bp.arguments(pma_schema_create)
    @api_bp.response(201, pma_schema)
    def post(self, data):
        obj = PolozkaMenuAlergen(**data)
        db.session.add(obj)
        db.session.commit()
        return obj


@api_bp.route("/polozkaMenuAlergen/<int:id_menu_polozka>/<int:id_alergenu>")
class PolozkaMenuAlergenResource(MethodView):
    @api_bp.response(200, pma_schema)
    def get(self, id_menu_polozka, id_alergenu):
        return PolozkaMenuAlergen.query.get_or_404((id_menu_polozka, id_alergenu))

    @api_bp.arguments(pma_schema_partial)
    @api_bp.response(200, pma_schema)
    def put(self, data, id_menu_polozka, id_alergenu):
        obj = PolozkaMenuAlergen.query.get_or_404(
            (id_menu_polozka, id_alergenu))
        for k, v in data.items():
            setattr(obj, k, v)
        db.session.commit()
        return obj

    @api_bp.response(204)
    def delete(self, id_menu_polozka, id_alergenu):
        obj = PolozkaMenuAlergen.query.get_or_404(
            (id_menu_polozka, id_alergenu))
        db.session.delete(obj)
        db.session.commit()
        return ""
