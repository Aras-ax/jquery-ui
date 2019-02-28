//依赖jQuery
(function($) {
    $.components = {};
}(jQuery));

/**
 * 组件基类
 * 未特别说明的参数为非必填
 * 所有驼峰写法的属性，写在标签属性上时用-连接（即:dataTitle -> data-title）,因为标签属性不区分大小写
 * 所有标签上面配置的属性值的优先级都大于以参数形式定义的属性值
 */

(function($) {
    //以下为默认配置参数
    var DEFAULT = {
        dataKey: "", //组件类型 必填
        dataField: "", //组件对应的字段（为空时为自动为其生成一个GUID作为字段名），但在ComponmentManager中使用时最好为必填，便于单个组件操作
        dataTitle: "", //组件左侧显示标题
        editable: true, //是否可编辑
        visible: true, //是否可见,visible为false的组件不会进行验证操作
        ignore: undefined, //是否忽略组件，true时则不进行该组件取值操作
        sync: true, //表示setVisible()中是否需要将visible的值与ignore同步
        css: '', //自定义css样式
        needWrap: true, //组件最外层是否需要容器包裹，若有dataTitle则该值默认为true
        required: true, //是否必填
        autoValidate: true, //是否自动进行数据校验
        autoChange: true, //componentManager在setValue时，是否自动执行change事件
        defaultValue: "", //默认值
        description: "", //描述信息
        desClass: "", //描述信息css类
        errorType: 1, //错误信息提示方式，1：在组件下面标红提示，2：悬浮标红提示
        dataValueType: null, //bool,num,float(input组件则含有其它数据校验格式值)
        validateCustom: null, //自定义错误信息提示方式，定义了该参数则不会显示默认的错误提示样式
        changeCallBack: null, //组件值改变回调函数，只有数据校验成功的情况下才执行该回调，函数内部this指向当前组件实例
        validateCallBack: null, //数据校验回调函数,有错则返回出错语句，否则为校验成功，函数内部this指向当前组件实例
        afterChangeCallBack: null,
        renderedCallBack: null //组件渲染完成后的回调函数，函数内部this指向当前组件实例
    };

    /**
     * 所有组件基类
     */
    $.BaseComponent = function(element, option) {
        this.$element = $(element);
        this.option = $.extend({}, DEFAULT);
        this.changeEvents = {};
        this.validateEvents = {};

        var cm = this.init(option);
        // 已渲染过的组建不再渲染
        if (cm) {
            return cm;
        }
        this.preRender();
        this.render();
        this.rendered();
        this.isIE = is_IE(8);
        this.oldData = "";
        // 检测是否有错误信息
        this.hasError = false;

        this.$element.data(this.dataKey, this);
    };

    $.BaseComponent.prototype = {
        constructor: $.BaseComponent,
        //组件初始化
        init: function(option) {
            var $elem = this.$element,
                elem = $elem[0],
                attrs = elem.attributes,
                //不需要遍历属性数组
                ignore = ["data-key", "data-field", "required"];

            this.dataKey = $elem.attr("data-key") || this.option.dataKey;

            //避免控件重复渲染
            var cmt = $elem.data(this.dataKey);
            if (cmt) {
                return cmt;
            }

            if (/(required='false')|(required="false")/.test($elem.prop("outerHTML"))) {
                this.option.required = false;
            }

            //遍历node节点上配置的属性
            for (var i = 0, l = attrs.length; i < l; i++) {
                var attr = attrs[i];
                var name = translate(attr.nodeName);
                if ($.inArray(attr.nodeName, ignore) == -1) {
                    this.option[name] = attr.nodeValue;
                }
            }

            this.option = $.extend(this.option, option);

            if (this.option.required === false) {
                $elem.removeAttr('required');
            }

            this.dataField = this.$element.attr("data-field") || this.option.dataField;
            if (!this.dataField) {
                this.dataField = $.IGuid();
                $elem.attr("data-field", this.dataField);
            }

            this.validateResult = true;
            this.css = this.option.css;

            this.isIE = is_IE(8);
            this.supportTransition = support_css3("transition");

            this.visible = this.option.visible = this.option.visible === "false" ? false : !!this.option.visible;
            this.ignore = this.option.ignore = this.option.ignore === "false" ? false : (this.option.ignore === undefined ? !this.visible : !!this.option.ignore);
            this.editable = this.option.editable = this.option.editable === "false" ? false : !!this.option.editable;
            this.autoValidate = this.option.autoValidate = this.option.autoValidate === "false" ? false : !!this.option.autoValidate;
            this.errorType = this.option.errorType;

            if (this.option.defaultValue || this.option.defaultValue === 0) {
                switch (this.option.dataValueType) {
                    case "bool":
                        {
                            if (this.option.defaultValue === "true") {
                                this.value = this.option.defaultValue = true;
                            } else {
                                this.value = this.option.defaultValue = false;
                            }
                        }
                        break;
                    case "float":
                    case "num":
                        {
                            this.value = this.option.defaultValue = Number(this.option.defaultValue);
                        }
                        break;
                    default:
                        {
                            if (this.dataKey === "FormCheckbox") {
                                if (this.option.defaultValue === "true") {
                                    this.value = this.option.defaultValue = true;
                                } else {
                                    this.value = this.option.defaultValue = false;
                                }
                            } else {
                                this.value = this.option.defaultValue;
                            }
                        }
                        break;
                }
            }

            this.option.changeCallBack && (this.changeEvents["default"] = this.option.changeCallBack);
            this.option.validateCallBack && (this.validateEvents["default"] = this.option.validateCallBack);
            this.option.hasTitle = !!this.option.dataTitle;
            //若组件有title则必须有外层容器包裹
            this.option.hasTitle && (this.option.needWrap = true);
        },

        /**
         * 组件渲染前
         */
        preRender: function() {
            this.$wrap = $('<div class="control-wrap clearfix"></div>');
            !this.visible && this.$wrap.hide();

            if (this.option.needWrap) {
                this.$element.after(this.$wrap);
                if (this.option.hasTitle) {
                    var titleCss = "form-title";
                    var bodyCss = "form-content";

                    //标题
                    this.$title = $('<label class="' + titleCss + '">' + this.option.dataTitle + '</label>');
                    if (this.Editable && this.Required) {
                        this.$Title.append('<i style="color:red;vertical-align:middle">*</i>');
                    }
                    this.$body = $('<div class="' + bodyCss + '"></div>').append(this.$element);

                    this.$wrap.append(this.$title).append(this.$body);
                } else {
                    this.$wrap.append(this.$element);
                    this.$body = this.$wrap;
                }
            } else {
                this.$wrap = this.$body = this.$element;
                this.$element.addClass('no-wrap');
            }

            this.$wrap.addClass(this.option.css);

            //是否可见
            if (!this.visible) {
                this.$wrap.hide();
            }
        },

        /**
         * 组件渲染中
         */
        render: function() {
            //子类重写
            throw new Error('error：需要子类重写该方法！！！');
        },

        /**
         * 组件渲染完成后
         */
        rendered: function() {
            if (this.option.description) {
                this.$description = $(`<em class="form-description ${this.option.desClass}">${this.option.description}</em>`);
                this.$element.after(this.$description);
            }

            this.option.renderedCallBack && this.option.renderedCallBack.call(this);
        },

        /**
         * 获取组件的值
         */
        getValue: function() {
            return this.value;
        },

        /**
         * 更改组件的title
         */
        changeTitle: function(title) {
            title && this.$title.text(title);
        },

        /**
         * 设置组件的值
         */
        setValue: function() {
            return this;
        },

        /**
         * 设置组件是否可编辑, 不可编辑的状态自动给组件加上disabled属性
         */
        setEditable: function(editable) {
            this.editable = !!editable;
            if (this.editable) {
                this.$element.removeAttr('disabled').removeClass('form-disabled');
            } else {
                this.removeValidateText();
                this.$element.addClass('form-disabled');
                // 解决IE9设置disabled后无法滚动问题
                this.dataKey === 'FormDropDownList' || this.$element.prop('disabled', true);
            }
            return this;
        },

        /**
         * 检测组件是否填写错误
         * true: 填写错误， false：填写正确
         */
        checkError: function() {
            return this.hasError;
        },

        /**
         * 设置组件是否可见 
         */
        setVisible: function(val) {
            this.visible = !!val;
            if (this.visible) {
                this.$wrap.show();
            } else {
                this.$wrap.hide();
                this.removeValidateText();
            }
            this.option.sync && (this.ignore = !this.visible);
            return this;
        },

        /**
         * 设置是否忽略组件
         */
        setIgnore: function(val) {
            this.ignore = !!val;
            return this;
        },
        /**
         * 对组件数据进行格式化
         */
        format: function() {
            if (this.value) {
                switch (this.option.dataValueType) {
                    case "bool":
                        {
                            if (this.value === "true") {
                                this.value = true;
                            } else if (this.value === 'false') {
                                this.value = false;
                            } else {
                                this.value = !!this.value;
                            }
                        }
                        break;
                    case "float":
                    case "num":
                        {
                            if (this.value === "true") {
                                this.value = 1;
                            } else if (this.value === 'false') {
                                this.value = 0;
                            } else {
                                this.value = this.value === '-' ? 0 : Number(this.value);
                            }
                        }
                        break;
                }
            }
        },
        /**
         * 重置组件的值
         */
        reset: function() {
            this.setValue(this.option.defaultValue);
            this.handleChangeEvents();
        },
        /**
         * 组件验证
         */
        validate: function() {
            //子类重写
            //返回值 
            //true验证通过，false验证失败
            return true;
        },

        validateOrChange(validate) {
            if (validate) {
                this.valChange();
            }
        },
        /**
         * 组件值改变逻辑，包括validate和change委托
         * 只有数据校验成功的情况下才执行自定义change事件
         */
        valChange: function() {
            if (this.autoValidate) {
                if (this.onValidate()) {
                    this.handleChangeEvents();
                }
            } else {
                this.handleChangeEvents();
            }
            this.option.afterChangeCallBack && this.option.afterChangeCallBack.call(this);
        },

        /**
         * 执行自定义数据校验逻辑和基础数据校验
         */
        onValidate: function(elem) {
            this.removeValidateText();
            // if (!this.editable || this.ignore) {
            // ignore项也需要实时验证，只是在componentmanager里面不验证，不显示的项则无需验证
            if (!this.editable || !this.visible) {
                return true;
            }

            elem = elem || this.$element;
            var val = this.getValue();

            if (this.option.required && (val === null || val === "" || val === undefined)) {

                this.addValidateText(_("This field is required."));
                return false;
            }

            var s = this.validate();
            if (!s) {
                return false;
            }

            return this.handleValidateEvents();
        },

        /**
         * 绑定自定义数据校验回调函数
         * 回调函数：若验证失败直接返回，失败信息文本，否则返回空
         * 回调函数中的this指向当前组件的实例
         */
        bindValidateEvent: function(key, fn) {
            key = key || "default";
            if (!fn || !$.isFunction(fn)) {
                return;
            }

            this.validateEvents[key] = fn;
            return this;
        },

        /**
         * 执行组件数据改变后的自定义逻辑
         */
        handleValidateEvents: function() {
            if (this.validateEvents == null || $.isEmptyObject(this.validateEvents)) {
                // this.removeValidateText();
                return true;
            }

            var events = this.validateEvents;
            for (var key in events) {
                var result = events[key].call(this);
                if (result && (typeof result === "string")) {
                    this.addValidateText(result);
                    return false;
                }
            }
            this.removeValidateText();
            return true;
        },

        /**
         * 执行组件数据改变后的自定义逻辑
         */
        handleChangeEvents: function() {
            this.getValue();
            if (this.changeEvents == null || $.isEmptyObject(this.changeEvents)) return;
            var events = this.changeEvents;
            for (var key in events) {
                events[key].apply(this, arguments);
            }
        },

        /**
         * 绑定组件数据后的自定义事件
         */
        bindChangeEvent: function(key, fn) {
            key = key || "default";
            if (!fn || !$.isFunction(fn)) {
                return;
            }

            this.changeEvents[key] = fn;
            return this;
        },

        /**
         * 解绑change事件和验证事件
         */
        unBindEvent: function(key) {
            // 预留API
            this.changeEvents[key] && (delete this.changeEvents[key]);
            this.validateEvents[key] && (delete this.validateEvents[key]);
            return this;
        },

        /**
         * 显示验证的错误信息
         */
        addValidateText: function(text, type = true) {
            //增加显示错误信息格式
            var _this = this;
            _this.hasError = true;
            if (_this.option.validateCustom && typeof _this.option.validateCustom === "function") {
                _this.option.validateCustom.call(this, text);
            } else {
                if (this.$error) {
                    this.$error.text(text);
                } else {
                    if (this.$element.children().length > 0 && this.option.needWrap === false) {
                        this.$error = $('<div class="form-error ellipsis error-down error-none" title="' + _('Show') + '">' + text + '</div>').appendTo(this.$element);
                    } else {
                        this.$error = $('<div class="form-error ellipsis error-down error-none" title="' + _('Show') + '">' + text + '</div>').appendTo(this.$element.parent());
                    }
                    if (this.errorType === 2) {
                        var pos = _this.$element.position(),
                            pos1 = _this.$element.parent().position();
                        pos = {
                            h: _this.$element.outerHeight(),
                            w: _this.$element.outerWidth(),
                            top: pos.top,
                            left: pos.left,
                            totalW: _this.$element.parent().outerWidth()
                        };

                        this.$error = this.$error.removeClass("error-down").attr("title", _("Hide")).addClass("error-float");
                        this.$hideerror = this.$hideerror || $('<i title="' + _("Show") + '" class="form-hideerror icon-warning none hide"></i>');

                        var top = pos.top,
                            left = pos.w + pos.left + 7;
                        if (this.option.css.indexOf("error-in-top") > -1 || pos.totalW - left < 130) {
                            this.$error.addClass('error-top').removeClass('error-left');
                            left = pos.left;
                            top = pos.h + pos.top + 7;
                        } else {
                            this.$error.removeClass('error-top').addClass('error-left');
                        }

                        this.$error.text(text).css({
                            top: top + "px",
                            left: left + "px"
                        });

                        this.$hideerror.css({
                            left: pos.w + pos.left + 6 + "px"
                        });
                        this.$error.removeClass('none').insertAfter(_this.$element);
                        this.$hideerror.insertAfter(_this.$element);

                        this.$error.off("click").on("click", function() {
                            _this.$error.toggleClass('hide');
                            _this.$hideerror.toggleClass('hide');

                            if (_this.isIE) {
                                _this.$hideerror.removeClass("icon-warning").addClass("icon-warning");
                            }

                        });

                        this.$hideerror.off("click").on("click", function() {
                            _this.$error.toggleClass('hide');
                            _this.$hideerror.toggleClass('hide');
                        });
                    }

                    this.$error.off('click').on('click', function() {
                        let $this = $(this);
                        if ($this.hasClass('ellipsis')) {
                            $this.removeClass('ellipsis').attr('title', _('Hide'));
                        } else {
                            $this.addClass('ellipsis').attr('title', _('Show'));
                        }

                    });
                }
                this.addOther && this.addOther();
                _this.showError(type);
            }
            return this;
        },
        /**
         * 添加组建自定义的错误信息
         */
        addOther: function() {

        },
        /**
         * 显示错误信息
         */
        showError: function(type) {
            let _this = this;
            type === false || this.$element.addClass('error-tip');
            this.$error.removeClass('error-none');
            this.$hideerror && this.$hideerror.removeClass('none');
        },

        /**
         * 去掉显示的错误信息
         */
        removeValidateText: function() {
            this.hasError = false;
            if (this.option.validateCustom && typeof this.option.validateCustom === "function") {
                this.option.validateCustom.call(this);
            } else {
                if (this.$error) {
                    let _this = this;
                    this.$error.addClass('error-none');
                    this.$hideerror && this.$hideerror.addClass('none');
                    this.$element.removeClass('error-tip');

                    this.removeOther && this.removeOther();
                }
            }
        },
        /**
         * 去掉显示的错误信息时执行的组建自定义逻辑
         */
        removeOther: function() {

        },
        /**
         * 修改描述信息
         */
        setDirection(text) {
            if (this.$description) {
                this.$description.text(text);
            } else {
                this.$description = $(`<em class="form-description ${this.option.desClass}">${text}</em>`);
                this.$element.after(this.$description);
            }
            this.option.description = text;
        },
        /**
         * 显示
         */
        show: function() {
            this.setVisible(true);
        },
        /**
         * 隐藏
         */
        hide: function() {
            this.setVisible(false);
        },
        /**
         * 显示/隐藏
         */
        toggle: function() {
            this.setVisible(!this.visible);
        }
    };

    function is_IE(ver) {
        var b = document.createElement('b');
        b.innerHTML = '<!--[if gte IE ' + ver + ']><i></i><![endif]-->';
        return b.getElementsByTagName('i').length === 1;
    }

    /**
     * 将横线连接字符串转成驼峰写法
     * 例如： add-hash-code -> addHashCode
     */
    function translate(str) {
        if (str === undefined || str === '') {
            return '';
        }
        str += '';
        return str.replace(/-[a-z]/g, function(match) {
            return match.replace(/-/, '').toUpperCase();
        });
    }

    //所有控件都能通过这种方式调用
    $.fn.Rcomponent = function(opt) {
        var key = this.attr("data-key");
        if (!!opt) {
            var component;
            opt.dataKey = opt.dataKey || key;
            this.each(function() {
                var $this = $(this);
                component = $this.data(opt.dataKey);
                if (component) {
                    return true;
                }
                component = new $.components[opt.dataKey]($this, opt);
            });
            return component;
        } else {
            if (key) {
                return new $.components[key](this);
            }
        }
    };

    function support_css3(prop) {
        var div = document.createElement('div'),
            vendors = 'Ms O Moz Webkit'.split(' '),
            len = vendors.length;

        if (prop in div.style) return true;

        prop = prop.replace(/^[a-z]/, function(val) {
            return val.toUpperCase();
        });

        while (len--) {
            if (vendors[len] + prop in div.style) {
                return true;
            }
        }
        return false;
    }
}(jQuery));