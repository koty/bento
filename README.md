[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

# bento
諸事情で作ることになった弁当注文取りシステムです。

動作はchromeで確認しています。androidのchromeでも確認するつもりです。

古いブラウザ（IE9以前とか）では多分動きません。

利用しているもの：python/flask/peewee/sqlite/jquery/bootstrap/jqgrid等

## install
* python3推奨。python2で動くかは知りません。
* virtualenvを作ったほうがいいかもしれません。

以下のコマンドを実行

        % git clone git@github.com:koty/bento.git
        % cd bento
        % mkvirtualenv -p /usr/local/bin/python3 --no-site-packages bento 
        % pip install -r requirements.txt
        % python3 app.py

その後、http://localhost:port/static/ にアクセスすれば、動くかと思います。

静的HTMLのシングルページアプリケーション＋JSONのAPIで作っています。HTMLアプリ以外にも http://localhost:port/static/apilist.html を参考にAPIを呼びだせば、AndroidやiOSでも使え（るはず）ます。
