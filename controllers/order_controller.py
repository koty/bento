# -*- coding: utf-8 -*-
from controllers.utils import consumes

__author__ = 'koty'
import json
from flask import jsonify, request, Blueprint
from model import Order, User, Menu, Store

order_controller = Blueprint('order_controller', __name__)


@order_controller.route('/orders', methods=['POST'])
@consumes('application/json')
def post_order():
    # Content-Body を JSON 形式として辞書に変換する
    content_body_dict = json.loads(request.data.decode())

    order = Order.select(Order.user == User(id=content_body_dict['user_id'])
                      , Order.order_date == content_body_dict['order_date'])
    if order.exists():
        result = {'result': {'user': {
            'user_id': content_body_dict['user_id'],
            'order_date': content_body_dict['order_date'],
            'id': order[0].get_id()
        }}}
        response = jsonify({'result': result})
        response.status_code = 200
        return response

    order = Order()
    store = Store(id=content_body_dict['store_id'], store_name='')
    order.menu = Menu(id=content_body_dict['menu_id']
                      , store=store)
    order.user = User(id=content_body_dict['user_id']
                      , email='', is_soumu=False, user_name='')
    order.store = store
    order.order_date = content_body_dict['order_date']

    # 保存
    order.save()

    result = {'result': {'user': {
        'user_id': order.user.get_id(),
        'order_date': order.order_date,
        'id': order.get_id()
    }}}
    response = jsonify(result)

    # ステータスコードは Created (201)
    response.status_code = 201
    return response


def _get_orders(orders):
    if not orders.exists():
        response = jsonify({})
        response.status_code = 404
        return response
    result = {'result': [
        {'id': o.id,
         'order_date': o.order_date,
         'menu_id': o.menu.get_id(),
         'menu_name': o.menu.menu_name,
         'user_id': o.user.get_id(),
         'user_name': o.user.user_name,
         'store_id': o.menu.store.get_id(),
         'store_name': o.menu.store.store_name,
         'proxy_user_id': o.proxy_user.get_id(),
        } for o in orders]}
    response = jsonify(result)
    response.status_code = 200
    return response


@order_controller.route('/orders_by_date/<order_date>', methods=['GET'])
def get_order_by_date(order_date):
    orders_query = Order.select().where(Order.order_date == order_date)
    return _get_orders(orders_query)


@order_controller.route('/orders_by_user/<user_id>', methods=['GET'])
def get_order_by_user(user_id):
    orders_query = Order.select().where(Order.user.id == user_id)
    return _get_orders(orders_query)


@order_controller.route('/order_by_user_date/<user_id>/<order_date>', methods=['GET'])
def get_order_by_user_date(user_id, order_date):
    orders_query = Order.select(Order, User, Menu, Store) \
        .join(User, Order, Menu) \
        .where(Order.user == User(id=user_id)
                                        , Order.order_date == order_date)
    return _get_orders(orders_query)
