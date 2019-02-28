/*!
 * reasy-ui.js v1.0.5 2015-06-19
 * Copyright 2015 ET.W
 * Licensed under Apache License v2.0
 *
 * The REasy UI for router, and themes built on top of the HTML5 and CSS3..
 */
"use strict";
document.querySelector = document.querySelector || function(selector) {
    let $node = $(selector);
    if ($node.length > 0) {
        return $node[0];
    }
    return;
};

let rnative = /^[^{]+\{\s*\[native code/,
    _ = window._;


/**
 * jquery 数据操作拓展
 */

// ReasyUI 全局变量对象
$.reasyui = {};

// 记录已加载的 REasy模块
$.reasyui.mod = 'core ';

// ReasyUI 多语言翻译对象
$.reasyui.b28n = {};

$.getType = function(val) {
    return Object.prototype.toString.call(val);
};

// // 全局翻译函数
// if (!_) {
//     window._ = _ = function(str, replacements) {
//         let ret = $.reasyui.b28n[str] || str,
//             len = replacements && replacements.length,
//             count = 0,
//             index;

//         if (len > 0) {
//             while ((index = ret.indexOf('%s')) !== -1) {
//                 ret = ret.substring(0, index) + replacements[count] +
//                     ret.substring(index + 2, ret.length);
//                 count = ((count + 1) === len) ? count : (count + 1);
//             }
//         }

//         return ret;
//     };
// }

// HANDLE: When $ is jQuery extend include function 
if (!$.include) {
    $.include = function(obj) {
        $.extend($.fn, obj);
    };
}

$.extend({
    keyCode: {
        ALT: 18,
        BACKSPACE: 8,
        CAPS_LOCK: 20,
        COMMA: 188,
        COMMAND: 91,
        COMMAND_LEFT: 91, // COMMAND
        COMMAND_RIGHT: 93,
        CONTROL: 17,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        INSERT: 45,
        LEFT: 37,
        MENU: 93, // COMMAND_RIGHT
        NUMPAD_ADD: 107,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        NUMPAD_ENTER: 108,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_SUBTRACT: 109,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SHIFT: 16,
        SPACE: 32,
        TAB: 9,
        UP: 38,
        WINDOWS: 91 // COMMAND
    },
    //创建伪Guid，用法:$.IGuid()
    IGuid: function(len, radix) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
        var uuid = [],
            i;
        len = len || 8;
        radix = radix || chars.length;

        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];
        }

        return uuid.join('');
    },

    isNotNullOrEmpty: function(str) {
        if (typeof str === "undefined" || str === "") {
            return false;
        }
        return true;
    },

    //设置文本框中光标位置，ctrl为你要设置的输入框，pos为位置
    setCursorPos: function(ctrl, pos) {
        let range;

        if (ctrl.setSelectionRange) {
            ctrl.focus();
            ctrl.setSelectionRange(pos, pos);
        } else if (ctrl.createTextRange) {
            range = ctrl.createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }

        return ctrl;
    },

    getUtf8Length: function(str) {
        let totalLength = 0,
            charCode,
            len = str.length,
            i;

        for (i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode < 0x007f) {
                totalLength++;
            } else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
                totalLength += 2;
            } else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
                totalLength += 3;
            } else {
                totalLength += 4;
            }
        }
        return totalLength;
    },

    /**
     * For feature detection
     * @param {Function} fn The function to test for native support
     */
    isNative: function(fn) {
        return rnative.test(String(fn));
    },

    isHidden: function(elem) {
        if (!elem) {
            return;
        }

        return $.css(elem, "display") === "none" ||
            $.css(elem, "visibility") === "hidden" ||
            (elem.offsetHeight == 0 && elem.offsetWidth == 0);
    },

    getValue: function(elem) {
        if (typeof elem.value !== "undefined") {
            return elem.value;
        } else if ($.isFunction(elem.val)) {
            return elem.val();
        }
    }
});

