/**
 * add by xc 弹出框
 * 参数解析
 * title：    string 消息框标题
 * content：  string/$对象，消息体内容(html代码或者iframe框)
 * isIframe:  bool    当content为iframe时，值必为true，默认值为false
 * -----------以下为非必填项
 *
 * skin:      皮肤样式，添加到最外层容器
 * height：   num 高度
 * width：    num 宽
 * autoClose：bool 是否自动关闭
 * timeout：  bool autoClose为true时多少秒后自动关闭
 * closeCallBack：function 关闭弹出框回调函数
 * buttons：  array [{}] 操作按钮
 * -----text：按钮文本值
 * ----theme：按钮主题
 * -autoHide: 点击按钮后是否关闭弹出窗，true为关闭，false为不关闭，默认值：true
 * -callback：点击按钮的回调，参数event会传入
 */
(function($, window) {
    //参数默认值
    let _DEFAULT = {
            title: "",
            content: "",
            isIframe: false,
            height: 0,
            width: 700,
            top: 40,
            buttons: [], //[{text:'确定',theme:'ok',autoHide:false,callback:function(e){}}]
            autoClose: false,
            timeout: 3,
            css: '',
            wrapperCss: '',
            closeCallBack: null,
            cancelCallBack: null,
            openCallBack: null
        },
        ZINDEX = 1100;

    let titleHeight = 80,
        footerHeight = 80,
        minWidth;

    function ModalDialog(opt) {
        this.opt = $.extend({}, _DEFAULT, opt);
        minWidth = this.opt.width + 80;
        this.$mask = $(`<div class="md-modal-wrap${this.opt.wrapperCss ? (' ' + this.opt.wrapperCss): ''}" style="min-width: ${minWidth}px;">
                            <div class="md-modal ${this.opt.skin ||""}" style="margin-top: ${this.opt.top}px;">
                                <div class="md-content">
                                    <div class="md-header">
                                        <h3 class="md-title ellipsis"></h3>
                                        <button type="button" class="md-close icon-close"></button>
                                    </div>
                                    <div class="md-con-body"></div>
                                    <div class="md-toolbar"></div>
                                </div>
                            </div>
                        </div>`);

        this.$overlay = $(`<div class="md-overlay${this.opt.wrapperCss ? (' ' + this.opt.wrapperCss): ''}"></div>`);
        this.$title = this.$mask.find(".md-title");
        this.$close = this.$mask.find('.md-close');
        this.$content = this.$mask.find(".md-con-body");
        this.$footer = this.$mask.find(".md-toolbar");
        this.namespace = "Modal_" + new Date().getTime();
        this.okCb = null;
        this.lessIE10 = is_IE(10);
        this.btnCallBack = {};

        this.resetZIndex();

        this.TIMEOUT = null;
        this.opt.css && this.$content.addClass(this.opt.css);
        $("body").append(this.$overlay).append(this.$mask);
        this.calcScrollBarWidth();
        this.getFixedNodes();
        this.init();
        this.bindEvets();
    }

    ModalDialog.prototype = {
        constructor: ModalDialog,
        //初始化
        init: function() {
            this.$title.text(this.opt.title).attr('title', this.opt.title);
            let _this = this;

            this.$content.html("");
            if (this.opt.isIframe) {
                this.iframeName = "Modal_Iframe";
                this.$iframe = $('<iframe src="' + this.opt.content + '" frameborder="0" class="modal-iframe" name="' + this.iframeName + '" />');
                this.$content.css("padding-top", 0).html(this.$iframe);
            } else {
                try {
                    $(this.opt.content).show();
                } catch (e) {}

                this.$content.append(this.opt.content);
            }

            this.reSize();

            this.opt.width > 0 && this.$mask.find('.md-content').css("width", this.opt.width + "px");
            this.opt.height > 0 && this.$content.css("min-height", this.opt.height + "px");

            this.setButtons(this.opt.buttons);
            this.show();

            //弹出框自动关闭
            if (this.opt.autoClose) {
                window.setTimeout(function() {
                    _this.hide();
                }, _this.opt.timeout * 1000);
            }
        },

        resetZIndex: function() {
            let showLength = $('div.md-overlay').length + 1;
            this.$mask.css('z-index', showLength + ZINDEX);
            this.$overlay.css('z-index', showLength + ZINDEX);
        },

        calcScrollBarWidth: function() {
            let noScroll, scroll, div = document.createElement("div");
            div.style.cssText = "position:absolute; top:-1000px; width:100px; height:100px; overflow:hidden;";
            noScroll = document.body.appendChild(div).offsetWidth;
            div.style.overflowY = "scroll";
            // ie
            scroll = div.offsetWidth;
            // 非IE
            if (scroll === noScroll) {
                scroll = div.clientWidth;
            }
            document.body.removeChild(div);
            this.scrollW = noScroll - scroll;
        },

        reLoad: function(opt) {
            this.opt = $.extend({}, this.opt, opt);
            this.init();
        },

        //获取和设置弹出框尺寸
        getSize: function() {
            this.opt.MAX_Height = (window.innerHeight || (document.documentElement && document.documentElement.clientHeight) || document.body.clientHeight) - titleHeight - 80;
            this.opt.MAX_Width = (window.innerWidth || (document.documentElement && document.documentElement.clientWidth) || document.body.clientWidth) * 0.8;
            this.opt.buttons.length > 0 && (this.opt.MAX_Height -= footerHeight);
        },

        getFixedNodes: function() {
            let fixNodes = [];
            $('body').children().each(function(index, node) {
                node = $(node);
                let pos = node.css('position');
                if (pos === 'fixed' || pos === 'absolute') {
                    if (node.width() === $('body').width()) {
                        fixNodes.push(node);
                    }
                }
            });
            this.fixNodes = fixNodes;
        },

        handleFixedNodes: function(width) {
            $(this.fixNodes).each((i, node) => {
                node.css('padding-right', width);
            });
        },

        //设置底部操作按钮
        setButtons: function(btns) {
            btns = btns || this.opt.buttons;
            this.opt.buttons = btns;
            this.btnCallBack = {};
            this.$footer.html("");
            if (!btns || Object.prototype.toString.call(btns) != "[object Array]" || btns.length < 1) {
                this.$footer.height(40);
                return;
            }

            this.$footer.show();
            for (let i = 0, l = btns.length; i < l; i++) {
                let btn = btns[i],
                    $btn = $(`<button type="button" class="md-btn ${btn.theme || 'cancel'}">${btn.text}</button>`);

                this.btnCallBack[btn.text] = btn;

                if (btn.theme === "ok") {
                    this.okCb = btn.callback;
                }
                this.$footer.append($btn);
            }
        },

        //显示
        show: function(opt) {
            let _this = this;
            if (opt && typeof opt === 'object') {
                _this.setTitle(opt.title);
            }
            if (document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight)) {
                $("body").css({
                    'overflow-y': "hidden",
                    'overflow-x': "auto",
                    "padding-right": _this.scrollW
                });
                _this.handleFixedNodes(_this.scrollW);
            }
            _this.$mask.css("overflow-y", "auto");
            _this.location();

            _this.$mask.show();
            _this.$overlay.addClass('md-show');
            _this.$mask.addClass('md-show');

            isFunction(this.opt.openCallBack) && this.opt.openCallBack();

            //低版本IE8字体库兼容性问题
            if (!$.support.leadingWhitespace) {
                _this.$mask.addClass('fix-ie-font-face');
                _this.$close.removeClass('icon-close');
                setTimeout(function() {
                    _this.$mask.removeClass('fix-ie-font-face');
                    _this.$close.addClass('icon-close');
                }, 100);
            }
            //end
            // 取消双击选中
            setTimeout(function() {
                window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
            }, 50);
        },

        //隐藏
        hide: function() {
            let _this = this;
            $("body").css({
                'overflow-y': "auto",
                "padding-right": 0
            });
            _this.handleFixedNodes(0);

            // _this.$mask.css("overflow", "hidden");
            this.$overlay.removeClass('md-show');
            this.$mask.removeClass('md-show').hide();
            this.$footer.find('.md-btn').removeAttr('disabled');
            $('.drop-list').removeClass('active');

            isFunction(this.opt.closeCallBack) && this.opt.closeCallBack();
        },

        location: function() {
            if ($(window).width() - minWidth < 0) {
                this.$mask.css('left', -(window.scrollX));
            } else {
                $(window).off('scroll.' + this.namespace);
            }
        },

        //重置窗口大小
        reSize: function(opt) {
            this.getSize();
        },

        //设置标题
        setTitle: function(text) {
            if (text) {
                this.$title.text(text).attr('title', text);
                this.opt.title = text;
            }
        },

        //事件绑定
        bindEvets: function() {
            let _this = this;
            //改变浏览器窗口大小
            $(window).off('scroll.' + _this.namespace).on('scroll.' + _this.namespace, function(event) {
                _this.location();
            });

            //关闭弹出框
            _this.$close.unbind('click.' + _this.namespace).bind('click.' + _this.namespace, function(e) {
                _this.hide();
                return false;
            });

            _this.$mask.find(".md-content").off("keyup").on("keyup", function(e) {
                var tagName = e.target.tagName.toLowerCase();
                if (tagName === 'input' || tagName === 'textarea') {
                    if (e.keyCode === 13) {
                        e.target.blur();
                        _this.okCb && _this.okCb();
                    }
                }
            });

            //底部按钮栏，防止事件冒泡
            _this.$footer.off("click." + _this.namespace).on("click." + _this.namespace, ".md-btn", function(e) {
                let $this = $(this);
                //委托处理按钮点击事件,通过按钮的text确定点击的是哪个按钮
                let text = $this.text();
                for (let key in _this.btnCallBack) {
                    if (key === text) {
                        let btnItem = _this.btnCallBack[key];
                        isFunction(btnItem.callback) && btnItem.callback(e);
                        if (btnItem.autoHide === false) {
                            return false;
                        }
                        break;
                    }
                }

                _this.hide();
                return false;
            });

            //点击阴影部分弹出框隐藏
            _this.$mask.off("click." + _this.namespace).on("click." + _this.namespace, function(e) {
                _this.opt.cancelCallBack && _this.opt.cancelCallBack();
                _this.hide();
                return false;
            });

            _this.$overlay.off("click." + _this.namespace).on("click." + _this.namespace, function(e) {
                _this.hide();
                return false;
            });

            //点击弹出框内容部分，捕获事件，阻止事件冒泡
            _this.$mask.find(".md-content").off("click." + _this.namespace).on("click." + _this.namespace, function(e) {
                // return false;
                $(document).click();
                e.stopPropagation();
            });
        },

        remove: function() {
            this.$mask.remove();
            this.$overlay.remove();
        }
    };

    /**
     * 是否是函数
     * @param  {[type]}  func 函数
     * @return {Boolean}      [true：是]
     */
    function isFunction(func) {
        if (func && typeof func === "function") {
            return true;
        }
        return false;
    }

    //组件开放调用api
    $.fn.modalDialog = function(opt) {
        let modal = $(this).data("modalDialog");
        if (typeof opt == 'string') {
            if (modal && modal[opt] && typeof modal[opt] === "function") {
                modal[opt]();
            }
        } else {
            if (modal) {
                modal.show(opt);
            } else {
                $(this).data("modalDialog", new ModalDialog(opt));
            }
        }

        return this;
    };

    $.modalDialog = function(opt) {
        let modal = new ModalDialog(opt);
        return modal;
    };

    // opt = {
    //     title: '',
    //     content: '',
    //     okText: '',
    //     okCallBack: function,//点击确定回调
    //     cancelText: '',
    //     cancelCallBack: function,//关闭回调
    //     autoClose: false
    // }
    //单例模式，只会实例化一个对象出来
    $.showConfirm = (function() {
        let confirmBox;

        return function(opt) {
            if (confirmBox) {
                let buttons = [{
                        text: opt.okText || _('Save'),
                        theme: 'ok',
                        callback: opt.okCallBack
                    },
                    {
                        text: opt.cancelText || _("Cancel"),
                        callback: opt.cancelCallBack
                    }
                ];
                confirmBox.opt.cancelCallBack = opt.cancelCallBack;
                confirmBox.opt.autoClose = opt.autoClose;
                confirmBox.setButtons(buttons);
                confirmBox.setTitle(opt.title);
                confirmBox.$content.find('.confirm').text(opt.content);
                confirmBox.resetZIndex();
                confirmBox.show();
            } else {
                let option = {
                    title: opt.title || _("Confirm"),
                    content: `<div class = "confirm">${opt.content || ""}</div>`,
                    isIframe: false,
                    height: opt.height || 180,
                    width: opt.width || 600,
                    top: opt.top || 100,
                    buttons: [{
                            text: opt.okText || _('Save'),
                            theme: 'ok',
                            callback: opt.okCallBack
                        },
                        {
                            text: opt.cancelText || _("Cancel"),
                            callback: opt.cancelCallBack
                        }
                    ],
                    css: 'table-cell',
                    wrapperCss: 'md-confirm',
                    autoClose: !!opt.autoClose || false,
                    cancelCallBack: opt.cancelCallBack,
                    closeCallBack: opt.closeCallBack
                };

                confirmBox = new ModalDialog(option);
            }

            return confirmBox;
        };
    })();

    //小于或等于IE*
    function is_IE(ver) {
        let b = document.createElement('b');
        b.innerHTML = '<!--[if lte IE ' + ver + ']><i></i><![endif]-->';
        return b.getElementsByTagName('i').length === 1;
    }
}(jQuery, window));

