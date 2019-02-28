/**
 * 推荐如下调用形式
 * <input type="text" data-key="FormDropDownList"/>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($) {
    // 直接挂载到 $.fn 上
    $.fn.FormDropDownList = function() {
        return new $.components.FormDropDownList(this, arguments);
    };

    // 构造函数
    $.components.FormDropDownList = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    // 组件特有配置项
    let DEFAULT = {
            selectArray: [],
            dataOptions: [], //[{type:"",args:[]}]
            clickCallBack: null, //下拉框展开回调
            hideCallBack: null, //下拉收起回调
            showSelfText: false, //显示自定义值，可以不是配置的下拉选型值
            customText: "", //若该字段不为空，则表示有自定义选项
            customTextSync: false, //自定义选项的文本与自定义的值保持一致
            unit: "", //显示单位
            listCss: '', //下拉选项css
            needRecover: false,
            inline: false,
            maxLength: null,
            switchCallBack: null,
            blurCallBack: null,
            focusCallBack: null //自定义情况下文本框获取焦点回调函数
        },
        htmlCode = {
            ' ': '&nbsp;',
            '<': '&lt;',
            '>': '&gt;'
        };

    // 选项池，对下拉选项进行缓存
    let dropListPool = [],
        recoverCss = 'drop-recover';

    $.components.FormDropDownList.inherit($.BaseComponent, {
        //重写基类的render方法
        render: function() {
            this.option = $.extend({}, DEFAULT, this.option);
            this.unit = this.option.unit;

            this.items = this.option.selectArray;
            this.hasCustom = !!this.option.customText;
            this.option.oldText = this.option.customText;
            this.position = {};
            this.isCustomMode = false;
            this.hasInit = false;
            this.isBodyParent = true;
            this.handleHeight = 40;
            if (this.option.needRecover) {
                this.option.listCss += ' ' + recoverCss;
                this.option.listCss = this.option.listCss.replace(/^\s|\s*$/g, '');
            }

            //渲染Html页面
            this.htmlRender();
            //绑定事件
            this.bindEvent();
        },
        /**
         * 构建默认值
         */
        setDefaultValue: function(val) {
            if (!$.isNotNullOrEmpty(this.option.defaultValue)) {
                this.option.defaultValue = val;
            }
            if (!$.isNotNullOrEmpty(this.value)) {
                this.value = this.option.defaultValue;
            }
        },
        /**
         * 渲染html内容
         */
        htmlRender: function() {
            if (!this.editable) {
                this.$element.addClass('form-disabled');
            }

            this.$body.addClass('dropdownlist');

            if (this.option.inline) {
                this.$par = this.$body;
            } else {
                this.$par = this.$element.closest('.md-modal-wrap');
                if (this.$par.length === 0) {}
                this.$par = $('body');
            }

            this.$element.addClass("drop-handle form-control");
            let nodes = '<div class="drop-text-wrap">' +
                '<span class="drop-text"></span>' +
                '<input type="text" class="drop-input none"/>' +
                '</div>';

            this.$DropHandle = $(nodes).appendTo(this.$element);
            this.$element.append('<span class="drop-btn icon-arrow-down"></span>');
            if (dropListPool.length > 0) {
                this.$DropList = $(dropListPool.shift());
                this.$DropList.attr('class', 'drop-list' + (this.option.listCss ? (' ' + this.option.listCss) : '')).removeAttr('style');
                this.$DropList.appendTo(this.$par);
            } else {
                this.$DropList = $('<ul class="drop-list' + (this.option.listCss ? (' ' + this.option.listCss) : '') + '"></ul>').appendTo(this.$par);
            }

            if (this.option.inline) {
                this.$DropList.css({
                    'margin-top': '-1px',
                    'top': '100%'
                });
            }

            this.$DropText = this.$DropHandle.find('.drop-text');
            this.ID = $.IGuid();
            this.renderOptions();
        },
        /**
         * 渲染下拉选项
         */
        renderOptions: function() {
            let that = this;

            if (that.hasCustom) {
                this.dropInput = this.$DropHandle.find(".drop-input").Rcomponent({
                    dataField: that.dataField,
                    dataKey: "FormInput",
                    maxLength: that.option.maxLength,
                    defaultValue: that.option.defaultValue,
                    dataValueType: that.option.dataValueType,
                    dataOptions: that.option.dataOptions,
                    validateCustom: function(text) {
                        if (text) {
                            that.addValidateText(text);
                        } else {
                            that.removeValidateText();
                        }
                    },
                    editable: that.editable,
                    validateCallBack: that.option.validateCallBack,
                    changeCallBack: function() {
                        that.valChange();
                    },
                    blurCallBack: function() {
                        that.value = this.value;
                        that.setSelectValue(that.value);
                        that.option.blurCallBack && that.option.blurCallBack();
                    },
                    focusCallBack: function() {
                        that.option.focusCallBack && that.option.focusCallBack();
                    }
                });
                this.dropInput.hide();
                this.$DropHandle.find(".drop-input").removeClass('none');
            }
            this.$DropList.css('min-width', this.$element.outerWidth());
            this.updateItems(this.option.selectArray);
        },
        /**
         * 定位选项列表打开的位置
         */
        location: function() {
            if (this.option.inline) {
                return;
            }
            if (!this.hasInit) {
                let $par = this.$element.closest('.md-modal-wrap');
                if ($par.length !== 0) {
                    this.$par = $par;
                    this.$DropList.appendTo(this.$par);
                    this.isBodyParent = false;
                }
                this.hasInit = true;
            }
            this.position.height = this.position.height || this.$element.outerHeight();
            let scrollTop = this.isBodyParent ? 0 : this.$par.scrollTop(),
                pOffset = this.$par.offset(),
                offset = this.$element.offset();


            this.$DropList.css({
                top: offset.top - pOffset.top + this.position.height - 1 + scrollTop,
                left: offset.left - pOffset.left
            });

            //确定选项朝哪个方向上展开
            // if(!$Tar.is(':visible')){
            //     let position = that.$DropHandle.offset();
            //     if(position.top + that.h + that.handleHeight > that.windowH){
            //         that.$DropList.addClass('top');
            //     }else{
            //         that.$DropList.removeClass('top');
            //     }
            // }
        },
        /**
         * 更新下拉选项
         */
        updateArray: function(arr) {
            this.updateItems(arr);
        },
        /**
         * 更新下拉选项，覆盖原有选项
         * @param {} options 与selectArray的类型相同
         */
        updateItems(options) {
            this.items = options;
            let selectOption = '<select name="' + this.dataField + '" class="form-drop-select">';
            this.$DropList.html("");
            let nodeHtml = '',
                items = {},
                keyValues = [];

            if (Object.prototype.toString.call(this.items) === "[object Array]") {
                for (let i = 0, len = this.items.length; i < len; i++) {
                    let item = this.items[i];
                    if (Object.prototype.toString.call(item) === "[object Object]") {
                        keyValues.push(item);
                    } else {
                        let obj = {};
                        obj[item] = item;
                        keyValues.push(obj);
                    }
                }
            } else if (Object.prototype.toString.call(this.items) === "[object Object]") {
                for (let key in this.items) {
                    let obj = {};
                    obj[key] = this.items[key];
                    keyValues.push(obj);
                }
            }
            for (let i = 0, l = keyValues.length; i < l; i++) {
                let item = keyValues[i];
                for (let key in item) {
                    i === 0 && this.setDefaultValue(key);
                    let text = (item[key] + '').replace(/(\s|<|>)/g, function(a) {
                        return htmlCode[a];
                    });
                    nodeHtml += '<li id="' + (this.ID + key) + '" class="dropdownlist-item ' + (this.value == key ? 'active' : "") + '" data-value="' + key + '"><a class="drop-item-btn">' + text + '</a></li>';
                    selectOption += '<option value="' + key + '">' + text + '</option>';
                    items[key] = item[key];
                    break;
                }
            }
            this.items = items;
            selectOption += '</select>';
            if (this.hasCustom) {
                nodeHtml += `<li class="dropdownlist-item text-item"><a class="drop-item-btn">${this.option.customText}</a></li>`;
            }
            this.$DropList.html(nodeHtml);
            // 自动化测试需要
            this.$select && this.$select.remove();
            this.$select = $(selectOption).insertBefore(this.$element);
            var that = this;
            this.$select.off('change.select').on('change.select', function() {
                that.setValue(this.value, true);
            });
            // 自动化测试需要

            if (!this.option.showSelfText && !this.hasCustom) {
                if (this.items[this.value] === undefined) {
                    this.value = this.option.defaultValue;
                }
            }
            this.setValue(this.value);
        },
        /**
         * 改变输入框的校验规则，直接替换覆盖原有的校验规则
         * @param {Array/Object} options 与FormInput的dataOptions用法相同
         */
        changeDataOptions(options) {
            this.dropInput && (this.dropInput.option.dataOptions = options);
        },
        /**
         * 数据验证
         */
        validate: function() {
            if (this.hasCustom && this.isCustomMode) {
                return this.dropInput.onValidate();
            }
            return true;
        },
        /**
         * 数据绑定
         */
        bindEvent: function() {
            let that = this;
            that.$element.off("click.dropdownlist").on('click.dropdownlist', ".drop-text,.drop-btn",
                function(e) {
                    if (that.$element.hasClass('form-disabled')) {
                        return false;
                    }

                    that.getWrapHeightWidth();

                    if (that.unit && typeof that.items[that.value] === "undefined" && $(e.target).hasClass("drop-text")) {
                        that.switchDisplay(true);
                        that.setValue(that.value || that.option.customText);
                        that.dropInput.focus();
                        return;
                    }

                    that.getWidthAndHeight();
                    that.getWrapHeightWidth();
                    let $Tar = that.$DropList;
                    $("ul.drop-list").not($Tar).removeClass('active');
                    // $("ul.drop-list").not($Tar).hide().removeClass('active');
                    $('.drop-handle.active').not(that.$element).removeClass('active');
                    that.option.clickCallBack && that.option.clickCallBack();
                    that.$element.toggleClass('active');

                    that.location();

                    $Tar.toggleClass('active');
                    if ($Tar.hasClass('active')) {
                        $(window).off('resize.droplist').on('resize.droplist', function() {
                            that.location();
                        });
                    } else {
                        that.option.hideCallBack && that.option.hideCallBack();
                    }
                    return false;
                }
            );

            that.$DropList.off("click.dropdownlist").on("click.dropdownlist", ".dropdownlist-item",
                function() {
                    let $this = $(this);
                    that.option.showSelfText = false;
                    if ($this.hasClass("active")) {
                        if ($this.hasClass('text-item')) {
                            that.hasCustom && that.switchDisplay(true);
                            that.dropInput.focus();
                        }
                        that.$DropList.removeClass('active');
                        that.$element.removeClass('active');
                        return false;
                    }
                    $this.addClass("active").siblings(".dropdownlist-item").removeClass("active");
                    //点击自定义选项
                    if ($this.hasClass('text-item')) {
                        that.hasCustom && that.switchDisplay(true);
                        that.dropInput.focus();
                    } else {
                        that.setValue.apply(that, [$this.attr("data-value")]);
                        that.hasCustom && that.switchDisplay(false);
                        that.valChange.call(that);
                    }
                    that.$DropList.removeClass('active');
                    that.$element.removeClass('active');

                    $(window).off('resize.droplist');
                    return false;
                }
            );

            $(document).unbind("click.dropdownlist-cl").bind("click.dropdownlist-cl", function() {
                if ($(".drop-list:visible").length > 0) {
                    that.option.hideCallBack && that.option.hideCallBack.call(that);
                }
                $("ul.drop-list").removeClass('active');
                $('.drop-handle').removeClass('active');
            });

            this.dropInput && this.dropInput.$element.off("blur.dropList").on("blur.dropList", function() {
                if (this.value !== "") {
                    if (that.unit || that.items[this.value] !== undefined) {
                        that.switchDisplay(false);
                    }
                }
                that.value = this.value;
            });

            if (that.$select) {
                that.$select.off('change.select').on('change.select', function() {
                    that.setValue(this.value, true);
                });
            }
        },
        /**
         * 添加下拉选项
         * @param {String} key 选项对应的value
         * @param {String} value 选项对应的显示文本，可不填，不填默认显示key的值
         */
        addItem: function(key, value) {
            value === undefined && (value = key);
            this.items[key] = value;

            let id = this.ID + key;
            this.$DropList.append('<li id="' + id + '" class="dropdownlist-item ' + (this.value == key ? 'active' : "") + '" data-value="' + key + '"><a class="drop-item-btn">' + value + '</a></li>');
            this.$select.append('<option value="' + key + '">' + value + '</option>');
        },
        /**
         * 同时添加多个选项
         * @param {Array/Object} items 待添加的选项
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
         * 移除单个或多个选项
         */
        removeItem: function(key) {
            let arr = this.items,
                val = this.value;

            if (typeof key !== "object") {
                delete arr[key];
                this.$DropList.find("#" + this.ID + key).remove();
                this.$select.children('option[value=' + key + ']').remove();
            } else if ($.getType(key) === "[object Array]") {
                for (let i = 0, l = key.length; i < l; i++) {
                    let t = key[i];
                    delete arr[t];
                    this.$DropList.find("#" + this.ID + t).remove();
                    this.$select.children('option[value=' + t + ']').remove();
                }
            }
            // 根据移除的项，重置默认值
            if (arr[this.option.defaultValue] === undefined) {
                for (let key in arr) {
                    this.option.defaultValue = key;
                    break;
                }
            }

            this.setValue(val);
        },
        /**
         * 设置自定义显示文本
         */
        setCustomText: function(val) {
            if (this.option.customTextSync && this.items[val] === undefined) {
                this.option.customText = val;
                this.$DropList.find('.dropdownlist-item.text-item').attr('data-value', val).children().text(val);
            } else if (this.items[val] !== undefined) {
                this.option.customText = this.option.oldText;
                this.$DropList.find('.dropdownlist-item.text-item').attr('data-value', '').children().text(this.option.customText);
            }
        },
        /**
         * 设置值，同步设置文本框和下拉框的值
         */
        setValue: function(val, confirm) {
            if (val === undefined || val === "") return;
            this.setSelectValue(val);
            this.dropInput && this.dropInput.setValue(val);
            confirm && this.valChange();
        },
        /**
         * 设置下拉框的值，不同步设置可输入模式下的文本框的值
         */
        setSelectValue: function(val) {
            this.$DropList.children('.dropdownlist-item').removeClass("active");
            if (this.hasCustom) {
                this.setCustomText(val);
            } else if (this.items[val] === undefined) {
                val = this.option.defaultValue;
            }

            if (this.option.showSelfText) {
                this.$DropText.text(this.option.showSelfText).attr("title", $.htmlEscape(this.option.showSelfText));
                this.hasCustom && this.switchDisplay(false);
            } else {
                let text = this.items[val] || val + this.unit;
                this.$DropText.text(text).attr("title", $.htmlEscape(text));
                if (this.items[val]) {
                    this.$DropList.find("li[data-value='" + val + "']").addClass('active');
                    this.hasCustom && this.switchDisplay(false);
                } else {
                    this.unit || (this.hasCustom && this.switchDisplay(true));
                    this.$DropList.find(".text-item").addClass('active');
                }
            }
            this.value = val;
            this.$select && this.$select.val(val);
        },

        /**
         * 设置限速文本
         */
        setText: function(text) {
            this.$DropText.text(text).attr("title", $.htmlEscape(text));
        },

        /**
         * 设置禁用或者启用
         */
        setDisabled: function(type) {
            if (type) {
                this.$element.addClass('form-disabled');
            } else {
                this.$element.removeClass('form-disabled');
            }
        },

        /**
         * 切换显示模式，文本框输入与下拉选择切换
         */
        switchDisplay: function(type) {
            this.isCustomMode = type;
            if (type) {
                this.$DropText.hide();
                this.dropInput.show();

                this.option.switchCallBack && this.option.switchCallBack.call(this);
            } else {
                this.$DropText.show();
                this.dropInput.hide();
            }
        },

        /**
         * 取值
         */
        getValue: function() {
            if (!this.editable) {
                let v = this.value;
                return v == null ? "" : v;
            } else {
                this.format();
                return this.value;
            }
        },

        /**
         * 获取显示文本
         */
        getText: function() {
            return this.getValue();
        },

        getWidthAndHeight: function() {
            this.h = this.$DropList.outerHeight();
            this.w = this.$DropList.outerWidth();
        },

        getWrapHeightWidth: function() {
            // if(!this.windowH){
            let $tar = this.$DropList.closest('.md-content');
            if ($tar.length == 0) {
                $tar = $("body");
                this.windowH = $tar.height();
            } else {
                this.windowH = $tar.height() - 24;
            }
            this.windowW = $tar.width();
            // }
        },

        /**
         * 清空所有选项
         */
        clearItems: function() {
            this.$DropText.html("");
            this.$DropList.children("li.dropdownlist-item").removeClass("active");

            this.getWidthAndHeight();
        }
    });

    $.recoverList = function() {
        dropListPool = Array.prototype.slice.call($('.drop-list.' + recoverCss), 0);
    };
}(jQuery));