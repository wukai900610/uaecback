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

(function(){
    var myTab = function(options) {
        var defaults = {
            tabs: [],
            index: 0
        }
        this.config = $.extend({}, defaults, options);
        this.move = {};
        this.itemWidth = this.config.itemWidth || 100;
        this.textToSort = function (select) {
            var style = select.attr('style') || '';
            var num = style.toLowerCase().replace('left:','').replace('px','').replace(';','');
            return parseInt(num);
        }

        this.initTab();

        // 缓存初始数据
        myUtil.setsessionStorage(this.config.target + '__tab',this.config);

        return {
            // config: {
            //     name:'实例',
            //     target:this.config.target,
            //     // index:this.config.index,
            //     // tabs:this.config.tabs,
            // },
            config:this.config,
            addTab: this.addTab,
            delAll: this.delAll,
            position: this.position,
            textToSort:this.textToSort,
            wheelTab:this.wheelTab,
        };
    }

    // 初始化
    myTab.prototype.initTab = function () {
        var that = this;
        // 初始化DOM
        that.rendTab();

        // 排序+激活点击的tab
        that.sort();

        // 全部关闭
        $(document).on('click', that.config.target + ' .closeAll', function(e) {
            that.delAll();
            return false;
        });

        // 删除单个
        $(document).on('click', that.config.target + ' .nav .close', function(e) {
            var _this = $(this).parent();
            var id = _this.attr('data-id');
            var delIndex = that.textToSort(_this) / that.itemWidth;

            // 删除dom
            _this.detach();
            $(that.config.target + ' .tbContents .itemContent[data-id=' + id + ']').detach();

            // 删除数据
            var findIndex;
            that.config.tabs.map(function(item, index) {
                if (item['id'] == id) {
                    findIndex = index;
                }
            });

            findIndex && that.config.tabs.splice(findIndex, 1);
            // 判断删除
            if(delIndex <= that.config.index){// 小于等于激活的tab
                // console.log('a');
                that.config.index = that.config.index - 1;
                // 激活
                var thisNav = $(that.config.target + ' .nav').eq(that.config.index);
                var thisFrame = $(that.config.target + ' .tbContents .itemContent').eq(that.config.index);
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
            $(that.config.target + ' .nav').each(function () {
                var itemPos = that.textToSort($(this));
                // console.log(itemPos);
                if(itemPos >= delPos){
                    $(this).css({
                        left:itemPos - that.itemWidth
                    });
                }
            });
            // console.log('-----end------');

            // 判断是否需要滚动
            that.wheelTab();

            // 更新缓存数据
            myUtil.setsessionStorage(that.config.target + '__tab',that.config);
            // myUtil.setsessionStorage(sessionConfig.target + '__tab', {
            //     target: sessionConfig.target,
            //     tabs: sessionConfig.tabs,
            //     index: sessionConfig.index
            // });
            return false;
        });

        // // 双击tab刷新
        $(document).on('dblclick', that.config.target + ' .nav', function(e) {
            var localData = myUtil.getsessionStorage(that.config.target + '__tab');
            var id = $(this).attr('data-id');
            var index = $(this).index();

            localData.tabs.map(function(item) {
                if (item.id == id) {
                    $(that.config.target + ' .tbContents .itemContent').eq(index).attr('src', addParams(item.url));
                }
            });

            return false;
        });

        // 左右滚动tab
        if(that.config.wheelTab != false){
            $(window).on('resize', function() {
                setTimeout(function() {
                    that.wheelTab();
                }, 250);
            });

            that.wheelTab();
        }
    }

    // 初始化DOM
    myTab.prototype.rendTab = function () {
        var that = this;
        var tabNav = '',
            tbContents = '';
        var showIndex = that.config.index;

        // 找出没有关闭按钮的tab 排序时要用
        var noCloseTabs = [];
        that.config.tabs.map(function (item,index) {
            if(item.close == false){
                noCloseTabs.push(item)
            }
        });

        var itemWidth = that.itemWidth;
        that.config.tabs.map(function(item, index) {
            if(item.id){
                item.id = item.id.toString();
                if (index == showIndex) {
                    if (item.close == false || item.id.toLowerCase() == 'home') {
                        if(noCloseTabs.length-1 == index){
                            tabNav += '<li style="left:'+(index*itemWidth)+'px;width:'+itemWidth+'px;" class="nav active" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                        }else{
                            tabNav += '<li style="left:'+(index*itemWidth)+'px;width:'+itemWidth+'px;" class="nav active" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                        }
                        tbContents += '<iframe allowTransparency="true" frameBorder="0" src="' + item.url + '" data-id="' + item.id + '" class="itemContent active">' + item.name + '</iframe>';
                    } else {
                        tabNav += '<li style="left:'+(index*itemWidth)+'px;width:'+itemWidth+'px;" class="nav canSwap active" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span><span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
                        tbContents += '<iframe allowTransparency="true" frameBorder="0" src="' + item.url + '" data-id="' + item.id + '" class="itemContent active canSwap">' + item.name + '</iframe>';
                    }
                } else {
                    if (item.close == false || item.id.toLowerCase() == 'home') {
                        if(noCloseTabs.length-1 == index){
                            tabNav += '<li style="left:'+(index*itemWidth)+'px;width:'+itemWidth+'px;" class="nav" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                        }else{
                            tabNav += '<li style="left:'+(index*itemWidth)+'px;width:'+itemWidth+'px;" class="nav" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span></li>';
                        }
                        tbContents += '<iframe allowTransparency="true" frameBorder="0" data-id="' + item.id + '" class="itemContent">' + item.name + '</iframe>';
                    } else {
                        tabNav += '<li style="left:'+(index*that.itemWidth)+'px;width:'+that.itemWidth+'px;" class="nav canSwap" data-id="' + item.id + '" data-src="' + item.url + '"><span class="tabText">' + item.name + '</span><span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>';
                        tbContents += '<iframe allowTransparency="true" frameBorder="0" data-id="' + item.id + '" class="itemContent canSwap">' + item.name + '</iframe>';
                    }
                }
            }
        });

        var closeAll = '<span class="closeAll close icon iconfont icon-shanchushuzimianbanbianjitai">全关</span>';
        var feaMenus = '';
        that.config.feaMenus && that.config.feaMenus.map(function (item, index) {
            feaMenus = feaMenus + '<a target="_blank" href="'+item.url+'" class="feaMenus">'+item.name+'</a>'
        });
        var tabDom = '<div class="tabNavWrap" style="'+(that.config.showCloseAll == false ? 'margin-right:0;' : '')+'"><ul>' + tabNav + '</ul></div><div class="tbContents">' + tbContents + '</div><div class="muder"></div>';

        // 是否显示全部按钮
        if(that.config.showCloseAll != false){
            tabDom = closeAll + feaMenus + tabDom;
        }

        $(that.config.target).addClass('myTab').html(tabDom);
    }

    myTab.prototype.addTab = function(item) {
        var that = this;

        // 初始样式
        $(that.config.target + ' .nav').removeClass('active');
        $(that.config.target + ' .tbContents .itemContent').removeClass('active');

        // 判重
        var find = {
            result: null,
            index: null
        };

        $.each(that.config.tabs,function(index,data){
            if (data.id == item.id) {
                find.result = true;
                find.index = index;
            }
        });

        if (find.result) {
            // 更新数据
            that.config.tabs[find.index] = item;

            // 激动页面并更新url
            $(that.config.target + ' .nav').eq(find.index).addClass('active');
            $(that.config.target + ' .tbContents .itemContent').eq(find.index).addClass('active').attr('src', addParams(item.url));

            // 自动滚动定位tab
            that.position(find.index);
            // 缓存数据
            myUtil.setsessionStorage(this.config.target + '__tab',this.config);
            return;
        }
        // 未找到执行添加操作
        $(that.config.target + ' ul').append('<li style="left:'+(that.config.tabs.length*100)+'px" class="nav active canSwap" data-id="' + item.id + '"><span class="tabText">' + item.name + '</span><span class="close icon iconfont icon-shanchushuzimianbanbianjitai"></span></li>');
        $(that.config.target + ' .tbContents').append('<iframe allowTransparency="true" frameBorder="0" src="' + addParams(item.url) + '" class="itemContent active canSwap" data-id="' + item.id + '">' + item.name + '</iframe>');

        // 记录添加
        that.config.tabs.push(item);

        // 自动滚动定位tab
        var tabLength = that.config.tabs.length - 1;
        that.position(tabLength);

        // 绑定滚动事件
        that.wheelTab();

        // 缓存数据
        myUtil.setsessionStorage(that.config.target + '__tab',that.config);

        return false;
    }

    // 定位tab位置
    myTab.prototype.position = function(actieIndex) {
        var that = this;
        var scroll = 0;
        var contexWidth = $(that.config.target + ' .tabNavWrap').width();
        that.config.index = actieIndex;
        myUtil.setsessionStorage(that.config.target + '__tab',that.config);

        // 计算滚动长度
        $(that.config.target + ' .nav').each(function(index, item) {
            if (index <= actieIndex) {
                scroll = scroll + $(this).outerWidth(true);
            }
        });

        // 内容宽度超过滚动宽度
        if (contexWidth > scroll) {
            $(that.config.target + ' .tabNavWrap').children().css('left', 0);
        } else {
            $(that.config.target + ' .tabNavWrap').children().css('left', -scroll + contexWidth);
        }
    }

    myTab.prototype.wheelTab = function() {
        // 浏览器判断
        var browser = navigator.appName;
        var b_version = navigator.appVersion;
        var version = b_version.split(";");
        var config = this.config;

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

                // return false;
            }
            $(document).on('mousewheel', config.target + ' .tabNavWrap', wheel);
            $(document).on('DOMMouseScroll', config.target + ' .tabNavWrap', wheel);
        }
    }

    // 排序+激活点击的tab
    myTab.prototype.sort = function() {
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

                $(that.config.target + ' .canSwap').removeClass('selected');
                $(that.config.target + ' .muder').hide();

                // 绑移解动事件
                $(document).off('mousemove');
            }
        }

        function swap() {
            $(that.config.target + ' .nav').each(function () {
                var _this = $(this);
                var id = _this.attr('data-id');
                var sort = that.textToSort(_this);
                that.config.tabs.map(function (item) {
                    if(item.id == id){
                        item.num = parseInt(sort)
                    }
                });
            });
            that.config.tabs.sort(function (a,b) {
                return a.num - b.num;
            });
            that.config.index = that.textToSort($(that.config.target + ' .nav.active')) / (that.itemWidth);
            // 保存数据
            myUtil.setsessionStorage(that.config.target + '__tab', that.config);
        }

        var config = that.config;
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

        $(document).on(config.eventType || 'mousedown', config.target + ' .nav .tabText', function(e) {
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
            that.config.index = index;
            myUtil.setsessionStorage(that.config.target + '__tab',that.config);
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
                var range = that.move.target.position().left + (config.itemWidth||100);

                if(range > itemLeft + 50 && range < itemLeft + (config.itemWidth||100)){// 左右
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

    myTab.prototype.delAll = function() {
        var that = this;
        var defaultTabs = myUtil.getNewObj(that.config.defaultTabs);
        // 重置数据
        that.config.index = 0;
        that.config.tabs = defaultTabs;

        // 激活首个
        var thisNav = $(that.config.target + ' .tabNavWrap .nav').eq(0);
        var thisFrame = $(that.config.target + ' .tbContents .itemContent').eq(0);
        thisNav.addClass('active').siblings().removeClass('active');
        thisFrame.addClass('active').siblings().removeClass('active');
        // 请求iframe页面
        var hasSrc = thisFrame.attr('src');
        if(!hasSrc){
            thisFrame.attr('src',thisNav.attr('data-src'));
        }

        // 删除dom
        $(that.config.target + ' .tabNavWrap .nav:gt('+(defaultTabs.length-1)+')').detach();
        $(that.config.target + ' .tbContents .itemContent:gt('+(defaultTabs.length-1)+')').detach();

        $(that.config.target + ' .tabNavWrap').children().css('left', 0);

        myUtil.setsessionStorage(that.config.target + '__tab', that.config);
    }

    window.myTab = myTab;
}());

window.AddTab = function (name,url) {
    APP.wkTab.addTab({id:name,name:name,url:url});
};
