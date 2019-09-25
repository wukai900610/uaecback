function getRandom() {
    return parseInt(Math.random() * 1000000);
}

function getUniqueRandom() {
    return new Date().getTime().toString() + getRandom().toString();
}

function addParams(url) {
    if (url) {

        var random = getRandom();
        if (url.indexOf('?') > -1) {
            url = url + '&rnd=' + random;
        } else {
            url = url + '?rnd=' + random;
        }

        return url;
    } else {
        return '';
    }
}

var myTab = function(config) {
    var defaults = {
        tabs: [],
        index: 1
    }
    var newConfig = $.extend({}, defaults, config);

    this.initTab(newConfig)
    return {
        config: newConfig,
        addTab: this.addTab,
        wheelTab: this.wheelTab,
        delAll: this.delAll,
    };
}

myTab.prototype.rendTab = function(config) {
    var that = this;
    var tabNav = '',
        tbContents = '';
    var showIndex = config.index || 0;

    // 找出没有关闭按钮的tab 排序时要用
    var noCloseTabs = [];
    config.tabs.map(function (item,index) {
        if(item.close == false){
            noCloseTabs.push(item)
        }
    });
    config.tabs.map(function(item, index) {
        if (index == showIndex) {
            if (item.close == false || (item.id && item.id.toLowerCase() == 'home')) {
                if(noCloseTabs.length-1 == index){
                    tabNav += '<li class="nav active canSwapFlag" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '</li>';
                }else{
                    tabNav += '<li class="nav active" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '</li>';
                }
            } else {
                tabNav += '<li class="nav canSwap canSwapFlag active" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
            }

            tbContents += '<iframe allowTransparency="true" frameBorder="0" src="' + item.url + '" data-id="' + item.id + '" class="itemContent active">' + item.name + '</iframe>';
        } else {
            if (item.close == false || (item.id && item.id.toLowerCase() == 'home')) {
                if(noCloseTabs.length-1 == index){
                    tabNav += '<li class="nav canSwapFlag" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '</li>';
                }else{
                    tabNav += '<li class="nav" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '</li>';
                }
            } else {
                tabNav += '<li class="nav canSwap canSwapFlag" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
            }
            tbContents += '<iframe allowTransparency="true" frameBorder="0" data-id="' + item.id + '" class="itemContent">' + item.name + '</iframe>';
        }
    });

    var tabDom = '<span class="closeAll close icon iconfont icon-shanchushuzimianbanbianjitai">全关</span><div class="tabNavWrap"><ul>' + tabNav + '</ul></div><div class="tbContents">' + tbContents + '</div><div class="muder"></div>';

    $(config.target).addClass('myTab').html(tabDom);
}
myTab.prototype.initTab = function(config) {
    var that = this;
    that.rendTab(config);

    // 更新缓存数据
    var merge = $.extend({}, config, {});
    myUtil.setsessionStorage(config.target + '__tab', merge);

    // 全部关闭
    $(document).on('click', config.target + ' .closeAll', function(e) {
        that.delAll(config,config.defaultTabs);
        return false;
    });

    // 排序
    var swapMouseDown = false,
    move = {
        target:null,
        iframe:null,
        index:null,
    },clone;

    function actionReset() {
        swapMouseDown = false;
        $(config.target + ' .canSwapFlag').removeClass('swaping');
        $(config.target + ' .canSwap').removeClass('selected');
        $(config.target + ' .muder').hide();
    }

    $(document).on('mouseup', actionReset);
    $(document).on('mouseleave', config.target + ' .tabNavWrap', function () {
        if(!swapMouseDown){
            actionReset()
        }
    });

    $(document).on('mouseup', config.target + ' .canSwapFlag', function(e) {
        var index = $(this).index();

        // 开始排序
        $(this).after(move.target);
        $(config.target + ' .tbContents .itemContent').eq(index).after(move.iframe);

        var localData = myUtil.getsessionStorage(config.target + '__tab');

        // 从左向右 右向左托
        if((move.index < index) || (move.index > index && move.index - index > 1)){
            var newTab = [];
             // 更新缓存数据
            $(config.target + ' .nav').each(function () {
                var id = $(this).attr('data-id');
                localData.tabs.map(function (item) {
                    if(id == item.id){
                        newTab.push(item);
                    }
                });

                if($(this).hasClass('active')){
                    localData.index = $(this).index();
                }
            });
            localData.tabs = newTab;

            myUtil.setsessionStorage(config.target + '__tab', localData);
        }

        // 删除复制的对象
        // $(config.target + ' .clone').detach();
        // clone = null;

        actionReset();
        return false;
    });
    $(document).on('mousedown', config.target + ' .canSwap', function(e) {
        var _this = $(this);

        $(config.target + ' .muder').show();

        var index = _this.index();
        var thisFrame = $(config.target + ' .tbContents .itemContent').eq(index);
        // 复制要移动的对象
        // clone = $(this).clone().addClass('clone');
        // $(this).parent().append(clone)

        // 设置选中的对象透明
        _this.addClass('selected');

        // 排序
        swapMouseDown = true;
        move.target = _this;
        move.iframe = thisFrame;
        move.index = index;
        // 主页类型标签不需要排序
        // if(_this.hasClass('canSwap')){
        //
        // }

        return false;
    });
    $(document).on('mouseover', config.target + ' .canSwapFlag', function(e) {
        if(swapMouseDown){
            $(this).addClass('swaping').siblings().removeClass('swaping');
        }

        return false;
    });

    // $(document).on('mousemove', function(e) {
    //     if(swapMouseDown){
    //         // 移动复制的对象
    //         var left = $(config.target).position().left
    //         console.log(left);
    //         clone.css({
    //             left:e.pageX - left,
    //         });
    //     }
    //
    //     return false;
    // });

    // 删除
    $(document).on('click', config.target + ' .nav .close', function(e) {
        var id = $(this).parent().attr('data-id');
        var isActie = $(this).parent().hasClass('active');
        var delIndex = $(this).parent().index();

        var sessionConfig = myUtil.getsessionStorage(config.target + '__tab');
        var activeIndex = sessionConfig.index;
        // 删除的是当前活动的tab
        if (isActie) {
            // console.log('当前');
            activeIndex = activeIndex - 1 < 0 ? 0 : activeIndex - 1;

            var thisNav = $(sessionConfig.target + ' .nav').eq(activeIndex);
            var thisFrame = $(sessionConfig.target + ' .tbContents .itemContent').eq(activeIndex);
            thisNav.addClass('active');
            thisFrame.addClass('active');
            var src = thisNav.attr('data-src');
            var hasSrc = thisFrame.attr('src');
            if(!hasSrc){
                thisFrame.attr('src',src);
            }
        } else {
            if (delIndex > activeIndex) //要删除的tab比当前tab索引值大
            {
            } else {
                activeIndex = activeIndex - 1;
            }
        }
        // 删除已添加的记录
        var findIndex;
        sessionConfig.tabs.map(function(item, index) {
            if (item['id'] == id) {
                findIndex = index;
            }
        });
        sessionConfig.tabs.splice(findIndex, 1);

        // 更新缓存数据
        myUtil.setsessionStorage(sessionConfig.target + '__tab', {
            target: sessionConfig.target,
            tabs: sessionConfig.tabs,
            index: activeIndex
        });

        // 删除dom
        $(sessionConfig.target + ' .nav[data-id=' + id + ']').detach();
        $(sessionConfig.target + ' .tbContents .itemContent[data-id=' + id + ']').detach();
        return false;
    });

    // 显示点击
    $(document).on('click', config.target + ' .nav', function(e) {
        var index = $(this).index();
        var src = $(this).attr('data-src');
        $(this).addClass('active').siblings().removeClass('active');
        var thisFrame = $(config.target + ' .tbContents .itemContent').eq(index);
        thisFrame.addClass('active').siblings().removeClass('active');
        var hasSrc = thisFrame.attr('src');
        if(!hasSrc){
            thisFrame.attr('src',src);
        }

        // 更新缓存数据
        var localData = myUtil.getsessionStorage(config.target + '__tab');
        localData.index = index
        myUtil.setsessionStorage(config.target + '__tab', localData);

        config.tabClicked && config.tabClicked(this);
    });

    // 双击tab刷新
    $(document).on('dblclick', config.target + ' .nav', function(e) {
        var localData = myUtil.getsessionStorage(config.target + '__tab');
        var id = $(this).attr('data-id');
        var index = $(this).index();

        localData.tabs.map(function(item) {
            if (item.id == id) {
                $(config.target + ' .tbContents .itemContent').eq(index).attr('src', addParams(item.url));
            }
        });

        return false;
    });

    $(window).on('resize', function() {
        setTimeout(function() {
            that.wheelTab(config);
        }, 250);
    });

    that.wheelTab(config);
}
myTab.prototype.delAll = function(config,defaultTabs) {
    if (!config) {
        config = this.config
    }
    config = config || this.config;
    defaultTabs = defaultTabs || this.config.defaultTabs;

    var nConfig = {
        index: 0,
        tabs: defaultTabs,
        target: config.target
    };

    // 激活首个
    var thisNav = $(nConfig.target + ' .tabNavWrap .nav').eq(0);
    var thisFrame = $(nConfig.target + ' .tbContents .itemContent').eq(0);
    thisNav.addClass('active').siblings().removeClass('active');
    thisFrame.addClass('active').siblings().removeClass('active');
    // 请求iframe页面
    var hasSrc = thisFrame.attr('src');
    if(!hasSrc){
        thisFrame.attr('src',thisNav.attr('data-src'));
    }

    // 删除dom
    $(nConfig.target + ' .tabNavWrap .nav:gt('+(defaultTabs.length-1)+')').detach();
    $(nConfig.target + ' .tbContents .itemContent:gt('+(defaultTabs.length-1)+')').detach();

    $(config.target + ' .tabNavWrap').children().css('left', 0);

    myUtil.setsessionStorage(nConfig.target + '__tab', nConfig);
}
//
// 定位tab位置
myTab.prototype.position = function(actieIndex, config) {
    var scroll = 0;
    var contexWidth = $(config.target + ' .tabNavWrap').width();

    // 计算滚动长度
    $(config.target + ' .nav').each(function(index, item) {
        if (index <= actieIndex) {
            scroll = scroll + $(this).outerWidth(true);
        }
    });

    // 内容宽度超过滚动宽度
    if (contexWidth > scroll) {
        $(config.target + ' .tabNavWrap').children().css('left', 0);
    } else {
        $(config.target + ' .tabNavWrap').children().css('left', -scroll + contexWidth);
    }
}
// 绑定tab滚动
myTab.prototype.wheelTab = function(config) {
    // 浏览器判断
    var browser = navigator.appName;
    var b_version = navigator.appVersion;
    var version = b_version.split(";");

    var wheelX = 0;
    var distence = 80;
    var maxWidth = 0;
    var contexWidth = $(config.target + ' .tabNavWrap').width();

    $(config.target + ' .tabNavWrap li').each(function() {
        maxWidth = maxWidth + $(this).outerWidth(true);
    });

    // 解绑事件
    $(document).off('mousewheel', config.target + ' .tabNavWrap');
    $(document).off('DOMMouseScroll', config.target + ' .tabNavWrap');
    // 判断是否需要滚动
    if (contexWidth > maxWidth) {
        $(config.target + ' .tabNavWrap').children().css('left', 0);
    } else {
        function wheel(e) {
            var currentWheel = e.originalEvent.wheelDelta || -e.originalEvent.detail;
            var delta = Math.max(-1, Math.min(1, currentWheel));
            if (delta < 0) { //向下滚动
                wheelX = wheelX <= -(maxWidth - contexWidth) ? -(maxWidth - contexWidth) : wheelX - distence;
            } else { //向上滚动
                wheelX = wheelX >= 0 ? 0 : wheelX + distence;
            }

            $(this).children().css({
                'left': wheelX
            });

            e.stopPropagation();
            // e.preventDefault();
        }
        $(document).on('mousewheel', config.target + ' .tabNavWrap', wheel);
        $(document).on('DOMMouseScroll', config.target + ' .tabNavWrap', wheel);
    }
}
myTab.prototype.addTab = function(adItem) {
    var that = this;
    var nConfig = myUtil.getsessionStorage(this.config.target + '__tab');
    // 初始样式
    $(nConfig.target + ' .nav').removeClass('active');
    $(nConfig.target + ' .tbContents .itemContent').removeClass('active');

    // 判重
    var find = {
        result: null,
        index: null
    };
    nConfig.tabs.map(function(item, index) {
        if (item.id == adItem.id) {
            find.result = true;
            find.index = index;

            // 更新数据
            nConfig.tabs[index] = adItem;
        }
    });

    if (find.result) {
        // 激动页面并更新url
        $(nConfig.target + ' .nav').eq(find.index).addClass('active');
        $(nConfig.target + ' .tbContents .itemContent').eq(find.index).addClass('active').attr('src', addParams(adItem.url));

        // 自动滚动定位tab
        myTab.prototype.position(find.index, nConfig);

        // 缓存数据
        myUtil.setsessionStorage(nConfig.target + '__tab', {
            tabs: nConfig.tabs,
            index: find.index,
            target: nConfig.target
        });
        return;
    }
    // 执行添加操作
    $(nConfig.target + ' ul').append('<li class="nav active canSwap canSwapFlag" data-id="' + adItem.id + '">' + adItem.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>');
    $(nConfig.target + ' .tbContents').append('<iframe allowTransparency="true" frameBorder="0" src="' + addParams(adItem.url) + '" class="itemContent active" data-id="' + adItem.id + '">' + adItem.name + '</iframe>');

    // 记录添加
    nConfig.tabs.push(adItem);

    // 自动滚动定位tab
    var tabLength = nConfig.tabs.length - 1
    myTab.prototype.position(tabLength, nConfig);

    // 绑定滚动事件
    this.wheelTab(nConfig);

    // 缓存数据
    myUtil.setsessionStorage(nConfig.target + '__tab', {
        tabs: nConfig.tabs,
        index: tabLength,
        target: nConfig.target
    });
}

function AddTab(name,url){
    APP.wkTab.addTab({id:name,name:name,url:url});
}
