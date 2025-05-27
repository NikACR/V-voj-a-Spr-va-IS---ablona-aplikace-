# app/models.py

from .db import db
from sqlalchemy import CheckConstraint
from werkzeug.security import generate_password_hash, check_password_hash

class Zakaznik(db.Model):
    __tablename__ = "zakaznik"
    id_zakaznika = db.Column(db.Integer, primary_key=True)
    jmeno        = db.Column(db.String(50), nullable=False)
    prijmeni     = db.Column(db.String(50), nullable=False)
    telefon      = db.Column(db.String(20), nullable=True)
    email        = db.Column(db.String(100), nullable=True, unique=True)
    _password    = db.Column(
        "password",
        db.String(255),          # prodlouženo z 128 na 255 znaků
        nullable=False,
        server_default=""        # výchozí prázdný řetězec pro existující záznamy
    )

    ucet       = db.relationship(
        "VernostniUcet",
        back_populates="zakaznik",
        uselist=False,
        cascade="all, delete-orphan"
    )
    rezervace  = db.relationship("Rezervace", back_populates="zakaznik", lazy="dynamic")
    objednavky = db.relationship("Objednavka", back_populates="zakaznik", lazy="dynamic")
    hodnoceni  = db.relationship("Hodnoceni", back_populates="zakaznik", lazy="dynamic")

    def __repr__(self):
        return f"<Zakaznik {self.jmeno} {self.prijmeni}>"

    @property
    def password(self):
        raise AttributeError("Heslo nelze číst v čistém textu.")

    @password.setter
    def password(self, raw_password: str):
        self._password = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self._password, raw_password)


class VernostniUcet(db.Model):
    __tablename__ = "vernostni_ucet"
    id_ucet        = db.Column(db.Integer, primary_key=True)
    body           = db.Column(db.Integer, default=0)
    datum_zalozeni = db.Column(db.Date, nullable=False)
    id_zakaznika   = db.Column(
        db.Integer,
        db.ForeignKey("zakaznik.id_zakaznika", ondelete="CASCADE"),
        nullable=False
    )

    zakaznik = db.relationship("Zakaznik", back_populates="ucet")

    def __repr__(self):
        return f"<VernostniUcet {self.id_ucet} body={self.body}>"


class Rezervace(db.Model):
    __tablename__ = "rezervace"
    __table_args__ = (
        CheckConstraint(
            "(id_stul IS NOT NULL) OR (id_salonek IS NOT NULL)",
            name="chk_rezervace_misto"
        ),
    )

    id_rezervace   = db.Column(db.Integer, primary_key=True)
    datum_cas      = db.Column(db.DateTime, nullable=False)
    pocet_osob     = db.Column(db.Integer, nullable=False)
    stav_rezervace = db.Column(db.String(20))
    sleva          = db.Column(db.Numeric(5, 2))
    id_zakaznika   = db.Column(
        db.Integer,
        db.ForeignKey("zakaznik.id_zakaznika", ondelete="CASCADE"),
        nullable=False
    )
    id_stul        = db.Column(db.Integer, db.ForeignKey("stul.id_stul"), nullable=True)
    id_salonek     = db.Column(db.Integer, db.ForeignKey("salonek.id_salonek"), nullable=True)

    zakaznik   = db.relationship("Zakaznik", back_populates="rezervace")
    stul       = db.relationship("Stul", back_populates="rezervace")
    salonek    = db.relationship("Salonek", back_populates="rezervace")
    notifikace = db.relationship("Notifikace", back_populates="rezervace", lazy="dynamic")

    def __repr__(self):
        return f"<Rezervace {self.id_rezervace} {self.datum_cas}>"


class Stul(db.Model):
    __tablename__ = "stul"
    id_stul   = db.Column(db.Integer, primary_key=True)
    cislo     = db.Column(db.Integer, nullable=False, unique=True)
    kapacita  = db.Column(db.Integer, nullable=False)
    popis     = db.Column(db.Text)

    rezervace = db.relationship("Rezervace", back_populates="stul", lazy="dynamic")

    def __repr__(self):
        return f"<Stul {self.cislo} cap={self.kapacita}>"


