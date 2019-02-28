/**
 * 推荐如下调用形式
 * <div type="text" data-key="FormMultiInput"></div>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($) {
    $.fn.FormMultiInput = function() {
        return new $.components.FormMultiInput(this, arguments);
    };

    // 构造函数
    $.components.FormMultiInput = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    const VALUE_TYPE = {
        STRING: 1, //字符串
        ARRAY: 2 // 数组
    };

    // 组件特有配置项
    let DEFAULT = {
        text: '', //文本框前面显示的数据，该数据最后会与input内部的数据合并成组件的value值
        maxLength: null,
        regExp: '',
        valueType: VALUE_TYPE.STRING,
        dataOptions: [], //[{type:'',args:[]}] 自身数据的校验
        inputCfg: [], //文本输入框的的配置信息，必须为数组
        inputCount: 0, //文本框的格式 inputCfg/inputCount中有一个必填
        joiner: '.' //连接符号
    };

    $.components.FormMultiInput.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);

            this.option.inputCount = this.option.inputCount || this.option.inputCfg.length;

            if (this.option.dataOptions && Object.prototype.toString.call(this.option.dataOptions) === "[object Object]") {
                this.option.dataOptions = [this.option.dataOptions];
            }
            // 记录当前的错误信息
            this.errors = {};

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            if (this.value) {
                this.setValue(this.value);
            }
        },

        //渲染html内容
        htmlRender: function() {
            if (!this.editable) {
                this.$element.attr('disabled', 'disabled').addClass('form-disabled');
            } else {
                let htmlNode = '',
                    text = this.option.text;
                if (this.option.joiner && text && text.lastIndexOf(this.option.joiner) === text.length - 1) {
                    this.option.text = text = text.substring(0, text.length - 1);
                }
                htmlNode += '<div class="form-multi-wrap">';
                if (text) {
                    htmlNode += `<label class="form-multi-text">${text}</label>` + (this.option.inputCount > 0 ? `<span class="input-joiner">${this.option.joiner}</span>` : '');
                }
                for (let i = 0, l = this.option.inputCount; i < l; i++) {
                    htmlNode += (i === 0 ? '' : `<span class="input-joiner">${this.option.joiner}</span>`) + `<input type="input" data-field="${this.dataField + '-' + i}" data-par="FormMultiInput" data-key="FormInput">`;
                }
                htmlNode += '</div>';

                this.$element.addClass('form-multi').html(htmlNode);
                this.$inputWrap = this.$element.find('.form-multi-wrap');
                this.$inputText = this.$element.find('.form-multi-text');

                this.initComponents();
            }
        },

        initComponents: function() {
            let formCfg = {},
                that = this;
            for (let i = 0, l = this.option.inputCount; i < l; i++) {
                let obj = {
                    css: 'form-multi-input',
                    maxLength: that.option.maxLength,
                    regExp: that.option.regExp,
                    autoChange: that.option.autoChange,
                    needWrap: false,
                    validateCustom: function(text) {
                        if (text === undefined && !this.$element.hasClass('error-tip')) {
                            return;
                        }
                        // that.removeError();
                        if (text) {
                            this.$element.addClass('error-tip');
                            that.addValidateText(text, false);
                            that.errors[this.dataField] = text + '';
                        } else {
                            this.$element.removeClass('error-tip');
                            that.removeValidateText();
                            that.errors[this.dataField] && (delete that.errors[this.dataField]);
                        }
                    },
                    validateCallBack: function() {
                        if (that.autoValidate) {
                            that.childValided = true;
                            that.onValidate();
                        }
                    },
                    changeCallBack: function() {
                        if (!that.$element.hasClass('error-tip')) {
                            that.handleChangeEvents.call(that);
                        }
                    },
                    maxCallBack: function(e) {
                        //如果是tab键直接返回
                        let ignorekey = [8, 9, 37, 38, 39, 40, 46]; // backspace键，tab键，左键，上键，右键，下键，delete键
                        if (ignorekey.indexOf(e.keyCode) > -1) {
                            return;
                        }
                        let fields = this.dataField.split('-'),
                            index = ~~fields.pop() + 1,
                            dataField = fields.join() + '-' + index,
                            $next = this.$element.siblings('[name=' + dataField + ']');

                        if ($next.length > 0) {
                            $next.focus();
                        }
                    }
                };
                formCfg[this.dataField + '-' + i] = $.extend({}, obj, this.option.inputCfg[i] || {});
            }
            this.cManager = $.componentManager({
                submitUrl: '/goform/module',
                container: this.$inputWrap,
                formCfg: formCfg
            });
        },

        //绑定事件
        bindEvent: function() {
            //事件绑定
            //数据改变时调用基类的valChange方法执行自定义业务逻辑
        },

        changeTetx(text) {
            this.option.text = text;
            this.$inputText.html(text);
        },

        removeError() {
            let components = this.cManager.components;
            for (let key in components) {
                components[key].$element.removeClass('error-tip');
            }
            this.removeValidateText();
        },

        onCheckData: function() {
            //格式验证
            let val = this.getValue();
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

                    if (fn && Object.prototype.toString.call(fn) === '[object Function]') {
                        err = fn.apply(obj, args);
                        if (err) break;
                    }
                }

                return err;
            }
            return "";
        },

        //数据验证
        validate: function() {
            //防止循环引用
            if (!this.childValided) {
                let components = this.cManager.components;
                for (let field in components) {
                    if (components.hasOwnProperty(field)) {
                        if (components[field].visible) {
                            let validate = components[field].onValidate();
                            if (validate === false) {
                                return false;
                            }
                        }
                    }
                }
            } else {
                for (let key in this.errors) {
                    if (this.errors.hasOwnProperty(key) && this.errors[key]) {
                        this.addValidateText(this.errors[key], false);
                        return false;
                    }
                }
            }

            if (this.$element.find(".error-tip").length > 0) {
                return false;
            }

            this.childValided = false;

            let err = this.onCheckData();

            if (err) {
                this.addValidateText(err);
                return false;
            }

            return true;
            //自身业务逻辑-end 
        },
        reset: function() {
            for (let key in this.cManager.components) {
                this.cManager.components[key].reset();
                this.cManager.components[key].removeValidateText();
            }
            if (this.option.defaultValue !== '') {
                this.setValue(this.option.defaultValue);
            }
            this.handleChangeEvents();
        },
        //设置值
        setValue: function(v, confirm) {
            if (this.option.valueType === VALUE_TYPE.STRING) {
                v = v.split(this.option.joiner);
            }

            let len = v.length,
                l = this.option.inputCount,
                data = {};

            for (let i = 1; i <= l; i++) {
                data[this.dataField + '-' + (l - i)] = v[len - i];
            }

            if (this.option.text) {
                v.length = len - l;
                this.option.text = v.join(this.option.joiner);
                this.$inputText.text(this.option.text);
            }
            this.cManager.updateComponents(data);
            // confirm && this.valChange();
            this.validateOrChange(confirm);
        },

        getValue: function() {
            let v = this.option.text ? [this.option.text] : [],
                cmv = this.cManager.getValue();
            for (let i = 0, l = this.option.inputCount; i < l; i++) {
                v.push(cmv[this.dataField + '-' + i]);
            }
            if (this.option.valueType === VALUE_TYPE.STRING) {
                this.value = v.join(this.option.joiner);
            } else {
                this.value = v;
            }

            return this.value;
        },

        getText: function() {
            return this.getValue();
        },
    });
}(jQuery));