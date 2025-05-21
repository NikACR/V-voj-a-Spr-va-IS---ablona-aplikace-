# Tento soubor definuje databázové modely pomocí SQLAlchemy ORM.
# Každá třída zde reprezentuje jednu tabulku v databázi.

from .db import db  # Import instance SQLAlchemy z db.py
from sqlalchemy.sql import func  # Import SQL funkcí (např. pro server_default)
# Import modulu datetime (i když není přímo použitý, může se hodit)
import datetime
# from werkzeug.security import generate_password_hash, check_password_hash # Příklad pro hashování hesel

# -----------------------------------------
# Model pro uživatele (User)
# Use case: Správa uživatelů
# -----------------------------------------


class User(db.Model):
    """
    Model reprezentující uživatele v informačním systému.
    """
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80),  unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True),
                           server_default=func.now())

    # vztahy
    reservations = db.relationship(
        "Reservation",     back_populates="user",      lazy="dynamic")
    orders = db.relationship(
        "Order",           back_populates="user",      lazy="dynamic")
    reviews = db.relationship(
        "Review",          back_populates="user",      lazy="dynamic")
    notifications = db.relationship(
        "Notification",    back_populates="user",      lazy="dynamic")
    favorites = db.relationship(
        "FavoriteDish",    back_populates="user",      lazy="dynamic")
    loyalty = db.relationship(
        "LoyaltyHistory",  back_populates="user",      lazy="dynamic")

    def __repr__(self):
        return f"<User {self.username}>"


# Zde můžete přidat další modely podle potřeb vaší aplikace
# Například pro závody (Events), registrace (Registrations), výsledky (Results), atd.

# class Event(db.Model):
#     """Model reprezentující závod nebo událost."""
#     __tablename__ = 'events' # Explicitní název tabulky
#
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(100), nullable=False) # Název události
#     date = db.Column(db.Date, nullable=False) # Datum konání
#     description = db.Column(db.Text) # Delší popis události
#     created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
#
#     # Příklad relace (pokud by existoval model Registration)
#     # registrations = db.relationship('Registration', backref='event', lazy=True)
#
#     def __repr__(self):
#         return f"<Event {self.name} ({self.date})>"
#
# class Registration(db.Model):
#     """Model reprezentující registraci uživatele na závod."""
#     __tablename__ = 'registrations'
#
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
#     event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
#     registration_time = db.Column(db.DateTime(timezone=True), server_default=func.now())
#     status = db.Column(db.String(50)) # Např. 'confirmed', 'pending', 'cancelled'
#
#     user = db.relationship('User', backref=db.backref('registrations', lazy=True))
#     __table_args__ = (db.UniqueConstraint('user_id', 'event_id', name='uq_user_event_registration'),)
#
#     def __repr__(self):
#         return f"<Registration user={self.user_id} event={self.event_id}>"


# -----------------------------------------
# Model pro stoly (Table)
# Use case: Zobrazení vytíženosti stolů, Rezervace stolu, Výběr stolu
# -----------------------------------------
class Table(db.Model):
    __tablename__ = "tables"

    id = db.Column(db.Integer, primary_key=True)
    capacity = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False,
                       default="free")  # free, reserved, occupied

    # vztahy
    reservations = db.relationship(
        "Reservation", back_populates="table", lazy="dynamic")
    orders = db.relationship(
        "Order",       back_populates="table",   lazy="dynamic")

    def __repr__(self):
        return f"<Table {self.id} (cap={self.capacity}, status={self.status})>"


# -----------------------------------------
# Model pro rezervace (Reservation)
# Use case: Rezervace stolu, Ověření rezervace dle jména
# -----------------------------------------
class Reservation(db.Model):
    __tablename__ = "reservations"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"),  nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey(
        "tables.id"), nullable=False)
    reservation_time = db.Column(db.DateTime(
        timezone=True),            nullable=False)
    status = db.Column(db.String(20),
                       nullable=False, default="pending")
    created_at = db.Column(db.DateTime(timezone=True),
                           server_default=func.now())

    # vztahy
    user = db.relationship("User",  back_populates="reservations")
    table = db.relationship("Table", back_populates="reservations")

    def __repr__(self):
        return f"<Reservation {self.id} user={self.user_id} table={self.table_id} at {self.reservation_time}>"


# -----------------------------------------
# Model pro položky menu (MenuItem)
# Use case: Prohlížet menu, Správa menu
# -----------------------------------------
class MenuItem(db.Model):
    __tablename__ = "menu_items"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text,    nullable=True)
    price = db.Column(db.Numeric(8, 2), nullable=False)
    available = db.Column(db.Boolean, nullable=False, default=True)

    # vztahy
    order_items = db.relationship(
        "OrderItem",   back_populates="menu_item", lazy="dynamic")
    favorites = db.relationship(
        "FavoriteDish", back_populates="menu_item", lazy="dynamic")
    reviews = db.relationship(
        "Review",       back_populates="menu_item", lazy="dynamic")

    def __repr__(self):
        return f"<MenuItem {self.name} ({self.price} Kč)>"


