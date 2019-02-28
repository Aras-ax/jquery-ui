/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormCalendar"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */

(function($) {
    $.fn.FormCalendar = function() {
        return new $.components.FormCalendar(this, arguments);
    };

    // 构造函数
    $.components.FormCalendar = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    // 组件特有配置项
    let DEFAULT = {
        // 是否显示星期
        hasWeekday: false,
        // 开始年份
        startYear: 1970,
        // 结束年份    
        endYear: 2037,
        // 是否可进行输入
        scanAble: true
    };

    $.components.FormCalendar.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);

            let t = new Date();
            if (this.option.defaultValue) {
                this.option.defaultValue = new Date(this.option.defaultValue);
            }
            this.curDate = this.option.defaultValue || t;
            this.elemH;

            this.today = {
                year: t.getFullYear(),
                month: t.getMonth() + 1,
                day: t.getDate()
            };

            this.selectedDay = {
                year: this.curDate.getFullYear(),
                month: this.curDate.getMonth() + 1,
                day: this.curDate.getDate()
            };

            this.setDefaultValue();

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.editable && this.bindEvent();

            this.setValue(this.value);
        },
        /**
         * 设置默认值
         */
        setDefaultValue: function() {
            if (!$.isNotNullOrEmpty(this.value)) {
                this.option.defaultValue = new Date();
            }
            this.value = this.option.defaultValue;
        },

        //渲染html内容
        htmlRender: function() {
            this.$element.addClass('form-input').attr("name", this.dataField);
            if (this.editable) {
                let htmls = [];
                htmls.push('<div class="form-calendar">');
                htmls.push('<dl>');
                htmls.push('<dt class="form-calen-head"></dt>');
                if (this.option.hasWeekday) {
                    htmls.push('<dd>');
                    htmls.push('<dt>' + _('w#eek#Sun.') + '</dt>');
                    htmls.push('<dt>' + _('w#eek#Mon.') + '</dt>');
                    htmls.push('<dt>' + _('w#eek#Tues.') + '</dt>');
                    htmls.push('<dt>' + _('w#eek#Wed.') + '</dt>');
                    htmls.push('<dt>' + _('w#eek#Thur.') + '</dt>');
                    htmls.push('<dt>' + _('w#eek#Fri.') + '</dt>');
                    htmls.push('<dt>' + _('w#eek#Sat.') + '</dt>');
                    htmls.push('</dd>');
                }
                htmls.push('<dd class="form-weekday"></dd>');
                htmls.push('</dl>');
                htmls.push('</div>');

                this.checkDate();
                this.$container = $(htmls.join("")).hide().appendTo('body');
                this.$head = this.$container.find('.form-calen-head');
                this.$content = this.$container.find('.form-weekday');

                this.createContainer();

                if (!this.option.scanAble) {
                    this.$element.attr("readonly", "readonly");
                }
            } else {
                this.$element.attr("disabled", "disabled").addClass('form-disabled');
            }
        },
        /**
         * 解析当前指定的日期数据
         */
        checkDate: function() {
            //当前设定日期的年份：例如：2017年
            this.year = this.curDate.getFullYear();
            //当前设定日期的月份：例如：8月
            this.month = this.curDate.getMonth() + 1;
            //当前设定日期的月份的第一天的星期数：例如：2017年8月1号为星期2则返回2
            this.weakDay = new Date(this.year, this.month - 1, 1).getDay();
            //当前设定的时间的日期：例如：8号
            this.day = this.curDate.getDate();
            //当前设定月份的天数
            this.days = new Date(this.year, this.month, 0).getDate();
        },
        /**
         * 创建日历操作栏
         */
        createContainer: function() {
            let selects = ['<a class="m-icon fc-left"><</a>', '<div class="select-wrap">', '<select class="form-c-year">'];

            for (let i = this.option.startYear; i <= this.option.endYear; i++) {
                if (i == this.year) {
                    selects.push('<option value=' + i + ' selected>' + i + _("Y") + '</option>');
                } else {
                    selects.push('<option value=' + i + '>' + i + _("Y") + '</option>');
                }
            }

            selects.push('</select>');
            selects.push('<select class="form-c-month">');
            for (let i = 1; i <= 12; i++) {
                if (i == this.month) {
                    selects.push('<option value=' + i + ' selected>' + i + _("M") + '</option>');
                } else {
                    selects.push('<option value=' + i + '>' + i + _("M") + '</option>');
                }
            }
            selects.push('</select></div><a class="m-icon fc-right">\></>');

            this.$head.html(selects.join(''));
            this.drawCalendar();
        },
        /**
         * 绘制日历日期栏
         */
        drawCalendar: function() {
            let dts = [],
                //当前curDate上个月的天数
                lDays = new Date(this.year, this.month - 1, 0).getDate();
            this.weakDay = this.weakDay === 0 ? 7 : this.weakDay; //将周日0改为7

            for (let i = 0; i < this.weakDay; i++) {
                dts.push('<a class="last">' + (lDays - this.weakDay + 1 + i) + '</a>');
            }

            for (let j = 1; j <= this.days; j++) {
                if (j === this.today.day && this.year === this.today.year && this.month === this.today.month) {
                    dts.push('<a class="today">' + j + '</a>');
                } else if (j === this.selectedDay.day && this.year === this.selectedDay.year && this.month === this.selectedDay.month) {
                    dts.push('<a class="selected">' + j + '</a>');
                } else {
                    dts.push('<a >' + j + '</a>');
                }
            }
            for (let j = 1; dts.length < 42; j++) {
                dts.push('<a class="next">' + j + '</a>');
            }
            this.$content.html(dts.join(""));
        },
        /**
         * 隐藏日历浮窗
         */
        hideCalendar: function() {
            this.$container.hide();
        },

        /**
         * 绑定事件
         */
        bindEvent: function() {
            let that = this;
            let key = "click.formCalendar" + ~~(Math.random() * 1000);
            this.$element.off("focus.formCalendar").on("focus.formCalendar", function() {
                // if(!that.elemH){
                that.elemH = that.$element.outerHeight() - 1;
                let pos = that.$element.offset();
                that.$container.css({
                    left: pos.left + "px",
                    top: pos.top + that.elemH + "px"
                });
                // }
                that.setValue(that.value);

                that.$container.show();
                that.removeValidateText();
            });

            this.$element.off("click.formCalendar").on("click.formCalendar", function(e) {
                $("div.form-calendar").not(that.$container).hide();
                e.stopPropagation();
            });

            this.$head.off("click.formCalendar").on("click.formCalendar", function(e) {
                e.stopPropagation();
            });

            // 全局点击隐藏日历浮窗
            $(document).off(key).on(key, function() {
                that.$container.hide();
            });

            // 月份或者年份选择
            this.$head.off('change').on('change', 'select', function() {
                var $this = $(this);
                if ($this.hasClass('form-c-year')) {
                    that.dochange(this.value, that.month);
                } else if ($this.hasClass('form-c-month')) {
                    that.dochange(that.year, this.value);
                }
            });

            // 点击上月下月
            this.$head.off("click.formCalendarNext").on("click.formCalendarNext", ".m-icon", function() {
                let $this = $(this);
                let m = that.month,
                    y = that.year,
                    d;
                if ($this.hasClass('fc-left')) {
                    m = m - 1 < 1 ? (y--, 12) : m - 1;
                } else if ($this.hasClass('fc-right')) {
                    m = m + 1 > 12 ? (y++, 1) : m + 1;
                }

                that.dochange(y, m);
                that.changeSelect();
            });
            // 点击日期
            this.$content.off("click.formCalendar").on("click.formCalendar", "a", function() {
                let $this = $(this);
                if (!$this.hasClass('selected')) {
                    that.$content.find('a.selected').removeClass('selected');
                    $(this).addClass('selected');
                }
                let m = that.month,
                    y = that.year,
                    d;
                if ($this.hasClass('last')) {
                    m = m - 1 < 1 ? (y--, 12) : m - 1;

                    if (y < that.option.startYear) {
                        return false;
                    }
                    that.dochange(y, m);
                    return false;
                } else if ($this.hasClass('next')) {
                    m = m + 1 > 12 ? (y++, 1) : m + 1;
                    if (y > that.option.endYear) {
                        return false;
                    }
                    that.dochange(y, m);
                    return false;
                }

                that.$container.hide();
                that.setValue(y + '-' + m + '-' + $this.text(), true);
            });

            if (this.option.scanAble) {
                this.$element.off("blur.formCalendar").on("blur.formCalendar", function() {
                    that.valChange();
                });
            }
        },

        /**
         * 同步value值和显示信息
         */
        dochange: function(year, month) {
            this.curDate = new Date(year, month - 1, 1);
            this.checkDate();
            this.changeSelect();
            this.drawCalendar();
        },

        /**
         * 设置选择列表的年份和月份
         */
        changeSelect: function() {
            this.$container.find('.form-c-year').val(this.year);
            this.$container.find('.form-c-month').val(this.month);
        },

        /**
         * 数据验证
         */
        validate: function() {
            let val = this.getValue();
            if (!checkDate(val)) {
                this.addValidateText(_("Valid format: YYYY-MM-DD"));
                return false;
            }
            return true;
        },

        /**
         * 设置值
         */
        setValue: function(v, confirm) {
            if (v) {
                if (Object.prototype.toString.call(v) !== "[object Date]") {
                    if (!checkDate(v)) {
                        //日期格式不正确
                        return;
                    }
                    v = v.replace(/\-/g, "\/");
                    v = new Date(v);
                }
            } else {
                v = new Date();
            }
            this.selectedDay = {
                year: v.getFullYear(),
                month: v.getMonth() + 1,
                day: v.getDate()
            };
            // if (this.selectedDay.year != this.year || this.selectedDay.month != this.month) {
            this.dochange(this.selectedDay.year, this.selectedDay.month);
            // }
            this.value = this.selectedDay.year + "-" + this.selectedDay.month + "-" + this.selectedDay.day;
            this.$element.val(this.value);
            confirm && this.valChange(this.value);
        },
        /**
         * 获取值
         */
        getValue: function() {
            this.value = this.$element.val();
            if (this.value) {
                this.value = this.value.replace(/(^\s*)|(\s*$)/g, "");
            }
            return this.value;
        },
        /**
         * 获取显示文本
         */
        getText: function() {
            return this.getValue();
        }
    });
    /**
     * 验证日期的合法性
     * @param {String/Date} date 需要验证的日期
     */
    function checkDate(date) {
        if (!date) return false;
        if (typeof date !== "string") {
            date += "";
        }
        // IE8不支持-连接的日期格式，转为/连接的格式
        date = date.replace(/-/g, "/");

        let d = new Date(date);
        if (isNaN(d)) return false;
        let arr = date.split("/");
        if (arr.length < 3) {
            return false;
        }
        return ((parseInt(arr[0], 10) == d.getFullYear()) && (parseInt(arr[1], 10) == (d.getMonth() + 1)) && (parseInt(arr[2], 10) == d.getDate()));
    }

}(jQuery));