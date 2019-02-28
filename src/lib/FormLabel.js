/**
 * 推荐如下调用形式
 * <label data-key="FormLabel"></label>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($) {
    $.fn.FormLabel = function() {
        return new $.components.FormLabel(this, arguments);
    };

    // 构造函数
    $.components.FormLabel = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    // 组件特有配置项
    let DEFAULT = {
        //配置项
    };

    $.components.FormLabel.inherit($.BaseComponent, {
        //重写基类的render方法，自身的业务逻辑入口
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);

            //渲染Html页面
            this.htmlRender();

            if (this.value) {
                this.setValue(this.value);
            }
        },

        /**
         * 渲染html内容
         */
        htmlRender: function() {
            this.$element.addClass('form-label-text');
        },


        /**
         * 设置值
         */
        setValue: function(v) {
            this.value = v;
            this.$element.text(v);
            this.$element.attr("title", v);
        },
        /**
         * 取值
         */
        getValue: function() {
            return this.value;
        },
        /**
         * 获取显示文本
         */
        getText: function() {
            return this.getValue();
        }
    });
}(jQuery));