/**
 * 消息提示框，几秒钟后自动消失
 */
(function($) {
    let DEFAULT = {
        message: "",
        hideTime: 300,
        displayTime: 1000, //几秒钟后自动关闭，为0则表示不关闭
        opacity: 0.8,
        callback: function() {
            //
        }
    };

    function FormMess(opt) {
        this.option = $.extend({}, DEFAULT, opt);
        this.option.displayTime = parseInt(this.option.displayTime);
        this.option.hideTime = parseInt(this.option.hideTime);
        this.cssTime = 300;

        this.$container = $("div.form-mess-con");

        if (this.$container.length === 0) {
            this.$container = $('<div class="form-mess-con"></div>').appendTo('body');
        }

        this.$pop = $('<div class="form-message ani-init">' + this.option.message + '</div>');

        this.show();
        this.option.callback && this.option.callback();
    }

    FormMess.prototype = {
        show: function() {
            let _this = this;

            this.$pop.appendTo(this.$container);
            _this.h = -this.$pop.outerHeight();
            this.$pop.css("margin-top", this.h);

            setTimeout(function() {
                _this.$pop.addClass('ani-final').css("margin-top", 0);
            }, 10);

            if (_this.option.displayTime) {
                setTimeout(function() {
                    _this.hide();
                }, _this.option.displayTime + _this.cssTime);
            }
        },

        setMess: function(mess, time) {
            let _this = this;
            if (mess) {
                this.$pop.text(mess);
            }

            if (time) {
                setTimeout(function() {
                    _this.hide();
                }, time + _this.cssTime);
            }
        },

        hide: function(time) {
            time = time || 500;
            let _this = this;
            setTimeout(function() {
                _this.$pop.removeClass('ani-final').css("margin-top", _this.h);
                setTimeout(function() {
                    _this.$pop.remove();
                    _this = null;
                }, _this.option.hideTime);
            }, time);
        }
    };

    $.formMessage = (function() {
        let messBox;
        return function(opt, stay) {
            if (typeof opt === "string") {
                opt = {
                    message: opt
                };
            }
            if (stay && typeof stay === 'boolean') {
                opt.displayTime = 0;
                messBox = new FormMess(opt);
            } else {
                if (typeof stay === 'number') {
                    opt.displayTime = stay;
                }
                if (messBox) {
                    messBox.setMess(opt.message, opt.displayTime || 1000);
                    messBox = null;
                } else {
                    new FormMess(opt);
                }
            }
        };
    }());
}(jQuery));
/**
 * 进度条弹出框
 */
