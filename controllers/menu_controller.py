# -*- coding: utf-8 -*-

__author__ = 'koty'
from flask import jsonify, Blueprint
from model import Menu, Store

menu_controller = Blueprint('menu_controller', __name__)


@menu_controller.route('/menus/<store_id>', methods=['GET'])
def get_menus(store_id):
    menus_query = Menu.select().where(Menu.store == Store(id=store_id))
    menus_result = [{
                        'menu_id': menu.get_id(),
                        'menu_name': menu.menu_name,
                        'store_id': menu.store.get_id(),
                        'store_name': menu.store.store_name,
                        'unit_price': menu.unit_price,
                    } for menu in menus_query]
    response = jsonify({'results': menus_result})
    # ステータスコードは OK (200)
    response.status_code = 200
    return response


@menu_controller.route('/stores', methods=['GET'])
def get_stores():
    stores_query = Store.select()
    stores_result = [{
                         'store_id': store.get_id(),
                         'store_name': store.store_name,
                         'latest_payment_month': store.latest_payment_month,
                         'payment_day': store.payment_day,
                     } for store in stores_query]
    response = jsonify({'results': stores_result})
    # ステータスコードは OK (200)
    response.status_code = 200
    return response
