# app/__init__.py

import os
import warnings
from flask import Flask, jsonify, request
from flask_smorest import Api
from flask_jwt_extended import JWTManager, create_access_token
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

# načteme modely, aby je Alembic/apispec viděl
from .models import (
    Zakaznik, VernostniUcet, Rezervace, Stul, Salonek,
    PodnikovaAkce, Objednavka, PolozkaObjednavky, Platba,
    Hodnoceni, PolozkaMenu, PolozkaMenuAlergen,
    JidelniPlan, PolozkaJidelnihoPlanu, Alergen, Notifikace,
    Role, TokenBlacklist
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

    # init JWT + blacklist callback
    jwt = JWTManager(app)
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload["jti"]
        return db.session.query(TokenBlacklist).filter_by(jti=jti).first() is not None

    # ─── dev‐mode JWT injector ───────────────────────────────────────────────
    # pokud běžíme ve vývoji, automaticky vytvoříme token pro DEV_USER_EMAIL
    if config_name == "development":
        dev_email = os.getenv("DEV_USER_EMAIL")
        dev_password = os.getenv("DEV_USER_PASSWORD")
        @app.before_request
        def _inject_dev_token():
            if not request.headers.get("Authorization") and dev_email and dev_password:
                user = db.session.query(Zakaznik).filter_by(email=dev_email).first()
                if user and user.check_password(dev_password):
                    token = create_access_token(identity=str(user.id_zakaznika))
                    request.environ["HTTP_AUTHORIZATION"] = f"Bearer {token}"
    # ────────────────────────────────────────────────────────────────────────────

    # init API / Swagger UI
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
