from flask import Flask
from flask_smorest import Api
from .config import config_by_name
from .db import db, migrate
import os

# Naimportujte všechny modely, které chcete v shellu používat
from .models import (
    User,
    Table,
    Reservation,
    MenuItem,
    Order,
    OrderItem,
    Review,
    FavoriteDish,
    Promotion,
    Notification,
    LoyaltyHistory,
)


def create_app(config_name=None, config_override=None):
    """Factory funkce pro vytvoření Flask aplikace."""
    if config_name is None:
        config_name = os.getenv("FLASK_CONFIG", "default")

    app = Flask(__name__)

    if config_override:
        app.config.from_object(config_override)
    else:
        app.config.from_object(config_by_name[config_name])

    # Inicializace rozšíření
    db.init_app(app)
    migrate.init_app(app, db)

    # Inicializace Flask-Smorest
    api = Api(app)

    # Registrace Blueprintů
    from .api import api_v1_bp
    api.register_blueprint(api_v1_bp)

    # Shell kontext pro `flask shell`
    @app.shell_context_processor
    def make_shell_context():
        return {
            "db": db,
            # tady všechny modely
            "User": User,
            "Table": Table,
            "Reservation": Reservation,
            "MenuItem": MenuItem,
            "Order": Order,
            "OrderItem": OrderItem,
            "Review": Review,
            "FavoriteDish": FavoriteDish,
            "Promotion": Promotion,
            "Notification": Notification,
            "LoyaltyHistory": LoyaltyHistory,
        }

    @app.route("/hello")
    def hello():
        return "Hello, World from Flask!"

    return app
