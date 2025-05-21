# backend/app/api/__init__.py

from . import routes
from flask_smorest import Blueprint

api_bp = Blueprint(
    "api_v1",              # interní jméno blueprintu
    __name__,
    url_prefix="/api/v1",  # URL prefix pro všechny endpointy
    description="API Verze 1"
)

# Naimportujeme routes.py, aby se k tomu blueprintu endpointy přidaly
