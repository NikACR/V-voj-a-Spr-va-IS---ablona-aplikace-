import os
from dotenv import load_dotenv

# zjistíme, kde je tento soubor, a skočíme o adresář výš do kořene projektu
BASEDIR = os.path.abspath(os.path.dirname(__file__))
DOTENV_PATH = os.path.join(BASEDIR, "..", ".env")

# načteme .env a přepíšeme všechny proměnné prostředí i,
# pokud už byly exportované v shellu
load_dotenv(DOTENV_PATH, override=True)

class Config:
    """Základní konfigurace."""

    # Diakritiku v JSON vypisujeme přímo, nevytváříme unicode eskapy
    JSON_AS_ASCII = False

    SECRET_KEY     = os.environ.get("SECRET_KEY", "vychozi_slabý_klíč_pro_vývoj")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "jwt_tajny_klic")  # nový řádek

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO              = False

    # konfigurace pro Flask-Smorest / OpenAPI
    API_TITLE = "IS Šablona API"
    API_VERSION = "v1"
    OPENAPI_VERSION = "3.0.2"
    OPENAPI_URL_PREFIX = "/api/docs"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True
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
    "testing":    TestingConfig,
    "production": ProductionConfig,
    "default":    DevelopmentConfig,
}
