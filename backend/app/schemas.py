# app/schemas.py

"""
Tento soubor definuje Marshmallow schémata pro validaci a serializaci dat.
Klíčové pojmy:
- Schema: základní třída, ze které dědí všechna schémata.
- fields: různé typy polí pro data (Str, Int, DateTime, Decimal…).
- validate: validátory polí (např. validate.Length(min=1)).
- dump_only=True: pole se jen vrací klientovi, nečeká se na něj v requestu.
- load_only=True: pole přijímáme v requestu, ale nevracíme v odpovědi (např. heslo).
- Nested(..., many=True): vnořené schéma jako seznam.
- @validates_schema: dekorátor pro vlastní validaci napříč poli.
- @post_dump: dekorátor pro úpravu dat po serializaci (před odesláním klientovi).
- **kwargs v metodách: obecný zástupce pro další argumenty (např. 'many', 'context').
"""

from marshmallow import (
    Schema, fields, validate,
    validates_schema, ValidationError, post_dump
)

# — Souhrnná (SUMMARY) schémata —————————————————————————————————————————

class RezervaceSummarySchema(Schema):
    """Minimalní data o rezervaci pro vnoření do jiných schémat."""
    id_rezervace   = fields.Int()         # ID rezervace
    datum_cas      = fields.DateTime()    # čas rezervace
    pocet_osob     = fields.Int()         # počet osob
    stav_rezervace = fields.Str()         # stav rezervace

class ZakaznikSummarySchema(Schema):
    """Minimalní data o zákazníkovi pro vnoření do jiných schémat."""
    id_zakaznika = fields.Int()           # ID zákazníka
    jmeno        = fields.Str()           # křestní jméno
    prijmeni     = fields.Str()           # příjmení

class ObjednavkaSummarySchema(Schema):
    """Minimalní data o objednávce."""
    id_objednavky = fields.Int()          # ID objednávky
    datum_cas     = fields.DateTime()     # datum a čas vytvoření
    stav          = fields.Str()          # stav objednávky

class HodnoceniSummarySchema(Schema):
    """Minimalní data o hodnocení."""
    id_hodnoceni = fields.Int()           # ID hodnocení
    hodnoceni    = fields.Int()           # bodové hodnocení
    komentar     = fields.Str()           # textový komentář

class PlatbaSummarySchema(Schema):
    """Minimalní data o platbě."""
    id_platba    = fields.Int()                     # ID platby
    castka       = fields.Decimal(as_string=True)   # částka platby
    typ_platby   = fields.Str()                     # typ platby (hotově/kartou)
    datum        = fields.DateTime()                # datum a čas provedení

class PolozkaObjednavkySummarySchema(Schema):
    """Minimalní data o položce objednávky."""
    id_polozky_obj = fields.Int()                   # ID položky
    mnozstvi       = fields.Int()                   # množství
    cena           = fields.Decimal(as_string=True) # cena za kus

class NotifikaceSummarySchema(Schema):
    """Minimalní data o notifikaci."""
    id_notifikace = fields.Int()                    # ID notifikace
    typ           = fields.Str()                    # typ notifikace (email/sms/push)
    datum_cas     = fields.DateTime()               # datum a čas odeslání
    text          = fields.Str()                    # obsah notifikace

class PodnikovaAkceSummarySchema(Schema):
    """Minimalní data o podnikové akci pro vnoření do jiných schémat."""
    id_akce = fields.Int()     # ID akce
    nazev   = fields.Str()     # název akce
    datum   = fields.Date()    # datum konání
    cas     = fields.Time()    # čas konání


# — Zakaznik ——————————————————————————————————————————————————————

