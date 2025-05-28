# app/__init__.py

import os
import warnings
from flask import Flask, jsonify, request
from flask_smorest import Api
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import NotFound, UnprocessableEntity

# potlačíme jen varování o duplicitních schématech
warnings.filterwarnings(
    "ignore",
    "Multiple schemas resolved to the name",
    UserWarning,
    module="apispec.ext.marshmallow.openapi"
)

from .config import config_by_name
from .db import db, migrate

# načteme modely, aby je Alembic/apí-spec viděl
from .models import (
    Zakaznik, VernostniUcet, Rezervace, Stul, Salonek,
    PodnikovaAkce, Objednavka, PolozkaObjednavky, Platba,
    Hodnoceni, PolozkaMenu, PolozkaMenuAlergen,
    JidelniPlan, PolozkaJidelnihoPlanu, Alergen, Notifikace
)

def create_app(config_name=None, config_override=None):
    if not config_name:
        config_name = os.getenv("FLASK_CONFIG", "default")

    app = Flask(__name__)
    app.json.ensure_ascii = False

    # načtení configu (development/testing/production)
    if config_override:
        app.config.from_object(config_override)
    else:
        app.config.from_object(config_by_name[config_name])
    app.config.setdefault("JSON_AS_ASCII", False)

    # init DB + migration
    db.init_app(app)
    migrate.init_app(app, db)

    # init JWT
    JWTManager(app)

    # ─── jediné přidání: v dev módu injektujeme JWT ze .env do všech requestů ───
    if config_name == "development":
        dev_token = os.getenv("DEV_JWT_TOKEN")
        if dev_token:
            @app.before_request
            def _inject_dev_token():
                # pokud klient neposlal vlastní Authorization, doplníme ho
                if not request.headers.get("Authorization"):
                    request.environ["HTTP_AUTHORIZATION"] = f"Bearer {dev_token}"
    # ────────────────────────────────────────────────────────────────────────────

    # init API / Swagger UI (bez dalších změn)
    api = Api(app)
    from .api import api_bp
    from .api.auth import auth_bp
    api.register_blueprint(api_bp)
    api.register_blueprint(auth_bp)

    @app.errorhandler(UnprocessableEntity)
    def handle_validation_error(err):
        data = getattr(err, 'data', None) or {}
        messages = data.get('messages', {})
        return jsonify({
            "status": "Chybný vstup",
            "code": 422,
            "errors": messages
        }), 422

    @app.errorhandler(NotFound)
    def handle_404(err):
        msg = err.description or "Nenalezeno"
        return jsonify({
            "status": "Nenalezeno",
            "code": 404,
            "message": msg
        }), 404

    @app.route("/hello")
    def hello():
        return "Hello, World from Flask!"

    return app
