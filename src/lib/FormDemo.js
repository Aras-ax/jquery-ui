/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormDemo"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($) {
    $.fn.FormDemo = function() {
        return new $.components.FormDemo(this, arguments);
    };

    // 构造函数
    $.components.FormDemo = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    // 组件特有配置项
    let DEFAULT = {
        //配置项
    };

    $.components.FormDemo.inherit($.BaseComponent, {
        //重写基类的render方法，自身的业务逻辑入口
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            if (this.value) {
                this.setValue(this.value);
            }
        },

        /**
         * 渲染html内容
         */
        htmlRender: function() {
            if (!this.editable) {
                this.$element.attr("disabled", "disabled").addClass('form-disabled');
            } else {
                //组件渲染
            }
        },

        /**
         * 绑定事件
         */
        bindEvent: function() {
            //事件绑定
            //数据改变时调用基类的valChange方法执行自定义业务逻辑
        },

        /**
         * 数据验证
         */
        validate: function() {
            //自身业务逻辑
            //..........................
            //
            //...自定义业务逻辑写在这...
            //
            //..........................
            //自身业务逻辑-end 
            return true;
        },

        /**
         * 设置值
         */
        setValue: function(v, confirm) {
            if (v == null) return;
            if (!this.editable) {
                this.value = (v + "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            }
            // confirm && this.valChange();
            this.validateOrChange(confirm);
        },
        /**
         * 取值
         */
        getValue: function() {
            if (!this.editable) {
                let v = this.value;
                return v == null ? "" : v;
            } else {
                // return this.$element.val().trim();
            }
        },
        /**
         * 获取显示文本
         */
        getText: function() {
            return this.getValue();
        }
    });
}(jQuery));