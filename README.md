# SensSlider
依赖jquery，支持IE8+的轮播，能在大部分样式条件下稳定生成轮播框架，例如负margin情况的ul

#使用示例
#
var slide = new SensSlider({
            parent: $currMover,
            itemSelector: '.case-box',
            auto: true,
            hoverSelector: '.j-slide-control-case',
            oninited: function (goIndex) {
                _$currControl.children('li').click(function () {
                    goIndex($(this).index());
                });
            }
        });
        $(slide).on('play', function (e, index) {
            _$currControl.children('li').removeClass('curr').eq(index).addClass('curr');
        });
