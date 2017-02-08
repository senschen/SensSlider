/**
 * Created by sens on 2017/1/5.
 * @param objConfig 传入配置对象
 * @param objConfig.parent jQuery对象 | 必填 | 负责移动或变换的父元素
 * @param objConfig.itemSelector String | 'li' | 子元素的选择器字符串
 * @param objConfig.containerSelector String | '.slide-box' | 防溢出的容器的选择器字符串，若未能取到则会自动创建
 * @param objConfig.btnLeftSelector String | 幻灯的后退按钮选择器字符串
 * @param objConfig.btnRightSelector String | 幻灯的前进按钮选择器字符串
 * @param objConfig.wasteTime Number | 500 | 变换动画持续时间ms
 * @param objConfig.waitTime Number | 3000 | 停留时间ms
 * @param objConfig.showNum Number | 1 | 一次显示几个幻灯
 * @param objConfig.skipNum Number | 1 |  变换时跳过几个幻灯
 * @param objConfig.index Number | 0 |  从第几个幻灯开始播放（从0开始）
 * @param objConfig.auto Boolean | false | 是否自动轮播
 * @param objConfig.hoverStop Boolean | true | 是否开启鼠标移入时暂停自动轮播
 * @param objConfig.hoverSelector String | 移入哪些元素（选择器）时暂停自动轮播
 * @param objConfig.isBanner Boolean | false | 是否开启banner切换模式
 * @param objConfig.oninited Function | 初始化完成后的回调函数
 * @returns obj | 返回一个SensSlider对象，可绑定play事件，在开始滚动时触发，并包含index参数
 */
function SensSlider(objConfig) {
    var defaultConfig = {
        parent: null,
        itemSelector: 'li',
        containerSelector: '.slide-box',
        btnLeftSelector: '',
        btnRightSelector: '',
        wasteTime: 500,
        waitTime: 3000,
        showNum: 1,
        skipNum: 1,
        index: 0,
        auto: false,
        hoverStop: true,
        hoverSelector: '',
        isBanner: false,
        oninited: function () {
        }
    };
    $.extend(this, defaultConfig, objConfig);
    this.isFading = false;
    this.arrWid = [0];
    this.container = this.parent.parent(this.containerSelector);
    this.items = this.parent.children(this.itemSelector);
    if (!this.isBanner && !this.container.length) {
        this.container = $('<div class="' + this.containerSelector.replace(/[\.#]*/, '') + '"></div>');
        this.parent.after(this.container);
        this.parent.appendTo(this.container);
    }
    this.init();
}
SensSlider.prototype.init = function () {
    var _obj = this;
    _obj.len = _obj.items.length;
    if(_obj.len < 1){
        throw new Error("no items!");
    }
    if (_obj.isBanner){
        _obj.items.each(function (index) {
            var _$this = $(this);
            _$this.css({
                position: 'absolute',
                left: '0',
                top: '0'
            });
            if (index === _obj.index) {
                _obj.parent.height(_$this.height()).css('position', 'relative');
            }
            else {
                _$this.hide();
            }
        });
    }
    else {
        if(!_obj.parent.is(':visible')){
            console.warn('the main element is not visible, this plugin may not work properly');
        }
        var _widParent = 0;
        _obj.items.each(function () {
            var _$this = $(this);
            _$this.width(_$this.width()).height(_$this.height());
            var _itemMarginR = parseInt('0' + _$this.css('margin-right'));
            _itemMarginR < 0 && _$this.css('margin-right','0') && (_itemMarginR = 0);

            var _currWid = _$this.outerWidth() + parseInt('0' + _$this.css('margin-left')) + _itemMarginR;
            _obj.arrWid.push(_obj.arrWid[_obj.arrWid.length - 1] + _currWid);
            _widParent += _currWid;

            _obj.container.css({
                'width': _obj.arrWid[_obj.index + _obj.showNum] - _obj.arrWid[_obj.index] + 'px',
                'height': _obj.parent.height(),
                'overflow': 'hidden',
                'position': 'relative',
                'margin-left' : _obj.parent.css('margin-left'),//IE不支持直接取css('margin')
                'margin-right' : _obj.parent.css('margin-right'),
                'margin-top' : _obj.parent.css('margin-top'),
                'margin-bottom' : _obj.parent.css('margin-bottom'),
                'padding-left' : _obj.parent.css('padding-left'),
                'padding-right' : _obj.parent.css('padding-right'),
                'padding-top' : _obj.parent.css('padding-top'),
                'padding-bottom' : _obj.parent.css('padding-bottom')
            });
        });

        _obj.items.each(function () {
            $(this).css('float', 'left');
        });

        _obj.parent.width(_widParent).css({
            'margin':'0',
            'padding':'0',
            'position' : 'absolute'
        });
    }

    function goIndex(index) {
        if (isPlaying()) {
            return false;
        }
        if ((index + 1) * _obj.skipNum > _obj.len + 1) {
            return false;
        }

        play(index);
    }

    function goFront(auto) {
        if (isPlaying()) {
            if (auto) {
                setTimeout(function () {
                    goFront(true);
                }, _obj.waitTime + _obj.wasteTime);
            }
            return false;
        }
        if (auto && _obj.isHover || !_obj.parent.is(':visible')) {
            setTimeout(function () {
                goFront(true);
            }, _obj.waitTime + _obj.wasteTime);
            return false;
        }

        _obj.len - _obj.index - _obj.showNum ? _obj.index++ : _obj.index = 0;
        if ((_obj.index + 1) * _obj.skipNum > _obj.len + 1) {
            _obj.index = 0;
        }

        play(_obj.index, auto);
    }

    function goBack() {
        if (isPlaying()) {
            return false;
        }
        _obj.index > 0 ? _obj.index-- : _obj.index = _obj.len - _obj.showNum;

        play(_obj.index);
    }

    function play(index, auto) {
        _obj.index = index;
        $(_obj).trigger('play', index);

        if (_obj.isBanner) {
            _obj.isFading = true;
            _obj.items.eq(index).fadeIn(_obj.wasteTime).siblings().fadeOut(_obj.wasteTime,function () {
                _obj.isFading = false;
            });
            if (auto) {
                setTimeout(function () {
                    goFront(true);
                }, _obj.waitTime + _obj.wasteTime);
            }
        }
        else {
            setTimeout(function () {
                _obj.container.width(_obj.arrWid[index + _obj.showNum] - _obj.arrWid[index]);
            }, _obj.wasteTime / 2);

            _obj.parent.stop(true).animate({left: -_obj.arrWid[index * _obj.skipNum]}, _obj.wasteTime, 'swing', function () {
                if (auto) {
                    setTimeout(function () {
                        goFront(true);
                    }, _obj.waitTime);
                }
            });
        }
    }

    function isPlaying() {
        return _obj.parent.is(':animated') || _obj.isFading;
    }


    if (_obj.auto) {
        setTimeout(function () {
            goFront(true);
        }, _obj.waitTime);

        if (_obj.hoverStop) {
            _obj.items.add(_obj.hoverSelector).on('mouseenter', function () {
                _obj.isHover = true;
            }).on('mouseleave', function () {
                _obj.isHover = false;
            });
        }
    }
    _obj.btnLeftSelector && $(_obj.btnLeftSelector).click(function () {
        goBack();
    });
    _obj.btnRightSelector && $(_obj.btnRightSelector).click(function () {
        goFront();
    });

    _obj.oninited(goIndex);
};
module.exports = SensSlider;