// ie8支持map
if (typeof Array.prototype.map != "function")
{
    Array.prototype.map = function(fn, context)
    {
        var arr = [];
        if (typeof fn === "function")
        {
            for (var k = 0, length = this.length; k < length; k++)
            {
                arr.push(fn.call(context, this[k], k, this));
            }
        }
        return arr;
    };
}

// Array.prototype.max = function() {
//     return Math.max.apply({}, this)
// }
// Array.prototype.min = function() {
//     return Math.min.apply({}, this)
// }
//日期
// Date.prototype.format = function(fmt) {
//     var o = {
//         "M+": this.getMonth() + 1, //月份
//         "d+": this.getDate(), //日
//         "h+": this.getHours(), //小时
//         "m+": this.getMinutes(), //分
//         "s+": this.getSeconds(), //秒
//         "q+": Math.floor((this.getMonth() + 3) / 3), //季度
//         "S": this.getMilliseconds() //毫秒
//     };
//     if (/(y+)/.test(fmt)) {
//         fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
//     }
//     for (var k in o) {
//         if (new RegExp("(" + k + ")").test(fmt)) {
//             fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//         }
//     }
//     return fmt;
// }

// 工具函数
var myUtil = {
    checkIE: function()
    {
        var browser = navigator.appName;
        var b_version = navigator.appVersion;
        var version = b_version.split(";");
        if (version && version[1])
        {
            var trim_Version = version[1].replace(/[ ]/g, "");
            if ((browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") || (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0"))
            {
                $('head')
                    .append('<link rel="stylesheet" href="/static/Main/css/hack.css">');
            }
        }
    },
    getNewObj: function(data)
    {
        return JSON.parse(JSON.stringify(data));
    },
    getsessionStorage: function(key)
    {
        return window.JSON.parse(window.sessionStorage.getItem(key));
    },
    setsessionStorage: function(key, value)
    {
        window.sessionStorage.setItem(key, window.JSON.stringify(value));
    },
    removesessionStorage: function(key)
    {
        window.sessionStorage.removeItem(key)
    },
    selectNode: function(obj, id)
    {
        var mySelectNodeId = window.myUtil.getsessionStorage(id + 'Ztree');
        var mySelectNode = obj.getNodeByTId(mySelectNodeId)
        mySelectNode && obj.selectNode(mySelectNode);
    },
    treeSetting: function(ztreeId)
    {
        return {
            callback:
            {
                onClick: function(event, treeId, treeNode, clickFlag)
                {
                    window.myUtil.setsessionStorage(ztreeId + 'Ztree', treeNode.tId);
                    treeNode.href && window.APP.wkTab.addTab(
                    {
                        id: treeNode.id,
                        name: treeNode.name,
                        url: treeNode.href,
                    });
                }
            }
        };
    }
}
var APP = {
    // 顶部显示隐藏
    toggleTop: function(control)
    {
        if (control)
        { //开
            $('.main_top')
                .show();
        }
        else
        { //关
            $('.main_top')
                .hide();
        }
    },
    toggleBottom: function(control)
    {
        if (control)
        { //开
            $('.main_page')
                .removeClass('hide_main_bottom');
        }
        else
        { //关
            $('.main_page')
                .addClass('hide_main_bottom');
        }
    },
    main: function(initTabArr)
    {
        var _this = this;
        myUtil.checkIE();

        // 渲染初始tab
        var targetId = '#insTab';
        var tabObj = myUtil.getsessionStorage(targetId + '__tab') ||
        {
            index: 0,
            tabs: initTabArr
        };
        setTimeout(function()
        {
            _this.wkTab = new myTab(tabConfig);
        }, 500);
        var tabConfig = {
            target: targetId,
            tabs: tabObj.tabs,
            index: tabObj.index,
        }
        // 顶部导行
        $('.main_page .main_top .main_menu li')
            .click(function()
            {
                var name = $(this)
                    .data('name');
                var index = $(this)
                    .index();
                var type = $(this)
                    .data('type');
                $(this).addClass('active').siblings().removeClass('active');

                // 缓存已点菜单
                myUtil.setsessionStorage('topMenu',
                {
                    index: index,
                });

                // 显示左侧
                $('.main_left .toShow')
                    .trigger('click');
                if (type == 'hideLeft')
                { //隐藏左侧
                    setTimeout(function()
                    {
                        $('.main_left .toHide')
                            .trigger('click');
                    }, 0);
                }
                zNodes = null;
                // 加载左侧菜单
                $.ajax(
                {
                    url: '/config/menu/' + name + '.html',
                    success: function(dom)
                    {
                        $('.main_page .main_contain .main_left .nav__ul')
                            .html(dom);
                    }
                });
            });
        // 读取缓存中的菜单
        var myTopMenu = myUtil.getsessionStorage('topMenu')
        if (myTopMenu && myTopMenu.index)
        {
            $('.main_page .main_top .main_menu li').eq(myTopMenu.index).trigger('click');
        }
        else
        {
            $('.main_page .main_top .main_menu li').eq(0).trigger('click');
        }

        // 侦听带有data-id的a链接
        $(document)
            .on('click', 'a[data-id]', function()
            {
                var id = $(this)
                    .data('id');
                var name = $(this)
                    .text();
                var href = $(this)
                    .data('href');
                if (href)
                {
                    _this.wkTab.addTab(
                    {
                        id: id,
                        name: name,
                        url: href,
                    });
                }
            });

        // 顶部最小化
        $('.slideTop li')
            .click(function(argument)
            {
                var open = $(this)
                    .hasClass('open');
                var close = $(this)
                    .hasClass('close');

                if (open)
                {
                    $('.slideTop li.open')
                        .hide();
                    $('.slideTop li.close')
                        .show();
                    $('.main_top')
                        .removeClass('hide');
                }
                if (close)
                {
                    $('.slideTop li.open')
                        .show();
                    $('.slideTop li.close')
                        .hide();
                    $('.main_top')
                        .addClass('hide');
                }
            });

        // 左侧导航左右切换
        $('.main_left .toHide')
            .click(function()
            {
                $('.main_contain')
                    .addClass('hideLeft');
                $('.main_left .toShow')
                    .addClass('active');
            });
        $('.main_left .toShow')
            .click(function()
            {
                $('.main_contain')
                    .removeClass('hideLeft');
                $('.main_left .toShow')
                    .removeClass('active');
            });

        // 左侧子导航伸展
        $(document)
            .on('click', '.main_left li h5', function(e)
            {
                var status = $(this)
                    .attr('status');
                $(this)
                    .find('b')
                    .hide();
                if (!status || status == 'down')
                {
                    $(this)
                        .next()
                        .slideUp();
                    $(this)
                        .attr('status', 'up');
                    $(this)
                        .find('.slide .down')
                        .show();
                }
                else
                {
                    $(this)
                        .next()
                        .slideDown();
                    $(this)
                        .attr('status', 'down');
                    $(this)
                        .find('.slide .up')
                        .show();
                }
            });

        // 退出登录
        $('.logout')
            .click(function(e)
            {
                $.dialog(
                {
                    width: 240,
                    height: 90,
                    content: '确认要退出系统么?',
                    ok: function()
                    {
                        _this.wkTab.delAll();
                        window.location.href = "/Manage/Logout.aspx";

                        // 清空缓存的主导向菜单
                        myUtil.setsessionStorage('topMenu',
                        {});
                    },
                    cancelVal: '关闭',
                    cancel: true /*为true等价于function(){}*/
                });
            });
    }
};