class ZakaznikSchema(Schema):
    """
    Výstupní schéma pro Zakaznik:
    - dump_only: id_zakaznika a vztahy se nečekají v requestu, ale posílají se v response.
    - vnořené seznamy rezervací, objednávek a hodnocení přes Nested(..., many=True).
    """
    id_zakaznika = fields.Int(dump_only=True)                                # PK zákazníka
    jmeno        = fields.Str(required=True, validate=validate.Length(min=1)) # křestní jméno
    prijmeni     = fields.Str(required=True, validate=validate.Length(min=1)) # příjmení
    email        = fields.Email(required=True)                                # emailová adresa
    telefon      = fields.Str(validate=validate.Length(max=20))               # telefonní číslo
    ucet         = fields.Nested("VernostniUcetSchema", dump_only=True, allow_none=True)
                                                                             # věrnostní účet (1:1)
    rezervace    = fields.Nested(RezervaceSummarySchema, many=True, dump_only=True)
                                                                             # seznam rezervací (1:N)
    objednavky   = fields.Nested(ObjednavkaSummarySchema, many=True, dump_only=True)
                                                                             # seznam objednávek (1:N)
    hodnoceni    = fields.Nested(HodnoceniSummarySchema, many=True, dump_only=True)
                                                                             # seznam hodnocení (1:N)

    @post_dump
    def replace_empty_relations(self, data, **kwargs):
        """Po serializaci nahradí prázdné seznamy a None textovými hláškami."""
        if data.get("ucet") is None:
            data["ucet"] = "Žádný účet"
        if not data.get("objednavky"):
            data["objednavky"] = "Žádné objednávky"
        if not data.get("rezervace"):
            data["rezervace"] = "Žádné rezervace"
        if not data.get("hodnoceni"):
            data["hodnoceni"] = "Žádná hodnocení"
        return data

class ZakaznikCreateSchema(Schema):
    """
    Vstupní schéma pro vytvoření Zakaznik:
    - load_only: password přijímáme, ale nevracíme v response (bezpečnost).
    """
    jmeno     = fields.Str(required=True, validate=validate.Length(min=1))
    prijmeni  = fields.Str(required=True, validate=validate.Length(min=1))
    email     = fields.Email(required=True)
    telefon   = fields.Str(validate=validate.Length(max=20))
    password  = fields.Str(
        required=True,
        load_only=True,
        validate=validate.Length(min=8, error="Heslo musí mít alespoň 8 znaků")
    )


# — VernostniUcet ——————————————————————————————————————————————————

class VernostniUcetSchema(Schema):
    """
    Výstupní schéma pro VernostniUcet:
    - dump_only: id_ucet a vztah na Zakaznik.
    """
    id_ucet        = fields.Int(dump_only=True)  # PK účtu
    body           = fields.Int()                # počáteční nebo aktuální body
    datum_zalozeni = fields.Date()               # datum vytvoření účtu
    zakaznik       = fields.Nested(ZakaznikSummarySchema, dump_only=True)
                                                # odkaz na majitele účtu

class VernostniUcetCreateSchema(Schema):
    """
    Vstupní schéma pro vytvoření VernostniUcet:
    - body: volitelné, pokud ne, nastaveno na 0.
    - datum_zalozeni a id_zakaznika jsou povinné.
    """
    body           = fields.Int()
    datum_zalozeni = fields.Date(required=True)
    id_zakaznika   = fields.Int(required=True)


# — Rezervace ——————————————————————————————————————————————————————

class RezervaceSchema(Schema):
    """
    Výstupní schéma pro Rezervace:
    - dump_only: id_rezervace a nested vztahy.
    - prázdné vztahy nahrazeny textem v post_dump.
    """
    id_rezervace   = fields.Int(dump_only=True)       # PK rezervace
    datum_cas      = fields.DateTime()                # čas rezervace
    pocet_osob     = fields.Int()                     # kolik osob
    stav_rezervace = fields.Str()                     # stav rezervace
    sleva          = fields.Decimal(as_string=True)   # sleva v procentech
    zakaznik       = fields.Nested(ZakaznikSummarySchema, dump_only=True)
    stul           = fields.Nested("StulSchema", dump_only=True, allow_none=True)
    salonek        = fields.Nested("SalonekSchema", dump_only=True, allow_none=True)
    notifikace     = fields.Nested(NotifikaceSummarySchema, many=True, dump_only=True)

    @post_dump
    def replace_nulls(self, data, **kwargs):
        """Nahrazení None vztahů čitelnými texty."""
        if data.get("stul") is None:
            data["stul"] = "Stůl je dostupný"
        if data.get("salonek") is None:
            data["salonek"] = "Žádný salóněk"
        if not data.get("notifikace"):
            data["notifikace"] = "Žádné notifikace"
        return data

