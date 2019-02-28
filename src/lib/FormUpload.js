/**
 * 推荐如下调用形式
 * <div data-key="FormUpload"></div>
 * 其中data-key为组件的名称，便于解析
 * 依赖jQuery
 */
(function($) {
    $.fn.FormUpload = function() {
        return new $.components.FormUpload(this, arguments);
    };

    // 构造函数
    $.components.FormUpload = function(element, options) {
        $.BaseComponent.call(this, element, options);
    };

    const BTNTYPE = {
        TEXT: 1, //显示上传文本
        IMG: 2 //上传按钮显示图标
    };

    // 组件特有配置项
    let DEFAULT = {
        submitUrl: "", //提交地址
        showFileText: true, //是否显示上传文件名框
        showLoading: false,
        browseText: _("Browse"), //文件浏览按钮文本
        uploadText: _("Upload"), //上传按钮文本
        uploaddingText: _("Uploading..."), //上传文件过程中的提示语,默认提示“上传升级文件xxx” by pjl
        emptyFileText: _("Select an upgrade file"), //文件为空时的提示语，默认提示“请选择一个升级文件” by pjl
        uploadBtnType: BTNTYPE.TEXT,
        uploadIcon: 'icon-add',
        beforeUpload: null, // 上传文件前的操作，格式检查之类的，通过this.value可取到上传文件的文件名,若取消上传，返回false
        success: null //上传文件返回成功的回调
    };


    $.components.FormUpload.inherit($.BaseComponent, {
        //重写基类的render方法
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

        //渲染html内容
        htmlRender: function() {
            this.$element.addClass("form-upload");
            this.ID = $.IGuid();
            if (this.option.showFileText) {
                this.$text = $('<input type="text" class="form-upload-text" readonly/>').appendTo(this.$element);
                this.$browse = $('<label for="' + this.ID + '" class="form-upload-btn form-btn-br">' + this.option.browseText + '</label>').appendTo(this.$element);
            }

            this.$fileInput = $('<input  type="file" class="form-upload-file" name="' + this.dataField + '" id="' + this.ID + '"/>').appendTo(this.$element);

            if (this.option.uploadBtnType === BTNTYPE.TEXT) {
                this.$btnUpload = $('<label title="' + this.option.uploadText + '" class="form-upload-btn form-btn-up btn-ellipsis">' + this.option.uploadText + '</label>').appendTo(this.$element);
            } else {
                this.$btnUpload = $('<label title="' + this.option.uploadText + '" class="form-upload-btn form-btn-up btn-ellipsis"><i class="upload-icon ' + this.option.uploadIcon + '"></i></label>').appendTo(this.$element);
            }

            if (!this.option.showFileText) {
                this.$btnUpload.attr('for', this.ID);
            }

            if (!this.editable) {
                this.$element.children("input").attr("disabled", "disabled").addClass('form-disabled');
            }
        },

        //绑定事件
        applyAjaxFileUpload: function() {
            let result = this.option.beforeUpload && this.option.beforeUpload.call(this),
                that = this,
                oldText = '';

            if (result === false) {
                that.setValue('');
                return;
            }

            that.$btnUpload.attr("disabled", "disabled").addClass('form-disabled');
            if (this.option.uploadBtnType === BTNTYPE.TEXT) {
                oldText = that.$btnUpload.text();
                that.$btnUpload.text(_("Uploading...")).attr('title', _("Uploading..."));
            }

            if (that.option.showLoading) {
                $.formMessage(that.option.uploaddingText, true);
            }

            $.ajaxFileUpload({
                url: that.option.submitUrl,
                secureuri: false,
                fileElementId: that.ID,
                data: result,
                dataType: 'text',
                success: function(d) {
                    that.$btnUpload.removeAttr("disabled").removeClass('form-disabled');
                    if (that.option.uploadBtnType === BTNTYPE.TEXT) {
                        that.$btnUpload.text(oldText).attr('title', oldText);
                    }
                    that.option.success && that.option.success.call(that, d);

                    //重新绑定事件
                    if (that.option.showFileText) {
                        that.$fileInput = $("#" + that.ID).off("change").on("change", function() {
                            let text = this.value.slice(this.value.lastIndexOf('\\') + 1);
                            that.$text.val(text);
                            that.value = text;
                        });
                    } else {
                        that.$fileInput = $("#" + that.ID).off("change").on("change", function() {
                            that.value = this.value;
                            that.applyAjaxFileUpload();
                        });
                    }

                    that.setValue('');
                }
            });
        },

        bindEvent: function() {
            let that = this;
            if (this.option.showFileText) {
                this.$fileInput.off("change").on("change", function() {
                    let text = this.value.slice(this.value.lastIndexOf('\\') + 1);
                    that.$text.val(text).attr('title', text);
                    that.value = text;
                });

                this.$btnUpload.off("click").on("click", function() {
                    if ($(this).hasClass('form-disabled')) {
                        return false;
                    }
                    if (!that.value) {
                        $.formMessage(that.option.emptyFileText);
                        return false;
                    }

                    //调用上传接口
                    that.applyAjaxFileUpload();
                });

                // 解决IE光标删除键后退问题
                this.$text.off('keydown').on('keydown', function() {
                    return false;
                });

                return;
            }

            this.$fileInput.off("change").on("change", function() {
                let text = this.value.slice(this.value.lastIndexOf('/') + 1);
                that.value = text;

                that.applyAjaxFileUpload();
            });
        },

        //设置值
        setValue: function(v, confirm) {
            this.value = v;
            this.$text && this.$text.val('');
            this.$fileInput && this.$fileInput.val(v);
            this.validateOrChange(confirm);
        },

        getValue: function() {
            return this.value;
        },

        setText: function(text) {
            if (text) {
                this.$btnUpload.text(text).attr('title', text);
            }
        },

        reset: function() {
            this.value = '';
            this.$text.val('');
        },

        getText: function() {
            return this.getValue();
        }
    });
}(jQuery));

