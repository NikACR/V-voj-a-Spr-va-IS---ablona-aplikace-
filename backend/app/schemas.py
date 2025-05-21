# app/schemas.py
from marshmallow import Schema, fields, validate

# -----------------------------------------
# Zakaznik
# -----------------------------------------


class ZakaznikSchema(Schema):
    id_zakaznika = fields.Int(dump_only=True)
    jmeno = fields.Str(required=True, validate=validate.Length(min=1))
    prijmeni = fields.Str(required=True, validate=validate.Length(min=1))
    telefon = fields.Str(validate=validate.Length(max=20))
    email = fields.Email()
    ucet = fields.Nested("VernostniUcetSchema", dump_only=True)
    rezervace = fields.Nested("RezervaceSchema", many=True, dump_only=True)
    objednavky = fields.Nested("ObjednavkaSchema", many=True, dump_only=True)
    hodnoceni = fields.Nested("HodnoceniSchema", many=True, dump_only=True)


class ZakaznikCreateSchema(Schema):
    jmeno = fields.Str(required=True, validate=validate.Length(min=1))
    prijmeni = fields.Str(required=True, validate=validate.Length(min=1))
    telefon = fields.Str(validate=validate.Length(max=20))
    email = fields.Email()


# -----------------------------------------
# VernostniUcet
# -----------------------------------------
class VernostniUcetSchema(Schema):
    id_ucet = fields.Int(dump_only=True)
    body = fields.Int()
    datum_zalozeni = fields.Date()
    id_zakaznika = fields.Int(load_only=True)
    zakaznik = fields.Nested("ZakaznikSchema", dump_only=True)


class VernostniUcetCreateSchema(Schema):
    body = fields.Int()
    datum_zalozeni = fields.Date(required=True)
    id_zakaznika = fields.Int(required=True)


# -----------------------------------------
# Rezervace
# -----------------------------------------
class RezervaceSchema(Schema):
    id_rezervace = fields.Int(dump_only=True)
    datum_cas = fields.DateTime()
    pocet_osob = fields.Int()
    stav_rezervace = fields.Str()
    sleva = fields.Decimal(as_string=True)
    id_zakaznika = fields.Int(load_only=True)
    id_stul = fields.Int(load_only=True)
    id_salonek = fields.Int(load_only=True)
    zakaznik = fields.Nested("ZakaznikSchema", dump_only=True)
    stul = fields.Nested("StulSchema", dump_only=True)
    salonek = fields.Nested("SalonekSchema", dump_only=True)


class RezervaceCreateSchema(Schema):
    datum_cas = fields.DateTime(required=True)
    pocet_osob = fields.Int(required=True)
    stav_rezervace = fields.Str()
    sleva = fields.Decimal(as_string=True)
    id_zakaznika = fields.Int(required=True)
    id_stul = fields.Int()
    id_salonek = fields.Int()


# -----------------------------------------
# Stul
# -----------------------------------------
class StulSchema(Schema):
    id_stul = fields.Int(dump_only=True)
    cislo = fields.Int()
    kapacita = fields.Int()
    popis = fields.Str()
    rezervace = fields.Nested("RezervaceSchema", many=True, dump_only=True)


class StulCreateSchema(Schema):
    cislo = fields.Int(required=True)
    kapacita = fields.Int(required=True)
    popis = fields.Str()


# -----------------------------------------
# Salonek
# -----------------------------------------
class SalonekSchema(Schema):
    id_salonek = fields.Int(dump_only=True)
    nazev = fields.Str()
    kapacita = fields.Int()
    popis = fields.Str()
    rezervace = fields.Nested("RezervaceSchema", many=True, dump_only=True)
    akce = fields.Nested("PodnikovaAkceSchema", many=True, dump_only=True)


class SalonekCreateSchema(Schema):
    nazev = fields.Str(required=True)
    kapacita = fields.Int(required=True)
    popis = fields.Str()


