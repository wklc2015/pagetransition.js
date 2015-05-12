/*
 * ---------------------------------------------
 * website:
 * filename: BASE.js
 * revision: 1.0
 * createdate: 2014-09-17 17:22
 * author: lc
 * description: 
 * ---------------------------------------------
 */
var BASE = BASE || {};
/**
* 命名空间函数
* */
BASE.namespace = function (_name) {
    var parts = _name.split('.'), i, size, parent = BASE;
    //去掉全局变量
    if (parts[0] === 'BASE') {
        parts = parts.slice(1);
    }
    size = parts.length;
    for (i = 0; i < size; i++) {
        //不存在就建一个空对象
        if (typeof parent[parts[i]] === 'undefined') {
            parent[parts[i]] = {};
        }
        //层层深入
        parent = parent[parts[i]];
    }
    return parent;
};

/**
 * 页面过度动画
 * 内置67种Css3滑入滑出动画
 * */
BASE.namespace('BASE.COM.pageTransition');
BASE.COM.pageTransition = (function () {
    var defaults = {
            pages           : 'article.pt-page',   //page selector
            current         : 1,                   //default show which page
            aniSwipeUp      : 48,              //page swipeUp animation
            aniSwipeDown    : 49,            //page swipeDown animation
            aniTap          : 48,            //page swipeDown animation
            isEnableLoopPage: true,       //is swipe loop to show page
            isEnablePrevPage: true,       //is swipe down to show prev page
            isEnableNextPage: true,       //is swipe up to show next page
            isEnableTapPage : true,         //is tap to show next page
            callback        : function () {
            }
        },
        animationEndEventName = 'webkitAnimationEnd',
        init = function (element, options) {
            var settings = $.extend({}, defaults, options);
            return new PageTransition(element, settings);
        };

    function PageTransition(element, options) {
        /*
         * 变量声明
         * */
        this._$wraper = $(element);
        this._$pages = this._$wraper.children(options.pages);
        this._pagesCount = this._$pages.length;
        this._current = options.current - 1;
        this._aniSwipeUp = options.aniSwipeUp;
        this._aniSwipeDown = options.aniSwipeDown;
        this._aniTap = options.aniTap;
        this.callback = options.callback;

        this._$currPage = null;
        this._$nextPage = null;

        /*
         * 状态属性
         * */
        this._isEnableLoopPage = options.isEnableLoopPage;
        this._isEnablePrevPage = options.isEnablePrevPage;
        this._isEnableNextPage = options.isEnableNextPage;
        this._isEnableTapPage = options.isEnableTapPage;


        this._isAnimating = false;
        this._endCurrPage = false;
        this._endNextPage = false;


        /*
         * 页面执行
         **/
        this.init();
    }

    PageTransition.prototype = {
        init             : function () {
            var _this = this;
            _this._$pages.each(function () {
                var $page = $(this);
                $page.data('originalClassList', $page.attr('class'));
            });

            $(window)
                .on('scroll.elasticity', function (e) {
                    e.preventDefault();
                })
                .on('touchmove.elasticity', function (e) {
                    e.preventDefault();
                })
                .delegate('img', 'mousemove', function (e) {
                    e.preventDefault();
                });

            _this._$pages.eq(_this._current).addClass('pt-page-current');
            _this.event();
        },
        event            : function () {
            var _this = this;
            $(document).on('swipeUp swipeDown tap', function (e) {
                e.preventDefault();
                switch (e.type) {
                    case 'swipeUp':
                        _this._isEnableNextPage && _this.nextPage(_this._aniSwipeUp);
                        break;
                    case 'swipeDown':
                        _this._isEnablePrevPage && _this.prevPage(_this._aniSwipeDown);
                        break;
                    case 'tap':
                        _this._isEnableTapPage && _this.nextPage(_this._aniTap);
                        break;
                }
                return false;
            });
        },
        prevPage         : function () {
            var _this = this;
            if (_this._isAnimating)  return;
            _this._isAnimating = true;

            _this._$currPage = _this._$pages.eq(_this._current);

            if (_this._current > 0) {
                _this._current--;
            } else {
                if (_this._isEnableLoopPage) {
                    _this._current = _this._pagesCount - 1;
                } else {
                    _this._isAnimating = false;
                    return;
                }
            }
            _this._$nextPage = _this._$pages.eq(_this._current);
            _this.showPage('prev');

        },
        nextPage         : function () {
            var _this = this;
            if (_this._isAnimating) {
                return false;
            }
            _this._isAnimating = true;

            _this._$currPage = _this._$pages.eq(_this._current);

            if (_this._current < _this._pagesCount - 1) {
                _this._current++;
            } else {
                if (_this._isEnableLoopPage) {
                    _this._current = 0;
                } else {
                    _this._isAnimating = false;
                    return;
                }
            }
            _this._$nextPage = _this._$pages.eq(_this._current);

            _this.showPage('next');


        },
        showPage         : function (param) {
            var _this = this;
            var _ani = _this._aniTap;
            switch (param) {
                case 'prev':
                    _ani = _this._aniSwipeDown;
                    break;
                case 'next':
                    _ani = _this._aniSwipeUp;
                    break;
                default:
                    if (_this._current > parseInt(param, 10) - 1) {
                        _ani = _this._aniSwipeDown;
                    } else {
                        _ani = _this._aniSwipeUp;
                    }
                    _this._$currPage = _this._$pages.eq(_this._current);
                    _this._$nextPage = _this._$pages.eq(parseInt(param, 10) - 1);
                    _this._current = param - 1;
                    break;
            }
            var arrClass = _this.setAnimationClass(_ani);
            var outClass = arrClass.outClass, inClass = arrClass.inClass;

            _this._$currPage.addClass(outClass).off(animationEndEventName).on(animationEndEventName, function () {
                _this._endCurrPage = true;
                if (_this._endCurrPage) {
                    _this.onEndAnimation(_this._$currPage, _this._$nextPage);
                    _this.callback(_this);
                }
            });

            _this._$nextPage.addClass(inClass + ' pt-page-current').off(animationEndEventName).on(animationEndEventName, function () {
                _this._endNextPage = true;
                if (_this._endNextPage) {
                    _this.onEndAnimation(_this._$currPage, _this._$nextPage);
                }
            });
        },
        setAnimationClass: function (animation) {
            var outClass = '', inClass = '';
            switch (animation) {
                case 1:
                    outClass = 'pt-page-moveToLeft';
                    inClass = 'pt-page-moveFromRight';
                    break;
                case 2:
                    outClass = 'pt-page-moveToRight';
                    inClass = 'pt-page-moveFromLeft';
                    break;
                case 3:
                    outClass = 'pt-page-moveToTop';
                    inClass = 'pt-page-moveFromBottom';
                    break;
                case 4:
                    outClass = 'pt-page-moveToBottom';
                    inClass = 'pt-page-moveFromTop';
                    break;
                case 5:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromRight pt-page-ontop';
                    break;
                case 6:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromLeft pt-page-ontop';
                    break;
                case 7:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromBottom pt-page-ontop';
                    break;
                case 8:
                    outClass = 'pt-page-fade';
                    inClass = 'pt-page-moveFromTop pt-page-ontop';
                    break;
                case 9:
                    outClass = 'pt-page-moveToLeftFade';
                    inClass = 'pt-page-moveFromRightFade';
                    break;
                case 10:
                    outClass = 'pt-page-moveToRightFade';
                    inClass = 'pt-page-moveFromLeftFade';
                    break;
                case 11:
                    outClass = 'pt-page-moveToTopFade';
                    inClass = 'pt-page-moveFromBottomFade';
                    break;
                case 12:
                    outClass = 'pt-page-moveToBottomFade';
                    inClass = 'pt-page-moveFromTopFade';
                    break;
                case 13:
                    outClass = 'pt-page-moveToLeftEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromRight';
                    break;
                case 14:
                    outClass = 'pt-page-moveToRightEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromLeft';
                    break;
                case 15:
                    outClass = 'pt-page-moveToTopEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromBottom';
                    break;
                case 16:
                    outClass = 'pt-page-moveToBottomEasing pt-page-ontop';
                    inClass = 'pt-page-moveFromTop';
                    break;
                case 17:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromRight pt-page-ontop';
                    break;
                case 18:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromLeft pt-page-ontop';
                    break;
                case 19:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromBottom pt-page-ontop';
                    break;
                case 20:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-moveFromTop pt-page-ontop';
                    break;
                case 21:
                    outClass = 'pt-page-scaleDown';
                    inClass = 'pt-page-scaleUpDown pt-page-delay300';
                    break;
                case 22:
                    outClass = 'pt-page-scaleDownUp';
                    inClass = 'pt-page-scaleUp pt-page-delay300';
                    break;
                case 23:
                    outClass = 'pt-page-moveToLeft pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 24:
                    outClass = 'pt-page-moveToRight pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 25:
                    outClass = 'pt-page-moveToTop pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 26:
                    outClass = 'pt-page-moveToBottom pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 27:
                    outClass = 'pt-page-scaleDownCenter';
                    inClass = 'pt-page-scaleUpCenter pt-page-delay400';
                    break;
                case 28:
                    outClass = 'pt-page-rotateRightSideFirst';
                    inClass = 'pt-page-moveFromRight pt-page-delay200 pt-page-ontop';
                    break;
                case 29:
                    outClass = 'pt-page-rotateLeftSideFirst';
                    inClass = 'pt-page-moveFromLeft pt-page-delay200 pt-page-ontop';
                    break;
                case 30:
                    outClass = 'pt-page-rotateTopSideFirst';
                    inClass = 'pt-page-moveFromTop pt-page-delay200 pt-page-ontop';
                    break;
                case 31:
                    outClass = 'pt-page-rotateBottomSideFirst';
                    inClass = 'pt-page-moveFromBottom pt-page-delay200 pt-page-ontop';
                    break;
                case 32:
                    outClass = 'pt-page-flipOutRight';
                    inClass = 'pt-page-flipInLeft pt-page-delay500';
                    break;
                case 33:
                    outClass = 'pt-page-flipOutLeft';
                    inClass = 'pt-page-flipInRight pt-page-delay500';
                    break;
                case 34:
                    outClass = 'pt-page-flipOutTop';
                    inClass = 'pt-page-flipInBottom pt-page-delay500';
                    break;
                case 35:
                    outClass = 'pt-page-flipOutBottom';
                    inClass = 'pt-page-flipInTop pt-page-delay500';
                    break;
                case 36:
                    outClass = 'pt-page-rotateFall pt-page-ontop';
                    inClass = 'pt-page-scaleUp';
                    break;
                case 37:
                    outClass = 'pt-page-rotateOutNewspaper';
                    inClass = 'pt-page-rotateInNewspaper pt-page-delay500';
                    break;
                case 38:
                    outClass = 'pt-page-rotatePushLeft';
                    inClass = 'pt-page-moveFromRight';
                    break;
                case 39:
                    outClass = 'pt-page-rotatePushRight';
                    inClass = 'pt-page-moveFromLeft';
                    break;
                case 40:
                    outClass = 'pt-page-rotatePushTop';
                    inClass = 'pt-page-moveFromBottom';
                    break;
                case 41:
                    outClass = 'pt-page-rotatePushBottom';
                    inClass = 'pt-page-moveFromTop';
                    break;
                case 42:
                    outClass = 'pt-page-rotatePushLeft';
                    inClass = 'pt-page-rotatePullRight pt-page-delay180';
                    break;
                case 43:
                    outClass = 'pt-page-rotatePushRight';
                    inClass = 'pt-page-rotatePullLeft pt-page-delay180';
                    break;
                case 44:
                    outClass = 'pt-page-rotatePushTop';
                    inClass = 'pt-page-rotatePullBottom pt-page-delay180';
                    break;
                case 45:
                    outClass = 'pt-page-rotatePushBottom';
                    inClass = 'pt-page-rotatePullTop pt-page-delay180';
                    break;
                case 46:
                    outClass = 'pt-page-rotateFoldLeft';
                    inClass = 'pt-page-moveFromRightFade';
                    break;
                case 47:
                    outClass = 'pt-page-rotateFoldRight';
                    inClass = 'pt-page-moveFromLeftFade';
                    break;
                case 48:
                    outClass = 'pt-page-rotateFoldTop';
                    inClass = 'pt-page-moveFromBottomFade';
                    break;
                case 49:
                    outClass = 'pt-page-rotateFoldBottom';
                    inClass = 'pt-page-moveFromTopFade';
                    break;
                case 50:
                    outClass = 'pt-page-moveToRightFade';
                    inClass = 'pt-page-rotateUnfoldLeft';
                    break;
                case 51:
                    outClass = 'pt-page-moveToLeftFade';
                    inClass = 'pt-page-rotateUnfoldRight';
                    break;
                case 52:
                    outClass = 'pt-page-moveToBottomFade';
                    inClass = 'pt-page-rotateUnfoldTop';
                    break;
                case 53:
                    outClass = 'pt-page-moveToTopFade';
                    inClass = 'pt-page-rotateUnfoldBottom';
                    break;
                case 54:
                    outClass = 'pt-page-rotateRoomLeftOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomLeftIn';
                    break;
                case 55:
                    outClass = 'pt-page-rotateRoomRightOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomRightIn';
                    break;
                case 56:
                    outClass = 'pt-page-rotateRoomTopOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomTopIn';
                    break;
                case 57:
                    outClass = 'pt-page-rotateRoomBottomOut pt-page-ontop';
                    inClass = 'pt-page-rotateRoomBottomIn';
                    break;
                case 58:
                    outClass = 'pt-page-rotateCubeLeftOut pt-page-ontop';
                    inClass = 'pt-page-rotateCubeLeftIn';
                    break;
                case 59:
                    outClass = 'pt-page-rotateCubeRightOut pt-page-ontop';
                    inClass = 'pt-page-rotateCubeRightIn';
                    break;
                case 60:
                    outClass = 'pt-page-rotateCubeTopOut pt-page-ontop';
                    inClass = 'pt-page-rotateCubeTopIn';
                    break;
                case 61:
                    outClass = 'pt-page-rotateCubeBottomOut pt-page-ontop';
                    inClass = 'pt-page-rotateCubeBottomIn';
                    break;
                case 62:
                    outClass = 'pt-page-rotateCarouselLeftOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselLeftIn';
                    break;
                case 63:
                    outClass = 'pt-page-rotateCarouselRightOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselRightIn';
                    break;
                case 64:
                    outClass = 'pt-page-rotateCarouselTopOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselTopIn';
                    break;
                case 65:
                    outClass = 'pt-page-rotateCarouselBottomOut pt-page-ontop';
                    inClass = 'pt-page-rotateCarouselBottomIn';
                    break;
                case 66:
                    outClass = 'pt-page-rotateSidesOut';
                    inClass = 'pt-page-rotateSidesIn pt-page-delay200';
                    break;
                case 67:
                    outClass = 'pt-page-rotateSlideOut';
                    inClass = 'pt-page-rotateSlideIn';
                    break;

            }
            return {
                outClass: outClass,
                inClass : inClass
            }
        },
        onEndAnimation   : function ($outpage, $inpage) {
            var _this = this;
            _this._endCurrPage = false;
            _this._endNextPage = false;
            _this.resetPage($outpage, $inpage);
            _this._isAnimating = false;
        },
        resetPage        : function ($outpage, $inpage) {
            $outpage.attr('class', $outpage.data('originalClassList'));
            $inpage.attr('class', $inpage.data('originalClassList') + ' pt-page-current');
        }
    };
    return {
        init: init
    }
}());