//直接引用成熟的插件库，出自：https://github.com/davgothic
jQuery.extend({
    createUploadIframe: function(d, b) {
        let a = "jUploadFrame" + d;
        let c = '<iframe id="' + a + '" name="' + a + '" style="position:absolute; top:-9999px; left:-9999px"';
        if (window.ActiveXObject) {
            if (typeof b == "boolean") {
                c += ' src="javascript:false"';
            } else {
                if (typeof b == "string") {
                    c += ' src="' + b + '"';
                }
            }
        }
        c += "/>";
        jQuery(c).appendTo(document.body);
        return jQuery("#" + a).get(0);
    },
    createUploadForm: function(a, j, d) {
        let h = "jUploadForm" + a;
        let c = "jUploadFile" + a;
        let b = jQuery('<form  action="" method="POST" name="' + h + '" id="' + h + '" enctype="multipart/form-data"></form>');
        if (d) {
            if (d.orderMine == "before") {
                for (let e in d) {
                    if (e == "orderMine") {
                        continue;
                    }
                    jQuery('<input type="hidden" name="' + e + '" value="' + d[e] + '" />').appendTo(b);
                }
                let f = jQuery("#" + j);
                let g = jQuery(f).clone();
                jQuery(f).attr("id", c);
                jQuery(f).before(g);
                jQuery(f).appendTo(b);
            } else {
                let f = jQuery("#" + j);
                let g = jQuery(f).clone();
                jQuery(f).attr("id", c);
                jQuery(f).before(g);
                jQuery(f).appendTo(b);
                for (let e in d) {
                    if (e == "orderMine") {
                        continue;
                    }
                    jQuery('<input type="hidden" name="' + e + '" value="' + d[e] + '" />').appendTo(b);
                }
            }
        } else {
            let f = jQuery("#" + j);
            let g = jQuery(f).clone();
            jQuery(f).attr("id", c);
            jQuery(f).before(g);
            jQuery(f).appendTo(b);
        }
        jQuery(b).css("position", "absolute");
        jQuery(b).css("top", "-1200px");
        jQuery(b).css("left", "-1200px");
        jQuery(b).appendTo("body");
        return b;
    },
    ajaxFileUpload: function(k) {
        k = jQuery.extend({}, jQuery.ajaxSettings, k);
        let a = new Date().getTime();
        let b = jQuery.createUploadForm(a, k.fileElementId, (typeof(k.data) == "undefined" ? false : k.data));
        let i = jQuery.createUploadIframe(a, k.secureuri);
        let h = "jUploadFrame" + a;
        let j = "jUploadForm" + a;
        if (k.global && !jQuery.active++) {
            jQuery.event.trigger("ajaxStart");
        }
        let c = false;
        let f = {};
        if (k.global) {
            jQuery.event.trigger("ajaxSend", [f, k]);
        }
        let d = function(l) {
            let p = document.getElementById(h);
            try {
                if (p.contentWindow) {
                    f.responseText = p.contentWindow.document.body ? (p.contentWindow.document.body.innerText || p.contentWindow.document.body.textContent) : null;
                    f.responseXML = p.contentWindow.document.XMLDocument ? p.contentWindow.document.XMLDocument : p.contentWindow.document;
                } else {
                    if (p.contentDocument) {
                        f.responseText = p.contentDocument.document.body ? p.contentDocument.document.body.innerText : null;
                        f.responseXML = p.contentDocument.document.XMLDocument ? p.contentDocument.document.XMLDocument : p.contentDocument.document;
                    }
                }
            } catch (o) {
                jQuery.handleError(k, f, null, o);
            }
            if (f || l == "timeout") {
                c = true;
                let m;
                try {
                    m = l != "timeout" ? "success" : "error";
                    if (m != "error") {
                        let n = jQuery.uploadHttpData(f, k.dataType);
                        if (k.success) {
                            k.success(n, m);
                        }
                        if (k.global) {
                            jQuery.event.trigger("ajaxSuccess", [f, k]);
                        }
                    } else {
                        jQuery.handleError(k, f, m);
                    }
                } catch (o) {
                    m = "error";
                    jQuery.handleError(k, f, m, o);
                }
                if (k.global) {
                    jQuery.event.trigger("ajaxComplete", [f, k]);
                }
                if (k.global && !--jQuery.active) {
                    jQuery.event.trigger("ajaxStop");
                }
                if (k.complete) {
                    k.complete(f, m);
                }
                jQuery(p).unbind();
                setTimeout(function() {
                    try {
                        jQuery(p).remove();
                        jQuery(b).remove();
                    } catch (q) {
                        jQuery.handleError(k, f, null, q);
                    }
                }, 100);
                f = null;
            }
        };
        if (k.timeout > 0) {
            setTimeout(function() {
                if (!c) {
                    d("timeout");
                }
            }, k.timeout);
        }
        try {
            let b = jQuery("#" + j);
            jQuery(b).attr("action", k.url);
            jQuery(b).attr("method", "POST");
            jQuery(b).attr("target", h);
            if (b.encoding) {
                jQuery(b).attr("encoding", "multipart/form-data");
            } else {
                jQuery(b).attr("enctype", "multipart/form-data");
            }
            jQuery(b).submit();
        } catch (g) {
            jQuery.handleError(k, f, null, g);
        }
        jQuery("#" + h).load(d);
        return {
            abort: function() {}
        };
    },
    uploadHttpData: function(r, type) {
        let data = !type;
        data = type == "xml" || data ? r.responseXML : r.responseText;
        if (type == "script") {
            jQuery.globalEval(data);
        }
        if (type == "json") {
            eval('data = "' + data + '"');
        }
        if (type == "html") {
            jQuery("<div>").html(data).evalScripts();
        }
        return data;
    },
    handleError: function(b, d, a, c) {
        if (b.error) {
            b.error.call(b.context || b, d, a, c);
        }
        if (b.global) {
            (b.context ? jQuery(b.context) : jQuery.event).trigger("ajaxError", [d, b, c]);
        }
    }
});