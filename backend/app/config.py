# app/config.py

import os
from dotenv import load_dotenv

# načteme .env
BASEDIR = os.path.abspath(os.path.dirname(__file__))
DOTENV_PATH = os.path.join(BASEDIR, "..", ".env")
load_dotenv(DOTENV_PATH, override=True)

class Config:
    JSON_AS_ASCII = False

    SECRET_KEY     = os.environ.get("SECRET_KEY",     "vychozi_slabý_klíč_pro_vývoj")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "tajnyklictoken")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO               = False

    # základní API metadata
    API_TITLE   = "IS Šablona API"
    API_VERSION = "v1"

    # OpenAPI / Swagger UI
    OPENAPI_VERSION         = "3.0.2"
    OPENAPI_URL_PREFIX      = "/api/docs"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL  = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

    # ← securitySchemes pro Bearer token
    OPENAPI_COMPONENTS = {
        "securitySchemes": {
            "bearerAuth": {
                "type":         "http",
                "scheme":       "bearer",
                "bearerFormat": "JWT",
                "description":  "Vlož JWT token jako `Bearer <token>`"
            }
        }
    }
    # ← globální security požadavek
    OPENAPI_SECURITY = [
        {"bearerAuth": []}
    ]

    # ← persistování tokenu v UI
    OPENAPI_SWAGGER_UI_CONFIG = {
        "persistAuthorization": True
    }


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO      = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg://user:password@localhost/dev_db"
    )


class TestingConfig(Config):
    TESTING = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL",
        "sqlite:///:memory:"
    )


class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]


config_by_name = {
    "development": DevelopmentConfig,
    "testing":     TestingConfig,
    "production":  ProductionConfig,
    "default":     DevelopmentConfig,
}