(function($) {
    let DEFAULT = {
        message: '',
        title: _('Tip'),
        perTime: 500, //总时长分为100份，每份的时间数
        requestUrl: '/goform/module', //请求的域名+地址
        stopTime: 96, //进度条停止增长时间节点
        percent: 0,
        requestData: {},
        autoStart: true, //是否自动开始跑进度条
        redirectUrl: '' //请求的域名+地址
    };

    function FormProgress(opt) {
        this.option = $.extend({}, DEFAULT, opt);
        let htmls = `<div class="md-modal-wrap md-confirm" style="top: 120px;">
                        <div class="md-modal" style="width: 520px;">
                            <div class="md-content">
                                <div class="md-header">
                                    <h3 class="md-title ellipsis" title="${this.option.title}">${this.option.title}</h3>
                                </div>
                                <div class="md-con-body" style="padding-bottom: 80px;">
                                    <div>
                                        <label class="md-per-text">${this.option.message}</label>
                                        <label class="md-per-val"></label>
                                    </div>
                                    <div class="md-per-total">
                                        <div class="md-per-now"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        this.$mask = $(htmls);
        this.$title = this.$mask.find('.md-title');
        this.$text = this.$mask.find('.md-per-text');
        this.$val = this.$mask.find('.md-per-val');
        this.$percent = this.$mask.find('.md-per-now');
        this.$overlay = $('<div class="md-pro-overlay"></div>');
        $("body").append(this.$overlay).append(this.$mask);

        this.timeout = null;
        this.percent = 0;
        this.index = 0;
        this.hasDone = false;
        this.max = 300; //极限值

        if (this.option.autoStart) {
            this.start();
            this.show();
        }
    }

    FormProgress.prototype.start = function() {

        this.timeout = setTimeout(() => {
            this.index++;
            //变速进度条
            this.percent += Math.random() * 1 + 0.6;
            this.percent = this.percent > this.option.stopTime ? this.option.stopTime : +this.percent.toFixed(2);

            this.$percent.css('width', this.percent + '%');
            this.$val.text(this.percent + '%');

            if (this.index > this.max) {
                this.$percent.css('width', '100%');
                this.$val.text('100%');
                this.timeout && clearInterval(this.timeout);
                this.timeout = null;
                if (this.option.redirectUrl !== "") {
                    window.setTimeout(() => { //防止过早跳转
                        window.location.href = this.option.redirectUrl;
                    }, 1000);
                }
                return;
            }

            if (this.hasDone) {
                if (this.index < this.option.stopTime) {
                    //当重启已完成时，加速跑完进度条
                    this.option.perTime = 100;
                } else {
                    this.index = this.max + 1;
                }
            } else {
                this.request();
            }

            this.start();
        }, this.option.perTime);
    };

    FormProgress.prototype.request = function() {
        //50次timeOut后开始请求数据看是否重启成功,3倍perTime发送一次请求
        if (this.index > 50 && this.index % 3 === 0) {
            $.GetSetData.getDataCROS(this.option.requestData, (res) => {
                // if (res.indexOf("loginType") != -1) {
                this.hasDone = true;
                // }
            }, this.option.requestUrl);
        }
    };

    FormProgress.prototype.reStart = function(opt) {
        this.hasDone = false;
        this.index = 0;
        this.percent = opt.percent || 0;
        this.option = $.extend({}, DEFAULT, opt);
        opt.text && this.$title.text(opt.text).attr('title', opt.text);
        opt.message && this.$text.text(opt.message);
        if (opt.autoStart !== false) {
            this.start();
            this.show();
        }
    };

    FormProgress.prototype.setTitle = function(title) {
        this.$title.text(title).attr('title', title);
    };

    FormProgress.prototype.setPercent = function(percent) {
        this.percent = percent;
        this.$percent.css('width', this.percent + '%');
    };

    FormProgress.prototype.setText = function(text) {
        this.$mask.find('.md-per-text').text(text);
    };

    FormProgress.prototype.hide = function() {
        this.$overlay.removeClass('md-show');
        this.$mask.removeClass('md-show');
    };

    FormProgress.prototype.show = function() {
        this.$overlay.addClass('md-show');
        this.$mask.addClass('md-show');
    };

    $.formProgress = function(opt) {
        return new FormProgress(opt);
    };
}(jQuery));