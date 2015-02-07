# -*- coding: utf-8 -*-
import json

from flask import Flask, jsonify
from flask import request

from controllers import user_controller, order_controller, menu_controller
from controllers.utils import consumes
from model import User


app = Flask(__name__, static_folder='static')
app.register_blueprint(user_controller.user_controller)
app.register_blueprint(order_controller.order_controller)
app.register_blueprint(menu_controller.menu_controller)


@app.route('/static/')
def root():
    return app.send_static_file('index.html')

@app.route('/static/list/monthly')
def list_monthly():
    return app.send_static_file('list_monthly.html')


@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("favicon.ico")


@app.route('/auth', methods=['POST', 'GET'])
@consumes('application/json')
def auth_yammer():
    content_body_dict = json.loads(request.data.decode())
    email = content_body_dict['email']
    user = User.get(User.email == email)
    results = {'results': {
        'user_name': user.user_name,
        'email': email,
        'is_soumu': user.is_soumu,
        'id': user.get_id(),
    }}

    response = jsonify(results)
    response.status_code = 200
    return response


if __name__ == '__main__':
    app.run()
