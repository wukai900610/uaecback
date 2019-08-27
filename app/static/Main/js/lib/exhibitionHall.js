function exhibitionHall(stageConfig) {
    this.stageConfig = stageConfig;
    this.scale = 10;
    this.halls = [];
    this.hallIndex = 0;
    this.mode = 'default';

    // 创建展馆
    this.creditHall();

    if(this.stageConfig.readOnly != true){
        this.event();
    }
}
exhibitionHall.prototype.creditHall = function() {
    var _this = this;
    var html = '';
    var tabs = '';
    var slide = '';
    _this.stageConfig.hallInit.map(function (item,index) {
        if(index == 0){
            tabs = tabs + '<a class="active">'+item.name+'</a>';
            slide = slide + '<div class="slide active" style="width:'+_this.stageConfig.width+'px;height:'+_this.stageConfig.height+'px"><div class="stageWrap" style="width:'+item.width+'px;height:'+item.height+'px">' + _this.creditRule(item) + _this.creditLine(item)+ '</div></div>';
        }else{
            tabs = tabs + '<a>'+item.name+'</a>';
            slide = slide + '<div class="slide" style="width:'+_this.stageConfig.width+'px;height:'+_this.stageConfig.height+'px"><div class="stageWrap" style="width:'+item.width+'px;height:'+item.height+'px">' + _this.creditRule(item) + _this.creditLine(item)+ '</div></div>';
        }
    });

    if(this.stageConfig.readOnly != true){
        html = '<span class="add">添加</span>';
    }
    html = html + '<div class="tabs">';
    html = html + tabs;
    html = html + '</div>';
    html = html + '<div class="container">';
    html = html + '<div class="container-wrapper" style="width:'+_this.stageConfig.width*_this.stageConfig.hallInit.length+'px">';
    html = html + slide;
    html = html + '</div>';
    html = html + '</div>';
    $(_this.stageConfig.target).append(html);
    $(_this.stageConfig.target).css({
        width: _this.stageConfig.width,
    });
    _this.changeHall();

    // 生成初始数据
    _this.stageConfig.hallInit.map(function (item,index) {
        // 初始配置
        _this.halls[index] = {
            currentIndex:0,
            distence:0,
            data:[]
        };
        // 添加展台
        item.data && item.data.map(function (item2,index2) {
            _this.addExhibition(item2,index,'init');
        });
    });

    // 重置展馆索引
    _this.hallIndex = 0;
}
exhibitionHall.prototype.changeHall = function() {
    var _this = this;
    $(_this.stageConfig.target + ' .tabs a').on('click', function() {
        _this.hallIndex = $(this).index();
        $(this).addClass('active').siblings().removeClass('active');
        $(_this.stageConfig.target + ' .container .slide').eq(_this.hallIndex).addClass('active').siblings().removeClass('active');

        // 切换勾子
        _this.stageConfig.onTabChange && _this.stageConfig.onTabChange({hallIndex:_this.hallIndex,halls:_this.halls});
    });
}
exhibitionHall.prototype.event = function() {
    var _this = this;
    // 修改展台
    var exhibitionIndex, currentConfig = {},delIndex;
    $(document).on('dblclick', _this.stageConfig.target + ' .exhibition', function() {
        exhibitionIndex = $(this).data('index');
        var data = _this.halls[_this.hallIndex].data[exhibitionIndex];
        currentConfig = data.config;
        var width = currentConfig.width;
        var height = currentConfig.height;
        var status = currentConfig.status;
        var exhibition = currentConfig.exhibition;
        var isOurcompany = currentConfig.isOurcompany;
        var remarks = currentConfig.remarks;

        layer.open({
            type: 1,
            skin: 'layui-layer-dialog',
            area: ['300px'],
            btn: ['确定'],
            content: $('.exhibitionForm'),
            success: function(layero, index) {
                $(layero).find('.width').val(width);
                $(layero).find('.height').val(height);
                $(layero).find('.status').val(status);
                $(layero).find('.exhibition').val(exhibition);
                $(layero).find('.isOurcompany').val(isOurcompany);
                $(layero).find('.remarks').val(remarks);
            },
            yes: function(index, layero) {
                layer.close(index);
                var config = {
                    width: parseInt($(layero).find('.width').val()),
                    height: parseInt($(layero).find('.height').val()),
                    status: $(layero).find('.status').val(),
                    exhibition: $(layero).find('.exhibition').val(),
                    isOurcompany: $(layero).find('.isOurcompany').val(),
                    remarks: $(layero).find('.remarks').val()
                }

                _this.reDrawExhibition(exhibitionIndex, config);
            }
        });
    });

    // 选中展台并按下
    $(document).on('mousedown', _this.stageConfig.target + ' .exhibition', function() {
        exhibitionIndex = $(this).data('index');
        var data = _this.halls[_this.hallIndex].data;
        currentConfig = data[exhibitionIndex].config;
        _this.mode = 'move';
        $(_this.stageConfig.target).css('cursor', 'move');
        $(_this.stageConfig.target + ' .exhibition').css({
            'z-index': 0
        });
        $(_this.stageConfig.target + ' .slide').eq(_this.hallIndex).find('.exhibition[data-index=' + exhibitionIndex + ']').css({
            'z-index': 1
        });
    });
    $(document).on('mouseup', _this.stageConfig.target + ' .exhibition', function() {
        _this.mode = 'default';
        $(_this.stageConfig.target).css('cursor', 'default');
    });

    var pOfl = $(_this.stageConfig.target + ' .container').offset().left;
    var pOft = $(_this.stageConfig.target + ' .container').offset().top;
    $(window).resize(function () {
        pOfl = $(_this.stageConfig.target + ' .container').offset().left;
        pOft = $(_this.stageConfig.target + ' .container').offset().top;
    });
    // 移动展台
    $(document).on('mousemove', _this.stageConfig.target, function(e) {
        var left = e.pageX - pOfl;
        var top = e.pageY - pOft;

        if (_this.mode == 'move') {
            $(_this.stageConfig.target + ' .slide').eq(_this.hallIndex).find('.exhibition[data-index=' + exhibitionIndex + ']').css({
                'left': left - currentConfig.width * _this.scale / 2,
                'top': top - currentConfig.height * _this.scale / 2,
            });
        }
    });

    // 添加展台
    $(_this.stageConfig.target + ' .add').on('click', function() {
        _this.addExhibition();
    });

    // // 获取删除的索引
    $(document).on('mouseover', _this.stageConfig.target + ' .exhibition', function() {
        delIndex = $(this).data('index');

        var data = _this.halls[_this.hallIndex].data;
        var tempData = data[delIndex].config;
    });
    $(document).on('mouseout', _this.stageConfig.target + ' .exhibition', function() {
        delIndex = null;
    });

    // 删除
    $(document).on('mouseup', _this.stageConfig.target + ' .exhibition .delete', function() {
        _this.delExhition(delIndex);
    });
}
exhibitionHall.prototype.creditRule = function(rule) {
    var width = '<span class="width">长:' + (rule.width / this.scale) + '米</span>';
    var height = '<span class="height">宽:' + (rule.height / this.scale) + '米</span>';
    return '<div class="ruleWrap">' + width + height + '</div>';
}
exhibitionHall.prototype.creditLine = function (item) {
    var wHtml = '';
    var hHtml = '';
    var step = 50;
    for(var i =1;i<=item.height/step;i++){
        wHtml += '<div class="w line" style="top:'+ (i*step) +'px"></div>';
    }
    for(var i =1;i<=item.width/step;i++){
        hHtml += '<div class="h line" style="left:'+ (i*step) +'px"></div>';
    }
    return '<div class="lineWrap">'+ wHtml + hHtml +'</div>';
}
exhibitionHall.prototype.reDrawExhibition = function(index, config) {
    var _this = this;
    var data = _this.halls[_this.hallIndex].data;
    data.map(function(item) {
        if (item.index == index) {
            for (var i in config) {
                item.config[i] = config[i];
            }
        }
    });
    var $this = $(_this.stageConfig.target + ' .slide').eq(_this.hallIndex).find('.exhibition[data-index=' + index + ']');
    $this.css({
        width: config.width * _this.scale,
        height: config.height * _this.scale,
    });

    if(config.remarks){
        $this.attr('data-tips',config.remarks);
    }else{
        $this.removeAttr('data-tips');
    }
    $(_this.stageConfig.target + ' .slide').eq(_this.hallIndex).find('.exhibition[data-index=' + index + '] div').css({
        background: config.status == 0 ? '#f00' : '#39983d'
    }).text(config.exhibition);

    _this.stageConfig.onEdit && _this.stageConfig.onEdit(_this.formatData());
}
exhibitionHall.prototype.addExhibition = function (config,hallIndex,isInit) {
    var _this = this;
    _this.hallIndex = hallIndex ? hallIndex : _this.hallIndex;
    var max,currentHall = _this.halls[_this.hallIndex];
    if(!config){
        currentHall.distence += 5;
        if(currentHall.distence > _this.stageConfig.hallInit[_this.hallIndex].height - 50){
            layer.msg('超出最大数量了！！！');
            return false;
        }else{
            max = 20 + currentHall.distence;
        }
    }else{
        max = 20;
    }

    var config = $.extend({},{
        width: 5,
        height: 5,
        x: max,
        y: max,
        status: 0,
        exhibition: '',
        isOurcompany: 0,
        remarks: ''
    },config);

    if(currentHall){
        currentHall.data.push({
            config:config,
            index:currentHall.currentIndex,
        });
    }else{
        currentHall.data.push({
            config:config,
            index:0,
        });
    }

    function deleteBtn() {
        return _this.stageConfig.readOnly != true ? '<span class="delete"></span>' : '';
    }
    function rendTips(remarks) {
        return remarks ? 'data-tips=' + remarks : '';
    }

    var html = '<div class="exhibition" '+ rendTips(config.remarks) + ' data-index="' + currentHall.currentIndex + '" style="width:' + config.width * _this.scale + 'px;height:' + config.height * _this.scale + 'px;line-height:' + config.height * _this.scale + 'px;left:' + config.x + 'px;top:' + config.y +
        'px">'+ deleteBtn() +'<div style="background:'+(config.status == 0 ? '#f00' : '#39983d')+'">' + config.exhibition + '</div></div>';
    $(_this.stageConfig.target + ' .slide').eq(_this.hallIndex).find('.stageWrap').append(html);

    // 记录当前展馆展台索引
    if(currentHall){
        currentHall.currentIndex ++;
    }

    // 添加勾子
    if(!isInit){
        _this.stageConfig.onAdd && _this.stageConfig.onAdd(_this.formatData());
    }
}
exhibitionHall.prototype.delExhition = function(index) {
    var _this = this;
    var exhibitionConfig = _this.halls[_this.hallIndex].data;
    exhibitionConfig.map(function(item) {
        if (item.index == index) {
            exhibitionConfig.splice(index, 1, {});
            $(_this.stageConfig.target + ' .slide').eq(_this.hallIndex).find('.exhibition[data-index=' + index + ']').detach();

            // 删除勾子
            _this.stageConfig.onDel && _this.stageConfig.onDel(_this.formatData());
        }
    });
}
exhibitionHall.prototype.formatData = function () {
    var _this = this;
    _this.stageConfig.hallInit.map(function (item,index) {
        item.data = [];
        _this.halls[index] && _this.halls[index].data.map(function (item2,index2) {
            item2.config && item.data.push(item2.config);
        });
    });
    return _this.stageConfig.hallInit;
}
