# run.py

import os
from app import create_app, db
# import všech modelů, aby je SQLAlchemy zaregistrovala
from app.models import (
    User, Table, Reservation, MenuItem, OrderItem,
    Order, Review, FavoriteDish, Promotion,
    Notification, LoyaltyHistory
)

# vyzvedneme config z proměnné prostředí
config_name = os.getenv("FLASK_CONFIG", "default")
app = create_app(config_name)

# shell-context – Flask shell vám automaticky poskytne tyto objekty
@app.shell_context_processor
def make_shell_context():
    return {
        "db": db,
        "User": User,
        "Table": Table,
        "Reservation": Reservation,
        "MenuItem": MenuItem,
        "OrderItem": OrderItem,
        "Order": Order,
        "Review": Review,
        "FavoriteDish": FavoriteDish,
        "Promotion": Promotion,
        "Notification": Notification,
        "LoyaltyHistory": LoyaltyHistory
    }

if __name__ == "__main__":
    # ve vývoji
    app.run(host="0.0.0.0", port=5000, debug=True)
