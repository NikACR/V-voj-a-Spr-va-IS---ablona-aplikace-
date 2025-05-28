# run.py


import os                                       # práce s OS a env variables
import click                                    # dekorátor pro CLI příkazy
from datetime import datetime, date, time, timedelta

from app import create_app, db                  # factory + SQLAlchemy session
from app.models import (                        # všechny entity pro seed a shell
    Zakaznik, VernostniUcet, Rezervace, Stul, Salonek,
    PodnikovaAkce, Objednavka, PolozkaObjednavky,
    Platba, Hodnoceni, PolozkaMenu, PolozkaMenuAlergen,
    JidelniPlan, PolozkaJidelnihoPlanu, Alergen, Notifikace
)

# 1) Pokud spouštíme lokálně a DATABASE_HOST je "db" (Docker), přepíšeme na "localhost"
os.environ.setdefault("DATABASE_HOST", "localhost")

# 2) Vytvoření Flask aplikace dle proměnné FLASK_CONFIG (nebo "default")
config_name = os.getenv("FLASK_CONFIG", "default")
app = create_app(config_name)


def _vycistit_databazi():
    """
    Smaže data ze všech tabulek v pořadí respektujícím FK:
    - M:N a závislé položky
    - primární tabulky
    """
    db.session.query(PolozkaMenuAlergen).delete()    # M:N vazba menu–alergeny
    db.session.query(Notifikace).delete()            # notifikace pro rezervace/objednávky
    db.session.query(Hodnoceni).delete()             # hodnocení objednávek
    db.session.query(Platba).delete()                # platby
    db.session.query(PolozkaObjednavky).delete()     # položky objednávek
    db.session.query(Objednavka).delete()            # objednávky
    db.session.query(PodnikovaAkce).delete()         # podnikové akce
    db.session.query(Rezervace).delete()             # rezervace
    db.session.query(PolozkaJidelnihoPlanu).delete() # položky jídelních plánů
    db.session.query(JidelniPlan).delete()           # jídelní plány
    db.session.query(Alergen).delete()               # alergeny
    db.session.query(PolozkaMenu).delete()           # položky menu
    db.session.query(Salonek).delete()               # salónky
    db.session.query(Stul).delete()                  # stoly
    db.session.query(VernostniUcet).delete()         # věrnostní účty
    db.session.query(Zakaznik).delete()              # zákazníci
    db.session.commit()                              # potvrdí smazání


