/**
 * 推荐如下调用形式
 * <textarea data-key="FormTextarea"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($) {
    $.fn.FormTextarea = function() {
        return new $.components.FormTextarea(this, arguments);
    };

    // 构造函数
    $.components.FormTextarea = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    let DEFAULT = { //组件独有配置项
        placeholder: '',
        removeSpace: false, //移除首尾空格
        dataOptions: [], //[{type:"",args:[]}]
        defaultText: "", // 值为空时显示的默认文本
        maxLength: null,
        rows: 5,
        keyupCallBack: null,
        focusCallBack: null //文本框获取焦点回调
    };

    // 继承及控件实现
    $.components.FormTextarea.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);

            this.supportPlaceHolder = 'placeholder' in document.createElement('input');

            if (this.option.dataOptions && Object.prototype.toString.call(this.option.dataOptions) === "[object Object]") {
                this.option.dataOptions = [this.option.dataOptions];
            }

            if (!this.option.dataValueType) {
                let options = this.option.dataOptions;
                for (let i = 0, l = options.length; i < l; i++) {
                    if (['num', "float"].indexOf(options[i]["type"]) > -1) {
                        this.option.dataValueType = options[i]["type"];
                        break;
                    }
                }
            }

            this.value = this.option.defaultValue;

            this.$holderplace = null;

            //渲染Html页面
            this.htmlRender();
            //设置placeholder
            this.setPlaceHolder(this.option.placeholder);
            //绑定事件
            this.bindEvent();

            this.setValue(this.value);
        },

        //渲染html内容
        htmlRender: function() {
            if (!this.editable) {
                this.$element.attr("disabled", "disabled").parent().addClass('form-disabled');
            }

            this.option.maxLength && this.$element.attr("maxlength", this.option.maxLength);
            this.option.rows && this.$element.attr("rows", this.option.rows);
            this.$element.addClass("form-textarea").attr("name", this.dataField).attr("placeholder", this.option.placeholder);
        },

        setEditable: function(editable) {
            this.editable = !!editable;
            if (this.editable) {
                this.$element.removeAttr('disabled').parent().removeClass('form-disabled');
            } else {
                this.removeValidateText();
                this.$element.prop('disabled', true).parent().addClass('form-disabled');
            }
            return this;
        },

        //绑定事件
        bindEvent: function() {
            let _this = this;

            //获取焦点时，进行错误提示信息等移除
            this.$element.unbind("focus.FormTextarea").bind("focus.FormTextarea", this, function(e) {
                let _this = e.data;
                _this.option.focusCallBack && _this.option.focusCallBack.call(_this);
            });

            //G0项目需要数据实时校验
            this.$element.off("keyup.FormValidate").on("keyup.FormValidate", this, function(e) {
                _this.format();
                _this.onValidate();
                _this.option.keyupCallBack && _this.option.keyupCallBack.call(_this);
            });

            //失去焦点，进行数据校验
            this.$element.unbind("blur.FormTextarea").bind("blur.FormTextarea", this, function(e) {
                let _this = e.data;
                if (_this.option.dataValueType === "float") {
                    if (this.value && this.value.indexOf(".") === this.value.length - 1) {
                        let v = Number(this.value) + "";
                        this.value = v;
                    }
                }

                _this.valChange();
            });

            //对于自定义placeholder情况的实现
            if (_this.$holderplace) {
                _this.$element.keyup(function(e) {
                    if (this.value) {
                        _this.$holderplace.hide();
                    } else {
                        _this.$holderplace.show();
                    }
                });

                _this.$holderplace.click(function(e) {
                    _this.focus();
                });
            }
        },

        //文本框获取焦点后，将光标移动到文本框的末尾
        focus: function(dom, start, end) {
            dom = dom || this.$element[0];
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

        changePlaceholder: function(placeholder) {
            this.setPlaceHolder(placeholder);
        },

        //值改变，调用基类的API，实现自定义业务逻辑
        valChange: function() {
            this.getValue();
            if (this.option.autoValidate) {
                let v = this.onValidate();
                if (v) {
                    this.handleChangeEvents();
                }
            }
            this.option.afterChangeCallBack && this.option.afterChangeCallBack.call(this);
        },

        //数据验证
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
                        args = [val].concat(opt.args);

                    for (let j = 0, k = types.length; j < k; j++) {
                        j === k - 1 && (obj = fn);
                        if (fn) fn = fn[types[j]];
                    }

                    if (fn) {
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

        //设置placeholder 
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
                        let pos = self.position(),
                            h = self.outerHeight(true),
                            w = self.outerWidth(false),
                            left = pos.left || 0,
                            paddingleft = self.css('padding-left'),
                            fontsize = self.css("font-size");
                        this.$holderplace = $('<span class="form-input-pholder auto-wrap"></span>').text(ph)
                            .css({
                                left: left,
                                top: '5px',
                                height: h,
                                lineHeight: parseInt(h) + "px",
                                paddingLeft: paddingleft,
                                position: 'absolute',
                                color: '#aaa',
                                "width": w - 2 * left,
                                "z-index": 10,
                                "font-size": fontsize
                            }).appendTo(self.parent());

                    }
                }
            }
        },

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

                if (this.$holderplace) {
                    (v === '' || v === undefined) ? this.$holderplace.show(): this.$holderplace.hide();
                }
            }

            this.validateOrChange(confirm);
        },

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
        }
    });
}(jQuery));