class RezervaceCreateSchema(Schema):
    """
    Vstupní schéma pro vytvoření Rezervace:
    - required: datum_cas, pocet_osob, id_zakaznika.
    - validate_schema: buď id_stul nebo id_salonek musí být zadáno.
    """
    datum_cas      = fields.DateTime(required=True)
    pocet_osob     = fields.Int(required=True)
    stav_rezervace = fields.Str()
    sleva          = fields.Decimal(as_string=True)
    id_zakaznika   = fields.Int(required=True)
    id_stul        = fields.Int(allow_none=True)
    id_salonek     = fields.Int(allow_none=True)

    @validates_schema
    def require_place(self, data, **kwargs):
        """Validace: musí být buď id_stul NEBO id_salonek."""
        if not data.get("id_stul") and not data.get("id_salonek"):
            raise ValidationError(
                "Musíte vyplnit buď 'id_stul' nebo 'id_salonek'.",
                field_names=["id_stul", "id_salonek"]
            )


# — Stul ——————————————————————————————————————————————————————

class StulSchema(Schema):
    """
    Výstupní schéma pro Stul:
    - dump_only: id_stul a rezervace.
    """
    id_stul   = fields.Int(dump_only=True)   # PK stolu
    cislo     = fields.Int()                 # číslo stolu
    kapacita  = fields.Int()                 # kolik osob
    popis     = fields.Str()                 # volitelný popis
    rezervace = fields.Nested(RezervaceSummarySchema, many=True, dump_only=True)

class StulCreateSchema(Schema):
    """Vstupní schéma pro vytvoření Stul: cislo и kapacita required."""
    cislo    = fields.Int(required=True)
    kapacita = fields.Int(required=True)
    popis    = fields.Str()


# — Salonek ——————————————————————————————————————————————————————

class SalonekSchema(Schema):
    """
    Výstupní schéma pro Salonek:
    - dump_only: id_salonek, rezervace, akce.
    """
    id_salonek = fields.Int(dump_only=True)
    nazev      = fields.Str()           # název salonku
    kapacita   = fields.Int()           # kapacita osob
    popis      = fields.Str()           # volitelný popis
    rezervace  = fields.Nested(RezervaceSummarySchema, many=True, dump_only=True)
    akce       = fields.Nested(PodnikovaAkceSummarySchema, many=True, dump_only=True)

class SalonekCreateSchema(Schema):
    """Vstupní schéma pro vytvoření Salonek: nazev a kapacita required."""
    nazev    = fields.Str(required=True)
    kapacita = fields.Int(required=True)
    popis    = fields.Str()


# — PodnikovaAkce ——————————————————————————————————————————————————

class PodnikovaAkceSchema(Schema):
    """
    Výstupní schéma pro PodnikovaAkce:
    - dump_only: id_akce a nested salonek.
    """
    id_akce = fields.Int(dump_only=True)
    nazev   = fields.Str()            # název akce
    popis   = fields.Str()            # popis akce
    datum   = fields.Date()           # datum konání
    cas     = fields.Time()           # čas konání
    salonek = fields.Nested(SalonekSchema, dump_only=True)

class PodnikovaAkceCreateSchema(Schema):
    """Vstupní schéma pro vytvoření PodnikovaAkce: nazev, datum, cas, id_salonek required."""
    nazev      = fields.Str(required=True)
    popis      = fields.Str()
    datum      = fields.Date(required=True)
    cas        = fields.Time(required=True)
    id_salonek = fields.Int(required=True)


# — Objednavka ——————————————————————————————————————————————————

class ObjednavkaSchema(Schema):
    """
    Výstupní schéma pro Objednavka:
    - dump_only: id_objednavky a všechny nested vztahy.
    """
    id_objednavky  = fields.Int(dump_only=True)
    datum_cas      = fields.DateTime()                      # datum a čas objednávky
    stav           = fields.Str()                           # stav objednávky
    celkova_castka = fields.Decimal(as_string=True)         # celková částka
    zakaznik       = fields.Nested(ZakaznikSummarySchema, dump_only=True)
    polozky        = fields.Nested(PolozkaObjednavkySummarySchema, many=True, dump_only=True)
    platby         = fields.Nested(PlatbaSummarySchema, many=True, dump_only=True)
    hodnoceni      = fields.Nested(HodnoceniSummarySchema, many=True, dump_only=True)
    notifikace     = fields.Nested(NotifikaceSummarySchema, many=True, dump_only=True)