@app.cli.command("seed-db")
def seed_db():
    """
    CLI příkaz pro vložení demo dat:
    - Nejprve zavolá _vycistit_databazi()
    - Pak vloží data krok po kroku:
      1) zákazníci + hash hesel
      2) věrnostní účty
      3) stoly
      4) salóny
      5) podnikové akce
      6) položky menu
      7) alergeny
      8) M:N vazby menu–alergeny
      9) rezervace
     10) objednávky
     11) položky objednávek
     12) platby
     13) hodnocení
     14) jídelní plány
     15) položky jídelních plánů
     16) notifikace
    """
    _vycistit_databazi()

    # 1) Zákazníci + heslo (setter vytvoří hash)
    zak1 = Zakaznik(jmeno="Petr",    prijmeni="Svoboda",
                    email="petr.svoboda@example.cz", telefon="603123456")
    zak1.password = "tajneheslo1"              # setter -> generate_password_hash
    zak2 = Zakaznik(jmeno="Eva",     prijmeni="Novotná",
                    email="eva.novotna@example.cz", telefon="608987654")
    zak2.password = "tajneheslo2"
    zak3 = Zakaznik(jmeno="Lukáš",   prijmeni="Krejčík",
                    email="lukas.krejcik@example.cz", telefon="602555333")
    zak3.password = "tajneheslo3"
    db.session.add_all([zak1, zak2, zak3])

    # 2) Věrnostní účty
    uc1 = VernostniUcet(body=150,
                        datum_zalozeni=date.today() - timedelta(days=45),
                        zakaznik=zak1)
    uc2 = VernostniUcet(body=70,
                        datum_zalozeni=date.today() - timedelta(days=20),
                        zakaznik=zak2)
    uc3 = VernostniUcet(body=230,
                        datum_zalozeni=date.today() - timedelta(days=90),
                        zakaznik=zak3)
    db.session.add_all([uc1, uc2, uc3])

    # 3) Stoly
    s1 = Stul(cislo=1, kapacita=4, popis="U okna")
    s2 = Stul(cislo=2, kapacita=2, popis="U stěny")
    s3 = Stul(cislo=3, kapacita=6, popis="Rodinný stůl")
    db.session.add_all([s1, s2, s3])

    # 4) Salónky
    sal1 = Salonek(nazev="Salónek Slunce", kapacita=20,
                   popis="prostorný salónek se stolním fotbálkem")
    sal2 = Salonek(nazev="Salónek Měsíc",   kapacita=15,
                   popis="útulný salónek s krbem")
    sal3 = Salonek(nazev="Salónek Hvězda",  kapacita=30,
                   popis="velký salónek pro akce")
    db.session.add_all([sal1, sal2, sal3])

    # 5) Podnikové akce
    ak1 = PodnikovaAkce(nazev="Firemní večírek", popis="večerní setkání pro zaměstnance",
                        datum=date.today() + timedelta(days=5),
                        cas=time(18, 0), salonek=sal1)
    ak2 = PodnikovaAkce(nazev="Degustace vín", popis="ochutnávka vybraných vín",
                        datum=date.today() + timedelta(days=10),
                        cas=time(17, 30), salonek=sal2)
    ak3 = PodnikovaAkce(nazev="Květinový workshop", popis="tvořivá dílna z květinových aranžmá",
                        datum=date.today() + timedelta(days=15),
                        cas=time(16, 0), salonek=sal3)
    db.session.add_all([ak1, ak2, ak3])

    # 6) Položky menu
    m1 = PolozkaMenu(nazev="Sýrová pizza",
                     popis="poctivá italská pizza se směsí sýrů", cena=199.00)
    m2 = PolozkaMenu(nazev="Hovězí burger",
                     popis="šťavnatý burger s hranolkami", cena=249.00)
    m3 = PolozkaMenu(nazev="Caesar salát",
                     popis="clásico s kuřecími prsy a domácím dresinkem", cena=159.00)
    db.session.add_all([m1, m2, m3])

    # 7) Alergeny
    a1 = Alergen(nazev="Gluten", popis="lepek v pšeničném a žitném pečivu")
    a2 = Alergen(nazev="Laktóza", popis="mléčný cukr v mléčných výrobcích")
    a3 = Alergen(nazev="Ořechy", popis="všechny druhy ořechů")
    db.session.add_all([a1, a2, a3])

    # 8) M:N vazby PolozkaMenuAlergen
    db.session.add_all([
        PolozkaMenuAlergen(menu_polozka=m1, alergen=a1),
        PolozkaMenuAlergen(menu_polozka=m2, alergen=a2),
        PolozkaMenuAlergen(menu_polozka=m3, alergen=a3),
    ])

    # 9) Rezervace
    r1 = Rezervace(datum_cas=datetime.now() + timedelta(days=1),
                   pocet_osob=2, stav_rezervace="potvrzená", sleva=0,
                   zakaznik=zak1, stul=s1)
    r2 = Rezervace(datum_cas=datetime.now() + timedelta(days=2),
                   pocet_osob=4, stav_rezervace="čekající", sleva=10,
                   zakaznik=zak2, stul=s2)
    r3 = Rezervace(datum_cas=datetime.now() + timedelta(days=3),
                   pocet_osob=6, stav_rezervace="zrušená", sleva=0,
                   zakaznik=zak3, salonek=sal3)
    db.session.add_all([r1, r2, r3])

    # 10) Objednávky
    o1 = Objednavka(datum_cas=datetime.now(), stav="otevřená",
                    celkova_castka=398.00, zakaznik=zak1)
    o2 = Objednavka(datum_cas=datetime.now(), stav="zaplacená",
                    celkova_castka=258.00, zakaznik=zak2)
    o3 = Objednavka(datum_cas=datetime.now(), stav="uzavřená",
                    celkova_castka=159.00, zakaznik=zak3)
    db.session.add_all([o1, o2, o3])

    # 11) Položky objednávek
    po1 = PolozkaObjednavky(mnozstvi=2, cena=199.00,
                            objednavka=o1, menu_polozka=m1)
    po2 = PolozkaObjednavky(mnozstvi=1, cena=249.00,
                            objednavka=o2, menu_polozka=m2)
    po3 = PolozkaObjednavky(mnozstvi=1, cena=159.00,
                            objednavka=o3, menu_polozka=m3)
    db.session.add_all([po1, po2, po3])

    # 12) Platby
    pay1 = Platba(castka=398.00, typ_platby="hotově",
                  datum=datetime.now(), objednavka=o1)
    pay2 = Platba(castka=258.00, typ_platby="kartou",
                  datum=datetime.now(), objednavka=o2)
    pay3 = Platba(castka=159.00, typ_platby="bankovní převod",
                  datum=datetime.now(), objednavka=o3)
    db.session.add_all([pay1, pay2, pay3])

    # 13) Hodnocení
    h1 = Hodnoceni(hodnoceni=5, komentar="Vynikající služba!",
                   datum=datetime.now(), objednavka=o1, zakaznik=zak1)
    h2 = Hodnoceni(hodnoceni=4, komentar="Velmi dobré.",
                   datum=datetime.now(), objednavka=o2, zakaznik=zak2)
    h3 = Hodnoceni(hodnoceni=3, komentar="Ujde.",
                   datum=datetime.now(), objednavka=o3, zakaznik=zak3)
    db.session.add_all([h1, h2, h3])

    # 14) Jídelní plány
    jp1 = JidelniPlan(nazev="Týdenní nabídka",
                      platny_od=date.today(),
                      platny_do=date.today() + timedelta(days=7))
    jp2 = JidelniPlan(nazev="Víkendový speciál",
                      platny_od=date.today(),
                      platny_do=date.today() + timedelta(days=2))
    jp3 = JidelniPlan(nazev="Zimní menu",
                      platny_od=date.today(),
                      platny_do=date.today() + timedelta(days=30))
    db.session.add_all([jp1, jp2, jp3])

    # 15) Položky jídelních plánů
    jpp1 = PolozkaJidelnihoPlanu(den=date.today(), poradi=1, plan=jp1, menu_polozka=m1)
    jpp2 = PolozkaJidelnihoPlanu(den=date.today(), poradi=2, plan=jp1, menu_polozka=m2)
    jpp3 = PolozkaJidelnihoPlanu(den=date.today() + timedelta(days=1),
                                  poradi=1, plan=jp2, menu_polozka=m3)
    db.session.add_all([jpp1, jpp2, jpp3])

    # 16) Notifikace
    n1 = Notifikace(typ="email", datum_cas=datetime.now(),
                    text="Vaše rezervace byla potvrzena.", rezervace=r1)
    n2 = Notifikace(typ="sms", datum_cas=datetime.now(),
                    text="Objednávka přijata a bude připravena.", objednavka=o2)
    n3 = Notifikace(typ="push", datum_cas=datetime.now(),
                    text="Jídelní plán byl aktualizován.")
    db.session.add_all([n1, n2, n3])

    # Uložíme všechny vložené záznamy najednou
    db.session.commit()
    click.echo("✅ Demo data úspěšně vložena do všech tabulek.")


