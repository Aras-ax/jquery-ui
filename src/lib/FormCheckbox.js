/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormCheckbox"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($) {
    $.fn.FormCheckbox = function() {
        return new $.components.FormCheckbox(this, arguments);
    };

    // 构造函数
    $.components.FormCheckbox = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    // 组件特有配置项
    var DEFAULT = {
        text: "",
        defaultValue: false
    };

    $.components.FormCheckbox.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);
            this.value = this.option.defaultValue;

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            this.setValue(this.value);
        },

        /**
         * 渲染html内容
         */
        htmlRender: function() {
            if (!this.editable) {
                this.$element.attr("disabled", "disabled").addClass('form-disabled');
            }
            //  else {
            var css = this.option.defaultValue ? "icon-switch-on" : "icon-switch-off",
                ID = $.IGuid();
            this.$checklabel = $('<label class="check-label ' + css + '" for="' + ID + '"></label>');
            this.$input = $('<input type="checkbox" name="' + this.dataField + '" id="' + ID + '" class="check-hide">');
            this.$element.addClass('check-wrap').append(this.$checklabel).append(this.$input);

            this.option.text && this.$element.append('<label class="form-label" for="' + this.dataField + '">' + this.option.text + '</label>');
            // }
        },

        /**
         * 绑定事件
         */
        bindEvent: function() {
            var _this = this;
            //事件绑定
            this.$input.off("change.FormCheckbox").on("change.FormCheckbox", function() {
                if (!_this.editable) {
                    return false;
                }
                // 点击后先判断是否有beforeChange事件
                if (_this.option.beforeChange && !_this.option.beforeChange.call(_this)) {
                    return false;
                }
                if (!_this.editable) {
                    return false;
                }
                _this.$checklabel.toggleClass('icon-switch-on').toggleClass('icon-switch-off');
                _this.valChange.call(_this);
            });

        },
        setEditable: function(editable) {
            this.editable = !!editable;
            if (this.editable) {
                this.$element.removeAttr('disabled').removeClass('form-disabled');
                this.$element.find('.check-hide').removeAttr('disabled');
            } else {
                this.removeValidateText();
                this.$element.prop('disabled', true).addClass('form-disabled');
                this.$element.find('.check-hide').prop('disabled', true);
            }
            return this;
        },

        /**
         * 设置值
         */
        setValue: function(v, confirm) {
            this.value = !!v;

            this.value ? this.$checklabel.addClass('icon-switch-on').removeClass('icon-switch-off') : this.$checklabel.removeClass('icon-switch-on').addClass('icon-switch-off');
            this.$input.prop("checked", this.value);

            this.validateOrChange(confirm);
        },
        /**
         * 获取值
         */
        getValue: function() {
            if (this.editable) {
                this.value = this.$checklabel.hasClass('icon-switch-on');
            }
            return this.value;
        }
    });
}(jQuery));