class Salonek(db.Model):
    __tablename__ = "salonek"
    id_salonek = db.Column(db.Integer, primary_key=True)
    nazev      = db.Column(db.String(100), nullable=False)
    kapacita   = db.Column(db.Integer, nullable=False)
    popis      = db.Column(db.Text)

    rezervace = db.relationship("Rezervace", back_populates="salonek", lazy="dynamic")
    akce      = db.relationship("PodnikovaAkce", back_populates="salonek", lazy="dynamic")

    def __repr__(self):
        return f"<Salonek {self.nazev} cap={self.kapacita}>"


class PodnikovaAkce(db.Model):
    __tablename__ = "podnikova_akce"
    id_akce    = db.Column(db.Integer, primary_key=True)
    nazev      = db.Column(db.String(100), nullable=False)
    popis      = db.Column(db.Text)
    datum      = db.Column(db.Date, nullable=False)
    cas        = db.Column(db.Time, nullable=False)
    id_salonek = db.Column(db.Integer, db.ForeignKey("salonek.id_salonek"), nullable=False)

    salonek = db.relationship("Salonek", back_populates="akce")

    def __repr__(self):
        return f"<PodnikovaAkce {self.nazev} {self.datum}>"


class Objednavka(db.Model):
    __tablename__ = "objednavka"
    id_objednavky  = db.Column(db.Integer, primary_key=True)
    datum_cas      = db.Column(db.DateTime, nullable=False)
    stav           = db.Column(db.String(20))
    celkova_castka = db.Column(db.Numeric(8, 2))
    id_zakaznika   = db.Column(
        db.Integer,
        db.ForeignKey("zakaznik.id_zakaznika", ondelete="CASCADE"),
        nullable=False
    )

    zakaznik   = db.relationship("Zakaznik", back_populates="objednavky")
    polozky    = db.relationship("PolozkaObjednavky", back_populates="objednavka", lazy="dynamic")
    platby     = db.relationship("Platba", back_populates="objednavka", lazy="dynamic")
    hodnoceni  = db.relationship("Hodnoceni", back_populates="objednavka", lazy="dynamic")
    notifikace = db.relationship("Notifikace", back_populates="objednavka", lazy="dynamic")

    def __repr__(self):
        return f"<Objednavka {self.id_objednavky}>"


class PolozkaObjednavky(db.Model):
    __tablename__ = "polozka_objednavky"
    id_polozky_obj  = db.Column(db.Integer, primary_key=True)
    mnozstvi        = db.Column(db.Integer, nullable=False)
    cena            = db.Column(db.Numeric(8, 2), nullable=False)
    id_objednavky   = db.Column(db.Integer, db.ForeignKey("objednavka.id_objednavky"), nullable=False)
    id_menu_polozka = db.Column(db.Integer, db.ForeignKey("polozka_menu.id_menu_polozka"), nullable=False)

    objednavka   = db.relationship("Objednavka", back_populates="polozky")
    menu_polozka = db.relationship("PolozkaMenu", back_populates="objednavky")

    def __repr__(self):
        return f"<PolozkaObjednavky {self.id_polozky_obj} qty={self.mnozstvi}>"


class Platba(db.Model):
    __tablename__ = "platba"
    id_platba     = db.Column(db.Integer, primary_key=True)
    castka        = db.Column(db.Numeric(8, 2), nullable=False)
    typ_platby    = db.Column(db.String(20), nullable=False)
    datum         = db.Column(db.DateTime, nullable=False)
    id_objednavky = db.Column(db.Integer, db.ForeignKey("objednavka.id_objednavky"), nullable=False)

    objednavka = db.relationship("Objednavka", back_populates="platby")

    def __repr__(self):
        return f"<Platba {self.id_platba} amt={self.castka}>"


class Hodnoceni(db.Model):
    __tablename__ = "hodnoceni"
    id_hodnoceni  = db.Column(db.Integer, primary_key=True)
    hodnoceni     = db.Column(db.SmallInteger, nullable=False)
    komentar      = db.Column(db.Text)
    datum         = db.Column(db.DateTime, nullable=False)
    id_objednavky = db.Column(db.Integer, db.ForeignKey("objednavka.id_objednavky"), nullable=False)
    id_zakaznika  = db.Column(
        db.Integer,
        db.ForeignKey("zakaznik.id_zakaznika", ondelete="CASCADE"),
        nullable=False
    )

    objednavka = db.relationship("Objednavka", back_populates="hodnoceni")
    zakaznik   = db.relationship("Zakaznik", back_populates="hodnoceni")

    def __repr__(self):
        return f"<Hodnoceni {self.id_hodnoceni} score={self.hodnoceni}>"