/* Cookie */
$.cookie = {
    get: function(name) {
        let cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieEnd = document.cookie.indexOf(';', cookieStart),
            cookieValue = null;

        if (cookieStart > -1) {
            if (cookieEnd === -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart +
                cookieName.length, cookieEnd));
        }
        return cookieValue;
    },
    set: function(name, value, path, domain, expires, secure) {
        let cookieText = encodeURIComponent(name) + "=" +
            encodeURIComponent(value);

        if (expires instanceof Date) {
            cookieText += "; expires =" + expires.toGMTString();
        }
        if (path) {
            cookieText += "; path =" + path;
        }
        if (domain) {
            cookieText += "; domain =" + domain;
        }
        if (secure) {
            cookieText += "; secure =" + secure;
        }
        document.cookie = cookieText;

    },
    unset: function(name, path, domain, secure) {
        this.set(name, '', path, domain, new Date(0), secure);
    }
};

$.isEqual = function(a, b) {
    for (let prop in a) {
        if ((!b.hasOwnProperty(prop) && a[prop] !== "") || a[prop] !== b[prop]) {
            return false;
        }
    }
    return true;
};

$.htmlEscape = function(str) {
    str = str + '';
    if (str) {
        str = str.replace(/\"/g, '&quot;').replace(/\'/g, '&#39;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    }
    return str;
};

// 继承
Function.prototype.inherit = function(parent, overrides) {
    let F = function() {},
        obj;
    F.prototype = parent.prototype;
    obj = new F();

    //重写基类的属性和方法
    if (overrides) $.extend(obj, overrides);
    obj.constructor = this;

    this.prototype = obj;
};

//扩展String的原型链
//去除前后空格
String.prototype.trim = function() {
    return this.replace(/(^\s+)|(\s+$)/g, "");
};
//去除字符串中所有的空格
String.prototype.trimAll = function() {
    return this.replace(/[ ]/g, "");
};

//去除前面的空格
String.prototype.trimBefore = function() {
    return this.replace(/^\s+/g, "");
};

//去除后面的空格
String.prototype.trimEnd = function() {
    return this.replace(/\s+$/g, "");
};

/**
 * 对象克隆
 * @param  {[type]} myObj [description]
 * @return {[type]}       [description]
 */

function objClone(myObj) {
    if (typeof(myObj) != 'object') return myObj;
    if (myObj === null) return myObj;
    let myNewObj = {};
    for (let i in myObj)
        myNewObj[i] = objClone(myObj[i]);
    return myNewObj;
}
/**
 * 拓展数组对象深度克隆
 * @return {[type]} [description]
 */
Array.prototype.clone = function() { //为数组添加克隆自身方法，使用递归可用于多级数组
    let newArr = [];
    for (let i = 0; i <= this.length - 1; i++) {
        let itemi = this[i];
        if (itemi.length && itemi.push) itemi = itemi.clone(); //数组对象，进行递归
        else if (typeof(itemi) == "object") itemi = objClone(itemi); //非数组对象，用上面的objClone方法克隆
        newArr.push(itemi);
    }
    return newArr;
};

Array.prototype.map = Array.prototype.map || function(cb) {
    let newArr = [];
    for (let i = 0; i <= this.length - 1; i++) {
        newArr.push(cb(this[i]));
    }
    return newArr;
};

if (!Array.prototype.indexOf) { //解决IE8不支持数组使用indexOf方法
    Array.prototype.indexOf = function(searchStr) {
        let len = this.length || 0;
        let from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0) {
            from += len;
        }

        for (; from < len; from++) {
            if (from in this && this[from] === searchStr)
                return from;
        }
        return -1;
    };
}

/**
 * AJAX
 */
$.GetSetData = {
    getData: function(data, handler, url = '/goform/module', type = 'post') {
        if (url.indexOf("?") < 0) {
            // url += "?" + (new Date().getTime());
            let key = '?';
            for (let t in data) {
                key += t + '&';
            }
            url += key;
        }

        if (data) {
            data = JSON.stringify(data);
        }

        return $.ajax({
            url: url,
            cache: false,
            type: type,
            dataType: "text",
            data: data,
            contentType: "application/json",
            async: true,
            success: function(data, status) {
                _handleResult(data);

                if (typeof handler == "function") {
                    data = JSON.parse(data);
                    handler.call(this, data);
                }
            },
            error: function(msg, status) {},
            complete: function(xhr) {
                xhr = null;
            }
        });
    },
    //跨域请求
    getDataCROS: function(data, handler, url = '/goform/module', type = 'post') {
        if (url.indexOf("?") < 0) {
            url += "?" + (new Date().getTime());
        }

        if (data) {
            data = JSON.stringify(data);
        }

        $.ajax({
            url: url,
            cache: false,
            type: type,
            dataType: "text",
            data: data,
            contentType: "text/plain", //CORS跨域content-type只能为text/plain, multipart/form-data, application/x-www-form-urlencoded中的一个，否则就是非简单请求
            async: true,
            success: function(data, status) {
                _handleResult(data);

                if (typeof handler == "function") {
                    handler.call(this, data);
                }
            },
            error: function(msg, status) {

            },
            complete: function(xhr) {
                xhr = null;
            }
        });
    },
    setData: function(data, handler, url = '/goform/module', type = 'post', handleError = true) {
        $('#module-save').prop('disabled', 'disabled');
        if (url.indexOf("?") < 0) {
            url += "?" + (new Date().getTime());
        }
        if (data) {
            data = JSON.stringify(data);
        }
        //禁用提交按钮
        $('.md-modal-wrap.md-show').find('.md-btn').not('.cancel').attr('disabled', true);

        $.ajax({
            url: url,
            cache: false,
            type: "post",
            dataType: "text",
            contentType: "application/json",
            async: true,
            data: data,
            success: function(data) {
                _handleResult(data);

                data = JSON.parse(data);
                //错误处理
                if (handleError) {
                    for (let key in data) {
                        if (data[key] === -1) {
                            //表示保存出错
                            $.formMessage(_("Save failed"));
                            return;
                        }
                    }
                }

                if ((typeof handler).toString() == "function") {
                    handler(data);
                }
            },
            complete: function() {
                $('#module-save').removeAttr('disabled');
                $('.md-toolbar').find('.md-btn').removeAttr('disabled');
            }
        });
    },
    setDataNoJson: function(data, handler, url = '/goform/module') {
        $.ajax({
            url: url,
            cache: false,
            type: "post",
            dataType: "text",
            async: true,
            data: data,
            success: function(data) {
                _handleResult(data);

                if ((typeof handler).toString() == "function") {
                    handler(data);
                }
            },
            complete: function() {
                $('#module-save').removeAttr('disabled');
                $('.md-toolbar').find('.md-btn').removeAttr('disabled');
            }
        });
    }
};

function _handleResult(data) {
    var version = (new Date().getHours()) + '' + (new Date().getMinutes());
    if (data.indexOf("login.js") > 0) {
        window.location.href = "login.html?v=" + version;
        return false;
    }
    if (data.indexOf("quickset.js") > 0) {
        window.location.href = "quickset.html?v=" + version;
        return false;
    }
}

/*!
 * REasy UI valid-lib @VERSION
 * http://reasyui.com
 *
 * 数据校验-正则匹配归类
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */
$.valid = {
    len: function(str, min, max) {
        let len = str.length;

        if (typeof min !== "undefined" && typeof max !== "undefined" && (len < min || len > max)) {
            return _("Range: %s to %s characters", [min, max]);
        }
    },

    byteLen: function(str, min, max) {
        let totalLength = $.getUtf8Length(str);

        if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) {
            return _("Range: %s to %s bytes", [min, max]);
        }
    },

    num: function(str, min, max) {
        if (min != "undefined" && min < 0) {
            if (!(/(^-[0-9]{1,}$)|(^[0-9]{1,}$)/).test(str)) {
                return _("Enter digits");
            }
        } else {
            if (!(/(^-[0-9]{1,}$)|(^[0-9]{1,}$)/).test(str)) {
                return _("Enter digits");
            }
        }
        if (typeof min != "undefined" && typeof max != "undefined") {
            if (parseInt(str, 10) < min || parseInt(str, 10) > max) {

                return _("Range: %s to %s", [min, max]);
            }
        }
    },

    ap: function(str) {
        if (!(/^[0-9a-zA-Z\u4e00-\u9fa5_.\s]+$/).test(str)) {
            return _("Digits, letters, dots (.), underscores (_), spaces, and Chinese characters are allowed.");
        }
    },
    apPwd: function(str) {
        if (str.length < 8 || str.length > 64) {
            return _("Range: 8 - 63 ASCII or 8 - 64 hexadecimal characters.");
        } else if (str.length === 64) {
            return $.valid.hex(str);
        } else {
            return $.valid.ascii(str, 8, 63);
        }
    },

    float: function(str, min, max) {
        let floatNum = parseFloat(str, 10);

        if (isNaN(floatNum)) {
            return _("Must be float");
        }
        if (typeof min != "undefined" && typeof max != "undefined") {
            if (floatNum < min || floatNum > max) {

                return _("Range: %s to %s", [min, max]);
            }
        }
    },
    url: function(str) {
        if (this.byteLen(str, 1, 64)) {
            return this.byteLen(str, 1, 64);
        }
        if (/^[-_~\|\#\?&\\\/\.%0-9a-z\u4e00-\u9fa5]+$/ig.test(str)) {
            if (!(/.+\..+/ig.test(str) || str == "localhost")) {
                return _("Invalid URL");
            }
        } else {
            return _("Invalid URL");
        }
    },
    authUrl: function(str) {
        var goUrl = "",
            strregex = /^((ht|f)tps?):\/\/[\w\\-]+(.[\w\\-]+)+([\w-,@?^=%&:\/~+#]*[\w-@?^=%&\/~.+#])?$/,
            re = new RegExp(strregex);

        if (str !== "") {
            goUrl = "http://" + encodeURI(str);
            if (!re.test(goUrl)) {
                return _("Invalid URL");
            }
        }
    },
    phoneNumber: function(str, len) {
        let ret = str,
            valid;
        len = len || 31;
        //不能为空
        if (ret == "") {
            return _("Enter a valid phone number");
        }

        //可能有+号，且只能在最前面
        if (ret.indexOf("+") !== -1) {
            if (ret.indexOf("+") !== 0) {
                return _("Enter a valid phone number");
            } else {
                ret = "0" + ret.slice(1);
            }
        }

        // ret = parseInt(ret,10);

        //只能是数字
        if (!(/^[0-9]{1,}$/).test(ret)) {
            return _("Enter a valid phone number");
        }

        //最长为31位
        valid = $.valid.byteLen(ret, 1, len);
        if (valid) {
            return _("Enter a valid phone number");
        }
    },
    messageUrl: function(str, minLen, maxLen) {
        let ret;
        str = str.toUpperCase();

        if (str.indexOf("HTTPS://") !== -1 || str.indexOf("HTTP://") !== -1) {
            ret = $.valid.ascii(str, minLen, maxLen);

            return ret;
        } else {
            return _("The URL of SMS gateway must begin with \"http://\" or \"https://\".");
        }
    },
    specailText: function(str, text, error) {
        str = str + '';
        if (str.indexOf(text) === -1) {
            return error;
        }
    },

    wanStream: function(str) {
        str = str + '';
        let r = new RegExp('^((0\\.([1-9]))|(([1-9]|[1-9]\\d)(\\.(\\d)?)?)|100|100\\.|100\\.0)$');
        if (!r.test(str)) {
            return _('Range: 0.1 to 100.0. Accurate to 1 decimal place.');
        }
    },

    domain: {
        all: function(str, min, max) {
            if (typeof min !== "undefined" && typeof max !== "undefined" && min <= max) {
                let totalLength = $.getUtf8Length(str);

                if (totalLength < min || totalLength > max) {
                    return _("Range: %s to %s bytes", [min, max]);
                }
            }

            if (!/^[\d\.]+$/.test(str)) {
                if (/^([\w-]+\.)*(\w)+$/.test(str))
                    return;
            } else {
                if (!$.valid.ip.all(str))
                    return;
            }
            return _("Enter a valid IP address or domain name.");


        }
    },

    //dns定向转发中域名的限制
    domain_special: function(str) {
        //长度不超过128字节
        var totalLength = $.getUtf8Length(str),
            hasStar = false, //是否有*号
            topName = ['com', 'net', 'org', 'info', 'edu', 'ac.cn', 'cn', 'wang', 'name', 'mobi', 'gov', 'club', 'mil', 'com.cn', 'edu.cn'], //目前平台支持的顶级域名
            ret;

        if (totalLength < 1 || totalLength > 128) {
            return _("Max. length of a domain name is 128 bytes.");
        }

        //域名中没有带“*”的情况，普通域名判断
        if (str.indexOf("*") == -1) {
            if (!/^[\d\.]+$/.test(str)) {
                if (/^([\w-]+\.)*(\w)+$/.test(str))
                    return;
            }
            return _("Enter a valid domain name");
        } else {
            //域名中带有通配符“*”，
            let domainArr = str.split("."),
                starIndex = domainArr.indexOf("*"),
                topNameStr;

            if (domainArr[0].toUpperCase().indexOf("HTTP") !== -1) {
                if (domainArr[0].toUpperCase() == "HTTP://*" || domainArr[starIndex].toUpperCase() == "HTTPS://*") {

                    topNameStr = domainArr[2];

                    if (topNameStr) {
                        let topNameLinkStr = domainArr[1] + "." + domainArr[2];

                        //没有主域名，错误范例：http://*.com.cn
                        if (topNameLinkStr == "com.cn" || topNameLinkStr == 'org.cn' || topNameLinkStr == "net.cn") {
                            return _("Enter a valid domain name");
                        }

                        //*后的第二位不是顶级域名，错我范例：http://*.baidu.ssss
                        if (topName.indexOf(topNameStr) == -1) {
                            return _("Enter a valid domain name");
                        }
                    } else { //没有顶级域名，错误范例：http://*.baidu
                        return _("Enter a valid domain name");
                    }

                    return;
                } else {
                    return _("Enter a valid domain name");
                }
            }

            if (starIndex !== -1) {
                topNameStr = domainArr[starIndex + 2];
                if (topNameStr) {
                    let topNameLinkStr = domainArr[starIndex + 1] + "." + domainArr[starIndex + 2];

                    //没有主域名，错误范例：*.com.cn
                    if (topNameLinkStr == "com.cn" || topNameLinkStr == 'org.cn' || topNameLinkStr == "net.cn") {
                        return _("Enter a valid domain name");
                    }

                    //*后的第二位不是顶级域名，错我范例：*.baidu.ssss
                    if (topName.indexOf(topNameStr) == -1) {
                        return _("Enter a valid domain name");
                    }
                } else { //没有顶级域名，错误范例：*.baidu
                    return _("Enter a valid domain name");
                }
            } else {
                //*不是单独成一个字段，错误范例：*xxx.baidu.com
                return _("Enter a valid domain name");
            }
        }
    },
    //dns劫持中域名的限制
    domainName: function(str) {

        let totalLength = $.getUtf8Length(str);
        if (totalLength > 128) {
            return _("Max. length of a domain name is 128 bytes.");
        }

        if (!/^[\d\.]+$/.test(str)) {
            if (/^([\w-]+\.)*(\w)+$/.test(str))
                return;
        }

        return _("Enter a valid domain name");

        /*let reg = /(^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$)|(^\*(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62}){2,}$)|(^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}\.\*(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$)/;
        if (!reg.test(str)) {
            return _("Domain name format error.");
        }*/
    },
    mac: {
        all: function(str) {
            if (!(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/).test(str)) {
                return _("MAC address format: XX:XX:XX:XX:XX:XX");
            }

            let subMac1 = str.split(':')[0];
            if (subMac1.charAt(1) && parseInt(subMac1.charAt(1), 16) % 2 !== 0) {
                return _("The second character of a MAC address must be an even number.");
            }
            if (str === "00:00:00:00:00:00") {
                return _("The MAC address cannot be 00:00:00:00:00:00.");
            }
        }
    },

    ip: {
        all: function(str) {
            let ret = this.specific(str);

            if (ret) {
                return ret;
            }

            if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/).test(str)) {
                return _("Please enter a valid IP address.");
            }
        },
        ipnet: function(str) {
            var ret = this.specific(str);

            if (ret) {
                return ret;
            }

            if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/).test(str)) {
                return _("Enter a valid network segment or IP address");
            }
        },
        specific: function(str) {
            let ipArr = str.split('.'),
                ipHead = ipArr[0];

            if (ipArr[0] === '127') {
                return _("Valid range: 1 to 223, excluding 127");
            }
            if (ipArr[0] > 223) {
                return _("Valid range: 1 to 223, excluding %s", [ipHead]);
            }
        }
    },
    privateIP: function(str) {
        var reg = /^((10\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d))|(172\.(1[6-9]|2\d|3[0-1]))|(192\.168))\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)\.(25[0-4]|2[0-4]\d|1\d\d|[1-9]\d|[1-9])$/;
        if (!reg.test(str)) {
            return _('Enter a valid private IP address');
        }
    },

    ipSegment: {
        all: function(str) {
            //不能以127开头
            if (/^(127)/.test(str)) {
                return _("Enter a valid network segment");
            }

            if (!(/^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}(0|128|192|224|240|252|254)$/).test(str)) {
                return _("Enter a valid network segment");
            }
        }
    },
    //判断输入IP地址与lanIP是否在同一个网段
    netSegmentCheck: {
        all: function(inputIP, lanIP, mask) {
            var res1 = [],
                res2 = [];
            if (lanIP === inputIP) {
                return _("It cannot be the same as the LAN IP address");
            }
            inputIP = inputIP.split(".");
            lanIP = lanIP.split(".");
            mask = mask.split(".");

            for (var i = 0, len = inputIP.length; i < len; i += 1) {
                res1.push(parseInt(inputIP[i]) & parseInt(mask[i]));
                res2.push(parseInt(lanIP[i]) & parseInt(mask[i]));
            }
            if ((res1.length !== 4) || (res2.length !== 4)) {
                //necessary.传递给type ip验证
            } else if (res1.join(".") !== res2.join(".")) {
                return _("It must belong to the same network segment as that of the LAN IP address");
            }

            // return $.valid.ip.all(inputIP);
        }
    },

    dns: function() {},

    mask: function(str) {
        let rel = /^(254|252|248|240|224|192|128)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$/;
        if (!rel.test(str)) {
            return _("Enter a valid subnet mask");
        }
    },

    email: function(str) {
        // let rel = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let rel = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (!rel.test(str)) {
            return _("Enter a valid Email address");
        }

    },
    smtpAccount: function(str) {
        // 首先判断是否是IP地址
        if (!$.valid.ip.all(str)) {
            var start = +str.split('.')[0];
            if (start === 127 || (start >= 224 && start <= 255)) {
                return _("Enter a valid Server address");
            }
        } else {
            // let rel = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            let rel = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
                relDomain = /^([\w-]+\.)*(\w)+$/;
            if (!rel.test(str) && !relDomain.test(str)) {
                return _("Enter a valid Server address");
            }
        }
    },

    time: function(str) {
        let dateAndTime = str.split("");
        let date = dateAndTime[0];
        let time = dateAndTime[1];
        let datePattern = /^((((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9]))|(([2468][048]00)([-\/\._])(0?2)([-\/\._])(29))|(([3579][26]00)([-\/\._])(0?2)([-\/\._])(29))(([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)))$/;
        let timePattern = /^(((0|1)\d)|(2[0-3]))(:([0-5]\d)){2}$/;
        if (!(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/).test(str)) {
            return _("Valid format: YYYY-MM-DD HH:MM:SS");
        } else if (!(datePattern.test(date)) || !(timePattern.test(time))) {
            return _("Please enter a valid time.");
        }

    },

    hex: function(str) {
        if (!(/^[0-9a-fA-F]{1,}$/).test(str)) {
            return _("Only hexadecimal characters are allowed.");
        }
    },

    /**
     * 检测是否包含全角字符
     * @param  {[type]} str [待检测字符串]
     * @return {[type]}     [true：包含全角字符 false:不包含]
     */
    chkHalf: function(str) {
        for (let i = 0; i < str.length; i++) {
            let strCode = str.charCodeAt(i);
            if ((strCode > 65248) || (strCode == 12288)) {
                return _("Full-width characters are not allowed.");
                break;
            }
        }
    },

    ascii: function(str, min, max) {
        /*chkHalf*/
        for (let i = 0; i < str.length; i++) {
            let strCode = str.charCodeAt(i);
            if ((strCode > 65248) || (strCode == 12288)) {
                return _("Full-width characters are not allowed.");
                break;
            }
        }

        if (!(/^[ -~]+$/g).test(str)) {
            return _("Please enter non-Chinese characters.");
        }
        if (min || max) {
            return $.valid.len(str, min, max);
        }
    },

    pwd: function(str, minLen, maxLen) {
        let ret;

        if (!(/^[0-9a-zA-Z_]+$/).test(str)) {
            return _("Digits, letters, and underscores are allowed.");
        }

        if (minLen && maxLen) {
            ret = $.valid.len(str, minLen, maxLen);
            if (ret) {
                return ret;
            }
        }
    },

    username: function(str, min, max) {
        let totalLength = $.getUtf8Length(str);

        if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) {
            return _("Range: %s to %s bytes", [min, max]);
        }

        if (!(/^[0-9a-zA-Z\u4e00-\u9fa5_]+$/).test(str)) {
            return _("Digits, letters, underscores, and Chinese characters are allowed.");
        }
    },

    ssidPasword: function(str, minLen, maxLen) {
        let ret;
        ret = $.valid.ascii(str);
        if (!ret && minLen && maxLen) {
            ret = $.valid.len(str, minLen, maxLen);
            if (ret) {
                return ret;
            }
        }

        return ret;
    },

    specialChar: function(str, banStr) {
        let len = banStr.length,
            curChar,
            i;

        for (i = 0; i < len; i++) {
            curChar = banStr.charAt(i);
            if (str.indexOf(curChar) !== -1) {
                return _("%s is disallowed", [banStr.split("").join("")]);
            }
        }
    },

    remarkTxt: function(str, min, max) {
        let totalLength = str.length,
            ret;
        if (min && max) {
            ret = $.valid.byteLen(str, min, max);
            if (ret) {
                return ret;
            }
        }

        if (!(/^[0-9a-zA-Z\u4e00-\u9fa5_\s]+$/).test(str)) {
            return _("Digits, letters, underscores, spaces, and Chinese characters are allowed.");
        }
    },

    noBlank: function(str) {
        if ((/\s/).test(str)) {
            return _("Spaces are disallowed");
        }
    },

    charTxt: function(str) {
        if (!(/^[0-9a-zA-Z]+$/).test(str)) {
            return _("Enter digits or letters");
        }
    },

    ssidNoBlank: function(str) {
        if ((/^\s|\s$/).test(str)) {
            return _("The first and last characters of the SSID cannot be spaces.");
        }
    },
    hostName: function(str) {
        if ((/[\s\'\"\.]/).test(str)) {
            return _("Space, dot(.), single quotation marks ('') and double quotation marks (\"\") are disallowed in a host name.");
        }
    },
    //服务器名和服务名
    serverName: function(str, minLen, maxLen) {
        let ret;

        if (!(/^[0-9a-zA-Z_-]+$/).test(str)) {
            return _("Digits, letters, underscores and hyphens are allowed.");
        }

        if (minLen && maxLen) {
            ret = $.valid.len(str, minLen, maxLen);
            if (ret) {
                return ret;
            }
        }
    },
    lanMask(str) {
        let reg = /^(254|252|248|240|224|192|128)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(252|248|240|224|192|128|0))$/;

        if (!reg.test(str)) {
            return _("Enter a valid subnet mask");
        }
    },
    // 不允许有空格
    nospace(str) {
        if (/\s/.test(str)) {
            return _("A space is not allowed.");
        }
    }
};