# -----------------------------------------
# PodnikovaAkce
# -----------------------------------------
class PodnikovaAkceSchema(Schema):
    id_akce = fields.Int(dump_only=True)
    nazev = fields.Str()
    popis = fields.Str()
    datum = fields.Date()
    cas = fields.Time()
    id_salonek = fields.Int(load_only=True)
    salonek = fields.Nested("SalonekSchema", dump_only=True)


class PodnikovaAkceCreateSchema(Schema):
    nazev = fields.Str(required=True)
    popis = fields.Str()
    datum = fields.Date(required=True)
    cas = fields.Time(required=True)
    id_salonek = fields.Int(required=True)


# -----------------------------------------
# Objednavka
# -----------------------------------------
class ObjednavkaSchema(Schema):
    id_objednavky = fields.Int(dump_only=True)
    datum_cas = fields.DateTime()
    stav = fields.Str()
    celkova_castka = fields.Decimal(as_string=True)
    id_zakaznika = fields.Int(load_only=True)
    zakaznik = fields.Nested("ZakaznikSchema", dump_only=True)
    polozky = fields.Nested("PolozkaObjednavkySchema",
                            many=True, dump_only=True)
    platby = fields.Nested("PlatbaSchema", many=True, dump_only=True)
    hodnoceni = fields.Nested("HodnoceniSchema", many=True, dump_only=True)
    notifikace = fields.Nested("NotifikaceSchema", many=True, dump_only=True)


class ObjednavkaCreateSchema(Schema):
    datum_cas = fields.DateTime(required=True)
    stav = fields.Str()
    celkova_castka = fields.Decimal(as_string=True)
    id_zakaznika = fields.Int(required=True)


# -----------------------------------------
# PolozkaObjednavky
# -----------------------------------------
class PolozkaObjednavkySchema(Schema):
    id_polozky_obj = fields.Int(dump_only=True)
    mnozstvi = fields.Int()
    cena = fields.Decimal(as_string=True)
    id_objednavky = fields.Int(load_only=True)
    id_menu_polozka = fields.Int(load_only=True)
    objednavka = fields.Nested("ObjednavkaSchema", dump_only=True)
    menu_polozka = fields.Nested("PolozkaMenuSchema", dump_only=True)


class PolozkaObjednavkyCreateSchema(Schema):
    mnozstvi = fields.Int(required=True)
    cena = fields.Decimal(as_string=True)
    id_objednavky = fields.Int(required=True)
    id_menu_polozka = fields.Int(required=True)


# -----------------------------------------
# Platba
# -----------------------------------------
class PlatbaSchema(Schema):
    id_platba = fields.Int(dump_only=True)
    castka = fields.Decimal(as_string=True)
    typ_platby = fields.Str()
    datum = fields.DateTime()
    id_objednavky = fields.Int(load_only=True)
    objednavka = fields.Nested("ObjednavkaSchema", dump_only=True)


class PlatbaCreateSchema(Schema):
    castka = fields.Decimal(as_string=True, required=True)
    typ_platby = fields.Str(required=True)
    datum = fields.DateTime(required=True)
    id_objednavky = fields.Int(required=True)


# -----------------------------------------
# Hodnoceni
# -----------------------------------------
class HodnoceniSchema(Schema):
    id_hodnoceni = fields.Int(dump_only=True)
    hodnoceni = fields.Int()
    komentar = fields.Str()
    datum = fields.DateTime()
    id_objednavky = fields.Int(load_only=True)
    id_zakaznika = fields.Int(load_only=True)
    objednavka = fields.Nested("ObjednavkaSchema", dump_only=True)
    zakaznik = fields.Nested("ZakaznikSchema", dump_only=True)


class HodnoceniCreateSchema(Schema):
    hodnoceni = fields.Int(required=True)
    komentar = fields.Str()
    datum = fields.DateTime(required=True)
    id_objednavky = fields.Int(required=True)
    id_zakaznika = fields.Int(required=True)


