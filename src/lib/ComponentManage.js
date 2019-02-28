//ControlManager
(function($) {
    /**
     * 该方法不建议手动调用
     * args:[]或者{}
     * args为[]时可作为组件的渲染或者方法的调用
     * args为{}时只能作为组件渲染 
     * key为组件的类型
     */
    $.renderComponent = function(args, key) {
        //data-key:用于存储组件的类型
        let $this = $(this),
            cmts = {};
        if (!args) return;
        if (args.hasOwnProperty("length")) {
            if (args.length == 0) return;
            args = Array.prototype.slice.call(args);
            let opt = args[0],
                params = args.slice(1);
            $this.each(function(i) {
                let comkey = key || $this.attr("data-key") || opt["dataKey"];

                let $this = $(this),
                    component = $this.data(comkey);
                //通过该方式访问组件内指定API
                if (component && params && typeof opt == "string") {
                    cmts = component[opt].call(component, params);
                } else if ($.components[comkey]) {
                    create.call(this, opt, comkey, cmts);
                }
            });
        } else {
            $this.each(function(i) {
                let $this = $(this),
                    comkey = key || $this.attr("data-key");
                if ($.components[comkey]) {
                    let opt = args[$this.attr("data-field")];
                    create.call(this, opt, comkey, cmts);
                }
            });
        }

        function create(opt, comkey) {
            let cmt = new $.components[comkey](this, opt);
            if (cmt.$element[0].tagName.toLowerCase() === "div") {
                cmt.$element.find("input,select").attr("tabindex", 1);
            } else {
                cmt.$element.attr("tabindex", 1);
            }
            cmts[cmt.dataField] = cmt;
        }

        return cmts;
    };

    //适用于模块组件操作，便于模块组件的编写
    let DEFAULT_OPT = {
            requestUrl: "",
            requestData: {},
            submitUrl: "",
            formCfg: {},
            target: '', //用于按模块划分数据 String/Array
            autoRequest: false,
            reserveKeys: [], //getValue时保留的字段，例如ID等无需编辑字段
            showSubmitBar: false,
            container: null,
            popError: true,
            beforeUpdate: null, //请求返回的数据，this指向当前ComponentManager实例对象
            afterUpdate: null, //数据更新后的回调，this指向当前ComponentManager实例对象
            beforeSubmit: null, //提交数据前，进行一些列自定义数据校验操作，当然基础的数据校验会在这之前进行调用,失败返回false, 成功返回true或者二次处理后需要提交的数据，this指向当前ComponentManager实例对象
            afterSubmit: null, //数据提交后的回调，this指向当前ComponentManager实例对象, 提供数据提交后台返回的参数
            renderedCallBack: null, //模块组件加载完成后的回调，可用于实现组件加载完后的自定义逻辑
            cancelCallBack: null,
            errorCallBack: null //组建校验不通过回调
        },
        CHECKTYPE = {
            SUBMIT: 1, //数据提交
            VALIDATE: 2 //只做数据校验
        };

    function ComponentManager(opt) {
        this.option = $.extend({}, DEFAULT_OPT, opt);
        this.$container = $(this.option.container).addClass("form-wrap");
        this.components = {}; //datafield:Component对象键值对
        this.isSingle = false; //单个组件渲染
        this.orignalData = {};

        this.init();
    }

    ComponentManager.prototype = {
        constructor: ComponentManager,
        init: function() {
            let key = this.$container.attr("data-key");
            this.isSingle = !!key;
            this.ID = $.IGuid();

            if (this.isSingle) {
                this.components = $.renderComponent.call(this.$container, this.option.formCfg, key);
            } else {
                //扫描节点包含与被包含关系
                let conection = {},
                    groupToId = {},
                    id = this.ID;
                this.$container.find('[data-group]').each(function() {
                    let $this = $(this),
                        group = $this.attr('data-group'),
                        dataKey = $this.attr('data-key');
                    conection[group] = conection[group] || [];

                    if (dataKey) {
                        conection[group].push($this.attr('data-field'));
                    } else {
                        this.id = this.id || id + group;
                        groupToId[group] = this.id;
                        $(this).find('[data-key]').each(function() {
                            conection[group].push($(this).attr('data-field'));
                        });
                    }
                });
                conection.groupToId = groupToId;
                this.conection = conection;

                this.components = $.renderComponent.call(this.$container.find('[data-key]'), this.option.formCfg);
            }
            this.option.renderedCallBack && this.option.renderedCallBack.call(this);

            this.$footbar = $('<div class="cm-footbar md-toolbar"><input type="submit" class="md-btn ok cm-submit" value="' + _("Submit") + '"><input type="button" class="md-btn cancel cm-cancel" value="' + _("Cancel") + '"></div>');
            this.option.showSubmitBar && this.$footbar.appendTo(this.$container);

            this.option.autoRequest && this.request();
            this.bindEvent();
        },

        /**
         * 请求显示数据
         */
        request: function() {
            let _this = this;
            // 获取数据，更新组件的值
            if (this.option.requestUrl) {
                $.ajax({
                    url: this.option.requestUrl + "?" + (new Date().getTime()),
                    cache: false,
                    type: "post",
                    dataType: "text",
                    contentType: "application/json",
                    data: JSON.stringify(this.option.requestData),
                    async: true,
                    success: function(data, status) {
                        if (data.indexOf("login.js") > 0) {
                            window.location.href = "login.html";
                            return;
                        }
                        if (data.indexOf("quickset.js") > 0) {
                            window.location.href = "quickset.html";
                            return;
                        }

                        data = JSON.parse(data);
                        //将赋值操作放在线程最后运行
                        setTimeout(() => {
                            _this.analyseData(data);
                        }, 10);
                    },
                    error: function(msg, status) {
                        // console && console.log && console.log(_("Data request failed!"));
                    },
                    complete: function(xhr) {
                        xhr = null;
                    }
                });
            }
        },
        /**
         * 事件绑定
         */
        bindEvent: function() {
            let _this = this;
            if (this.option.showSubmitBar) {
                this.$footbar.off("click.cm").on("click.cm", ".md-btn", function() {
                    let $this = $(this);
                    if ($this.hasClass("cm-submit")) {
                        _this.submit();
                    } else if ($this.hasClass("cm-cancel")) {
                        _this.cancelCallBack();
                    }
                    return false;
                });
            }
        },
        /**
         * 重新加载数据
         */
        reLoad: function() {
            this.request();
        },

        /**
         * 更新组件的值
         */
        analyseData: function(data) {
            this.updateComponents(data);
        },

        /**
         * 对容器内的表单进行数据校验
         * @param hideError bool 是否隐藏错误提示框
         * @return {true:数据校验成功,false:数据校验失败}
         */
        validate: function(hideError) {
            let components = this.components,
                result = true;

            //首先检测界面上是否已存在输入错误
            result = this.checkError(hideError);
            if (result === false) {
                return false;
            }

            for (let field in components) {
                if (components.hasOwnProperty(field)) {
                    let component = components[field];
                    if (component.visible && !component.ignore) {
                        let validate = component.onValidate();
                        if (result) {
                            result = validate;
                        }
                    }
                }
            }

            //再次检测各表单是否有规格错误
            result = this.checkError(hideError);

            return result;
        },
        /**
         * 检查输入错误，并定位到相应的错误位置
         */
        checkError: function(hideError) {
            let $error = this.$container.find(".error-tip"),
                _this = this,
                result = true;
            // 对于ignore的错误不考虑
            $error.each(function(index, item) {
                let dataField = $(item).attr('data-field'),
                    component = _this.components[dataField];
                if (component && !component.ignore) {
                    result = false;
                    return false;
                } else if (component === undefined) {
                    result = false;
                    return false;
                }
            });

            if (result === false) {
                hideError || $.formMessage(_("Incorrect. Check the red text box."));
                //若错误元素在不可见区域，则定位到相应的元素
                let windowH = $(window).height(),
                    offset = $($error[0]).offset(),
                    scrollTop = $(window).scrollTop();
                if (offset.top < scrollTop) {
                    $(window).scrollTop(offset.top - windowH / 2);
                } else {
                    let distance = offset.top - scrollTop - windowH + 160;
                    if (distance > 0) {
                        $(window).scrollTop(offset.top - windowH / 2);
                    }
                }
            }
            return result;
        },

        /**
         * 获取组件的值
         * @param  {[field]} 需要获取值得组件filed，可不填，不填就是获取所有组件的值
         * @return filed为空返回{},field有值返回对应组件的值
         */
        getValue: function(field) {
            if (field) {
                let cmt = this.components[field];
                if (cmt) {
                    return cmt.getValue();
                }
            } else {
                let data = {},
                    components = this.components,
                    reserveKeys = this.option.reserveKeys;
                for (let key in components) {
                    if (components.hasOwnProperty(key)) {
                        let cmt = components[key];
                        !cmt.ignore && (data[key] = components[key].getValue());
                    }
                }
                for (let i = 0, l = reserveKeys.length; i < l; i++) {
                    let key = reserveKeys[i],
                        val = this.orignalData[key];
                    val !== undefined && (data[key] = val);
                }
                if (this.option.target) {
                    let newObj = {};
                    if (typeof this.option.target === 'string') {
                        newObj[this.option.target] = data;
                    } else {
                        for (let key in this.option.target) {
                            let item = this.option.target[key],
                                iObj = {};
                            for (let i = 0, l = item.length; i < l; i++) {
                                let ikey = item[i];
                                if (data[ikey] !== undefined) {
                                    iObj[ikey] = data[ikey];
                                }
                            }
                            $.isEmptyObject(iObj) || (newObj[key] = iObj);
                        }
                    }
                    return newObj;
                }
                return data;
            }
        },
        /**
         * 提交数据
         * type: 1表示数据提交，2：表示数据校验，默认值为1
         * 返回 false：数据校验失败， true:数据校验成功
         */
        submit: function(type) {
            type = type || CHECKTYPE.SUBMIT;
            let result = this.validate(),
                data;
            if (result) {
                data = this.getValue();
                result = this.option.beforeSubmit && this.option.beforeSubmit.call(this, data);
                if (result === false) {
                    return false;
                }

                if (type === CHECKTYPE.VALIDATE) {
                    return true;
                }

                //微企特有
                $('#module-save').attr('disabled', true);
                $('.md-modal-wrap.md-show').find('.md-btn').not('.cancel').attr('disabled', true);

                if (result && result !== true) {
                    data = result;
                }

                let _this = this;

                $.ajax({
                    url: this.option.submitUrl + "?" + (new Date().getTime()),
                    cache: false,
                    type: "post",
                    dataType: "text",
                    async: true,
                    contentType: "application/json",
                    data: JSON.stringify(data),
                    success: function(data) {
                        let result = true;
                        if (data.indexOf("login.js") > 0) {
                            window.location.reload();
                            return;
                        }
                        data = JSON.parse(data);
                        //错误处理
                        if (_this.option.popError) {
                            for (let key in data) {
                                if (data[key] === -1) {
                                    //表示保存出错
                                    $.formMessage(_("Save failed"));
                                    return;
                                }
                            }
                        }

                        _this.option.afterSubmit && _this.option.afterSubmit.call(_this, data);
                    },
                    complete() {
                        //微企特有
                        $('#module-save').removeAttr('disabled');
                        $('.md-toolbar').find('.md-btn').removeAttr('disabled');
                    }
                });
                return true;
            } else {
                this.option.errorCallBack && this.option.errorCallBack.call(this, data);
            }
            return false;
        },

        /**
         * 设置组件的值
         * field：需要设置值得组件field,可为空
         * val:   组件的值，field为空则是所有组件的值{}，否则为该组件的值
         */
        setValue: function(val, field) {
            if (field) {
                let cmt = this.components[field];
                if (cmt) {
                    cmt.setValue(val);
                    cmt.option.autoChange && cmt.handleChangeEvents();
                }
                this.orignalData || (this.orignalData = {});
                this.orignalData[field] = val;
            } else {
                this.updateComponents(val);
            }
        },

        /**
         * 设置组件是否可见
         */
        setVisible: function(visible, fields) {
            fields = fields || [];
            let components = this.components;
            if (fields) {
                if ($.getType(fields) !== '[object Array]') {
                    fields = [fields];
                }
                for (let i = 0, l = fields.length; i < l; i++) {
                    let component = components[fields[i]];
                    component && component.setVisible(visible);
                }
            } else {
                for (let key in components) {
                    let component = components[key];
                    component.setVisible(visible);
                }
            }
        },
        /**
         * 设置组件是否可见
         */
        setEditable: function(editable, fields) {
            fields = fields || [];
            let components = this.components;
            if (fields) {
                if ($.getType(fields) !== '[object Array]') {
                    fields = [fields];
                }
                for (let i = 0, l = fields.length; i < l; i++) {
                    let component = components[fields[i]];
                    component && component.setEditable(editable);
                }
            } else {
                for (let key in components) {
                    let component = components[key];
                    component.setEditable(editable);
                }
            }
            return this;
        },
        /**
         * 设置组件组是否可见
         */
        setGroupVisible: function(visible, groups) {
            if (typeof groups === 'string') {
                this.setVisible(visible, this.conection[groups]);
                let $gruot = this.$container.find('#' + this.conection.groupToId[groups]);
                visible ? $gruot.show() : $gruot.hide();
            } else {
                let fields = [];
                for (let i = 0, l = groups.length; i < l; i++) {
                    fields = fields.concat(this.conection[groups[i]]);
                    let $gruot = this.$container.find('#' + this.conection.groupToId[groups[i]]);
                    visible ? $gruot.show() : $gruot.hide();
                }
                this.setVisible(visible, fields);
            }
        },
        /**
         * 重置组件数据为给定的数据
         * @param {Object} data 
         */
        resetData(data) {
            let newObj = {};
            for (let key in data) {
                if ($.getType(data[key]) === '[object Object]') {
                    $.extend(newObj, this.resetData(data[key]));
                } else {
                    newObj[key] = data[key];
                }
            }
            return newObj;
        },
        /**
         * 更新组件的值-重置为上一次的值或者给定的值
         * data:{} 字段与值的键值对
         */
        updateComponents: function(data) {
            let components = this.components;
            if (this.option.beforeUpdate) {
                data = this.option.beforeUpdate.call(this, data) || data;
            } else {
                data = this.resetData(data);
            }

            if (data && !$.isEmptyObject(data)) {
                $.extend(this.orignalData, data);
            } else {
                data = this.orignalData;
            }

            if (data && $.getType(data) === "[object Object]") {
                for (let key in data) {
                    if (data.hasOwnProperty(key)) {
                        let component = components[key];
                        if (component) {
                            component.setValue(data[key]);
                            component.option.autoChange && component.handleChangeEvents();
                            component.removeValidateText();
                        }
                    }
                }
            }
            this.option.afterUpdate && this.option.afterUpdate.call(this, data);
        },
        /**
         * 重置组件的值为默认值
         */
        reset() {
            let components = this.components;
            this.orignalData = {};
            for (let key in components) {
                if (components.hasOwnProperty(key)) {
                    let component = components[key];
                    component.reset();
                    component.removeValidateText();
                }
            }
        },
        /**
         * 移除所有的错误提示信息
         */
        removeValidateText() {
            let components = this.components;
            for (let key in components) {
                if (components.hasOwnProperty(key)) {
                    components[key].removeValidateText();
                }
            }
        },
        /**
         * 触发组内各组件的功能方法
         */
        emmit: function(funName, args) {
            if (!!funName) {
                return;
            }

            if (typeof args === "undefined") {
                if (Object.prototype.toString.call(args) !== "[object Array]") {
                    args = [args];
                }
            } else {
                args = [];
            }

            let data = {},
                components = this.components;

            for (let key in components) {
                if (components.hasOwnProperty(key)) {
                    let cmt = components[key];
                    if (cmt[funName] && typeof cmt[funName] === "function") {
                        data[key] = cmt[funName].apply(cmt, args);
                    }
                }
            }
            return data;
        },

        /**
         * 获取单个组件
         */
        getComponent: function(field) {
            if (field) {
                return this.components[field];
            }
        },

        /**
         * 根据元素节点获取组件
         */
        getComponentByNode: function(node) {
            if (node) {
                let field = $(node).attr("data-field");
                return this.getComponent(field);
            }
        }
    };

    //两种调用形式
    $.componentManager = function(opt) {
        return new ComponentManager(opt);
    };

    /**
     * 获取数据类型
     */
    $.getType = function(obj) {
        return Object.prototype.toString.call(obj);
    };
}(jQuery));