class PolozkaMenu(db.Model):
    __tablename__ = "polozka_menu"
    id_menu_polozka = db.Column(db.Integer, primary_key=True)
    nazev           = db.Column(db.String(100), nullable=False)
    popis           = db.Column(db.Text)
    cena            = db.Column(db.Numeric(8, 2), nullable=False)

    objednavky = db.relationship("PolozkaObjednavky", back_populates="menu_polozka", lazy="dynamic")
    alergeny   = db.relationship("PolozkaMenuAlergen", back_populates="menu_polozka", lazy="dynamic")
    plany      = db.relationship("PolozkaJidelnihoPlanu", back_populates="menu_polozka", lazy="dynamic")

    def __repr__(self):
        return f"<PolozkaMenu {self.nazev}>"


class PolozkaMenuAlergen(db.Model):
    __tablename__ = "polozka_menu_alergen"
    id_menu_polozka = db.Column(db.Integer, db.ForeignKey("polozka_menu.id_menu_polozka"), primary_key=True)
    id_alergenu     = db.Column(db.Integer, db.ForeignKey("alergen.id_alergenu"), primary_key=True)

    menu_polozka = db.relationship("PolozkaMenu", back_populates="alergeny")
    alergen      = db.relationship("Alergen", back_populates="polozky")

    def __repr__(self):
        return f"<PMA {self.id_menu_polozka}/{self.id_alergenu}>"


class JidelniPlan(db.Model):
    __tablename__ = "jidelni_plan"
    id_plan    = db.Column(db.Integer, primary_key=True)
    nazev      = db.Column(db.String(100), nullable=False)
    platny_od  = db.Column(db.Date, nullable=False)
    platny_do  = db.Column(db.Date)

    polozky = db.relationship("PolozkaJidelnihoPlanu", back_populates="plan", lazy="dynamic")

    def __repr__(self):
        return f"<JidelniPlan {self.nazev}>"


class PolozkaJidelnihoPlanu(db.Model):
    __tablename__ = "polozka_jidelniho_planu"
    id_polozka_jid_pl = db.Column(db.Integer, primary_key=True)
    den               = db.Column(db.Date, nullable=False)
    poradi            = db.Column(db.Integer, nullable=False)
    id_plan           = db.Column(db.Integer, db.ForeignKey("jidelni_plan.id_plan"), nullable=False)
    id_menu_polozka   = db.Column(db.Integer, db.ForeignKey("polozka_menu.id_menu_polozka"), nullable=False)

    plan         = db.relationship("JidelniPlan", back_populates="polozky")
    menu_polozka = db.relationship("PolozkaMenu", back_populates="plany")

    def __repr__(self):
        return f"<PolozkaJidelnihoPlanu {self.id_polozka_jid_pl}>"


class Alergen(db.Model):
    __tablename__ = "alergen"
    id_alergenu = db.Column(db.Integer, primary_key=True)
    nazev       = db.Column(db.String(100), nullable=False)
    popis       = db.Column(db.Text)

    polozky = db.relationship("PolozkaMenuAlergen", back_populates="alergen", lazy="dynamic")

    def __repr__(self):
        return f"<Alergen {self.nazev}>"


class Notifikace(db.Model):
    __tablename__ = "notifikace"
    id_notifikace  = db.Column(db.Integer, primary_key=True)
    typ             = db.Column(db.String(20), nullable=False)
    datum_cas       = db.Column(db.DateTime, nullable=False)
    text            = db.Column(db.Text)
    id_rezervace    = db.Column(db.Integer, db.ForeignKey("rezervace.id_rezervace"), nullable=True)
    id_objednavky   = db.Column(db.Integer, db.ForeignKey("objednavka.id_objednavky"), nullable=True)

    rezervace  = db.relationship("Rezervace", back_populates="notifikace")
    objednavka = db.relationship("Objednavka", back_populates="notifikace")

    def __repr__(self):
        return f"<Notifikace {self.id_notifikace} type={self.typ}>"
