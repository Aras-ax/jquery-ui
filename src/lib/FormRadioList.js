/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormRadioList"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($) {
    $.fn.FormRadioList = function() {
        return new $.components.FormRadioList(this, arguments);
    };

    // 构造函数
    $.components.FormRadioList = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    // 组件特有配置项 
    let DEFAULT = {
        selectArray: [],
        radioIndex: '' // 用来区分多个相同的name的radio
    };

    $.components.FormRadioList.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();
        },

        setDefaultValue: function(val) {
            if (!$.isNotNullOrEmpty(this.option.defaultValue)) {
                this.option.defaultValue = val;
            }
        },

        //渲染html内容
        htmlRender: function() {
            if (!this.editable) {
                this.$element.attr("disabled", "disabled").addClass('form-disabled');
            }
            this.$element.addClass('form-container');
            this.ID = $.IGuid();
            this.updateItems(this.option.selectArray);
        },

        updateItems: function(selectArray) {
            let arr = selectArray,
                radios = [],
                items = {};

            let keyValues = [];
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
            let inputName = this.dataField + (this.option.radioIndex === '' ? '' : this.option.radioIndex);
            // let inputName = this.dataField + this.ID;
            for (let i = 0, l = keyValues.length; i < l; i++) {
                let item = keyValues[i];
                for (let key in item) {
                    i === 0 && this.setDefaultValue(key);
                    let text = item[key],
                        id = this.ID + key;
                    radios.push('<label for="' + id + '" class="form-label icon-radio-off"><input type="radio" id="' + id + '" name="' + inputName + '" class="form-radiolist" value="' + key + '" ' + (this.editable || "disabled") + '/>' + text + '</label>');
                    items[key] = text;
                    break;
                }
            }

            this.items = items;
            this.$element.html(radios.join(''));

            if (this.items[this.value] === undefined) {
                this.value = this.option.defaultValue;
            }

            this.setValue(this.value);
        },

        setEditable: function(editable) {
            this.editable = !!editable;
            if (this.editable) {
                this.$element.removeAttr('disabled').removeClass('form-disabled');
                this.$element.find('.form-radiolist').removeAttr('disabled');
            } else {
                this.removeValidateText();
                this.$element.prop('disabled', true).addClass('form-disabled');
                this.$element.find('.form-radiolist').prop('disabled', true);
            }
            return this;
        },

        setDisable: function(keys, val) {
            let arr = this.items,
                type = $.getType(arr);
            if ($.getType(keys) !== '[object Array]') {
                keys = [keys];
            }

            for (let i = 0, l = keys.length; i < l; i++) {
                let key = keys[i];
                if (val) {
                    $("#" + this.ID + key).attr('disabled', true).parent('label').addClass('disabled');
                } else {
                    $("#" + this.ID + key).removeAttr('disabled').parent('label').removeClass('disabled');
                }
            }

            if (keys.indexOf(this.value) > -1) {
                for (let key in this.items) {
                    if (keys.indexOf(key) === -1) {
                        this.setValue(key);
                        break;
                    }
                }
            }
        },

        //绑定事件
        bindEvent: function() {
            let _this = this;
            //事件绑定
            this.$element.off("change.formRadioList").on("change.formRadioList", ".form-radiolist", function(e) {
                if (!_this.editable) {
                    return false;
                }
                _this.valChange.call(_this);
                _this.$element.find('.form-label').removeClass('icon-radio-on').addClass('icon-radio-off');
                $(this).parent().addClass('icon-radio-on').removeClass('icon-radio-off');
            });
        },

        addItem: function(key, value) {
            value === undefined && (value = key);
            this.items[key] = value;

            let id = this.ID + key;
            this.$element.append('<label for="' + id + '" class="form-label icon-radio-off"><input type="radio" id="' + id + '" name="' + this.dataField + this.ID + '" class="form-radiolist" value="' + key + '"/>' + value + '</label>');
        },

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

        removeItem: function(key) {
            let arr = this.items,
                type = $.getType(arr),
                val = this.value;

            if (typeof key !== "object") {
                delete arr[key];
                $("#" + this.ID + key).parent('label').remove();
            } else if ($.getType(key) === "[object Array]") {
                for (let i = 0, l = key.length; i < l; i++) {
                    let t = key[i];
                    delete arr[t];
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
        setValue: function(v, confirm) {
            this.value = v;
            let val = v;
            if (val === '') {
                val = this.option.defaultValue;
            } else if (typeof val === 'boolean') {
                val = val + '';
            }
            //如果设置的值不在选项内部，则默认选中第一个值
            if (this.items[val] === undefined) {
                for (let key in this.items) {
                    this.value = val = key;
                    break;
                }
            }

            let inputs = this.$element.find('input');
            inputs.prop("checked", false);
            this.$element.find('.form-label').addClass('icon-radio-off').removeClass('icon-radio-on');
            inputs.each(function() {
                if (val == this.value) {
                    this.checked = true;
                    $(this).parent().addClass('icon-radio-on').removeClass('icon-radio-off');
                    return false;
                }
            });

            this.validateOrChange(confirm);
        },

        getValue: function() {
            if (this.editable) {
                let val = this.$element.find('input[type="radio"]:checked').val();
                this.value = val;
            }
            this.format();
            return this.value;
        }
    });
}(jQuery));