# app/config.py

# modul pro práci s OS a proměnnými prostředí
import os
from dotenv import load_dotenv                # funkce pro načtení .env souboru

# ── Sestavení cesty k .env ────────────────────────────────────────────────────
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DOTENV_PATH = os.path.join(BASE_DIR, "..", ".env")

# ── Načteme proměnné z .env do os.environ (všechny proměnné), přepišeme i stávající (override=True) ──
load_dotenv(DOTENV_PATH, override=True)


class Config:
    """Základní nastavení společné pro všechny režimy."""

    JSON_AS_ASCII = False
    #   False = povolíme české znaky v JSON odpovědích (nebudou eskapovány)

    SECRET_KEY = os.environ.get(
        "SECRET_KEY",
        "vychozi_slabý_klíč_pro_vývoj"
    )
    #   klíč pro Flask session, CSRF tokeny, cookies…

    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY",
        "tajnyklictoken"
    )
    #   klíč, kterým se podepisují a ověřují JWT tokeny

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    #   vypíná sledování změn ORM → lepší výkon, méně varování

    SQLALCHEMY_ECHO = False
    #   False = nevypisovat raw SQL dotazy do konzole
    #   ORM (Object-Relational Mapper) automaticky překládá Python objekty
    #   na „surové“ SQL dotazy, které by bez ORM psal(a) ručně.

    # ── Metadata API pro Swagger/OpenAPI ────────────────────────────────
    API_TITLE = "Informační Systém REST API"
    API_VERSION = "v1"

    # ── Cesty a zdroje pro Swagger UI ─────────────────────────────────
    OPENAPI_VERSION = "3.0.2"
    OPENAPI_URL_PREFIX = "/api/docs"
    OPENAPI_SWAGGER_UI_PATH = "/swagger"
    OPENAPI_SWAGGER_UI_URL = (
        "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"
    )

    # ── Definice zabezpečení v dokumentaci ───────────────────────────────
    OPENAPI_COMPONENTS = {
        "securitySchemes": {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": (
                    "Vlož JWT ve tvaru "
                    "`Bearer <váš_token>`"
                )
            }
        }
    }
    # vyžadovat Bearer JWT na všech endpointů
    OPENAPI_SECURITY = [{"bearerAuth": []}]

    OPENAPI_SWAGGER_UI_CONFIG = {
        "persistAuthorization": True
    }
    #   v Swagger UI si token uložíme a nemusíme ho zadávat znovu

    # ── [NOVÉ] Specifikujeme, aby Swagger UI automaticky vědělo o BearerAuth:
    API_SPEC_OPTIONS = {
        "security": [{"bearerAuth": []}],
        "components": {
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT",
                    "description": "Vlož JWT ve tvaru `Bearer <váš_token>`"
                }
            }
        }
    }


class DevelopmentConfig(Config):
    """Nastavení pro vývojové prostředí."""

    DEBUG = True                             # zapne auto-reload a detailní chyby
    SQLALCHEMY_ECHO = True                   # True = vypisovat raw SQL pro ladění
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg://user:heslo@localhost/dev_db"
    )
    #   URI pro vývojovou DB


class TestingConfig(Config):
    """Nastavení pro testovací běh."""

    TESTING = True                           # zapne testovací režim Flaska
    WTF_CSRF_ENABLED = False                 # vypne CSRF ochranu v testech
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL",
        "sqlite:///:memory:"
    )
    #   in-memory SQLite pro rychlé testy


class ProductionConfig(Config):
    """Nastavení pro produkční prostředí."""

    DEBUG = False
    TESTING = False
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    #   produkční DB URI (musí být definováno v .env)


# ── Mapa názvů režimů na třídy konfigurace ──────────────────────────────────
config_by_name = {
    "development": DevelopmentConfig,
    "testing":     TestingConfig,
    "production":  ProductionConfig,
    "default":     DevelopmentConfig
}


"""
Principy a důležité body
------------------------
1. .env načítání
   - load_dotenv(DOTENV_PATH, override=True): načte proměnné z .env a přepíše stávající v os.environ.

2. Třída Config
   - Základní parametry pro všechny režimy (development, testing, production).
   - SECRET_KEY: pro Flask session a CSRF.
   - JWT_SECRET_KEY: pro podepisování/verifikaci JWT tokenů.
   - SQLALCHEMY_TRACK_MODIFICATIONS = False: vypne zbytečné sledování ORM změn.
   - SQLALCHEMY_ECHO: logování SQL dotazů, v produkci False, ve vývoji True.

3. OpenAPI/Swagger nastavení
   - API_TITLE, API_VERSION: metadata API.
   - OPENAPI_URL_PREFIX, OPENAPI_SWAGGER_UI_PATH, OPENAPI_SWAGGER_UI_URL: cesty a zdroj pro UI.
   - OPENAPI_COMPONENTS + OPENAPI_SECURITY: definice BearerAuth v dokumentaci.
   - persistAuthorization: token v UI zůstane uložen.

4. Konkrétní režimy dědí z Config:
   - DevelopmentConfig: DEBUG=True, SQLALCHEMY_ECHO=True, URI z env DATABASE_URL (fallback na lokální).
   - TestingConfig: TESTING=True, WTF_CSRF_ENABLED=False, in-memory SQLite pro izolované testy.
   - ProductionConfig: DEBUG=False, TESTING=False, vyžaduje env DATABASE_URL (KeyError při chybě).

"""