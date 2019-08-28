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
        delAll: this.delAll
    };
}

myTab.prototype.rendTab = function(config) {
    var that = this;
    var tabNav = '',
        tbContents = '';
    var showIndex = config.index || 0;
    config.tabs.map(function(item, index) {
        if (index == showIndex) {
            if (item.close == false) {
                tabNav += '<li class="nav active" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '</li>';
            } else {
                tabNav += '<li class="nav active" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
            }

            tbContents += '<iframe frameBorder="0" src="' + item.url + '" data-id="' + item.id + '" class="itemContent active">' + item.name + '</iframe>';
        } else {
            if (item.close == false) {
                tabNav += '<li class="nav" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '</li>';
            } else {
                tabNav += '<li class="nav" data-id="' + item.id + '" data-src="' + item.url + '">' + item.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
            }
            tbContents += '<iframe frameBorder="0" data-id="' + item.id + '" class="itemContent">' + item.name + '</iframe>';
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
            var src = thisNav.data('src');
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
        sessionConfig.tabs.map(function(item, index) {
            if (item.id == id) {
                sessionConfig.tabs.splice(index, 1);
            }
        });
        // console.log(sessionConfig);

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
        var src = $(this).data('src');
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

        config.tabClicked && config.tabClicked();
        return false;
    });

    // 双击tab刷新
    $(document).on('dblclick', config.target + ' .nav', function(e) {
        var localData = myUtil.getsessionStorage(config.target + '__tab');
        var id = $(this).data('id');
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
myTab.prototype.delAll = function(config) {
    if (!config) {
        config = this.config
    }
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
    $(nConfig.target + ' ul').append('<li class="nav active" data-id="' + adItem.id + '">' + adItem.name + '<span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>');
    $(nConfig.target + ' .tbContents').append('<iframe frameBorder="0" src="' + addParams(adItem.url) + '" class="itemContent active" data-id="' + adItem.id + '">' + adItem.name + '</iframe>');

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
