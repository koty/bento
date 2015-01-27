# -*- coding: utf-8 -*-
from controllers.utils import consumes

__author__ = 'koty'
import json
from flask import jsonify, request, Blueprint
from model import User

user_controller = Blueprint('user_controller', __name__)

@user_controller.route('/users', methods=['GET'])
def get_uers():
    # ユーザ一覧からレスポンスを作る
    users = User.select()  # 全件取得
    users_result = [{
                        'user_name': user.user_name,
                        'email': user.email,
                        'id': user.get_id(),
                        } for user in users]
    response = jsonify({'results': users_result})
    # ステータスコードは OK (200)
    response.status_code = 200
    return response


@user_controller.route('/users', methods=['POST'])
@consumes('application/json')
def post_user():
    # Content-Body を JSON 形式として辞書に変換する
    content_body_dict = json.loads(request.data.decode())

    user = User.get_or_create(User.email == content_body_dict['email'])
    if user.exists():
        user.user_name = content_body_dict['name']
    else:
        user.user_name = content_body_dict['name']
        user.email = content_body_dict['email']

    # 保存
    user.save()

    result = {'result': {'user': {
        'username': user.user_name,
        'email': user.email,
        'id': user.get_id()
    }}}
    response = jsonify(result)

    # ステータスコードは Created (201)
    if user.exists():
        response.status_code = 200
    else:
        response.status_code = 201

    return response


@user_controller.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = User.get(id=user_id)
    if not user.exists():
        response = jsonify({})
        response.status_code = 404
        return response

    result = {'result': {'user': {
        'username': user.user_name,
        'email': user.email,
        'id': user.get_id()
    }}}
    response = jsonify(result)
    response.status_code = 200

    return response
