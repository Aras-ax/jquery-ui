/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormInput"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($) {
    $.fn.FormInput = function() {
        return new $.components.FormInput(this, arguments);
    };

    // 构造函数
    $.components.FormInput = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };
    // 显示模式
    let displayMode = {
            // 写入模式
            edit: 'edit',
            // 只读模式
            read: 'readonly',
            // 显示/只读切换模式
            readEdit: 'readEdit'
        },
        DEFAULT = { //组件独有配置项
            placeholder: '',
            displayMode: displayMode.edit,
            // 移除首尾空格
            removeSpace: false,
            // 是否有眼睛图标显示，只有在type为password的情况下才有效
            hasEyes: false,
            // 是否需要输入前面有一个剪短的描述性文字
            hasTitleDes: "",
            // [{type:"",args:[]}]
            dataOptions: [],
            // 值为空时显示的默认文本
            defaultText: "",
            defaultTextClass: "gray",
            dataPrefix: "",
            // 允许输入项的正则，覆盖默认的num和float对应的正则
            regExp: null,
            maxLength: null,
            // 当输入的值等于max时的回调
            maxCallBack: null,
            // 切换模式回调函数
            switchCallBack: null,
            // 文本框获取焦点回调
            focusCallBack: null,
            blurCallBack: null
        };

    // 继承及控件实现
    $.components.FormInput.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);

            this.supportPlaceHolder = 'placeholder' in document.createElement('input');
            this.supportChangeType = supportChangeType();
            this.type = this.option.type;

            if (this.option.dataOptions && Object.prototype.toString.call(this.option.dataOptions) === "[object Object]") {
                this.option.dataOptions = [this.option.dataOptions];
            }

            if (this.option.displayMode === displayMode.read) {
                this.required = this.option.required = false;
            }

            let optTar = {
                len: 1,
                byteLen: 1,
                pwd: 1,
                username: 1,
                ssidPasword: 1,
                remarkTxt: 1,
                serverName: 1,
                num: 2,
                float: 2,
                ascii: 1
            };

            //通过设定的dataOptions确定maxlength属性的值，如设置直接忽略，同时确定dataValueType的值，如设置直接忽略
            if (this.option.dataOptions && this.option.dataOptions.length > 0) {
                for (let i = 0, l = this.option.dataOptions.length; i < l; i++) {
                    let option = this.option.dataOptions[i];
                    switch (optTar[option.type]) {
                        case 1:
                            if (option.args && Object.prototype.toString.call(option.args) === '[object Array]' && option.args.length >= 2) {
                                this.option.maxLength = this.option.maxLength || option.args[1];
                            }
                            break;
                        case 2:
                            if (!this.option.dataValueType) {
                                this.option.dataValueType = option["type"];
                            }

                            if (option.args && Object.prototype.toString.call(option.args) === '[object Array]' && option.args.length >= 2) {
                                let max = option.args[1] + '';
                                this.option.maxLength = this.option.maxLength || max.length;
                            }
                            break;
                    }

                    if (this.option.maxLength) {
                        break;
                    }
                }
            }

            //记录组件显示状态
            //edit（编辑），read（只读）,readEdit（编辑只读状态互转）
            this.displayMode = this.option.displayMode;
            this.editable = this.displayMode == displayMode.read ? false : this.editable;
            this.value = this.option.defaultValue;

            this.$holderplace = null;
            // 根据配置的dataValueType现在文本框的输入
            if (!this.option.regExp) {
                if (this.option.dataValueType === "num") {
                    this.option.regExp = /[0-9\-]/;
                } else if (this.option.dataValueType === "float") {
                    this.option.regExp = /[0-9\.\-]/;
                }
            }

            if (this.option.regExp) {
                this.regExp = typeof this.option.regExp === "object" ? this.option.regExp : new RegExp(this.option.regExp);
            }

            //渲染Html页面
            this.htmlRender();
            //设置placeholder
            this.setPlaceHolder(this.option.placeholder);
            //绑定事件
            this.bindEvent();

            this.option.capTipCallback && this.addCapTip();

            this.setValue(this.value);
        },

        /**
         * 渲染html内容
         */
        htmlRender: function() {
            if (!this.editable) {
                this.$element.attr("disabled", "disabled").parent().addClass('form-disabled');
            }

            if (this.option.hasEyes && this.type === "password") {
                let $wrap = $('<div class="form-input-wrap"></div>');
                this.$element.parent().append($wrap);
                $wrap.append(this.$element);
            }

            this.ID = this.$element.attr('id') || $.IGuid();
            this.$element.attr('id', this.ID);

            //添加简短的文字描述前缀
            if (this.option.hasTitleDes && typeof this.option.hasTitleDes == "string") {
                this.$element.parent()
                    .addClass("form-input-des")
                    .prepend('<label class="input-title-des" for="' + this.ID + '">' + this.option.hasTitleDes + '</label>');
            }

            this.option.maxLength && this.$element.attr("maxlength", this.option.maxLength);

            if (this.type === "password") {
                if (this.$element.attr("type") !== "password") {
                    if (this.supportChangeType) {
                        this.$element.prop("type", "password");
                    } else {
                        let $copyNode = $('<input type="password"/>');
                        let tarElem = this.$element[0],
                            attrs = tarElem.attributes;

                        for (let i = 0, l = attrs.length; i < l; i++) {
                            let attr = attrs[i];
                            if (attr.nodeName != "type") {
                                $copyNode.attr(attr.nodeName, attr.nodeValue);
                            }
                        }
                        this.$element.replaceWith($copyNode);
                        this.$element = $copyNode;
                    }
                }
            }

            this.$element.addClass("form-input").attr("name", this.dataField).attr("placeholder", this.option.placeholder);
            //type为password时，输入框获取焦点则显示输入的文本信息
            if (!this.supportChangeType && this.type === "password") {
                this.$textElem = $('<input type="text" class="form-input" style="display:none;"/>');
                let tarElem = this.$element[0],
                    attrs = tarElem.attributes;

                for (let i = 0, l = attrs.length; i < l; i++) {
                    let attr = attrs[i];
                    if (attr.nodeName != "type" && attr.nodeName != "id") {
                        this.$textElem.attr(attr.nodeName, attr.nodeValue);
                    }
                }

                this.$textElem.insertAfter(this.$element);
            }

            if (this.option.hasEyes && this.type === "password") {
                this.$eyes = $('<i class="icon-eyes-close form-input-eyes"></i>');
                this.$eyes.insertAfter(this.$element);
            }

            if (this.displayMode === displayMode.readEdit) {
                this.$readELement = $('<label class="form-inputmess ellipsis"></label>');
                this.$readEditBth = $('<i class="edit-icon icon-edit"></i>');
                this.$readWrap = $("<div class='form-inputread'></div>").append(this.$readELement).append(this.$readEditBth);
                this.$element.before(this.$readWrap).hide();
            }
        },
        /**
         * 设置是否可编辑
         */
        setEditable: function(editable) {
            this.editable = !!editable;
            if (this.editable) {
                this.$element.removeAttr('disabled').parent().removeClass('form-disabled');
                this.$textElem && this.$textElem.removeAttr('disabled').parent().removeClass('form-disabled');
            } else {
                this.removeValidateText();
                this.$element.prop('disabled', true).parent().addClass('form-disabled');
                this.$textElem && this.$textElem.prop('disabled', true).parent().addClass('form-disabled');
            }
            return this;
        },


        /**
         * 绑定事件
         */
        bindEvent: function() {
            let _this = this;
            let _eventHandle = {
                all: function() {
                    // 限制输入即时校验的频率
                    var inputTimeout;
                    // 绑定foucs，同时出触发自定义行为
                    _this.$element.unbind("focus.FormInput").bind("focus.FormInput", function(e) {
                        if (!_this.editable) {
                            return;
                        }
                        _this.option.focusCallBack && _this.option.focusCallBack.call(_this);
                    });

                    //根据配置正则对输入项进行校验,中文输入法不会进入该事件，故需要绑定keypress对中文输入法做出限制
                    _this.$element.off("keypress.FormInput").on("keypress.FormInput", function(e) {

                        //兼容firefox,其它浏览器不会响应功能键的keypress事件
                        if (/firefox/i.test(window.navigator.userAgent)) {
                            let ignoreCode = [8, 9, 37, 38, 39, 40, 46]; // backspace键，tab键，左键，上键，右键，下键，delete键
                            if (ignoreCode.indexOf(e.keyCode) > -1) {
                                return;
                            }
                        }
                        let key = e.key || String.fromCharCode(e.keyCode),
                            type = _this.option.dataValueType;
                        if (_this.regExp && key) {
                            if (!_this.regExp.test(key)) {
                                return false;
                            }
                        }

                        // input输入框至多只能输入一个'-'号
                        if (type === "float" || type === "num") {
                            if (this.value !== "" && key === "-") {
                                return false;
                            }
                        }
                        // input输入框的值为空，或者已经输入'.'号后不能再输入'.'号
                        if (type === "float" && key === '.') {
                            if (this.value === '' || this.value.indexOf(".") > -1) {
                                return false;
                            }
                        }
                    });

                    // keypress可以限制一部分输入，但是对于中文输入法没法进行截获，故通过keyup去截获，以达到限制输入的效果
                    if (_this.option.dataValueType === "num") {
                        _eventHandle.num();
                    } else if (_this.option.dataValueType === "float") {
                        _eventHandle.float();
                    } else if (_this.regExp) {
                        _eventHandle.otherLimit();
                    }

                    //切换显示风格
                    if (_this.displayMode === displayMode.readEdit) {
                        _this.$readEditBth.off("click.formInput").on("click.formInput", function() {
                            _this.lastValue = _this.getValue();
                            _this.changeDisplayMode("show");
                            _this.option.switchCallBack && _this.option.switchCallBack.call(_this);
                        });
                    }

                    if (/chrome/i.test(navigator.userAgent)) {
                        // 解决中文输入法按enter后keyup捕获不了问题
                        _this.$element.unbind("compositionend.FormValidate").bind("compositionend.FormValidate", function(e) {
                            _this.format();
                            _this.onValidate();
                        });
                    }

                    _this.$element.unbind("keyup.FormValidate").bind("keyup.FormValidate", function(e) {
                        if (this.value && _this.option.maxLength && this.value.length >= _this.option.maxLength) {
                            _this.option.maxCallBack && _this.option.maxCallBack.call(_this, e);
                        }

                        var ignoreCode = [9, 37, 38, 39, 13]; // tab键，左键，上键，右键，下键，回车
                        if (ignoreCode.indexOf(e.keyCode) === -1) {
                            // 限制输入验证的频率
                            inputTimeout && clearTimeout(inputTimeout);
                            inputTimeout = window.setTimeout(function() {
                                //G0项目需要数据实时校验
                                _this.format();
                                _this.onValidate();
                                inputTimeout = null;
                            }, 100);
                        }
                    });

                    //失去焦点，进行数据校验
                    _this.$element.unbind("blur.FormInput").bind("blur.FormInput", function(e) {
                        if (!_this.editable) {
                            return;
                        }

                        let type = _this.option.dataValueType;

                        if (type === "float") {
                            if (this.value && this.value.indexOf(".") === this.value.length - 1) {
                                let v = Number(this.value) + "";
                                this.value = v;
                            }
                        }
                        resetData(_this, this);
                        _this.option.blurCallBack && _this.option.blurCallBack.call(_this);

                        if (_this.$element.attr('data-old') !== this.value || (this.value === "" && _this.option.required)) {
                            _this.$element.attr("data-old", this.value);
                            _this.valChange();
                        } else if (_this.displayMode === displayMode.readEdit && !_this.$element.hasClass('error-tip')) {
                            _this.changeDisplayMode();
                        }
                    });

                },
                num: function() {
                    _this.$element.unbind("keyup.FormInputLimit").bind("keyup.FormInputLimit", function(e) {
                        if (this.value === "-") {
                            return;
                        }
                        let v;
                        if (this.value == "0") {
                            v = 0;
                        } else {
                            v = this.value.replace(/[^\-\d]+/g, "").replace(/\-+$/g, '');
                        }

                        v !== "" && (v = Number(v));
                        if (this.value !== (v + '')) {
                            this.value = v;
                        }
                    });

                    _this.$element.unbind("blur.FormInputLimit").bind("blur.FormInputLimit", function(e) {
                        if (!_this.editable) {
                            return;
                        }

                        if (this.value) {
                            let v = this.value === "-" ? "0" : Number(this.value);
                            if (isNaN(v)) {
                                v = 0;
                            }
                            this.value = v;
                        }
                    });
                },
                float: function() {
                    _this.$element.unbind("keyup.FormInputLimit").bind("keyup.FormInputLimit", function(e) {
                        let curVal = this.value;
                        if (curVal === "" || this.value === "-") {
                            return;
                        }
                        curVal = curVal.replace(/([^\-\d\.]|\s)/g, "").replace(/\-+$/g, '');
                        if (/\./.test(curVal) || /^\-/.test(curVal)) {
                            curVal = curVal.replace(/[^\-\d\.]+/g, "");
                        } else if (curVal !== "") {
                            curVal = Number(curVal);
                        }
                        if (this.value !== (curVal + '')) {
                            this.value = curVal;
                        }
                    });

                    _this.$element.unbind("blur.FormInputLimit").bind("blur.FormInputLimit", function(e) {
                        if (!_this.editable) {
                            return;
                        }

                        if (this.value) {
                            let v = this.value === "-" ? "0" : Number(this.value);
                            if (isNaN(v)) {
                                v = 0;
                            }
                            this.value = v;
                        }
                    });
                },
                otherLimit: function() {
                    // 根据正则限制输入
                    _this.$element.off("keyup.FormInputLimit").on("keyup.FormInputLimit", function(e) {
                        let ignoreCode = [187, 189, 192];
                        if (this.value && (/[^\x00-\xff]/.test(this.value) || ignoreCode.indexOf(e.keyCode) > -1)) {
                            let v, reg = new RegExp(_this.regExp, "g");
                            v = this.value.match(reg, function(a) {}) || [];
                            this.value = v.join("");
                        }
                    });
                },
                supportChange: function() {
                    //有眼睛按钮的情况下通过点击眼睛来切换明文密文
                    if (_this.option.hasEyes) {
                        _this.$eyes.off("click.FormInputPass").on("click.FormInputPass", function() {
                            if (!_this.editable) {
                                return false;
                            }

                            if ($(this).hasClass('active')) {
                                _this.$element.attr("type", "password");
                            } else {
                                _this.$element.attr("type", "text");
                            }
                            _this.$element.focus();
                            $(this).toggleClass('active');
                            return false;
                        });
                    } else {
                        //无眼睛的情况下通过文本框获取和失去焦点来切换明文米密文
                        _this.$element.off("focus.FormInputPass").on("focus.FormInputPass", function() {
                            this.type = "text";
                        });

                        _this.$element.off("blur.FormInputPass").on("blur.FormInputPass", function() {
                            this.type = "password";
                        });
                    }
                },
                unSupport: function() {
                    //绑定事件，控制两个输入框的显示隐藏，数据同步
                    if (_this.option.hasEyes) {
                        _this.$eyes.off("click.FormInputPass").on("click.FormInputPass", function() {
                            if (!_this.editable) {
                                return false;
                            }

                            if ($(this).hasClass('active')) {
                                _this.setValue(_this.$textElem.val());
                                _this.$textElem.hide();
                                _this.$element.show();
                                _this.focus(_this.$element[0]);
                            } else {
                                _this.setValue(_this.$element.val());
                                _this.$textElem.show();
                                _this.$element.hide();
                                _this.focus(_this.$textElem[0]);
                            }
                            $(this).toggleClass('active');
                            return false;
                        });

                        _this.$textElem.off('keyup.FormInputPass').on('keyup.FormInputPass', function() {
                            let $this = $(this);
                            _this.setValue($this.val(), true);

                            if (_this.$element.hasClass("error-tip")) {
                                _this.$textElem.addClass("error-tip");
                            } else {
                                _this.$textElem.removeClass("error-tip");
                            }
                        });
                    } else {
                        _this.$element.off("focus.FormInputPass").on('focus.FormInputPass', function() {
                            let val = this.value,
                                pos = $(this).position();
                            // $(this).addClass('hide');
                            _this.$textElem.css({
                                position: "absolute",
                                top: pos.top,
                                left: pos.left
                            }).show();
                            if (val === "") {
                                this.value = "";
                            }
                            setTimeout(function() {
                                // _this.$textElem.focus();
                                _this.focus(_this.$textElem[0]);
                                // _this.removeValidateText();
                                $.setCursorPos(_this.$textElem[0], val.length);
                            }, 0);
                        });

                        _this.$textElem.off('keyup.FormInputPass').on('keyup.FormInputPass', function() {
                            let $this = $(this);

                            _this.setValue($this.val(), true);

                            if (_this.$element.hasClass("error-tip")) {
                                _this.$textElem.addClass("error-tip");
                            } else {
                                _this.$textElem.removeClass("error-tip");
                            }
                        });

                        _this.$textElem.off('blur.FormInputPass').on('blur.FormInputPass', function() {
                            let $this = $(this);

                            // _this.setValue($this.val(), true);
                            $this.hide();

                            // if (_this.$element.hasClass("error-tip")) {
                            //     _this.$textElem.addClass("error-tip");
                            // } else {
                            //     _this.$textElem.removeClass("error-tip");
                            // }
                        });
                    }

                    _this.$textElem.unbind("focus.FormInputPass").bind("focus.FormInputPass", function(e) {
                        _this.option.focusCallBack && _this.option.focusCallBack.call(_this);
                    });
                },
                placeholder: function() {
                    //如果是密码输入框
                    if (_this.$textElem) {
                        _this.$textElem.off('keyup.FormInputHolder').on("keyup.FormInputHolder", function(e) {
                            if (this.value) {
                                _this.$holderplace.hide();
                            } else {
                                _this.$holderplace.show();
                            }
                        });
                    }

                    _this.$element.off('keyup.FormInputHolder').on("keyup.FormInputHolder", function(e) {
                        if (this.value) {
                            _this.$holderplace.hide();
                        } else {
                            _this.$holderplace.show();
                        }
                    });

                    _this.$holderplace.click(function(e) {
                        if (_this.$textElem && _this.option.hasEyes && _this.$eyes.hasClass("active")) {
                            _this.focus(_this.$textElem[0]);
                            return;
                        }
                        _this.focus();
                    });
                }
            };
            //执行公共逻辑事件绑定
            _eventHandle.all();

            //当前的输入框为密码时
            if (_this.type === "password") {
                //兼容IE,若可以更改type属性则直接进行type属性的修改
                if (_this.supportChangeType) {
                    _eventHandle.supportChange();
                } else {
                    _eventHandle.unSupport();
                }
            }

            //对于自定义placeholder情况的实现
            if (_this.$holderplace) {
                _eventHandle.placeholder();
            }
        },

        /**
         * 文本框获取焦点后，将光标移动到文本框的末尾
         * IE上默认聚焦在首位
         */
        focus: function(dom, start, end) {
            dom = dom || this.$element[0];

            if (this.$eyes && this.$textElem && this.$eyes.hasClass('active')) {
                dom = this.$textElem[0];
            }
            let l = dom.value.length;
            start = start || l;
            end = end || l;

            if (dom.setSelectionRange) {
                dom.focus();
                dom.setSelectionRange(start, end);
            } else if (dom.createTextRange) {
                let range = dom.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        },
        /**
         * 更改placeholder的显示
         */
        changePlaceholder: function(placeholder) {
            this.setPlaceHolder(placeholder);
        },
        /**
         * 切换显示模式
         */
        changeDisplayMode: function(mode) {
            if (mode === "show") {
                this.$readWrap.hide();
                this.$element.show();
                // this.$element.show().focus();
                this.focus();
            } else {
                this.$readWrap.show();
                this.$element.hide();
            }
        },

        /**
         * 重写基类值改变方法
         */
        valChange: function() {
            this.getValue();
            if (this.option.autoValidate) {
                let v = this.onValidate();
                if (v) {
                    this.handleChangeEvents();
                }
                if (!!v && this.displayMode === displayMode.readEdit) {
                    // 改变值
                    let text = this.getValue();
                    if (text == "" && this.option.defaultText) {
                        text = this.option.defaultText;
                        this.$readELement.addClass(this.option.defaultTextClass);
                    } else {
                        this.$readELement.removeClass(this.option.defaultTextClass);
                    }
                    text = this.option.dataPrefix + text;
                    this.$readELement.text(text).attr("title", text);
                    this.changeDisplayMode("hide");
                }
            }
            this.option.afterChangeCallBack && this.option.afterChangeCallBack.call(this);
        },
        /**
         * 添加显示的错误信息
         */
        addOther: function() {
            this.$textElem && this.$textElem.addClass("error-tip");
        },
        /**
         * 去掉显示的错误信息
         */
        removeOther: function() {
            this.$textElem && this.$textElem.removeClass("error-tip");
        },

        /**
         * 重写基类数据验证方法
         */
        validate: function() {
            //格式验证
            let val = this.value;
            if (val !== "" && val !== undefined && this.option.dataOptions && this.option.dataOptions.length > 0) {
                let err = '',
                    isValid = true,
                    opt;

                for (let i = 0, l = this.option.dataOptions.length; i < l; i++) {
                    opt = this.option.dataOptions[i];
                    let types = opt.type.split("."),
                        fn = $.valid,
                        obj = {},
                        args = opt.args !== undefined ? [val].concat(opt.args) : [val];

                    for (let j = 0, k = types.length; j < k; j++) {
                        j === k - 1 && (obj = fn);
                        if (fn) fn = fn[types[j]];
                    }

                    if (fn && Object.prototype.toString.call(fn) === '[object Function]') {
                        err = fn.apply(obj, args);
                        if (err) break;
                    }
                }

                err && (isValid = false);

                if (!isValid) {
                    this.addValidateText(err);
                    return false;
                }
            }
            return true;
        },

        /**
         * 设置placeholder 
         */
        setPlaceHolder: function(ph) {
            if (this.editable && !!ph) {
                this.option.placeholder = ph.toString();

                //兼容IE9及以下
                if (this.supportPlaceHolder) {
                    this.$element.attr("placeholder", this.option.placeholder);
                } else {
                    if (this.$holderplace) {
                        this.$holderplace.text(this.option.placeholder);
                    } else {
                        let self = this.$element,
                            _this = this;
                        if (!_this.option.needWrap) {
                            let $wrapper = $(`<div style="display: inline-block; position: relative;"></div>`);
                            _this.$element.after($wrapper);

                            $wrapper.append(_this.$element);
                        }

                        let pos = self.position(),
                            h = self.outerHeight(true),
                            paddingleft = self.css('padding-left'),
                            fontsize = self.css("font-size");
                        this.$holderplace = $('<span class="form-input-pholder"></span>').text(ph)
                            .css({
                                left: pos.left || 0,
                                top: 0,
                                height: h,
                                lineHeight: parseInt(h) + "px",
                                paddingLeft: paddingleft,
                                position: 'absolute',
                                color: '#aaa',
                                width: "100%",
                                whiteSpace: "nowrap",
                                "z-index": 10,
                                overflow: "hidden",
                                "font-size": fontsize
                            }).appendTo(self.parent());
                    }
                }
            }
        },
        /**
         * 移除placeholder
         */
        removePlaceholder: function() {
            if (this.supportPlaceHolder) {
                this.$element.attr("placeholder", "");
            } else {
                this.$holderplace && this.$holderplace.text("");
            }
        },

        //设置值
        setValue: function(v, confirm) {
            // if (v == null) return;
            if (!this.editable) {
                this.value = v;
                this.$element.val(this.value);
            } else {
                this.value = v;
                this.$element.val(v);
                this.$textElem && this.$textElem.val(v);
                this.$element.attr("data-old", this.value);

                if (this.$readELement) {
                    if (v === "" && this.option.defaultText) {
                        v = this.option.defaultText;
                        this.$readELement.addClass(this.option.defaultTextClass);
                    } else {
                        this.$readELement.removeClass(this.option.defaultTextClass);
                    }
                    v = this.option.dataPrefix + v;
                    this.$readELement.text(v).attr("title", v);
                }
                if (this.$holderplace) {
                    (v === '' || v === undefined) ? this.$holderplace.show(): this.$holderplace.hide();
                }
            }
            // confirm && this.valChange();
            this.validateOrChange(confirm);
            return this;
        },
        /**
         * 获取值
         */
        getValue: function() {
            if (!this.editable) {
                let v = this.value;
                this.value = v == null ? "" : v;
            } else {
                this.value = this.$element.val();
                this.option.removeSpace && (this.value = this.value.trim());
            }

            this.format();
            return this.value;
        },

        addCapTip: function() {
            let _this = this;

            function hasCapital(value, pos) {
                let pattern = /[A-Z]/g;
                pos = pos || value.length;

                return pattern.test(value.charAt(pos - 1));
            }

            let $capTipElem = this.$element;
            if (this.$textElem && this.$textElem.length == 1) {
                $capTipElem = this.$textElem;
            }

            //add capital tip
            $capTipElem.on('keyup', function(e) {
                let myKeyCode = e.keyCode || e.which,
                    pos;

                // HANDLE: Not input letter
                if (myKeyCode < 65 || myKeyCode > 90) {
                    return true;
                }

                pos = $.getCursorPos(this);

                if (hasCapital(this.value, pos)) {
                    _this.option.capTipCallback(true); //输入的是大写字母
                } else {
                    _this.option.capTipCallback(false); //输入的是小写字母
                }
            });
        }
    });

    //是否支持修改input元素的type属性
    function supportChangeType() {
        try {
            let $elem = $('<input type="text" style="display:none;"/>').appendTo("body");
            $elem.attr("type", "password");
            let s = $elem[0].type === "password";
            $elem.remove();
            return s;
        } catch (e) {
            return false;
        }
    }

    /**
     * 输入值小于最小值时，默认为最小，大于最大值，默认为最大
     * @param {*} that 
     * @param {*} item 
     */
    function resetData(that, item) {
        if (that.option.dataValueType === "float" || that.option.dataValueType === "num") {
            let val = Number(item.value);
            $(that.option.dataOptions).each(function(index, value) {
                if (value.type === "num" || value.type === "float") {
                    if (value.args.length > 0) {
                        let arr = value.args.sort(sortNumber);

                        function sortNumber(a, b) {
                            return a - b;
                        }
                        if (val <= arr[0]) {
                            item.value = arr[0];
                            that.removeValidateText();
                        }
                        if (val >= arr[1]) {
                            item.value = arr[1];
                            that.removeValidateText();
                        }
                    }
                }
            });
            that.getValue();
        }
    }
}(jQuery));