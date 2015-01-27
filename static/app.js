function changeDiv() {
    if (location.hash === '#order'){
        $('#divHome').css('display', 'none');
        $('#divOrder').css('display', 'block');
        $('#divManage').css('display', 'none');
    } else if (location.hash === '#manage') {
        $('#divHome').css('display', 'none');
        $('#divOrder').css('display', 'none');
        $('#divManage').css('display', 'block');
    } else {
        $('#divHome').css('display', 'block');
        $('#divOrder').css('display', 'none');
        $('#divManage').css('display', 'none');
    }
}
$(document).on('click', '#btnOrder', function() {
    location.href="#order";
});
$(document).on('click', '#btnManage', function() {
    location.href="#manage";
});
$(document).on('click', '#btnSubmitOrder', function() {
    location.href="#";
});
$(document).on('click', '#btnCancelOrder', function() {
    location.href="#";
});
$(document).on('click', '#btnBackFromManage', function() {
    location.href="#";
});
$(document).on('click', '#authYammer', function() {
    var ORG_KEY = 'yammer-organization';
    var yammer_org = localStorage.getItem(ORG_KEY);
    if (!yammer_org) {
        if (location.search) {
            yammer_org = location.search.split('=')[1];
        } else {
            yammer_org = window.prompt("yammerの組織名を入力してください", "");
        }
        if (!yammer_org) return;
        localStorage.setItem(ORG_KEY, yammer_org);
    }
    location.href = 'https://www.yammer.com/'
        + yammer_org
        + '/dialog/oauth?client_id=7P0TIAkZg8TgXAHSwiB0KQ&redirect_uri='
        + encodeURIComponent(location.href);
});
$(window).hashchange(function() {
    changeDiv();
});
var user_info;
$(window).on('load', function () {
    if (location.search.indexOf("?code=") >= 0) {
        var code = location.search.split('=')[1];
        $.ajax({
            type: "POST",
            url: "/auth",
            contentType: "application/json",
            data: JSON.stringify({'code': code}),
            dataType: "json"
        }).done(function (data) {
            if (!data || !data.result) {
                alert('yammerのユーザー情報取得に失敗しました。');
            }
            user_info = {
                'token': data.result.token,
                'email': data.result.email,
                'user_name': data.result.user_name,
                'is_soumu': data.result.is_soumu
            };
            localStorage.setItem('user_info', JSON.stringify(user_info));
            //codeを取り除く
            location.href = location.href.split('?')[0];
        }).fail(function (data) {
            alert(data);
        });
    }
    var user_info_json = localStorage.getItem('user_info');
    if (user_info_json != null) {
        user_info = JSON.parse(user_info_json);
        $('#authYammer').css('display', 'none');
        $('#yammerUserInfo')
            .css('display', 'block')
            .text(user_info.user_name
            + ' <' + user_info.email + '> '
            + 'としてログイン中');
        if (user_info.is_soumu) {
            $('#btnManage').css('display', 'block');
        }
    }

    $('#selStore').selectpicker({
        'selectedValue': '弁当屋A'
    });
    $('#selBento').selectpicker({
        'selectedValue': '中'
    });
    changeDiv();
});

//列の設定
var colModelSettings= [
    {name:"date",index:"date",width:100,align:"center"},
    {name:"emp_id",index:"no",width:70,align:"center", hidden:true},
    {name:"emp_name",index:"emp_name",width:200,align:"center"},
    {name:"order_item_id",index:"age",width:200,align:"center", hidden:true},
    {name:"order_item_name",index:"local",width:200,align:"center"}
];
//列の表示名
var colNames = ["日付","社員ID","社員名","注文ID","注文名"];
var data = [
    {date:'2014-01-23',emp_id:1,emp_name:'あああ',order_item_id:'MS',order_item_name:'ごはん少'},
    {date:'2014-01-23',emp_id:1,emp_name:'ううう',order_item_id:'M0',order_item_name:'ごはんなし'},
    {date:'2014-01-23',emp_id:1,emp_name:'いいい',order_item_id:'MM',order_item_name:'ごはん中'}
];
//テーブルの作成
$("#tabOrderList").jqGrid({
    data:data,  //表示したいデータ
    datatype : "local",            //データの種別 他にjsonやxmlも選べます。
    //しかし、私はlocalが推奨です。
    colNames : colNames,           //列の表示名
    colModel : colModelSettings,   //列ごとの設定
    rowNum : 100,                   //一ページに表示する行数
    rowList : [1, 10, 20],         //変更可能な1ページ当たりの行数
    caption : "注文状況",    //ヘッダーのキャプション
    height : 200,                  //高さ
    width : 500,                   //幅
    shrinkToFit : true,        //画面サイズに依存せず固定の大きさを表示する設定
    viewrecords: true              //footerの右下に表示する。
});
