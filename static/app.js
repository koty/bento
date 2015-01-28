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
    if ($('#txtOrderDate').val() === '') {
        alert('注文日を入力してください。');
    }
    location.href="#order";
});
$(document).on('click', '#btnManage', function() {
    location.href="#manage";
});
$(document).on('click', '#btnBackFromManage', function() {
    location.href="#";
});
$(document).on('click', '#btnSubmitOrder', function() {
    var post_data = {};
    post_data.store_id = $('#selStore').find(":selected").val();
    post_data.menu_id = $('#selMenu').find(":selected").val();
    post_data.user_id = user_info.id;
    post_data.order_date = $('#txtOrderDate').val();
    $.ajax({
        type: "POST",
        url: "/orders",
        contentType: "application/json",
        data: JSON.stringify(post_data),
        dataType: "json"
    }).done(function (data) {
        if (!data || !data.result) {
            alert('注文の保存に失敗しました。');
        }
        if (data.status === 200) {
            alert('注文を修正しました。')
        } else {
            alert('注文を保存しました。');
        }
        $('#lblOrderStatus').text('注文済みです。')
            .addClass('alert-success')
            .removeClass('alert-warning');
        location.href="#";
    }).fail(function (data) {
        alert(data);
    });
});
$(document).on('click', '#btnCancelOrder', function(){
    var post_data = {};
    post_data.user_id = user_info.id;
    post_data.order_date = $('#txtOrderDate').val();
    $.ajax({
        type: "DELETE",
        url: "/orders",
        contentType: "application/json",
        data: JSON.stringify(post_data),
        dataType: "json"
    }).done(function (data) {
        if (!data || !data.result) {
            alert('注文の取り消しに失敗しました。');
        }
        if (data.status === 200) {
            alert('注文を取り消ししました。')
        }
        $('#lblOrderStatus').text('注文未済みです。')
            .addClass('alert-warning')
            .removeClass('alert-success');
        location.href="#";
    }).fail(function (data) {
        alert('注文はありません。');
        location.href="#";
    });
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
$(document).on('change', '#selStore', function(){
    var store_id = $("#selStore").find(':selected').val();
    $.getJSON('/menus/' + store_id).done(function(data) {
        var menu_options = data.results.map(function(s) {
            return '<option value="' + s.menu_id  + '">' + s.menu_name + '</option>';
        }).join('');
        $('#selMenu').html(menu_options);
        $('#txtOrderDate').trigger('change');
    });
});
$(document).on('change', '#txtOrderDate', function() {
    if ($('#txtOrderDate').val() === '') {
        return;
    }
    if (!user_info) {
        return;
    }
    $.getJSON('/order_by_user_date/' 
        + user_info.id + '/' 
        + $('#txtOrderDate').val())
    .done(function(data) {
        if (!data || !data.result || data.result.length === 0) {
            $('#selStore option:first')
                .attr('selected', 'selected');
            $('#selMenu option:first')
                .attr('selected', 'selected');
            return;
        }
        $('#selStore option[value="' + data.result[0].store_id + '"]')
            .attr('selected', 'selected');
        $('#selMenu option[value="' + data.result[0].menu_id + '"]')
            .attr('selected', 'selected');
        $('#lblOrderStatus').text('注文済みです。')
            .addClass('alert-success')
            .removeClass('alert-warning');
    }).fail(function(data) {
        if (data.status === 404) {
            $('#lblOrderStatus').text('注文未済みです。')
                .addClass('alert-warning')
                .removeClass('alert-success');
            $('#selStore option:first')
                .attr('selected', 'selected');
            $('#selMenu option:first')
                .attr('selected', 'selected');
        }
    });
});
$(window).hashchange(function() {
    changeDiv();
});
var user_info;
$(window).on('load', function () {
    $('#txtOrderDate').val(moment().format('YYYY-MM-DD'))
        .trigger('change');
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
                'is_soumu': data.result.is_soumu,
                'id': data.result.id
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
    $('#btnOrder').attr('disabled', user_info == null);
    $('#btnManage').attr('disabled', user_info == null);

    var last_selected_store_menu = localStorage.getItem('last_selected_store_menu');
    $.getJSON('/stores').done(function(data) {
        if (!data || !data.results) return;
        var store_options = data.results.map(function(s) {
            return '<option value="' + s.store_id  + '">' + s.store_name + '</option>';
        }).join('');
        $('#selStore').html(store_options);
        $('#selStore option:first').attr('selected','selected');
        $('#selStore').trigger('change');
    })
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
