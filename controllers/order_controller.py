# -*- coding: utf-8 -*-
from controllers.utils import consumes

__author__ = 'koty'
import json
from flask import jsonify, request, Blueprint
from model import Order

order_controller = Blueprint('order_controller', __name__)


@order_controller.route('/orders', methods=['POST'])
@consumes('application/json')
def post_order():
    # Content-Body を JSON 形式として辞書に変換する
    content_body_dict = json.loads(request.data.decode())

    order = Order.get_or_create(Order.user.id == content_body_dict['user_id']
                                , Order.order_date == content_body_dict['order_date'])
    if order.exists():
        order.menu_id = content_body_dict['menu_id']
    else:
        order.menu_id = content_body_dict['menu_id']
        order.user_id = content_body_dict['user_id']
        order.order_date = content_body_dict['order_date']

    # 保存
    order.save()

    result = {'result': {'user': {
        'user_id': order.user_id,
        'order_date': order.order_date,
        'id': order.get_id()
    }}}
    response = jsonify(result)

    # ステータスコードは Created (201)
    if order.exists():
        response.status_code = 200
    else:
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
         'menu_id': o.menu.get_id,
         'menu_name': o.menu.menu_name,
         'user_id': o.user.get_id(),
         'user_name': o.user.user_name,
         'store_id': o.menu.store.get_id(),
         'store_name': o.menu.store.store_name,
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


@order_controller.route('/orders_by_user_date/<user_id>/<order_date>', methods=['GET'])
def get_order_by_user_date(user_id, order_date):
    orders_query = Order.select().where(Order.user.id == user_id
                                        , Order.order_date == order_date)
    return _get_orders(orders_query)
