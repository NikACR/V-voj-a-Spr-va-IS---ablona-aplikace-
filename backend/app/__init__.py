import os
import warnings
from flask import Flask, jsonify
from flask_smorest import Api
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import NotFound, UnprocessableEntity

# potlačíme jen varování z apispecu o duplicitních schématech
warnings.filterwarnings(
    "ignore",
    "Multiple schemas resolved to the name",
    UserWarning,
    module="apispec.ext.marshmallow.openapi"
)

from .config import config_by_name
from .db import db, migrate

# načteme modely, aby Alembic a apispec viděly metadata
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

    # aby flask.json neposílal \uXXXX, ale přímo UTF-8 znaky
    app.json.ensure_ascii = False

    if config_override:
        app.config.from_object(config_override)
    else:
        app.config.from_object(config_by_name[config_name])

    app.config.setdefault("JSON_AS_ASCII", False)

    db.init_app(app)
    migrate.init_app(app, db)

    # --- inicializace JWT ---
    jwt = JWTManager(app)

    # init API a registrace blueprintů
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
