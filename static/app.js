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
$(document).on('click', '#btnOrder', function () {
    if ($('#txtOrderDate').val() === '') {
        alert('注文日を入力してください。');
    }
    location.href="#order";
});
$(document).on('click', '#btnManage', function() {
    location.href="#manage";
    $.getJSON('/orders_per_month')
        .done(function (data) {
        if (!data || !data.results) return;
        createOrderListPerStore(data.results)
    })
        .fail(function (data) {
            createOrderListPerStore(data.responseJSON.results)
        });
});
$(document).on('click', '#btnCloseTodaysOrder', function() {
    var today = moment().format('YYYY-MM-DD');
    $.ajax({
        type: "POST",
        url: "/order_close_today/" + today,
        contentType: "application/json",
        data: JSON.stringify({}),
        dataType: "json"
    }).done(function (data) {
        if (!data || !data.results) {
            alert('注文の締め切りに失敗しました。');
        }
        alert('注文を締め切りました。');
        $('#orderCloseInfo').css('display', 'block');
        $('#btnCloseTodaysOrder').css('display', 'none');
        $('#btnReopenTodaysOrder').css('display', 'block');
    }).fail(function (data) {
        alert(data.responseText);
    });
});
$(document).on('click', '#btnReopenTodaysOrder', function () {
    var today = moment().format('YYYY-MM-DD');
    $.ajax({
        type: "POST",
        url: "/order_reopen_today/" + today,
        contentType: "application/json",
        data: JSON.stringify({}),
        dataType: "json"
    }).done(function (data) {
        if (!data || !data.results) {
            alert('注文の再開に失敗しました。');
        }
        alert('注文を再開しました。');
        $('#orderCloseInfo').css('display', 'none');
        $('#btnCloseTodaysOrder').css('display', 'block');
        $('#btnReopenTodaysOrder').css('display', 'none');
    }).fail(function (data) {
        alert(data.responseText);
    });
});
$(document).on('click', '#btnBackFromManage', function() {
    location.href="#";
});
$(document).on('click', '#btnBackFromOrder', function () {
    location.href = "#";
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
        if (!data || !data.results) {
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
        $('#btnSubmitOrder').css('display', 'none');
        $('#btnCancelOrder').css('display', 'block');
        location.href="#";
    }).fail(function (data) {
        alert(data.responseText);
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
        if (!data || !data.results) {
            alert('注文の取り消しに失敗しました。');
        }
        if (data.status === 200) {
            alert('注文を取り消ししました。')
        }
        $('#lblOrderStatus').text('注文未済みです。')
            .addClass('alert-warning')
            .removeClass('alert-success');
        $('#btnSubmitOrder').css('display', 'block');
        $('#btnCancelOrder').css('display', 'none');
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
            if (!data || !data.results || data.results.length === 0) {
            $('#selStore option:first')
                .attr('selected', 'selected');
            $('#selMenu option:first')
                .attr('selected', 'selected');
            return;
        }
            $('#selStore option[value="' + data.results[0].store_id + '"]')
            .attr('selected', 'selected');
            $('#selMenu option[value="' + data.results[0].menu_id + '"]')
            .attr('selected', 'selected');
        $('#lblOrderStatus').text('注文済みです。')
            .addClass('alert-success')
            .removeClass('alert-warning');
            $('#btnSubmitOrder').css('display', 'none');
            $('#btnCancelOrder').css('display', 'block');
            if (data.results.is_order_closed) {
                $('#orderCloseInfo').css('display', 'block');
                $('#btnCloseTodaysOrder').css('display', 'none');
                $('#btnReopenTodaysOrder').css('display', 'block');
            } else {
                $('#orderCloseInfo').css('display', 'none');
                $('#btnCloseTodaysOrder').css('display', 'block');
                $('#btnReopenTodaysOrder').css('display', 'none');
            }

    }).fail(function(data) {
        if (data.status === 404) {
            $('#lblOrderStatus').text('注文未済みです。')
                .addClass('alert-warning')
                .removeClass('alert-success');
            $('#btnSubmitOrder').css('display', 'block');
            $('#btnCancelOrder').css('display', 'none');
            $('#selStore option:first')
                .attr('selected', 'selected');
            $('#selMenu option:first')
                .attr('selected', 'selected');
            if (data.responseJSON.results.is_order_closed) {
                $('#orderCloseInfo')
                    .css('display', 'block');
                $('#btnCloseTodaysOrder').css('display', 'none');
                $('#btnReopenTodaysOrder').css('display', 'block');
            } else {
                $('#orderCloseInfo')
                    .css('display', 'none');
                $('#btnCloseTodaysOrder').css('display', 'block');
                $('#btnReopenTodaysOrder').css('display', 'none');
            }
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
            if (!data || !data.results) {
                alert('yammerのユーザー情報取得に失敗しました。');
            }
            user_info = {
                'token': data.results.token,
                'email': data.results.email,
                'user_name': data.results.user_name,
                'is_soumu': data.results.is_soumu,
                'id': data.results.id
            };
            localStorage.setItem('user_info', JSON.stringify(user_info));
            //codeを取り除く
            location.href = location.href.split('?')[0];
        }).fail(function (data) {
            alert(data.responseText);
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
    });
    changeDiv();
});

