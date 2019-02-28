/**
 * 推荐如下调用形式
 * <div data-key="FormPercent"></div>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($) {
    $.fn.FormPercent = function() {
        return new $.components.FormPercent(this, arguments);
    };

    // 构造函数
    $.components.FormPercent = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    // 组件特有配置项
    let DEFAULT = {
        start: 0,
        end: 100,
        showInput: true,
        fixed: 0 //保留小数点后几位
    };

    $.components.FormPercent.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);
            this.option.start = +this.option.start;
            this.option.end = +this.option.end;
            this.option.desClass += ' form-percent-em';
            this.barWidth = 16;
            //若a > b,则start与end交互值
            let a = this.option.start,
                b = this.option.end;
            if (a > b) {
                this.option.end = a + b - (this.option.start = b);
            }

            this.value = this.option.defaultValue || this.option.start;
            this.total = this.option.end - this.option.start;
            this.startMove = false;
            this.startPoint = {
                x: 0, //记录按钮点击的位置
                left: 0 //滑块开始时所在的位置
            };

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();

            if ($.isNotNullOrEmpty(this.value)) {
                this.setValue(this.value);
            }
        },

        //渲染html内容
        htmlRender: function() {
            this.$element.addClass("form-percent");
            let htmlNode = '<div class="form-per-wrap">' +
                '<div class="form-per-active"></div>' +
                '<div class="form-per-bar">' +
                '<i class="bar icon-radio-off"></i>' +
                '<label class="form-per-val">' + this.option.start + '</label>' +
                '</div>' +
                // '<i class="form-per-s">' + this.option.start + '</i>' +
                // '<i class="form-per-e">' + this.option.end + '</i>' +
                '</div>';
            this.$element.append(htmlNode);
            this.$input = $('<input type="text" class="form-per-input none" name="' + this.dataField + '">').appendTo(this.$element);
            this.$bar = this.$element.find("div.form-per-bar");
            this.$activebar = this.$element.find("div.form-per-active");
            this.$text = this.$element.find("label.form-per-val");

            let that = this;

            that.totalWidth = that.$element.children(".form-per-wrap").width() - that.barWidth;
            this.option.showInput && this.renderFormInput();
        },

        renderFormInput: function() {
            let _this = this;
            this.perInput = this.$input.Rcomponent({
                dataField: _this.dataField,
                dataKey: "FormInput",
                errorType: this.errorType,
                needWrap: false,
                dataValueType: "float",
                validateCustom: function(text) {
                    return true;
                },
                validateCallBack: _this.option.validateCallBack,
                changeCallBack: function() {
                    _this.setValue(this.value, true);
                }
            });
            this.$input.removeClass("none");
        },

        //绑定事件
        bindEvent: function() {
            if (!this.editable) {
                return;
            }
            //事件绑定
            let that = this;
            this.$bar.off("mousedown." + that.dataField).on("mousedown." + that.dataField, ".bar", function(e) {
                that.startMove = true;
                that.startPoint = {
                    x: e.pageX,
                    left: parseInt(that.$bar.css("left"))
                };
                that.$text.show();

                $(document).off("mousemove." + that.dataField).on("mousemove." + that.dataField, function(e) {
                    e.preventDefault();
                    if (!that.startMove) {
                        return;
                    }
                    let width = e.pageX - that.startPoint.x;
                    width = that.startPoint.left + width;
                    that.setValueByWidth(width);
                });
            });

            $(document).off("mouseup." + that.dataField).on("mouseup." + that.dataField, function(e) {
                that.startMove = false;
                that.$text.hide();

                $(document).off("mousemove." + that.dataField);
            });
            //数据改变时调用基类的valChange方法执行自定义业务逻辑
        },

        //重置开始和结束范围值
        /**
         * start: 开始值
         * end: 结束值
         * value: 设定的值
         */
        resetRange: function(start, end, value) {
            if (start === undefined) {
                return;
            }
            start = +start;
            if (end === undefined) {
                end = this.option.end;
            }

            //若start > end,则start与end交互值
            if (start > end) {
                this.option.end = start;
                this.option.start = end;
            } else {
                this.option.end = end;
                this.option.start = start;
            }

            this.$element.find('.form-per-s').text(this.option.start);
            this.$element.find('.form-per-e').text(this.option.end);

            value !== undefined && this.setValue(value);
        },

        setValueByWidth: function(width) {
            width = width > this.totalWidth ? this.totalWidth : (width < 0 ? 0 : width);
            this.$bar.css("left", width);
            this.$activebar.css('width', width);

            this.value = (this.option.start + (width / this.totalWidth) * this.total).toFixed(this.option.fixed);
            this.$text.text(this.value).css("margin-left", -(this.$text.width() / 2));
            this.perInput ? this.perInput.setValue(this.value) : this.$input.val(this.value);
            this.valChange();
        },

        //设置值
        setValue: function(v, confirm) {
            if (v < this.option.start) {
                v = this.option.start;
            } else if (v > this.option.end) {
                v = this.option.end;
            }

            this.value = v.toFixed(this.option.fixed);
            let width = (this.value - this.option.start) / this.total * this.totalWidth;
            width = width > this.totalWidth ? this.totalWidth : (width < 0 ? 0 : width);

            this.$bar.css("left", width);
            this.$activebar.css('width', width);
            this.$text.text(this.value).css("margin-left", -(this.$text.width() / 2));
            this.perInput ? this.perInput.setValue(this.value) : this.$input.val(this.value);

            // confirm && this.valChange();
            this.validateOrChange(confirm);
        },

        getValue: function() {
            this.format();
            return this.value;
        },

        getText: function() {
            return this.getValue();
        }
    });
}(jQuery));