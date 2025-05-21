# backend/app/__init__.py

import os
from flask import Flask
from flask_smorest import Api

from .config import config_by_name
from .db import db, migrate

# Import všech modelů, aby je Flask-Migrate “viděl”
from .models import (
    Zakaznik,
    VernostniUcet,
    Rezervace,
    Stul,
    Salonek,
    PodnikovaAkce,
    Objednavka,
    PolozkaObjednavky,
    Platba,
    Hodnoceni,
    PolozkaMenu,
    PolozkaMenuAlergen,
    JidelniPlan,
    PolozkaJidelnihoPlanu,
    Alergen,
    Notifikace
)


def create_app(config_name=None, config_override=None):
    # 1) název konfigurace
    if config_name is None:
        config_name = os.getenv("FLASK_CONFIG", "default")

    # 2) vytvoření Flask-app instance
    app = Flask(__name__)

    # 3) načtení konfigurace (development / testing / production)
    if config_override:
        app.config.from_object(config_override)
    else:
        app.config.from_object(config_by_name[config_name])

    # 4) inicializace rozšíření
    db.init_app(app)
    migrate.init_app(app, db)

    # 5) inicializace Swagger/OpenAPI + unikátní názvy schémat
    api = Api(
        app,
        spec_kwargs={
            "schema_name_resolver": lambda schema: (
                schema.__class__.__name__
                .replace("Schema", "")
                + ("List" if getattr(schema, "many",   False) else "")
                + ("Partial" if getattr(schema, "partial", False) else "")
            )
        }
    )

    # 6) registrace hlavního blueprintu pro API v1
    from .api import api_bp
    api.register_blueprint(api_bp)

    # 7) shell-context pro flask shell (flask shell → import všeho)
    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            "Zakaznik":           Zakaznik,
            "VernostniUcet":      VernostniUcet,
            "Rezervace":          Rezervace,
            "Stul":               Stul,
            "Salonek":            Salonek,
            "PodnikovaAkce":      PodnikovaAkce,
            "Objednavka":         Objednavka,
            "PolozkaObjednavky":  PolozkaObjednavky,
            "Platba":             Platba,
            "Hodnoceni":          Hodnoceni,
            "PolozkaMenu":        PolozkaMenu,
            "PolozkaMenuAlergen": PolozkaMenuAlergen,
            "JidelniPlan":        JidelniPlan,
            "PolozkaJidelnihoPlanu": PolozkaJidelnihoPlanu,
            "Alergen":            Alergen,
            "Notifikace":         Notifikace
        }

    # 8) jednoduchý testovací endpoint
    @app.route("/hello")
    def hello():
        return "Hello, World from Flask!"

    # 9) vracíme finální aplikaci
    return app
