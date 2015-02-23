# -*- coding: utf-8 -*-
from controllers.utils import consumes, add_months

__author__ = 'koty'
import json
from flask import jsonify, request, Blueprint
from model import Order, User, Menu, Store, Config
from datetime import datetime, timedelta
from dateutil.parser import parse

order_controller = Blueprint('order_controller', __name__)


@order_controller.route('/orders', methods=['POST'])
@consumes('application/json')
def post_order():
    # Content-Body を JSON 形式として辞書に変換する
    content_body_dict = json.loads(request.data.decode())

    order = Order.select(Order.user == User(id=content_body_dict['user_id'])
                         and Order.order_date == content_body_dict['order_date'])
    # order[0].get_id()は不要そうな気がするけど、order.exists()がtrueになるので。。。
    if order.exists() and order[0].get_id():
        results = {'results': {'user': {
            'user_id': content_body_dict['user_id'],
            'order_date': content_body_dict['order_date'],
            'id': order[0].get_id()
        }}}
        response = jsonify({'results': results})
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

    results = {'results': {'user': {
        'user_id': order.user.get_id(),
        'order_date': order.order_date,
        'id': order.get_id()
    }}}
    response = jsonify(results)

    # ステータスコードは Created (201)
    response.status_code = 201
    return response


@order_controller.route('/orders', methods=['DELETE'])
@consumes('application/json')
def delete_order():
    # Content-Body を JSON 形式として辞書に変換する
    content_body_dict = json.loads(request.data.decode())

    order = Order.select(Order.user == User(id=content_body_dict['user_id'])
                         and Order.order_date == content_body_dict['order_date'])
    if order.exists():
        q = Order.delete() \
            .where(Order.user == User(id=content_body_dict['user_id'])
                   and Order.order_date == content_body_dict['order_date'])
        q.execute()
        results = {'results': True}
        response = jsonify({'results': results})
        response.status_code = 200
        return response

    result = {'results': True}
    response = jsonify(result)

    response.status_code = 404
    return response


def _get_orders(orders, is_order_closed=False):
    if not orders.exists():
        response = jsonify({'results': {'is_order_closed': is_order_closed}})
        response.status_code = 404
        return response

    orders = sorted(orders, key=lambda o: o.order_date)

    results = {'results': [
        {'id': o.id,
         'order_date': str(o.order_date),
         'menu_id': o.menu.get_id(),
         'menu_name': o.menu.menu_name,
         'unit': o.unit,
         'price': o.unit * o.menu.unit_price,
         'user_id': o.user.get_id(),
         'user_name': o.user.user_name,
         'store_id': o.menu.store.get_id(),
         'store_name': o.menu.store.store_name,
         'proxy_user_id': o.proxy_user.get_id() if o.proxy_user else '',
         'proxy_user_name': o.proxy_user.user_name if o.proxy_user else '',
        } for o in orders]
        , 'is_order_closed': is_order_closed}
    response = jsonify(results)
    response.status_code = 200
    return response


@order_controller.route('/orders_per_month/<store_id>', methods=['GET'])
def get_order_per_month(store_id):
    store = Store.get(Store.id == store_id)
    today = datetime.today()
    
    last_payment_day = today.replace(day=store.payment_day)
    if today.day <= store.payment_day:
        # 前月支払日翌日〜今月支払日
        last_payment_day = add_months(last_payment_day, -1)
    last_payment_day = (last_payment_day + timedelta(days=1)).strftime('%Y-%m-%d')
    
    this_payment_day = today.replace(day=store.payment_day)
    if today.day > store.payment_day:
        this_payment_day = add_months(this_payment_day, 1)
    this_payment_day = this_payment_day.strftime('%Y-%m-%d')
        
    orders_query = Order.select().where(last_payment_day <= Order.order_date, Order.order_date <= this_payment_day)
    return _get_orders(orders_query)


@order_controller.route('/orders_by_date/<order_date>', methods=['GET'])
def get_order_by_date(order_date):
    orders_query = Order.select().where(Order.order_date == order_date)
    return _get_orders(orders_query, _get_is_order_closed(order_date))


@order_controller.route('/orders_by_user/<user_id>', methods=['GET'])
def get_order_by_user(user_id):
    orders_query = Order.select().where(Order.user == User(id=user_id))
    return _get_orders(orders_query)


@order_controller.route('/order_by_user_date/<user_id>/<order_date>', methods=['GET'])
def get_order_by_user_date(user_id, order_date):
    orders_query = Order.select() \
        .where(Order.user == User(id=user_id, email='', user_name='')
               , Order.order_date == order_date)
    return _get_orders(orders_query, _get_is_order_closed(order_date))


@order_controller.route('/order_close_today/<order_date>', methods=['POST'])
def close_today_order(order_date):
    data = Config.get(Config.key == '最新注文締め日')
    data.value = order_date
    data.save()
    response = jsonify({'results': True})
    response.status_code = 200
    return response


@order_controller.route('/order_reopen_today/<order_date>', methods=['POST'])
def close_reopen_order(order_date):
    data = Config.get(Config.key == '最新注文締め日')
    data.value = parse(order_date)
    data.value = (data.value + timedelta(days=-1)).strftime('%Y-%m-%d')
    data.save()
    response = jsonify({'results': True})
    response.status_code = 200
    return response


def _get_is_order_closed(order_date):
    data = Config.get(Config.key == '最新注文締め日')
    return data.value >= order_date
