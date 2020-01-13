// 版本0.01
// ie8支持map
if (typeof Array.prototype.map != "function") {
    Array.prototype.map = function(fn, context) {
        var arr = [];
        if (typeof fn === "function") {
            for (var k = 0, length = this.length; k < length; k++) {
                arr.push(fn.call(context, this[k], k, this));
            }
        }
        return arr;
    };
}
// ie8支持filter
if (!Array.prototype.every) {
    Array.prototype.every = function(fun /*, thisArg */ ) {
        'use strict';

        if (this === void 0 || this === null)
            throw new TypeError();

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function')
            throw new TypeError();

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t && !fun.call(thisArg, t[i], i, t))
                return false;
        }

        return true;
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
var zTreeObj, ztreeId;

function noSelectText() {
    document.body.onselectstart = document.body.ondrag = function() {
        return false;
    }
}
var myUtil = {
    checkIE: function() {
        var browser = navigator.appName;
        var b_version = navigator.appVersion;
        var version = b_version.split(";");
        if (version && version[1]) {
            var trim_Version = version[1].replace(/[ ]/g, "");
            if ((browser == "Microsoft Internet Explorer" && trim_Version == "MSIE9.0") || (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE8.0") || (browser == "Microsoft Internet Explorer" && trim_Version == "MSIE7.0")) {
                $('head')
                    .append('<link rel="stylesheet" href="/static/Main/css/hack.css">');

                noSelectText();
            }
        }

        // 火狐低版本
        var findFx = navigator.userAgent.toLowerCase().indexOf('firefox');
        if (findFx > 0) {
            var fx_version = findFx + 8;
            if (parseInt(navigator.userAgent.substr(fx_version)) <= 22) {
                $('head')
                    .append('<link rel="stylesheet" href="/static/Main/css/hack.css">');
            }

            noSelectText();
        }
    },
    getNewObj: function(data) {
        return JSON.parse(JSON.stringify(data));
    },
    getsessionStorage: function(key) {
        return window.JSON.parse(window.sessionStorage.getItem(key));
    },
    setsessionStorage: function(key, value) {
        window.sessionStorage.setItem(key, window.JSON.stringify(value));
    },
    removesessionStorage: function(key) {
        window.sessionStorage.removeItem(key)
    },
    selectNode: function(obj, id) {
        var mySelectNodeId = window.myUtil.getsessionStorage(id + 'Ztree');
        var mySelectNode = obj.getNodeByTId(mySelectNodeId)
        mySelectNode && obj.selectNode(mySelectNode);
    },
    treeSetting: function(ztreeId) {
        return {
            callback: {
                onClick: function(event, treeId, treeNode, clickFlag) {
                    window.myUtil.setsessionStorage(ztreeId + 'Ztree', treeNode.tId); //保存当前选择的节点
                    treeNode.href && window.APP.wkTab.addTab({
                        id: treeNode.tId,
                        name: treeNode.name,
                        url: treeNode.href,
                    });
                    // 取消左侧菜单选择
                    $('.main_page .main_contain .main_left .nav__ul li a[data-href]').removeClass('active');
                    window.myUtil.removesessionStorage('leftMenu');
                }
            }
        };
    },
    tips: function() {
        $('body').append('<style>.imgAlert .contents{padding: 5px;color: #000;font-size: 14px;}.imgAlert .contents img{max-height: 200px;}</style>');

        var imgAlertIndex;
        $(document).on('mousemove', '*[data-tips]', function(e) {
            var left = e.pageX + 20;
            var top = e.pageY;
            var bTop = $(document).scrollTop();
            var bLeft = $(document).scrollLeft();
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var contentWidth = $('.imgAlert').width();
            var contentHeight = $('.imgAlert').height();

            var posX = 0,
                posY = 0;
            // 鍒ゆ柇鏄剧ず浣嶇疆
            if (windowWidth - (left - bLeft) < contentWidth) {
                posX = e.pageX - contentWidth - 20 - bLeft;
            } else {
                posX = e.pageX + 20 - bLeft;
            }

            if (windowHeight - (top - bTop) < contentHeight) {
                posY = e.pageY - contentHeight - 20 - bTop;
            } else {
                posY = e.pageY - bTop;
            }

            layer.style(imgAlertIndex, {
                left: posX - window.scrollX,
                top: posY - window.scrollY
            });
        });
        $(document).on('mouseenter', '*[data-tips]', function(e) {
            var content = $(this).attr('data-tips');

            imgAlertIndex = layer.open({
                type: 1,
                title: false,
                closeBtn: 0,
                maxWidth: 800,
                maxHeight: 600,
                area: 'auto',
                shade: false,
                skin: 'imgAlert',
                time: 2000,
                content: '<div class="contents">' + content + '</div>'
            });
        });
        $(document).on('mouseleave', '*[data-tips]', function(e) {
            layer.close(imgAlertIndex);
        });
    },
    urlToArray: function() {
        var start = location.href.indexOf('?');
        var params = [];
        if (start > 0) {
            var urlArr = location.href.substring(start + 1).split('&')
            urlArr.map(function(item) {
                params.push({
                    key: item.split('=')[0],
                    value: item.split('=')[1],
                })
            });
        }

        return params;
    },
    insMainContentTab: function(initTabArr, itemWidth) {
        this.checkIE();

        var start = location.href.indexOf('?');
        if (start > 0) {
            var params = [];
            var urlArr = location.href.substring(start + 1).split('&')
            urlArr.map(function(item) {
                params.push({
                    key: item.split('=')[0],
                    value: item.split('=')[1],
                })
            });
            var heightObj = {};
            params.map(function(item) {
                if (item.key == 'height') {
                    heightObj.has = true;
                    heightObj.value = item.value;
                }
            });
            if (heightObj.has) {
                $('#insMainContentTab').height(heightObj.value - 60);
            } else {
                var bodyH = $('body').height();
                $('#insMainContentTab').height(bodyH - 60);
            }
        } else {
            var bodyH = $('body').height();
            $('#insMainContentTab').height(bodyH - 60);
        }

        // 渲染初始tab
        var targetId = '#insMainContentTab';
        var tabObj = {
            index: 0,
            tabs: initTabArr
        };

        var tabConfig = {
            target: targetId,
            tabs: tabObj.tabs,
            index: tabObj.index,
            defaultTabs: initTabArr,
            eventType: 'mousemove',
            showCloseAll: false,
            wheelTab: false,
            itemWidth: itemWidth || 80
        }

        new myTab(tabConfig);
    }
}
var APP = {
    aBindId: function(target, menu) { //a链接 绑定 data-id
        if (target) {
            $(target + ' a[data-href]').each(function(index) {
                var hasId = $(this).data('id');
                if (!hasId) {
                    $(this).attr('data-id', menu + (index + 1));
                }
            });
        } else {
            $('a[data-href]').each(function(index) {
                var hasId = $(this).data('id');
                if (!hasId) {
                    $(this).attr('data-id', 'init' + (index + 1));
                }
            });
        }
    },
    getAjax: function(id, url, fun) {
        $.ajax({
            url: url,
            success: function(res) {
                fun(id, res);
            }
        });
        // fun(id,'1');
    },
    main: function(initConfig) {
        var _this = this;

        myUtil.checkIE();

        // 初始绑定id
        this.aBindId();

        // 渲染初始tab
        var targetId = '#insTab';
        var tabObj = myUtil.getsessionStorage(targetId + '__tab') || {
            index: 0,
            tabs: initConfig.tabArr
        };

        var tabConfig = {
            target: targetId,
            tabs: tabObj.tabs,
            index: tabObj.index,
            defaultTabs: initConfig.tabArr,
            tabClicked: function(obj) {
                // 失活左边菜单
                $('.link_box a').removeClass('active');
                // 右上菜单
                $('.top_menu a').removeClass('active');
                // 失活底部菜单
                $('.links a').removeClass('active');

                // 显示左侧的菜单
                // $('.main_page .main_contain .main_left').show();
                // 动画渐入左侧的菜单
                // setTimeout(function () {
                //     $('.main_left .toShow')
                //         .trigger('click');
                // }, 50);
            }
        }
        _this.wkTab = new myTab(tabConfig);

        // 顶部导行
        $('.main_top .main_menu li').click(function() {
            var index = $(this).index();
            $(this).addClass('active').siblings().removeClass('active');

            // 缓存已点菜单
            myUtil.setsessionStorage('topMenu', {
                index: index,
            });
        });

        //标识第一次打开
        var openLeft = 0;
        // 侦听带有data-id的a链接
        $(document).on('click', 'a[data-id],a[data-menu]', function() {
            var $this = $(this);
            var id = $this.data('id');
            var name = $this.text();
            var menu = $this.data('menu');
            var dataHref = $this.data('href');
            var type = $this.data('type');
            var href = $this.attr('href');

            // 非原始链接
            if (!href) {
                if (menu) { // 加载左侧menu菜单 优先级最高
                    openLeft = true;

                    var url = '';
                    if (menu.indexOf('/') > -1) { //url
                        url = menu;
                    } else if (menu.indexOf('.') > -1) { //固定文件
                        url = '/config/menu/' + menu + '?rnd=' + getRandom();
                    } else { //默认文件
                        url = '/config/menu/' + menu + '.html?rnd=' + getRandom();
                    }
                    menu = menu.indexOf('.') > -1 ? menu : menu + '.html';

                    $.ajax({
                        url: url,
                        success: function(dom) {
                            $('.main_page .main_contain .main_left .nav__ul').html(dom);

                            // 绑定id
                            _this.aBindId('.main_page .main_contain .main_left .nav__ul li', menu);

                            // 显示左侧菜单已点项
                            $('.main_page .main_contain .main_left .nav__ul li a[data-href]').each(function() {
                                var id = $(this).data('id');
                                var id2 = myUtil.getsessionStorage('leftMenu');
                                if (id == id2) {
                                    $(this).addClass('active');
                                }
                            });

                            var menus = myUtil.getsessionStorage('menus') || {
                                data: {}
                            };
                            menus.data[menu] = menus.data[menu] || [];
                            menus.currentMenu = menu;

                            // 子菜单状态
                            $('.main_page .main_contain .main_left .nav__ul>li').each(function(index) {
                                if (menus.data[menu][index] == undefined) {
                                    if ($(this).hasClass('hide')) {
                                        menus.data[menu][index] = 'close';
                                        $(this).addClass('hide');
                                    } else {
                                        menus.data[menu][index] = 'open';
                                    }
                                }
                                if (menus.data[menu][index] == 'open') {
                                    $(this).removeClass('hide');
                                } else {
                                    $(this).addClass('hide');
                                }
                            });
                            myUtil.setsessionStorage('menus', menus);
                            // 控制全部显示
                            var allOpen = menus.data[menu].every(function(item) {
                                return item == 'open';
                            });
                            var allClose = menus.data[menu].every(function(item) {
                                return item == 'close';
                            });
                            if (allOpen) {
                                $('.main_left li').removeClass('hide');
                                $('.main_left .nav__box .toggleBox').text('收起');
                            } else if (allClose) {
                                $('.main_left li').addClass('hide');
                                $('.main_left .nav__box .toggleBox').text('展开');
                            }
                        }
                    });
                } else if (id && dataHref && dataHref != '#' && dataHref != 'null') { // 执行link tab 优先级其次
                    _this.wkTab.addTab({
                        id: id,
                        name: name,
                        url: dataHref,
                    });
                }
                // 执行显示左侧动作
                if (menu) {
                    $('.main_left .toShow').trigger('click');
                }

                //隐藏左侧
                if (type == 'hideLeft' || menu == '') {
                    setTimeout(function() {
                        $('.main_left .toHide').trigger('click');
                        if (openLeft == false) {
                            $('.main_left .toShow').removeClass('active');
                        }
                    }, 0);
                }

                // 点击的是左侧菜单
                if ($this.parents().hasClass('link_box')) {
                    $('.link_box a').removeClass('active');
                    $this.addClass('active');
                    myUtil.setsessionStorage('leftMenu', $this.data('id'));
                    // 取消选中左侧树
                    zTreeObj && zTreeObj.cancelSelectedNode();
                    window.myUtil.removesessionStorage(ztreeId + 'Ztree');
                }

                return false;
            }
        });

        // 读取缓存中的菜单
        var myTopMenu = myUtil.getsessionStorage('topMenu');
        if (myTopMenu && (myTopMenu.index || myTopMenu.index == 0)) {
            $('.main_top .main_menu li').eq(myTopMenu.index).find('a').trigger('click');
        } else {
            // 无缓存时左侧控制方式
            if (initConfig.defaultMenu) {
                $('.main_top .main_menu li').eq(0).find('a').trigger('click');
            } else {
                setTimeout(function() {
                    $('.main_page .main_contain').addClass('hideLeft');
                }, 0);
            }
        }

        // 顶部最小化
        $('.slideTop li').click(function(argument) {
            var isOpen = $(this).hasClass('open');
            // var close = $(this)
            // .hasClass('close');

            if (isOpen) {
                $('.slideTop li.open').hide();
                $('.slideTop li.close').show();
                $('.main_page').removeClass('normal_Page');
            } else {
                $('.slideTop li.open').show();
                $('.slideTop li.close').hide();
                $('.main_page').addClass('normal_Page');
            }
            myUtil.setsessionStorage('normal_Page', isOpen);
        });
        var normal_Page = myUtil.getsessionStorage('normal_Page');
        if (normal_Page == false) {
            $('.slideTop li').eq(0).trigger('click');
        } else {
            $('.slideTop li').eq(1).trigger('click');
        }

        // 左侧导航左右切换
        $('.main_left .toHide').click(function() {
            $(this).parent().addClass('anim').next().addClass('anim'); // 增加动画效果
            $('.main_contain').addClass('hideLeft');
            $('.main_left .toShow').addClass('active');

            myUtil.setsessionStorage('main_leftStatus', 'hide');
        });
        $('.main_left .toShow').click(function() {
            $(this).parent().addClass('anim').next().addClass('anim'); // 增加动画效果
            $('.main_contain').removeClass('hideLeft');
            $('.main_left .toShow').removeClass('active');

            myUtil.setsessionStorage('main_leftStatus', 'show');
        });

        var main_leftStatus = myUtil.getsessionStorage('main_leftStatus');
        if (main_leftStatus == 'hide') {
            $('.main_left .toHide').trigger('click');
        }

        // 左侧子导航展开 收起
        $(document).on('click', '.main_left li h5', function(e) {
            var index = $(this).parent().index();
            var isHide = $(this).parent().hasClass('hide');
            var menus = myUtil.getsessionStorage('menus');
            if (!isHide) {
                $(this).parent().addClass('hide');
                menus.data[menus.currentMenu][index] = 'close';
            } else {
                $(this).parent().removeClass('hide');
                menus.data[menus.currentMenu][index] = 'open';
            }
            myUtil.setsessionStorage('menus', menus);

            var allOpen = menus.data[menus.currentMenu].every(function(item) {
                return item == 'open';
            });
            var allClose = menus.data[menus.currentMenu].every(function(item) {
                return item == 'close';
            });
            if (allOpen) {
                $('.main_left li').removeClass('hide');
                $('.main_left .nav__box .toggleBox').text('收起');
            } else if (allClose) {
                $('.main_left li').addClass('hide');
                $('.main_left .nav__box .toggleBox').text('展开');
            }
        });
        // 左侧子导航全部展开 收起
        $('.main_left .nav__box .toggleBox').on('click', function(e) {
            var text = $(this).text();
            var open = $(this).attr('data-open');
            var close = $(this).attr('data-close');

            var menus = myUtil.getsessionStorage('menus');
            if (text == '收起') {
                $('.main_left li').addClass('hide');
                $(this).text(open);
                menus.data[menus.currentMenu].map(function(item, index) {
                    menus.data[menus.currentMenu][index] = 'close';
                });
            } else {
                $('.main_left li').removeClass('hide');
                $(this).text(close);
                menus.data[menus.currentMenu].map(function(item, index) {
                    menus.data[menus.currentMenu][index] = 'open';
                });
            }
            myUtil.setsessionStorage('menus', menus);
        });

        // 退出登录
        $('.logout').click(function(e) {
            $.dialog({
                width: 240,
                height: 90,
                content: '确认要退出系统么?',
                ok: function() {
                    _this.wkTab.delAll();

                    // 清空缓存的主导向菜单
                    myUtil.removesessionStorage('#insTab__tab');
                    myUtil.removesessionStorage('topMenu');
                    myUtil.removesessionStorage('leftMenu');
                    myUtil.removesessionStorage('normal_Page');
                    myUtil.removesessionStorage('menus');
                    myUtil.removesessionStorage('main_leftStatus');

                    window.location.href = "/Manage/Logout.aspx";
                },
                cancelVal: '关闭',
                cancel: true /*为true等价于function(){}*/
            });
        });
    }
};