function createOrderListPerStore(orderData) {
    //列の設定
    var colModelSettings= [
        {name:"order_date",index:"date",width:100,align:"center"},
        {name:"user_id",index:"user_id",width:70,align:"center", hidden:true},
        {name:"user_name",index:"user_name",width:200,align:"center"},
        {name:"menu_id",index:"menu_id",width:200,align:"center", hidden:true},
        {name:"menu_name",index:"menu_name",width:200,align:"center"},
        {name:"unit", index: "unit", width: 50, align: "center"},
        {name:"price", index: "unit", width: 50, align: "center"},
        {name:"store_id",index:"store_id",width:200,align:"center", hidden:true},
        {name:"store_name",index:"store_name",width:200,align:"center"},
        {name:"proxy_user_id",index:"proxy_user_id",width:70,align:"center", hidden:true},
        {name:"proxy_user_name",index:"proxy_user_name",width:70,align:"center", hidden:true}
    ];
    //列の表示名
    var colNames = ["日付", "社員ID", "社員名", "注文ID", "注文名", "個数", "金額", "店ID", "店名", "代理社員ID", "代理社員名"];

    //テーブルの作成
    $("#tabOrderDetail").jqGrid({
        data: orderData,  //表示したいデータ
        datatype : "local",            //データの種別 他にjsonやxmlも選べます。
        //しかし、私はlocalが推奨です。
        colNames : colNames,           //列の表示名
        colModel : colModelSettings,   //列ごとの設定
        rowNum : 100,                   //一ページに表示する行数
        rowList : [1, 10, 20],         //変更可能な1ページ当たりの行数
        caption : "当月注文状況詳細",    //ヘッダーのキャプション
        height : 'auto',                  //高さ
        width : 500,                   //幅
        shrinkToFit : true,        //画面サイズに依存せず固定の大きさを表示する設定
        viewrecords: true              //footerの右下に表示する。
    });
    var summaryOrderData = orderData.reduce(function (prev, current) {
        if (!prev.some(function(value) {return value.menu_id === current.menu_id;})) {
            prev.push(current);
        } else {
            var target = prev.filter(function(value) {return value.menu_id === current.menu_id;})
            target.unit += current.unit;
            target.price += current.price;
        }
        return prev;
    }, []);

    //列の設定
    var colSummaryModelSettings= [
        {name:"order_date",index:"date",width:100,align:"center"},
        {name:"menu_id",index:"menu_id",width:200,align:"center", hidden:true},
        {name:"menu_name",index:"menu_name",width:200,align:"center"},
        {name:"unit", index: "unit", width: 50, align: "center"},
        {name:"price", index: "unit_price", width: 50, align: "center"},
        {name:"store_id",index:"store_id",width:200,align:"center", hidden:true},
        {name:"store_name",index:"store_name",width:200,align:"center"},
    ];
    //列の表示名
    var colSummaryNames = ["日付", "注文ID", "注文名", "個数", "金額", "店ID", "店名"];
    $("#tabOrderSummary").jqGrid({
        data: summaryOrderData,  //表示したいデータ
        datatype : "local",            //データの種別 他にjsonやxmlも選べます。
        //しかし、私はlocalが推奨です。
        colNames : colSummaryNames,           //列の表示名
        colModel : colSummaryModelSettings,   //列ごとの設定
        rowNum : 100,                   //一ページに表示する行数
        rowList : [1, 10, 20],         //変更可能な1ページ当たりの行数
        caption : "本日注文状況",    //ヘッダーのキャプション
        height : 'auto',                  //高さ
        width : 500,                   //幅
        shrinkToFit : true,        //画面サイズに依存せず固定の大きさを表示する設定
        viewrecords: true              //footerの右下に表示する。
    });

    //列の設定
    var colUserModelSettings= [
        {name:"user_id",index:"user_id",width:70,align:"center", hidden:true},
        {name:"user_name",index:"user_name",width:200,align:"center"},
        {name:"unit", index: "unit", width: 50, align: "center"},
        {name:"price", index: "unit", width: 50, align: "center"},
    ];
    var userOrderData = orderData.reduce(function (prev, current) {
        if (!prev.some(function(value) {return value.user_id === current.user_id;})) {
            prev.push(current);
        } else {
            var target = prev.filter(function(value) {return value.user_id === current.user_id;})
            target.unit += current.unit;
            target.price += current.price;
        }
        return prev;
    }, []);

    //テーブルの作成
    $("#tabOrderUserDetail").jqGrid({
        data: userOrderData,  //表示したいデータ
        datatype : "local",            //データの種別 他にjsonやxmlも選べます。
        //しかし、私はlocalが推奨です。
        colNames : ["社員ID", "社員名", "個数", "金額"],           //列の表示名
        colModel : colUserModelSettings,   //列ごとの設定
        rowNum : 100,                   //一ページに表示する行数
        rowList : [1, 10, 20],         //変更可能な1ページ当たりの行数
        caption : "当月個人別注文状況詳細",    //ヘッダーのキャプション
        height : 'auto',                  //高さ
        width : 500,                   //幅
        shrinkToFit : true,        //画面サイズに依存せず固定の大きさを表示する設定
        viewrecords: true              //footerの右下に表示する。
    });
}
