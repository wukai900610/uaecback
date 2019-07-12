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
        delAll: this.delAll
    };
}
myTab.prototype.rendTab = function(config) {
    var tabNav = '',
        tbContents = '';
    var showIndex = config.index || 0;
    config.tabs.map(function(item, index) {
        if (index == showIndex) {
            if (item.close == false) {
                tabNav += '<li class="nav active" data-id="' + item.id + '">' + item.name + '</li>';
            } else {
                tabNav += '<li class="nav active" data-id="' + item.id + '">' + item.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
            }

            tbContents += '<iframe frameBorder="0" src="' + (item.url || '') + '" data-id="' + item.id + '" class="itemContent active">' + item.name + '</iframe>';
        } else {
            if (item.close == false) {
                tabNav += '<li class="nav" data-id="' + item.id + '">' + item.name + '</li>';
            } else {
                tabNav += '<li class="nav" data-id="' + item.id + '">' + item.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
            }
            tbContents += '<iframe frameBorder="0" src="' + (item.url || '') + '" data-id="' + item.id + '" class="itemContent">' + item.name + '</iframe>';
        }
    });

    var tabDom = '<span class="closeAll close icon iconfont icon-shanchushuzimianbanbianjitai">全关</span><div class="tabNavWrap"><ul>' + tabNav + '</ul></div><div class="tbContents">' + tbContents + '</div>';

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
        that.delAll(config);
        return false;
    });

    // 删除
    $(document).on('click', config.target + ' .nav .close', function(e) {
        var id = $(this).parent().data('id');
        var isActie = $(this).parent().hasClass('active');

        var sessionConfig = myUtil.getsessionStorage(config.target + '__tab');
        var activeIndex = sessionConfig.index;
        // 删除的是当前活动的tab
        if (isActie) {
            activeIndex = activeIndex - 1 < 0 ? 0 : activeIndex - 1;

            $(config.target + ' .nav').eq(activeIndex).addClass('active');
            $(config.target + ' .tbContents .itemContent').eq(activeIndex).addClass('active');
        } else {
            activeIndex = $(this).parent().index(); //有问题
            var currentIndex = 0;
            $(config.target + ' .nav').each(function() {
                if ($(this).hasClass('active')) {
                    currentIndex = $(this).index();
                }
            });
            // 我也不知道在写什么
            if (currentIndex && activeIndex > currentIndex) {
                activeIndex = $(this).parent().index() - 1;
            }
        }

        // 删除dom
        $(config.target + ' .nav[data-id=' + id + ']').detach();
        $(config.target + ' .tbContents .itemContent[data-id=' + id + ']').detach();

        // 删除已添加的记录
        config.tabs.map(function(item, index) {
            if (item.id == id) {
                config.tabs.splice(index, 1);
            }
        });

        // 更新缓存数据
        var merge = $.extend({}, config, {
            tabs: config.tabs,
            index: activeIndex
        });
        myUtil.setsessionStorage(config.target + '__tab', merge);
        return false;
    });

    // 显示点击
    $(document).on('click', config.target + ' .nav', function(e) {
        var index = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(config.target + ' .tbContents .itemContent').eq(index).addClass('active').siblings().removeClass('active');


        // 更新缓存数据
        var merge = $.extend({}, config, {
            index: index
        });
        myUtil.setsessionStorage(config.target + '__tab', merge);
        return false;
    });

    $(window).on('resize', function() {
        setTimeout(function() {
            that.wheelTab(config);
        }, 250);
    });

    that.wheelTab(config);
}
myTab.prototype.delAll = function(config) {
    var nConfig = {
        index: 0,
        tabs: [config.tabs[0]],
        target: config.target
    };
    // 删除dom
    $(nConfig.target + ' .tabNavWrap .nav').eq(0).siblings().detach().end().addClass('active');
    $(nConfig.target + ' .tbContents .itemContent').eq(0).siblings().detach().end().addClass('active');

    $(config.target + ' .tabNavWrap').children().css('left', 0);

    myUtil.setsessionStorage(nConfig.target + '__tab', nConfig);
}

// tab滚动
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

            return false;
        }
        $(document).on('mousewheel', config.target + ' .tabNavWrap', wheel);
        $(document).on('DOMMouseScroll', config.target + ' .tabNavWrap', wheel);
    }
}
myTab.prototype.addTab = function(adItem) {
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
        }
    });
    if (find.result) {
        // 定位到已打开的页面
        $(nConfig.target + ' .nav').eq(find.index).addClass('active');
        $(nConfig.target + ' .tbContents .itemContent').eq(find.index).addClass('active');

        // 缓存数据
        myUtil.setsessionStorage(nConfig.target + '__tab', {
            tabs: nConfig.tabs,
            index: find.index,
            target: nConfig.target
        });
        return;
    }
    // 执行添加操作
    $(nConfig.target + ' ul').append('<li class="nav active" data-id="' + adItem.id + '">' + adItem.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>');
    $(nConfig.target + ' .tbContents').append('<iframe frameBorder="0" src="' + (adItem.url || '') + '" class="itemContent active" data-id="' + adItem.id + '">' + adItem.name + '</iframe>');

    // 绑定滚动事件
    this.wheelTab(nConfig);

    // 记录已添加
    nConfig.tabs.push(adItem);
    // 缓存数据
    myUtil.setsessionStorage(nConfig.target + '__tab', {
        tabs: nConfig.tabs,
        index: nConfig.tabs.length - 1,
        target: nConfig.target
    });
}