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
        index: 0
    }
    var newConfig = $.extend({}, defaults, config);
    this.move = {};
    this.textToSort = function (select) {
        var style = select.attr('style') || '';
        var num = style.toLowerCase().replace('left:','').replace('px','').replace(';','');
        return parseInt(num);
    }

    this.initTab(newConfig)
    return {
        config: newConfig,
        addTab: this.addTab,
        wheelTab: this.wheelTab,
        delAll: this.delAll,
        textToSort:this.textToSort,
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
        if(item.id){
            item.id = item.id.toString();
            if (index == showIndex) {
                if (item.close == false || item.id.toLowerCase() == 'home') {
                    if(noCloseTabs.length-1 == index){
                        tabNav += '<li style="left:'+(index*100)+'px" class="nav active" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                    }else{
                        tabNav += '<li style="left:'+(index*100)+'px" class="nav active" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                    }
                    tbContents += '<iframe allowTransparency="true" frameBorder="0" src="' + item.url + '" data-id="' + item.id + '" class="itemContent active">' + item.name + '</iframe>';
                } else {
                    tabNav += '<li style="left:'+(index*100)+'px" class="nav canSwap active" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span><span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
                    tbContents += '<iframe allowTransparency="true" frameBorder="0" src="' + item.url + '" data-id="' + item.id + '" class="itemContent active canSwap">' + item.name + '</iframe>';
                }
            } else {
                if (item.close == false || item.id.toLowerCase() == 'home') {
                    if(noCloseTabs.length-1 == index){
                        tabNav += '<li style="left:'+(index*100)+'px" class="nav" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                    }else{
                        tabNav += '<li style="left:'+(index*100)+'px" class="nav" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                    }
                    tbContents += '<iframe allowTransparency="true" frameBorder="0" data-id="' + item.id + '" class="itemContent">' + item.name + '</iframe>';
                } else {
                    tabNav += '<li style="left:'+(index*100)+'px" class="nav canSwap" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span><span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
                    tbContents += '<iframe allowTransparency="true" frameBorder="0" data-id="' + item.id + '" class="itemContent canSwap">' + item.name + '</iframe>';
                }
            }
        }
    });

    var tabDom = '<span class="closeAll close icon iconfont icon-shanchushuzimianbanbianjitai">全关</span><div class="tabNavWrap"><ul>' + tabNav + '</ul></div><div class="tbContents">' + tbContents + '</div><div class="muder"></div>';

    $(config.target).addClass('myTab').html(tabDom);
}
myTab.prototype.initTab = function(config) {
    var that = this;
    that.rendTab(config);

    // 排序
    this.sort(config);

    // 更新缓存数据
    var merge = $.extend({}, config, {});
    myUtil.setsessionStorage(config.target + '__tab', merge);

    // 全部关闭
    $(document).on('click', config.target + ' .closeAll', function(e) {
        that.delAll(config,config.defaultTabs);
        return false;
    });

    // 删除
    $(document).on('click', config.target + ' .nav .close', function(e) {
        var _this = $(this).parent();
        var id = _this.attr('data-id');
        var delIndex = that.textToSort(_this) / 100;

        // 获取最新存储数据
        var sessionConfig = myUtil.getsessionStorage(config.target + '__tab');

        // 删除dom
        $(sessionConfig.target + ' .nav[data-id=' + id + ']').detach();
        $(sessionConfig.target + ' .tbContents .itemContent[data-id=' + id + ']').detach();

        // 删除数据
        var findIndex;
        // console.log(sessionConfig.tabs);
        sessionConfig.tabs.map(function(item, index) {
            if (item['id'] == id) {
                findIndex = index;
            }
        });
        // $(sessionConfig.target + ' .nav').each(function () {
        //     if ($(this).attr('data-id') == id) {
        //         findIndex = $(this).index();
        //     }
        // });
        findIndex && sessionConfig.tabs.splice(findIndex, 1);
        // 判断删除
        if(delIndex <= sessionConfig.index){// 小于等于激活的tab
            // console.log('a');
            sessionConfig.index = sessionConfig.index - 1;
            // 激活
            var thisNav = $(sessionConfig.target + ' .nav').eq(sessionConfig.index);
            var thisFrame = $(sessionConfig.target + ' .tbContents .itemContent').eq(sessionConfig.index);
            thisNav.addClass('active').siblings().removeClass('active');
            thisFrame.addClass('active').siblings().removeClass('active');
            var src = thisNav.attr('data-src');
            var hasSrc = thisFrame.attr('src');
            if(!hasSrc){
                thisFrame.attr('src',src);
            }
        }else{//大于活动的tab
            // console.log('b');
        }

        // 控制位置
        // console.log('-----start------');
        var delPos = that.textToSort(_this);
        $(config.target + ' .nav').each(function () {
            var itemPos = that.textToSort($(this));
            // console.log(itemPos);
            if(itemPos >= delPos){
                $(this).css({
                    left:itemPos-100
                });
            }
        });
        // console.log('-----end------');

        // 更新缓存数据
        myUtil.setsessionStorage(sessionConfig.target + '__tab', {
            target: sessionConfig.target,
            tabs: sessionConfig.tabs,
            index: sessionConfig.index
        });
        return false;
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
myTab.prototype.sort = function(config) {
    var that = this;

    function actionReset(type) {
        if(that.move.target){
            that.move.target.css({
                left:that.move.left
            });
            if(type){
                // 存储排序后的数据
                swap();
            }

            $(config.target + ' .canSwap').removeClass('selected');
            $(config.target + ' .muder').hide();

            // 绑移解动事件
            $(document).off('mousemove');
        }
    }

    function swap() {
        var localData = myUtil.getsessionStorage(config.target + '__tab');

        $(config.target + ' .nav').each(function () {
            var _this = $(this);
            var id = _this.attr('data-id');
            var sort = that.textToSort(_this);
            localData.tabs.map(function (item) {
                if(item.id == id){
                    item.num = parseInt(sort)
                }
            });
        });
        localData.tabs.sort(function (a,b) {
            return a.num - b.num;
        });
        localData.index = that.textToSort($(config.target + ' .nav.active')) / 100;
        // 保存数据
        myUtil.setsessionStorage(config.target + '__tab', localData);
    }

    $(document).on('mouseup', function (e) {
        if(that.move.down){
            if(that.move.pageX && that.move.pageX2 && that.move.pageX != that.move.pageX2){
                actionReset(true);
            }else{
                actionReset(false);
            }
        }
        that.move.down = false;

        return false;
    });

    $(document).on('mousedown', config.target + ' .nav .tabText', function(e) {
        var _this = $(this).parent();
        // 显示点击
        var index = _this.index();
        var src = _this.attr('data-src');
        _this.addClass('active').siblings().removeClass('active');
        var thisFrame = $(config.target + ' .tbContents .itemContent').eq(index);
        thisFrame.addClass('active').siblings().removeClass('active');
        var hasSrc = thisFrame.attr('src');
        if(!hasSrc){
            thisFrame.attr('src',src);
        }

        that.move = {};
        // 点击的是可以拖动标签
        if(_this.hasClass('canSwap')){
            // 设置选中的对象透明
            _this.addClass('selected');
            // 排序
            that.move.target = _this;
            that.move.left = _this.position().left,
            that.move.remain = e.pageX - ($(config.target).offset().left + _this.position().left);
            that.move.pageX = e.pageX;
            that.move.down = true;

            $(config.target + ' .muder').show();
            // 绑定移动事件
            $(document).on('mousemove',moveFun);
        }

        // 记录点击的索引
        var localData = myUtil.getsessionStorage(config.target + '__tab');
        localData.index = that.textToSort(_this) / 100;
        myUtil.setsessionStorage(config.target + '__tab', localData);
        return false;
    });

    function moveFun(e) {
        that.move.pageX2 = e.pageX;
        // 减少绑定时会多余执行
        if(that.move.pageX2 == that.move.pageX){
            return;
        }
        var outLeft = $(config.target).offset().left;
        var dis = e.pageX - outLeft;
        that.move.target.css({
            left:dis - that.move.remain
        });

        $(config.target + ' .tabNavWrap .canSwap').each(function () {
            var itemLeft = $(this).position().left;
            var range = that.move.target.position().left + 100;

            if(range > itemLeft + 50 && range < itemLeft + 100){// 左右
                $(this).css({
                    left:that.move.left
                });
                that.move.left = itemLeft;
            }else if(that.move.target.position().left > itemLeft && that.move.target.position().left < itemLeft + 50){// 右左
                $(this).css({
                    left:that.move.left
                });
                that.move.left = itemLeft;
            }
        });

        return false;
    }
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

    $(nConfig.target + ' .nav').each(function () {
        if ($(this).attr('data-id') == adItem.id) {
            find.result = true;
            find.index = $(this).index();

            // 更新数据
            nConfig.tabs[find.index] = adItem;
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
    $(nConfig.target + ' ul').append('<li style="left:'+(nConfig.tabs.length*100)+'px" class="nav active canSwap" data-id="' + adItem.id + '"><span class="tabText">' + adItem.name + '</span><span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>');
    $(nConfig.target + ' .tbContents').append('<iframe allowTransparency="true" frameBorder="0" src="' + addParams(adItem.url) + '" class="itemContent active canSwap" data-id="' + adItem.id + '">' + adItem.name + '</iframe>');

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

    return false;
}

function AddTab(name,url){
    APP.wkTab.addTab({id:name,name:name,url:url});
}