class ObjednavkaCreateSchema(Schema):
    """Vstupní schéma pro vytvoření Objednavka: datum_cas a id_zakaznika required."""
    datum_cas      = fields.DateTime(required=True)
    stav           = fields.Str()
    celkova_castka = fields.Decimal(as_string=True)
    id_zakaznika   = fields.Int(required=True)


# — PolozkaObjednavky ——————————————————————————————————————————————————

class PolozkaObjednavkySchema(Schema):
    """
    Výstupní schéma pro PoložkaObjednavky:
    - dump_only: id_polozky_obj a menu_polozka.
    """
    id_polozky_obj = fields.Int(dump_only=True)
    mnozstvi       = fields.Int()                             # kolik kusů
    cena           = fields.Decimal(as_string=True)            # cena za kus
    menu_polozka   = fields.Nested("PolozkaMenuSchema", dump_only=True)

class PolozkaObjednavkyCreateSchema(Schema):
    """Vstupní schéma pro vytvoření PoložkaObjednavky: mnozstvi, cena, id_objednavky, id_menu_polozka required."""
    mnozstvi        = fields.Int(required=True)
    cena            = fields.Decimal(as_string=True)
    id_objednavky   = fields.Int(required=True)
    id_menu_polozka = fields.Int(required=True)


# — Platba ——————————————————————————————————————————————————

class PlatbaSchema(Schema):
    """
    Výstupní schéma pro Platba:
    - dump_only: id_platba a objednavka.
    """
    id_platba     = fields.Int(dump_only=True)
    castka        = fields.Decimal(as_string=True)
    typ_platby    = fields.Str()
    datum         = fields.DateTime()
    objednavka    = fields.Nested(ObjednavkaSummarySchema, dump_only=True)

class PlatbaCreateSchema(Schema):
    """Vstupní schéma pro vytvoření Platba: castka, typ_platby, datum, id_objednavky required."""
    castka        = fields.Decimal(as_string=True, required=True)
    typ_platby    = fields.Str(required=True)
    datum         = fields.DateTime(required=True)
    id_objednavky = fields.Int(required=True)


# — Hodnoceni ——————————————————————————————————————————————————

class HodnoceniSchema(Schema):
    """
    Výstupní schéma pro Hodnoceni:
    - dump_only: id_hodnoceni, zakaznik, objednavka.
    """
    id_hodnoceni = fields.Int(dump_only=True)
    hodnoceni    = fields.Int()                              # bodové hodnocení
    komentar     = fields.Str()                              # textový komentář
    datum        = fields.DateTime()                         # datum a čas
    zakaznik     = fields.Nested(ZakaznikSummarySchema, dump_only=True)
    objednavka   = fields.Nested(ObjednavkaSummarySchema, dump_only=True)

class HodnoceniCreateSchema(Schema):
    """Vstupní schéma pro vytvoření Hodnoceni: hodnoceni, datum, id_objednavky, id_zakaznika required."""
    hodnoceni     = fields.Int(required=True)
    komentar      = fields.Str()
    datum         = fields.DateTime(required=True)
    id_objednavky = fields.Int(required=True)
    id_zakaznika  = fields.Int(required=True)


# — PolozkaMenu ——————————————————————————————————————————————————

class PolozkaMenuSchema(Schema):
    """
    Výstupní schéma pro PolozkaMenu:
    - dump_only: id_menu_polozka a alergeny.
    """
    id_menu_polozka = fields.Int(dump_only=True)
    nazev           = fields.Str()                                # název jídla
    popis           = fields.Str(dump_default="", allow_none=False)# popis (místo NULL "")
    cena            = fields.Decimal(as_string=True)              # cena za položku
    alergeny        = fields.Nested("AlergenSchema", many=True, dump_only=True)

class PolozkaMenuCreateSchema(Schema):
    """Vstupní schéma pro vytvoření PolozkaMenu: nazev a cena required."""
    nazev = fields.Str(required=True)
    popis = fields.Str(load_default="", allow_none=False)
    cena  = fields.Decimal(as_string=True, required=True)


# — PolozkaMenuAlergen ——————————————————————————————————————————————————

