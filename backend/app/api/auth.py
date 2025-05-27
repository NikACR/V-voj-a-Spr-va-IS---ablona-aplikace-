# app/api/auth.py

from flask.views import MethodView
from flask_smorest import Blueprint, abort
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from ..db import db
from ..models import Zakaznik
from ..schemas import LoginSchema

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login")
class LoginResource(MethodView):
    @auth_bp.arguments(LoginSchema)
    def post(self, data):
        user = db.session.query(Zakaznik).filter_by(email=data["email"]).first()
        if not user or not user.check_password(data["password"]):
            abort(401, message="Neplatné přihlašovací údaje.")
        # identity musí být string, ne int
        access_token = create_access_token(identity=str(user.id_zakaznika))
        return {"access_token": access_token}

@auth_bp.route("/me")
class MeResource(MethodView):
    @jwt_required()
    @auth_bp.response(200)
    def get(self):
        user_id = get_jwt_identity()
        user = db.session.get(Zakaznik, int(user_id))
        if not user:
            abort(404, message="Uživatel nenalezen.")
        return {
            "id": user.id_zakaznika,
            "email": user.email,
            "jmeno": user.jmeno,
            "prijmeni": user.prijmeni
        }
