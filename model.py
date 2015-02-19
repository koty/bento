from peewee import *
from initial_data import InitialData
import os
import urllib.parse

try:
    database_url = os.environ["DATABASE_URL"]
    urllib.parse.uses_netloc.append("postgres")
    url = urllib.parse.urlparse(database_url)
    db = PostgresqlDatabase(url.path[1:], user=url.username, password=url.password, host=url.hostname)
except KeyError:
    #db = PostgresqlDatabase('bento')
    db = SqliteDatabase('my.db')


class BaseModel(Model):
    class Meta:
        database = db


class User(BaseModel):
    user_name = CharField(null=False, unique=True)
    email = CharField(null=False, unique=True)
    is_soumu = BooleanField(null=False, default=False)
    
    class Meta:
        db_table = 'user'


class Store(BaseModel):
    store_name = CharField(null=False)
    payment_day = IntegerField(null=False)
    latest_payment_month = IntegerField(null=False)
    
    class Meta:
        db_table = 'store'


class Config(BaseModel):
    key = CharField(null=False)
    value = CharField(null=False)


class Menu(BaseModel):
    store = ForeignKeyField(rel_model=Store, related_name='menus', null=False)
    menu_name = CharField(null=False)
    unit_price = IntegerField(null=False, default=0)
# 将来的にはiframeでメニューを表示できるようにしたい。。。
#    intro_url = CharField(null=True)

    class Meta:
        db_table = 'menu'


class Order(BaseModel):
    order_date = DateField(null=False)
    menu = ForeignKeyField(rel_model=Menu, related_name='orders', null=False)
    user = ForeignKeyField(rel_model=User, related_name='orders', null=False, to_field='id')
    proxy_user = ForeignKeyField(rel_model=User, related_name='orders_proxy', null=True, to_field='id')
    unit = IntegerField(null=False, default=1)

    class Meta:
        db_table = 'order'

if not User.table_exists():
    if not User.select().exists():
        User.create_table()
        InitialData.create_users()

if not Store.table_exists() and not Store.select().exists():
    Store.create_table()
    InitialData.create_stores()

if not Menu.table_exists() and not Menu.select().exists():
    Menu.create_table()
    InitialData.create_menus()

if not Order.table_exists() and not Order.select().exists():
    Order.create_table()

if not Config.table_exists() and not Config.select().exists():
    Config.create_table()
    InitialData.create_config()