# -----------------------------------------
# Asociační tabulka položek objednávky (OrderItem)
# Use case: Objednání z menu, Správa objednávek
# -----------------------------------------
class OrderItem(db.Model):
    __tablename__ = "order_items"

    order_id = db.Column(db.Integer, db.ForeignKey(
        "orders.id"),     nullable=False, primary_key=True)
    menu_item_id = db.Column(db.Integer, db.ForeignKey(
        "menu_items.id"), nullable=False, primary_key=True)
    quantity = db.Column(db.Integer,
                         nullable=False, default=1)

    # vztahy
    order = db.relationship("Order",     back_populates="items")
    menu_item = db.relationship("MenuItem",  back_populates="order_items")

    def __repr__(self):
        return f"<OrderItem order={self.order_id} item={self.menu_item_id} qty={self.quantity}>"


# -----------------------------------------
# Model pro objednávky (Order)
# Use case: Objednání z menu, Aktualizace stavu objednávky, Přinesení objednávky
# -----------------------------------------
class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"),  nullable=False)
    table_id = db.Column(db.Integer, db.ForeignKey("tables.id"), nullable=True)
    # new, in_progress, done, cancelled
    status = db.Column(db.String(20), nullable=False, default="new")
    created_at = db.Column(db.DateTime(timezone=True),
                           server_default=func.now())

    # vztahy
    user = db.relationship("User",  back_populates="orders")
    table = db.relationship("Table", back_populates="orders")
    items = db.relationship(
        "OrderItem", back_populates="order", lazy="dynamic")
    review = db.relationship(
        "Review",    back_populates="order", uselist=False)

    def __repr__(self):
        return f"<Order {self.id} user={self.user_id} status={self.status}>"


# -----------------------------------------
# Model pro hodnocení (Review)
# Use case: Ohodnocení jídla/obsluhy
# -----------------------------------------
class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        "users.id"),       nullable=False)
    order_id = db.Column(db.Integer, db.ForeignKey(
        "orders.id"),      nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey(
        "menu_items.id"),  nullable=True)
    rating = db.Column(db.Integer,
                       nullable=False)  # např. 1–5
    comment = db.Column(db.Text,
                        nullable=True)
    created_at = db.Column(db.DateTime(timezone=True),
                           server_default=func.now())

    # vztahy
    user = db.relationship("User",     back_populates="reviews")
    order = db.relationship("Order",    back_populates="review")
    menu_item = db.relationship("MenuItem", back_populates="reviews")

    def __repr__(self):
        return f"<Review {self.id} rating={self.rating}>"


# -----------------------------------------
# Model pro oblíbené jídlo (FavoriteDish)
# Use case: Zobrazení oblíbených jídel
# -----------------------------------------
class FavoriteDish(db.Model):
    __tablename__ = "favorite_dishes"

    user_id = db.Column(db.Integer, db.ForeignKey(
        "users.id"),      primary_key=True)
    menu_item_id = db.Column(db.Integer, db.ForeignKey(
        "menu_items.id"), primary_key=True)

    # vztahy
    user = db.relationship("User",     back_populates="favorites")
    menu_item = db.relationship("MenuItem", back_populates="favorites")

    def __repr__(self):
        return f"<FavoriteDish user={self.user_id} item={self.menu_item_id}>"


# -----------------------------------------
# Model pro akce/promo (Promotion)
# Use case: Zobrazení akcí podniku
# -----------------------------------------
class Promotion(db.Model):
    __tablename__ = "promotions"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text,    nullable=True)
    start_date = db.Column(db.Date,    nullable=False)
    end_date = db.Column(db.Date,    nullable=False)

    def __repr__(self):
        return f"<Promotion {self.title} from {self.start_date} to {self.end_date}>"


# -----------------------------------------
# Model pro notifikace (Notification)
# Use case: Zasílání notifikace emailem/SMS, Zasílání e-účtenky
# -----------------------------------------
class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # email, sms
    content = db.Column(db.Text,     nullable=True)
    sent_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    # vztahy
    user = db.relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.id} to user={self.user_id} type={self.type}>"


# -----------------------------------------
# Model pro historii věrnostního programu (LoyaltyHistory)
# Use case: Vyhodnocení věrnostního programu, Zaznamenání historie objednávek
# -----------------------------------------
class LoyaltyHistory(db.Model):
    __tablename__ = "loyalty_history"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    # např. 'order', 'reservation', 'review'
    event = db.Column(db.String(50), nullable=False)
    points = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True),
                           server_default=func.now())

    # vztahy
    user = db.relationship("User", back_populates="loyalty")

    def __repr__(self):
        return f"<LoyaltyHistory {self.id} user={self.user_id} event={self.event} pts={self.points}>"