# 6) Shell context pro `flask shell`
@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "Zakaznik": Zakaznik,
        "VernostniUcet": VernostniUcet,
        "Rezervace": Rezervace,
        "Stul": Stul,
        "Salonek": Salonek,
        "PodnikovaAkce": PodnikovaAkce,
        "Objednavka": Objednavka,
        "PolozkaObjednavky": PolozkaObjednavky,
        "Platba": Platba,
        "Hodnoceni": Hodnoceni,
        "PolozkaMenu": PolozkaMenu,
        "PolozkaMenuAlergen": PolozkaMenuAlergen,
        "JidelniPlan": JidelniPlan,
        "PolozkaJidelnihoPlanu": PolozkaJidelnihoPlanu,
        "Alergen": Alergen,
        "Notifikace": Notifikace
    }


# 7) Spuštění serveru přímo `python run.py`
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)



"""
Principy a důležité body
------------------------
1. Nastavení prostředí
   - os.environ.setdefault("DATABASE_HOST", "localhost")
     Pokud spouštíme lokálně a proměnná DATABASE_HOST z .env zní "db" (Docker), 
     přepíšeme ji na "localhost" pro lokální připojení k databázi.

2. Application Factory
   - config_name = os.getenv("FLASK_CONFIG", "default")
     vybere režim (development/testing/production) podle env. proměnné.
   - app = create_app(config_name)
     vytvoří a nakonfiguruje Flask aplikaci.

3. Čištění databáze (_vycistit_databazi)
   - Smaže data z tabulek ve správném pořadí, aby se neporušila FK omezení:
     nejprve závislé tabulky (M:N, položky, notifikace), pak základní.

4. Seed CLI příkaz (flask seed-db)
   - @app.cli.command("seed-db") definuje příkaz `flask seed-db`.
   - Vloží demo data: zákazníky, účty, stoly, salóny, akce, položky menu, alergeny,
     rezervace, objednávky, platby, hodnocení, jídelní plány, notifikace.

5. Hashování hesel
   - Zakaznik.password = "raw": setter v modelu generate_password_hash uloží hash
     do sloupce _password, raw heslo se nikde neukládá.

6. Shell context (flask shell)
   - @app.shell_context_processor: přidá `db` a modely do shellu,
     nemusíme je importovat ručně.

7. Spuštění serveru
   - `python run.py` spustí vývojový server na 0.0.0.0:8000 s debug režimem.
"""