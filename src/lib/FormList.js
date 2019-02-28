(function($) {
    let DEFAULT = {
        dataObj: {},
        ignoreKey: [],
        titleObj: {},
        css: ""
    };
    //todo by xc 字段按顺序输出

    function FormList(tar, opt) {
        this.option = $.extend({}, DEFAULT, opt);
        this.$tar = tar;
        this.option.css && this.$tar.addClass(this.option.css);
        this.render();
    }

    FormList.prototype = {
        constructor: FormList,
        render: function() {
            let dataObj = this.option.dataObj,
                ignoreKey = this.option.ignoreKey,
                hasColon = this.option.hasColon,
                titleObj = this.option.titleObj;

            let nodeHtml = "";

            function createHtml(obj, groupKey) {
                let nodes = "",
                    row = '<div class="form-row clearfix"><label class="col-5 form-title f-left">{title}</label><div class="col-7 form-text f-left" data-key="{key}">{value}</div></div>';

                function addNode(titleItem, dataItems) {
                    let nodes = "";
                    titleItem["title"] && (nodes += '<div class="form-row-title"><label class="h2-title">' + (titleItem["title"]) + '</label></div>');
                    for (let j = 0, jl = titleItem.items.length; j < jl; j++) {
                        let target = titleItem.items[j];
                        nodes += row.replace(/{title}/g, target.title).replace(/{key}/g, target.field + (titleItem.index || "")).replace(/{value}/g, dataItems[target.field]);
                    }
                    return nodes;
                }

                if (titleObj) {
                    for (let i = 0, l = titleObj.length; i < l; i++) {
                        let curItem = titleObj[i],
                            curData = dataObj[curItem.field],
                            type = Object.prototype.toString.call(curData);
                        if (type === "[object Array]") {
                            let title = curItem.title;
                            for (let k = 0, kl = curData.length; k < kl; k++) {
                                let titleItem = {
                                    title: _(curItem.title, curItem.startIndex + k + ''),
                                    items: curItem.items,
                                    index: k + 1
                                };

                                nodes += addNode(titleItem, curData[k]);
                            }
                        } else {
                            nodes += addNode(curItem, curData);
                        }

                    }
                }
                return nodes;
            }

            nodeHtml = createHtml(dataObj);

            this.$tar.html(nodeHtml);
            this.$tar.find("div.form-row-title:first").css({
                "border-top": 0,
                "padding-top": 0
            });

            this.option.rendered && this.option.rendered.call(this);
        },
        reLoad: function(data) {
            this.option.dataObj = data;
            this.update();
        },
        update: function() {
            let dataObj = this.option.dataObj,
                ignoreKey = this.option.ignoreKey,
                titleObj = this.option.titleObj;
            if (titleObj) {
                for (let i = 0, l = titleObj.length; i < l; i++) {
                    let curItem = titleObj[i],
                        curData = dataObj[curItem.field],
                        type = Object.prototype.toString.call(curData);
                    if (type === "[object Array]") {
                        for (let j = 0, kl = curData.length; j < kl; j++) {
                            curItem.items.forEach(target => {
                                if (ignoreKey.indexOf(target.field) > -1) {
                                    return true;
                                }
                                this.$tar.find('div.form-text[data-key="' + target.field + (j + 1) + '"]').html(curData[j][target.field]);
                            });
                        }
                    } else {
                        curItem.items.forEach(target => {
                            if (ignoreKey.indexOf(target.field) > -1) {
                                return true;
                            }
                            this.$tar.find('div.form-text[data-key="' + target.field + '"]').html(curData[target.field]);
                        });
                    }
                }
            }
        },

        setText: function(key, value) {
            if (key && this.option.dataObj[key]) {
                this.option.dataObj[key] = value;
                //找到元素并替换value
                this.$tar.find("div.datatext[data-key='" + key + "']").text(value);
            }
        }
    };

    $.fn.FormList = function(opt) {
        let args = Array.prototype.slice.call(arguments, 1),
            curObj;

        this.each(function() {
            let $this = $(this);
            curObj = $this.data("formlist");

            if (curObj && opt && typeof opt === "string") {
                curObj[opt].apply(curObj, args);
            } else {
                curObj = new FormList($this, opt);
                $(this).data("formlist", curObj);
            }
        });
        return curObj || this;
    };
})(jQuery);