class PolozkaMenuAlergenSchema(Schema):
    """
    Výstupní schéma pro PolozkaMenuAlergen:
    - dump_only: oba klíče FK.
    """
    id_menu_polozka = fields.Int(dump_only=True)
    id_alergenu     = fields.Int(dump_only=True)

class PolozkaMenuAlergenCreateSchema(Schema):
    """Vstupní schéma pro vytvoření PolozkaMenuAlergen: oba FK required."""
    id_menu_polozka = fields.Int(required=True)
    id_alergenu     = fields.Int(required=True)


# — JidelniPlan ——————————————————————————————————————————————————

class JidelniPlanSchema(Schema):
    """
    Výstupní schéma pro JidelniPlan:
    - dump_only: id_plan a polozky.
    """
    id_plan    = fields.Int(dump_only=True)
    nazev      = fields.Str()                        # název plánu
    platny_od  = fields.Date()                       # platný od data
    platny_do  = fields.Date()                       # platný do data
    polozky    = fields.Nested("PolozkaJidelnihoPlanuSummarySchema", many=True, dump_only=True)

class JidelniPlanCreateSchema(Schema):
    """Vstupní schéma pro vytvoření JidelniPlan: nazev a platny_od required."""
    nazev      = fields.Str(required=True)
    platny_od  = fields.Date(required=True)
    platny_do  = fields.Date()


# — PolozkaJidelnihoPlanu ——————————————————————————————————————————————————

class PolozkaJidelnihoPlanuSummarySchema(Schema):
    """Minimalní data o položce plánu."""
    id_polozka_jid_pl = fields.Int()
    den               = fields.Date()
    poradi            = fields.Int()

class PolozkaJidelnihoPlanuSchema(Schema):
    """
    Výstupní schéma pro PolozkaJidelnihoPlanu:
    - dump_only: id_polozka_jid_pl, menu_polozka, plan.
    """
    id_polozka_jid_pl = fields.Int(dump_only=True)
    den               = fields.Date()
    poradi            = fields.Int()
    menu_polozka      = fields.Nested("PolozkaMenuSchema", dump_only=True)
    plan              = fields.Nested(JidelniPlanSchema, dump_only=True)

class PolozkaJidelnihoPlanuCreateSchema(Schema):
    """Vstupní schéma: den, poradi, id_plan, id_menu_polozka required."""
    den             = fields.Date(required=True)
    poradi          = fields.Int(required=True)
    id_plan         = fields.Int(required=True)
    id_menu_polozka = fields.Int(required=True)


# — Alergen ——————————————————————————————————————————————————

class AlergenSchema(Schema):
    """
    Výstupní schéma pro Alergen:
    - dump_only: id_alergenu.
    """
    id_alergenu = fields.Int(dump_only=True)
    nazev       = fields.Str()            # název alergenu
    popis       = fields.Str()            # popis alergenu

class AlergenCreateSchema(Schema):
    """Vstupní schéma pro vytvoření Alergen: nazev required."""
    nazev = fields.Str(required=True)
    popis = fields.Str()


# — Notifikace ——————————————————————————————————————————————————

class NotifikaceSchema(Schema):
    """
    Výstupní schéma pro Notifikace:
    - dump_only: id_notifikace.
    """
    id_notifikace = fields.Int(dump_only=True)
    typ           = fields.Str()                       # typ notifikace
    datum_cas     = fields.DateTime()                  # datum a čas
    text          = fields.Str()                       # obsah zprávy
    rezervace     = fields.Nested(RezervaceSummarySchema, dump_only=True, allow_none=True)
    objednavka    = fields.Nested(ObjednavkaSummarySchema, dump_only=True, allow_none=True)

class NotifikaceCreateSchema(Schema):
    """Vstupní schéma pro vytvoření Notifikace: typ a datum_cas required."""
    typ           = fields.Str(required=True)
    datum_cas     = fields.DateTime(required=True)
    text          = fields.Str()
    id_rezervace  = fields.Int(allow_none=True)
    id_objednavky = fields.Int(allow_none=True)


# — Autentizace ——————————————————————————————————————————————————

class LoginSchema(Schema):
    """
    Vstupní schéma pro přihlášení:
    - email: validní e-mail (required)
    - password: heslo (required, load_only)
    """
    email    = fields.Email(required=True)               # validace e-mailu
    password = fields.Str(required=True, load_only=True) # heslo```
