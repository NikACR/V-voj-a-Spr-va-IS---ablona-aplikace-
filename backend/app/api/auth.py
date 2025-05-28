# app/api/auth.py


from flask.views import MethodView                      # class-based views
# Blueprint a abort pro JSON chyby
from flask_smorest import Blueprint, abort
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from ..db import db                                     # SQLAlchemy session
from ..models import Zakaznik                           # model zákazníka
from ..schemas import LoginSchema                        # schema pro login vstup

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/login")
class LoginResource(MethodView):
    """
    POST /api/auth/login
    - @arguments(LoginSchema): validuje email (str) a password (str, load_only)
    - Najde Zakaznik podle emailu, pak check_password(raw)
    - Pokud neplatné, abort(401)
    - Jinak create_access_token(identity=str(id_zakaznika))
    - Vrátí JSON { "access_token": token }
    """
    @auth_bp.arguments(LoginSchema)
    def post(self, data):
        # data = ověřený dict {"email": ..., "password": ...}
        user = db.session.query(Zakaznik).filter_by(
            email=data["email"]).first()
        if not user or not user.check_password(data["password"]):
            abort(401, message="Neplatné přihlašovací údaje.")
        # identity vždy string (JWT požaduje str)
        access_token = create_access_token(identity=str(user.id_zakaznika))
        return {"access_token": access_token}


@auth_bp.route("/me")
class MeResource(MethodView):
    """
    GET /api/auth/me
    - @jwt_required(): ochrana JWT tokenem
    - get_jwt_identity(): získá identity (string ID zákazníka)
    - Načte Zakaznik podle ID, pokud neexistuje abort(404)
    - Vrátí JSON s id, email, jmeno, prijmeni
    """
    @jwt_required()
    @auth_bp.response(200)
    def get(self):
        user_id = get_jwt_identity()                   # string s id_zakaznika
        user = db.session.get(Zakaznik, int(user_id))
        if not user:
            abort(404, message="Uživatel nenalezen.")
        return {
            "id": user.id_zakaznika,
            "email": user.email,
            "jmeno": user.jmeno,
            "prijmeni": user.prijmeni
        }


"""
Principy a důležité body
------------------------
1. Přihlášení (Login)
   - POST /api/auth/login
   - @auth_bp.arguments(LoginSchema): validuje email a password
   - Ověříme uživatele v DB a zkontrolujeme hash hesla (check_password)
   - Vytvoříme JWT token pomocí create_access_token(identity)
   - identity je vždy string (proto str(user.id_zakaznika))
   - Vrací JSON { "access_token": "<token>" }

2. Ověření identity (Me)
   - GET /api/auth/me
   - @jwt_required(): ochrana JWT tokenem
   - get_jwt_identity(): vrátí identity (string ID)
   - Načteme Zakaznik podle ID, vrátíme základní data
   - Pokud uživatel neexistuje, abort(404)
"""
