/** 
 * 推荐如下调用形式
 * <input type="text" data-key="FormCheckList"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($) {
    $.fn.FormCheckList = function() {
        return new $.components.FormCheckList(this, arguments);
    };

    // 构造函数
    $.components.FormCheckList = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    const VALUE_TYPE = {
        STRING: 1, //字符串
        ARRAY: 2, // 数组
        BOOLEAN: 3 //bool //当只有一个选项且值为true或者false时，可设置为该类型
    };

    let DEFAULT = {
        // 选项列表[],{},[{}]都可以
        selectArray: [],
        valueType: VALUE_TYPE.STRING,
        // 单个CheckBox的change事件，与整个组件的change不同，在整个组件的change之后执行
        singleChange: null,
        // 数据为字符串时，选项之间的连接符
        joiner: ';'
    };

    $.components.FormCheckList.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);
            this.value = this.option.defaultValue;

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();
        },

        /**
         * 渲染html内容
         */
        htmlRender: function() {
            if (!this.editable) {
                this.$element.attr("disabled", "disabled").addClass('form-disabled');
            }
            this.$element.addClass('form-container');
            this.ID = $.IGuid();
            this.updateItems(this.option.selectArray);

        },

        /**
         * 绑定事件
         */
        bindEvent: function() {
            let _this = this;
            //事件绑定
            this.$element.off("change.formCheckList").on("change.formCheckList", ".form-checklist", function(e) {
                if (!_this.editable) {
                    return false;
                }
                _this.valChange.call(_this);
                $(this).parent().toggleClass('icon-check-on').toggleClass('icon-check-off');

                _this.option.singleChange && _this.option.singleChange.call(_this, this);
            });
        },
        /**
         * 更新选项，覆盖原有的选项
         */
        updateItems: function(selectArray) {
            this.length = 0;
            let arr = selectArray,
                checkboxs = [],
                items = {},
                keyValues = [];
            if ($.getType(arr) === "[object Array]") {
                for (let i = 0, len = arr.length; i < len; i++) {
                    let item = arr[i];
                    if ($.getType(item) === "[object Object]") {
                        keyValues.push(item);
                    } else {
                        let obj = {};
                        obj[item] = item;
                        keyValues.push(obj);
                    }
                }
            } else if ($.getType(arr) === "[object Object]") {
                for (let key in arr) {
                    let obj = {};
                    obj[key] = arr[key];
                    keyValues.push(obj);
                }
            }
            for (let i = 0, l = keyValues.length; i < l; i++) {
                let item = keyValues[i];
                for (let key in item) {
                    let text = item[key];
                    let id = this.ID + $.IGuid();
                    checkboxs.push(this.createHtml(id, key, text));
                    items[key] = text;
                    this.length++;
                    break;
                }
            }
            this.items = items;
            this.$element.html(checkboxs.join(''));

            this.setValue(this.value);
        },
        setEditable: function(editable) {
            this.editable = !!editable;
            if (this.editable) {
                this.$element.removeAttr('disabled').removeClass('form-disabled');
                this.$element.find('.form-checklist').removeAttr('disabled');
            } else {
                this.removeValidateText();
                this.$element.prop('disabled', true).addClass('form-disabled');
                this.$element.find('.form-checklist').prop('disabled', true);
            }
            return this;
        },
        createHtml(id, key, text) {
            text = $.htmlEncode(text);
            key = $.htmlEncode(key);
            return `<label for="${id}" class="form-label icon-check-off ellipsis-label" title="${text}"><input type="checkbox" name="${this.dataField}" id="${id}" class="form-checklist" value="${key}" ${(this.editable || "disabled")}/>${text}</label>`;
        },
        /**
         * 添加单项
         */
        addItem: function(key, value) {
            value === undefined && (value = key);
            this.items[key] = value;
            this.length++;
            let id = this.ID + $.IGuid();
            this.$element.append(this.createHtml(id, key, value));
        },
        /**
         * 添加多项
         */
        addItems: function(items) {
            let type = $.getType(items);

            if (type === "[object Array]") {
                for (let i = 0, item;
                    (item = items[i]);) {
                    if ($.getType(item) === '[object Object]') {
                        this.addItems(item);
                    } else {
                        this.addItem(item, item);
                    }
                }
            } else if (type === "[object Object]") {
                for (let key in items) {
                    this.addItem(key, items[key]);
                }
            }
        },
        /**
         * 移除单项或者多项
         */
        removeItem: function(key) {
            let arr = this.items,
                type = $.getType(arr),
                val = this.value;

            if (typeof key !== "object") {
                delete arr[key];
                this.length--;
                $("#" + this.ID + key).parent('label').remove();
            } else if ($.getType(key) === "[object Array]") {
                for (let i = 0, l = key.length; i < l; i++) {
                    let t = key[i];
                    delete arr[t];
                    this.length--;
                    $("#" + this.ID + t).parent('label').remove();
                }
            }
            if (arr[val] === undefined) {
                for (let key in arr) {
                    val = key;
                    break;
                }
            }

            this.setValue(val);
        },

        //设置值
        //v为以;隔开的字符串
        setValue: function(val, confirm) {
            // if (val == null) return;
            this.value = val;

            if (this.option.valueType === VALUE_TYPE.BOOLEAN) {
                if (val) {
                    for (let key in this.items) {
                        val = [key];
                        break;
                    }
                } else {
                    val = [];
                }
            } else {
                if ($.getType(val) !== "[object Array]") {
                    val += "";
                    val = val.split(this.option.joiner);
                }
            }
            val = val.map((item) => String(item));

            let inputs = this.$element.find('input');
            inputs.prop("checked", false);
            this.$element.find('.form-label').removeClass('icon-check-on').addClass('icon-check-off');
            inputs.each(function() {
                if (val.indexOf(this.value) > -1) {
                    this.checked = true;
                    $(this).parent().addClass('icon-check-on').removeClass('icon-check-off');
                }
            });

            // confirm && this.valChange();
            this.validateOrChange(confirm);
            return this;
        },
        /**
         * 全选中
         */
        setAllValue: function() {
            let val = [];
            for (let key in this.items) {
                val.push(key);
            }
            this.setValue(val);
        },
        /**
         * 根据设置的valueType和dataValueType对数据进行格式化
         * 首先根据valueType进行一轮格式化，再根据dataValueType进行二轮格式化
         */
        format: function() {
            if ($.getType(this.value) === '[object Array]') {
                switch (this.option.valueType) {
                    case VALUE_TYPE.STRING:
                        this.value = this.value.join(this.option.joiner);
                        break;
                    case VALUE_TYPE.ARRAY:
                        if (this.option.dataValueType === 'num') {
                            this.value = this.value.map((item) => Number(item));
                        } else {
                            this.value = this.value.map((item) => String(item));
                        }
                        break;
                    case VALUE_TYPE.BOOLEAN:
                        this.value = this.value.length > 0;
                        break;
                }
            }
        },
        /**
         * 获取值
         */
        getValue: function() {
            if (this.editable) {
                let val = [];
                this.$element.find("input").each(function() {
                    if (this.checked) {
                        val.push($.htmlDecode(this.value));
                    }
                });
                this.value = val;
                this.format();
            }
            return this.value;
        }
    });
}(jQuery));