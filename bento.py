# -*- coding: utf-8 -*-
import json
import http.client

from flask import Flask, jsonify
from flask import request

from controllers import user_controller, order_controller, menu_controller
from controllers.utils import consumes
from initial_data import InitialData
from model import User


app = Flask(__name__, static_folder='static')
app.register_blueprint(user_controller.user_controller)
app.register_blueprint(order_controller.order_controller)
app.register_blueprint(menu_controller.menu_controller)


@app.route('/static/')
def root():
    return app.send_static_file('index.html')


@app.route("/favicon.ico")
def favicon():
    return app.send_static_file("favicon.ico")


@app.route('/auth', methods=['POST', 'GET'])
@consumes('application/json')
def auth_yammer():
    content_body_dict = json.loads(request.data.decode())
    code = content_body_dict['code']
    if not code:
        return {'result': False}
    conn = http.client.HTTPSConnection("www.yammer.com")
    conn.request("GET", "/oauth2/access_token.json"
                 + "?client_id=" + InitialData.get_client_id()
                 + "&client_secret=" + InitialData.get_client_secret()
                 + "&code=" + code)
    res_bytes = conn.getresponse()
    res_json = res_bytes.readall().decode("UTF-8")
    conn.close()
    if "invalid" in res_json or "not allowed" in res_json:
        return res_json
    res = json.loads(res_json)
    if not res or not res['access_token'] or not res['access_token']['token']:
        return {'results': False}
    token = res['access_token']['token']
    email = res['user']['email']
    user = User.get(User.email == email)
    results = {'results': {
        'token': token,
        'user_name': res['user']['full_name'],
        'email': email,
        'is_soumu': user.is_soumu,
        'id': user.get_id(),
    }}

    response = jsonify(results)
    response.status_code = 200
    return response


if __name__ == '__main__':
    app.run()
