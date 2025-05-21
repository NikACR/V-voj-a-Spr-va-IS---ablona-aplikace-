import os
from app import create_app, db

# import všech modelů
from app.models import (
    Zakaznik,
    VernostniUcet,
    Rezervace,
    Stul,
    Salonek,
    PodnikovaAkce,
    Objednavka,
    PolozkaObjednavky,
    Platba,
    Hodnoceni,
    PolozkaMenu,
    PolozkaMenuAlergen,
    JidelniPlan,
    PolozkaJidelnihoPlanu,
    Alergen,
    Notifikace
)

config_name = os.getenv("FLASK_CONFIG", "default")
app = create_app(config_name)


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


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
