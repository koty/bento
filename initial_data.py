# -*- coding: utf-8 -*-
__author__ = 'koty'
import model


class InitialData:
    @staticmethod
    def create_users():
        model.User(user_name='塚田俊秀', email='tsukada@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='三井昇', email='mitsui@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='西澤太平', email='t_nishizawa@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='横田憲治', email='yokota@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='池亀栄二', email='ikegame@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='中澤祐一', email='y_nakazawa@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='有川清志', email='arikawa@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='垣田和彦', email='k_kakita@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='鈴木清', email='suzuki@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='岸田修一', email='kishida@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='荒井崇夫', email='arai@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='田中健治', email='k.tanaka@sakata-seed.co.jp', is_soumu=True).save()
        model.User(user_name='青木勉', email='aoki@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='中沢良光', email='nakazawa@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='田中宏昌', email='hir_tanaka@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='小林博徳', email='h_kobayashi@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='橋詰廣', email='hashidume@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='小林達也', email='t_kobayashi@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='西澤晃一', email='k_nishizawa@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='縣佳男', email='agata@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='田中宏明', email='h_tanaka@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='知野雄二', email='chino@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='高橋孝幸', email='takahashi@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='大田省吾', email='oota@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='桜井太一', email='sakurai@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='小池幸司', email='koike@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='中島祐樹', email='nakajima@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='堀米ゆかり', email='horigome@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='宮坂敏彰', email='miyasaka@jsl.co.jp', is_soumu=True).save()
        model.User(user_name='会津匠', email='aidu@jsl.co.jp', is_soumu=True).save()

    @staticmethod
    def create_stores():
        store = model.Store(store_name='店A', latest_payment_month=1, payment_day=20)
        store.save()

    @staticmethod
    def create_menus():
        store = model.Store(id=1)
        model.Menu(store=store, menu_name='ごはん少', unit_price=250).save()
        model.Menu(store=store, menu_name='ごはん無', unit_price=210).save()
        model.Menu(store=store, menu_name='ごはん中', unit_price=280).save()
        model.Menu(store=store, menu_name='ごはん多', unit_price=310).save()

    @staticmethod
    def create_config():
        model.Config(key='最新注文締め日', value='2015-01-27').save()

    @staticmethod
    def get_client_secret():
        return "y9Dbz9qu9HoAXXLrfvnCabyLcIHqhZ0dkWVCPbmSI"
    
    @staticmethod
    def get_client_id():
        return "7P0TIAkZg8TgXAHSwiB0KQ"
    