# -----------------------------------------
# PolozkaMenu
# -----------------------------------------
class PolozkaMenuSchema(Schema):
    id_menu_polozka = fields.Int(dump_only=True)
    nazev = fields.Str()
    popis = fields.Str()
    cena = fields.Decimal(as_string=True)
    objednavky = fields.Nested(
        "PolozkaObjednavkySchema", many=True, dump_only=True)
    alergeny = fields.Nested("AlergenSchema", many=True, dump_only=True)
    plany = fields.Nested("PolozkaJidelnihoPlanuSchema",
                          many=True, dump_only=True)


class PolozkaMenuCreateSchema(Schema):
    nazev = fields.Str(required=True)
    popis = fields.Str()
    cena = fields.Decimal(as_string=True, required=True)


# -----------------------------------------
# PolozkaMenuAlergen
# -----------------------------------------
class PolozkaMenuAlergenSchema(Schema):
    id_menu_polozka = fields.Int(dump_only=True)
    id_alergenu = fields.Int(dump_only=True)
    menu_polozka = fields.Nested("PolozkaMenuSchema", dump_only=True)
    alergen = fields.Nested("AlergenSchema", dump_only=True)


class PolozkaMenuAlergenCreateSchema(Schema):
    id_menu_polozka = fields.Int(required=True)
    id_alergenu = fields.Int(required=True)


# -----------------------------------------
# JidelniPlan
# -----------------------------------------
class JidelniPlanSchema(Schema):
    id_plan = fields.Int(dump_only=True)
    nazev = fields.Str()
    platny_od = fields.Date()
    platny_do = fields.Date()
    polozky = fields.Nested("PolozkaJidelnihoPlanuSchema",
                            many=True, dump_only=True)


class JidelniPlanCreateSchema(Schema):
    nazev = fields.Str(required=True)
    platny_od = fields.Date(required=True)
    platny_do = fields.Date()


# -----------------------------------------
# PolozkaJidelnihoPlanu
# -----------------------------------------
class PolozkaJidelnihoPlanuSchema(Schema):
    id_polozka_jid_pl = fields.Int(dump_only=True)
    den = fields.Date()
    poradi = fields.Int()
    id_plan = fields.Int(load_only=True)
    id_menu_polozka = fields.Int(load_only=True)
    plan = fields.Nested("JidelniPlanSchema", dump_only=True)
    menu_polozka = fields.Nested("PolozkaMenuSchema", dump_only=True)


class PolozkaJidelnihoPlanuCreateSchema(Schema):
    den = fields.Date(required=True)
    poradi = fields.Int(required=True)
    id_plan = fields.Int(required=True)
    id_menu_polozka = fields.Int(required=True)


# -----------------------------------------
# Alergen
# -----------------------------------------
class AlergenSchema(Schema):
    id_alergenu = fields.Int(dump_only=True)
    nazev = fields.Str()
    popis = fields.Str()
    polozky = fields.Nested("PolozkaMenuSchema", many=True, dump_only=True)


class AlergenCreateSchema(Schema):
    nazev = fields.Str(required=True)
    popis = fields.Str()


# -----------------------------------------
# Notifikace
# -----------------------------------------
class NotifikaceSchema(Schema):
    id_notifikace = fields.Int(dump_only=True)
    typ = fields.Str()
    datum_cas = fields.DateTime()
    text = fields.Str()
    id_rezervace = fields.Int(load_only=True)
    id_objednavky = fields.Int(load_only=True)
    rezervace = fields.Nested("RezervaceSchema", dump_only=True)
    objednavka = fields.Nested("ObjednavkaSchema", dump_only=True)


class NotifikaceCreateSchema(Schema):
    typ = fields.Str(required=True)
    datum_cas = fields.DateTime(required=True)
    text = fields.Str()
    id_rezervace = fields.Int()
    id_objednavky = fields.Int()
