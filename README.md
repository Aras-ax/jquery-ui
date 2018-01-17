# Reasy-UI
Form表单组件库
项目中直接引用

# 组件使用说明书

------

> 原子组件：文本框，下拉框，开关，checkBoxList，radioList，自定义下拉框，日历
> 功能组件：，消息提示框，弹出框，纯文本信息展示，table

#### 注：所有组件兼容到IE8，jQuery版本使用1.X兼容IE8的版本

# BaseComponent

所有的原子组件都继承自该基类，拥有该基类的所有属性和方法。支持自定义事件的绑定，解绑，实现自身的业务逻辑。以下为所有原子组件都拥有的属性和方法。

## 1. 公共配置参数
>属性名称既可以通过标签属性配置也可以通过参数传递。当以标签属性形式配置时，需要用驼峰法配置属性名称（例如：`dataKey` 对应属性名称 `data-key`），同时在标签和参数里面配置相同属性时，标签属性的优先级较低

| 属性名称    | 描述     | 值类型  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| dataKey    | 组件类型(必填) |  string  | -- |
| dataField   | 组件对应的数据字段 |  string  | -- |
| dataTitle   | 组件左侧显示标题(为空则表示不显示标题) |  string  | -- |
| editable    | 是否可编辑，为false则自动加上disabled属性 |  bool  | true |
| visible     | 是否可见   |  bool  | true |
| ignore      | 是否忽略,   |  bool  | false |
| css    | 自定义样式皮肤 |  string  | -- |
| required    | 是否必填 |  bool  | true |
| autoValidate| 数据修改后是否自动调用数据校验 | bool | true |
| defaultValue    | 默认值/初始值 |  取决于组件  | "" |
| dataValueType| 组件的值类型 | 基础数据类型 |--|
| description    | 组件尾部描述信息 |  string  | -- |
| changeCallBack    | 组件数据改变回调 |  function  | -- |
| validateCallBack    | 组件数据校验回调 |  function  | -- |
| validateCustom(text)|自定义错误信息显示方式| function | -- |
| renderedCallBack|组件渲染完成后回调| function | -- |

> 强调说明
> 1. dataValueType: 设置组件返回值类型，比如设置为`num`则返回整型数据
> 2. visible：控制组件的显示和隐藏，设置为`false`，则该控件不会进行数据校验等操作，但是在`componentManage`中进行`getValue()`操作不会被忽略
> 3. ignore：组件是否被忽略，不控制组件的显示和隐藏状态，设置为`false`，则在`componentManage`中进行`getValue()`操作时会忽略该组件，不会进行取值数据提交操作
> 4. validateCustom(text):自定义错误信息提示方式，定义了该参数则不会显示默认的错误提示样式，参数为需要显示的错误信息，当text为空时不显示任何错误信息或者移除已显示的错误信息。
> 5. changeCallBack:组件值改变回调函数，只有数据校验成功的情况下才执行该回调，函数内部this指向当前组件实例
> 6. validateCallBack:数据校验回调函数,有错则返回出错语句，否则为校验成功，函数内部this指向当前组件实例
> 7. renderedCallBack:组件渲染完成后的回调函数，函数内部this指向当前组件实例
> 8. dataKey:以组件名称显示调用的情况下可不填

## 2. 公共方法
| 方法名称   | 描述   |  参数| 返回值  |
| :--------   | :-----:  | :----:  |  :----:  | 
| getValue() | 取值 |  --  | -- |
| setValue(v) | 赋值 | 组件的值 | -- |
| setEditable(v)| 编辑只读状态切换 | true:可写，false：只读 | |
| setVisible(v) | 可见切换 | true:可见，false：隐藏 | -- |
| setIgnore(v) | 忽略切换 | true:忽略，false：不忽略 | -- |
| reset() | 重置组件的值 | -- | -- |
| show() | 显示该组件 | -- | -- |
| hide() | 隐藏组件 | -- | -- |
| toggle() | 显示/隐藏 | -- | -- |
| addValidateText(text) | 显示错误信息 | string | -- |
| removeValidateText() | 移除错误提示信息| -- | -- |
| bindValidateEvent(fc) | 绑定自定义校验   | function | -- | 
| bindChangeEvent(fc) | 绑定自定义`change`事件 | function | -- | 
| unBindEvent(key) | 解绑事件 | 事件对应的key | -- |
| 其它方法    | -- |  --  | 
> 强调说明：
> 1. show，hide，toggle只做组件的显示隐藏处理，对组件的其它功能属性没有任何影响
> 2. bindValidateEvent,bindChangeEvent参数的返回值同上面属性的介绍

## 3. 调用形式（以FormInput为例）

* Rcomponent调用时传递参数
```javascript
<div id="demo1" data-key="FormInput"></div>
...
$("#demo1").Rcomponent({
    dataTitle:'传递参数形式',
    dataField:'demo',
    ......
});
```
> 属性写在调用参数里面,推荐使用这种形式

* Rcomponent 标签属性传递参数
```javascript
<div id="demo1" data-key="FormInput" data-field="name"  type="email"></div>
......
$("#demo1").Rcomponent();
```
> 属性全部写在标签属性里面，框架去解析所有的配置属性

* 组件名称显示调用
```javascript
<div id="demo1" ></div>
...
$("#demo1").FormInput({
	dataKey:'FormInput',
	dataField:'input',
	placeholder:'XXXXX',
	......
});
```
>通过组件名称形式条用，配置参数同第一种形式
> 以上三种调用形式为常用的调用形式，其它调用形式暂不列出，仅供框架内部调用

## 4. 公共属性方法使用demo
```
<!-- html模板 -->
<div id="tk" data-key="FormInput"></div>
```
* 无标题
```
$("#tk").Rcomponent({
	dataField:'username',
	placeholder:"普通文本测试"
});
```
* 有标题
```
$("#tk").Rcomponent({
	dataField:'username',
	dataTitle:"普通文本",
	placeholder:"普通文本测试"
});
```
* 有description描述信息
```
$("#tk").Rcomponent({
	dataField:'username',
	dataTitle:"普通文本",
	description:'介个是描述信息',
	placeholder:"普通文本测试"
});
```
* 自定义数据校验逻辑
```
$("#tk").Rcomponent({
	dataField:'username',
	dataTitle:"普通文本",
	placeholder:"请输入大于100的数字",
	type:"number",
	validateCallBack:function(){
		var value = this.getValue();
		if(value < 100){
			alert("请输入大于100的数字");
		}
	}
});
```
* 自定义change逻辑
```
$("#tk").Rcomponent({
	dataField:'username',
	dataTitle:"普通文本",
	placeholder:"随意",
	type:"text",
	changeCallBack:function(){
		var value = this.getValue();
		alert(value);
	}
});
```
* add自定义校验逻辑，change逻辑
```
var $tk = $("#tk").Rcomponent({
	dataField:'username',
	dataTitle:"普通文本",
	placeholder:"大于100",
	type:"number"
});

$tk.bindValidateEvent("change",function(){
	var value = this.getValue();
	if(value < 100){
		alert("请输入大于100的数字");
	}
}).bindChangeEvent("change",function(){
	alert("change啦！");
})
```

---
# 文本框组件
支持普通文本，密码文本，指定的文本校验格式，只读状态与编辑状态切换
```
<!-- html模板 -->
<input id="forminput" data-key="FormInput">
```
##  特有的属性，方法

| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| type | 文本框类型| string | text |
| placeholder | 提示语句| string | -- |
| displayMode | 显示类型 |  readonly，edit，readEdit  | edit |
| removeSpace | getValue时是否移除首尾空格 |  bool  | false |
| hasEyes     |   是否有眼睛图标显示，只有在type为password的情况下才有效 |  bool  | false |
| defaultText | displayMode:readEidt时值为空显示的默认文本  |  string  | -- |
| dataOptions | 数据校验格式例如：[{type:"num",args:[1,32]}] |  object  | -- |
| switchCallBack |displayMode:readEidt时,切换显示模式回调函数,this指向当前组件实例  |  function  | -- |
| focusCallBack | 文本框获取焦点回调,this指向当前组件实例  |  function  | -- |

##  使用
### 1. 普通文本
```
$("#formInput1").Rcomponent({
	dataKey:"FormInput",
	dataField:'username',
	dataTitle:"普通文本",
	placeholder:"普通文本测试"
});
```
### 2. 密码输入框
```
$("#formInput2").Rcomponent({
	dataKey:"FormInput",
	dataField:'username',
	dataTitle:"密码文本",
	placeholder:"密码文本测试",
	type:"password"
});
```
### 3. 密码输入框 - hasEyes:true
```
$("#formInput3").Rcomponent({
	dataKey:"FormInput",
	dataField:'username',
	dataTitle:"密码文本",
	placeholder:"密码文本测试",
	type:"password",
	hasEyes:true
});
```
### 4. 只读模式
```
$("#formInput4").Rcomponent({
	dataKey:"FormInput",
	dataField:'username',
	dataTitle:"只读模式",
	displayMode:"readonly",
	defaultValue:"只读"
});
```
### 5. 切换模式, defaultText，switchCallBack
```
$("#formInput5").Rcomponent({
	dataKey:"FormInput",
	dataField:'username',
	dataTitle:"切换模式",
	placeholder:"切换模式测试",
	displayMode:"readEdit",
	required:false,
	defaultText:"未知数据",
	switchCallBack:function(){
	    console.log("切换显示模式为：" + this.displayMode);
	}
});
```
### 6. 数据校验模式
```
$("#formInput6").Rcomponent({
	dataKey:"FormInput",
	dataField:'username',
	dataTitle:"普通文本",
	placeholder:"请输入1-6位整数",
	dataOptions:[{type:"num",args:[1,6]}]
});
```
### 7. removeSpace，focusCallBack
```
$("#formInput7").Rcomponent({
	dataKey:"FormInput",
	dataField:'username',
	dataTitle:"去除首尾空格",
	placeholder:"removeSpace",
	removeSpace: true,
	focusCallBack:function(){
	    console.log("focus");
	    console.log(this.value);
	}
});
```
> 其它API遵循BaseComponent的API进行使用

---
# 下拉框组件(FormSelect)
支持下拉框选项的添加，删除，修改等操作
```
<!-- html模板 -->
<select id="formselect" data-key="FormSelect"></select>
```
##  特有配置属性，方法
| 属性名称     | 描述       |  值类型/范围  | 默认值 |
| :--------    | :-----:    | :----:  | :----:  |
| selectArray  | 下拉可选项 |  array或object | [] |
| hasNullItem  | 是否包含空选择项 |  bool  | false |
| nullText     | 空选择项显示文本 |  string  | -- |

| 方法名称     | 描述       |  参数说明 |
| :--------    | :-----:    | :----:  |
| removeItem(key)  | 移除下拉项 |  string或array  |
| addItem(key)  | 增加下拉选项 |  string,array或object    |

##  使用
### 1. 基础使用-selectArray为array
```
var $ts = $("#formselect1").Rcomponent({
	dataTitle:"selectArray为数组",
	dataField:"formselect1",
	defaultValue:"test2",
	selectArray:['test1', 'test2', 'test3', 'test4'],
	changeCallBack:function(){
		console.log(this.value);
	}
});
```
### 2. selectArray为object
```
$("#formselect2").Rcomponent({
	dataTitle:"selectArray为对象",
	dataField:"formselect2",
	defaultValue:3,
	selectArray:{1:'test1', 2:'test2', 3:'test3', 4:'test4'},
	changeCallBack:function(){
		console.log(this.value);
	}
});
```
### 3. removeItem
```
$ts.removeItem("test2");
$ts.removeItem(["test3","test4"]);
```

### 4. addIem
```
$ts.addItem("test5");
$ts.addItem("test6","test哈哈");
$ts.addItem({a:1,b:2});
```
> 其它API遵循BaseComponent的API进行使用

---
# checkboxlist组件（FormCheckList）
多个checkbox排列显示，支持添加和删除项
```
<!-- html模板 -->
<div id="formchecklist" data-key="FormCheckList"></div>
```
##  特有配置属性，方法
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| selectArray | check列表 | array或object  | [] |

| 方法名称     | 描述       |  参数说明 |
| :--------    | :-----:    | :----: |
| removeItem  | 移除可选项 |  string或array |
| addItem  | 增加可选项 |  string，array或object |
##  使用
### 1. 基础使用-selectArray为array
```
var $tc = $("#formchecklist").Rcomponent({
	dataTitle:"formchecklist",
	dataField:"formchecklist",
	defaultValue:"test1",
	selectArray:['test1', 'test2', 'test3', 'test4'],
	changeCallBack:function(){
		console.log(this.value);
	}
});
```
### 2. selectArray为object
```
var $tc = $("#formchecklist").Rcomponent({
	dataTitle:"formchecklist",
	dataField:"formchecklist",
	defaultValue:"test1",
	selectArray:{test1:"test1", test2:"test2", test3:"test3", test4:"test4"},
	changeCallBack:function(){
		console.log(this.value);
	}
});
```
### 3. removeItem(key)
```
$tc.removeItem("test2");
$tc.removeItem(["test3","test4"]);
```
### 4. addItem(key)
```
$tc.addItem("test5");
$tc.addItem("test6","test哈哈");
```

> 其它API遵循BaseComponent的API进行使用

---
# radiolist组件(FormRadioList)
支持下拉框选项的添加，删除，修改等操作
```
<!-- html模板 -->
<div id="formradiolist" data-key="FormRadioList"></div>
```
##  特有配置属性，方法
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| selectArray | check列表 | array/object  | [] |

| 方法名称     | 描述       |  参数说明 |
| :--------    | :-----:    | :----: |
| removeItem  | 移除可选项 |  string或array |
| addItem  | 增加可选项 |  string，array或object |
##  使用
### 1. 基础使用-selectArray为array
```
var $tr = $("#formradiolist").Rcomponent({
	dataTitle:"FormRadioList",
	dataField:"FormRadioList",
	defaultValue:"test1",
	selectArray:['test1', 'test2', 'test3', 'test4'],
	changeCallBack:function(){
		console.log(this.value);
	}
});
```
### 2. selectArray为object
```
var $tr = $("#formradiolist").Rcomponent({
	dataTitle:"FormRadioList",
	dataField:"FormRadioList",
	defaultValue:"test1",
	selectArray:{test1:"test1", test2:"test2", test3:"test3", test4:"test4"}
});
```
### 3. removeItem(key)
```
$tc.removeItem("test2");
$tc.removeItem(["test3","test4"]);
```
### 4. addItem(key, value)
```
$tc.addItem("test5");
$tc.addItem("test6","test哈哈");
```

> 其它API遵循BaseComponent的API进行使用

---
# 开关组件（FormCheckbox）
支持on，off两种状态
```
<!-- html模板 -->
<div id="formcheckbox" data-key="FormCheckbox"></div>
```
##  特有配置属性，方法
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| text    | 显示文本 |  string  | null |

##  使用
### 1. 基础使用--无文本
```
var $tcb = $("#formcheckbox").Rcomponent({
	dataTitle:"FormCheckbox",
	dataField:"formcheckbox",
	changeCallBack:function(){
		// $("#getvalue").toggle();
	}
});
```
### 2. 基础使用--有文本
```
var $tcb = $("#formcheckbox").Rcomponent({
	dataTitle:"FormCheckbox",
	dataField:"formcheckbox",
	text:"this is text",
	changeCallBack:function(){
		// $("#getvalue").toggle();
	}
});
```
> 其它API遵循BaseComponent的API进行使用
---

---
# 自定义下拉组件（FormDropDownList）
```
<!-- html模板 -->
<div id="formDropDownList" data-key="FormDropDownList"></div>
```
## 特有配置属性，方法
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| selectArray    | 可选配置项 |  array或object  | null |
| dataOptions    | 数据校验配置项(customText不为空时才有效) |  array或object  | null |
| clickCallBack    | 下拉框展开收起回调 |  function  | null |
| showSelfText    | 显示自定义的文本，与selectArray值无关，只做显示用 |  string  | null |
| customText    | 自定义选项文本，若该字段不为空，则表示有自定义选项 |  string  | null |
| focusCallBack    | 自定义情况下文本框获取焦点回调函数(customText不为空时才有效) |  function  | null |

## 使用
### 1. selectArray
```
var $tcb = $("#formDropDownList").Rcomponent({
    dataValueType:"num",
    showSelfText:QOSTEXT[qosPolicy],
    customText:_("Manual (Unit: KB/s)"),
    dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"},
    clickCallBack:function(){
        //移除定时器
        switchQosTimeout(false);
    },
    focusCallBack:function(){
        switchQosTimeout(false);
    },
    changeCallBack:function(){
    },
    renderedCallBack:function(){
    }
});
```
### 2. dataOptions
```
var $tcb = $("#formDropDownList").Rcomponent({
    dataValueType:"num",
    customText:_("Manual (Unit: KB/s)"),
    dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"}
});
```
### 3. clickCallBack
```
var $tcb = $("#formDropDownList").Rcomponent({
    dataValueType:"num",
    customText:_("Manual (Unit: KB/s)"),
    dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"},
    clickCallBack:function(){
        //移除定时器
        switchQosTimeout(false);
    },
    focusCallBack:function(){
        switchQosTimeout(false);
    }
});
```
### 4. showSelfText
```
var $tcb = $("#formDropDownList").Rcomponent({
    dataValueType:"num",
    showSelfText:QOSTEXT[qosPolicy],
    dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"}
});
```
### 5. customText
```
var $tcb = $("#formDropDownList").Rcomponent({
    customText:_("Manual (Unit: KB/s)"),
    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"},
    clickCallBack:function(){
        //移除定时器
        switchQosTimeout(false);
    }
});
```
### 6. focusCallBack
```
var $tcb = $("#formDropDownList").Rcomponent({
    dataValueType:"num",
    customText:_("Manual (Unit: KB/s)"),
    dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"},
    focusCallBack:function(){
        switchQosTimeout(false);
    }
});
```
> 其它API遵循BaseComponent的API进行使用
---

---
# 日历组件（FormCalendar）
```
<!-- html模板 -->
<input type="text" id="formCalendar" data-key="FormCalendar">
```
## 特有配置属性，方法
| 属性名称    | 描述         |  值类型/范围  | 默认值 |
| :--------   | :-----:      | :----:        | :----: |
| hasWeekday  | 是否显示星期 |  bool         | false  |
| startYear   | 日历开始时间 |  num          | 1970   |
| endYear     | 日历结束时间 |  num          | 2037   |
| scanAble    | 是否可输入   |  bool         | true   |

##  使用
### 1. 基础使用
```
var $tcb = $("#formCalendar").Rcomponent({
	dataTitle:"日历组件",
	dataField:"formCalendar",
	hasWeekday:true
	}
});
```
> 其它API遵循BaseComponent的API进行使用
---

---
# 选项卡组件（FormTab）
```
<!-- html模板 -->
<div id="formTab" data-key="FormTab"></div>
```
## 特有配置属性，方法
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| selectArray    | 按钮配置项 |  object或array  | false |

##  使用
### 1. 基础使用
```
var$("#formtab").Rcomponent({
    selectArray:{1:_("Online Devices"), 2:_("Blacklist")},
    dataValueType:"num",
    defaultValue:1, //默认选中的按钮项
    changeCallBack:function(){
        switch(this.value){
            case 1:{
                //xxx
            }break;
            case 2:{
                //xxx
            }break;
        }
    }
});
```
> 其它API遵循BaseComponent的API进行使用
---

# 功能组件
---
# 消息提示框组件 ($.FormMessage)
消息提示框，几秒钟后自动消失

## 配置属性参数
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| message    | 消息内容 |  string | -- |
| hideTime    | 消失淡出时间，毫秒 |  number  | 300 |
| displayTime | 展示时间，毫秒，为0表示不关闭  |  number  | 1000 |
| opacity | 消息框透明度 | 0~1 | 0.8 |
| callback   | 消息框显示回调   |  function  | -- |

##  可使用方法
| 方法名称        | 描述   |  参数 |
| :--------   | :-----:  | :----:  |
| setMess(mess) | 设置消息内容 |  mess:字符串 |
| hide    | 隐藏消息提示框,隐藏后对应的node节点会在整个文档流中移除 | -- |
        
##  使用
### 1. 基础使用
```
$.FormMessage({
    message:"消息",
    callback：function(){
    }
})
```
---
# 弹出框组件（$.modalDialog）
支持弹出框标题，内容，操作按钮，皮肤主题自定义

## 配置属性，方法
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| title    | 消息框标题（必填） | string | -- |
| content  | 消息体内容/iframe（必填） |  string/$对象  | -- |
| isIframe | 当content为iframe时，值必为true   |  bool  | false |
| skin    | 皮肤样式，添加到最外层容器 |  string  | -- |
| height | 高度 | number | -- |
| width  | 宽   |  number  | -- |
| autoClose   | 是否自动关闭 | bool  | false |
| timeout    | autoClose为true时多少秒后自动关闭 |  num  | -- |
| closeCallBack  | 关闭弹出框回调   |  funciton  | -- |
| buttons     | 操作按钮   |  array([{}])  | [] |
|| 按钮参数|
| text    | 按钮文本值 |  string | -- |
| theme    | 按钮主题 | 按钮主题 | -- |
| autoHide     | 点击按钮后是否关闭弹出窗   |  bool  | true |
| callback    | 点击按钮的回调 |  t  | edit |

## 使用
### 1. 基础使用
```
$.modalDialog({
	title:'test',
	content:'<div style="height:200px;width:200px;"></div>',
	buttons:[
		{
			text:'ok'
		},
		{
			text:'cancel'
		}
	]
});
```

---

# table组件（FormTable）

```
<!-- html模板 -->
<table id="FormTable"></table>
```
## 配置属性
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----  | :----  | :----  |
| data | 表格数据 | array | -- |
| requestUrl | 数据请求地址 | string | ""|
| requestOpt | 请求参数 | object | {} |
| dataTarget | 数据项的子项,请求或给定数据对象的某个子属性 | string | "" |
| perArray  | 每页显示条数数组 | array | [10, 20, 30, 50] |
| perNum | 每页显示的数据数 |  number  | 10 |
| pageIndex | 当前起始页 |  number | 0 |
| showStyle  | 数据显示类型 | 1:分页，2：不分页  | 1 |
| limit | 最多显示的数据条数 | Number | 0(不限制) |
| filterProperty | 过滤字段 | array | [] |
| showIndex | 显示序号 | bool | false |
| key | 主键字段，数据的标识在启用CheckBox的时候需要用到 | string | ID |
| sortFields | 已排序字段规则优先级顺序 | array | [] |
| sortOpt | 排序字段对应的排序规则 1：升序，2：降序,例如{Age:1, Name:1} | object | {} |
| autoHighLight | 高亮与查询字段匹配的字符 | bool | false |
| sortFunction | 自定义排序函数，若设置自定义函数则配置的排序字段排序失效 | function |  |
| showCheckbox | 显示checkbox |  bool | false |
| showPageLeftBar | 显示底部左侧显示页数切换栏 |  bool  | true |
| showPageRightBar | 显示分页按钮 | bool | true |
| maxIndex | 分页栏最多显示按钮数 | number | 7 |
| updateCallback | 数据更新回调，this指向当前组件实例对象 | function | -- |
| changePageNumCallBack| 改变每页显示条数回调，this指向当前组件实例对象 | function | --|
| beforeUpdate| 数据更新前操作，可进行数据的二次处理，若有返回值，则返回新的数据，this指向当前组件实例对象 | funciton | -- |
| columns | 配置列信息 |  array  | -- |
||||
| columns配置属性  |||
| field | 单元格对应的字段 |  string  | -- |
| title | 列显示标题 |  string  | -- |
| width | 列宽 |  number、百分比字符串  | -- |
| sortable | 设置字段是否可以排序 | bool | false |
| sortCallBack | 自定义排序逻辑函数，默认在升序和降序间切换 | function | null|
| format | 格式化单元格数据，必须有返回值 |  function(data)  | -- |
| rendered | 渲染完成后的回调（待更新） |  function  | -- |
| actionColumn | 按钮操作列 | object | -- |
| actionColumn配置属性 |  |  |  
| columnName | 列名称 |  string  | 操作 |
| actions | 按钮数组 | array  | -- |
|||||
| actions配置属性 |  |    | |
| type | 按钮类型 |  edit,delete,other  | -- |
| text | 按钮文本 |  string  | -- |
| icon | 按钮图标 |  string  | -- |
| callback | 点击回调 |  function  | -- |

## 方法
| 方法名称 |  |  |
| :--------   | :-----  | :----  |
|  |  |  |
|  |  |  |
|  |  |  |

##  使用
### 1. 基础使用
```
<!--html-->
<table id="formTablenormal">
	<thead>
		<tr>
			<th data-field="A">A</th>
			<th data-field="G">B</th>
			<th data-field="G2">C</th>
			<th data-field="D">D</th>
			<th data-field="G0">E</th>
		</tr>
	</thead>
</table>
<!--js-->
var tableData = [
	{A:'1', D:"D1",G:"G1", G2:"G21", G0:"GO1"},
	······
];

$("#formTablenormal").TablePage({
	data:tableData
});
```

### 2. 配置使用-配置信息加载 自定义列头显示,列宽设置
```
<!--html-->
<table id="formTable"></table>
```
```
$("#formTable").TablePage({
	data:tableData,
	columns:[
		{field:'G2',title:"G2--2"},
		{field:'G',width:"100px"},
		{field:'D'},
		{field:'A'}
	],
	perNum:10,
	pageIndex:0
});
```
### 3. 重写列数据值
```
$("#formTable").TablePage({
	data:tableData,
	columns:[
		{field:'G2',title:"G2 + cute", format:function(val){
			return val + "--cute";
		}},
		{field:'G'},
		{field:'D'},
		{field:'A'}
	],
	perNum:10,
	pageIndex:0
});
```
### 4. 显示复选框 
```
$("#formTable").TablePage({
	data:tableData,
	showCheckbox:true,
	columns:[
		{field:'G2',title:"G2--2"},
		{field:'G'},
		{field:'D'},
		{field:'A'}
	],
	perNum:8,
	maxIndex:5,
	pageIndex:0
});
```
### 5. 显示操作按钮
```
$("#formTable").TablePage({
	data:tableData,
    showCheckbox:true,
	columns:[
		{field:'G2', title:"G2 + 哈哈", format:function(val){return "哈哈" + val;}},
		{field:'G'},
		{field:'D'},
		{field:'*_*', title:"", format:function(val){return "@_@";}}
	],
	actionColumn:{
	    columnName:"操作",
	    actions:[
	        {
	            type:"edit",//delete,other
	            text:"修改",
	            icon:"",
	            callback:function(index){
	                console.log(index);
	                tableData[index]["D"] = "修改后的值"
	            }
	        },
	        {
	            type:"delete",//delete,other
	            text:"删除",
	            icon:"",
	            callback:function(index){
	                console.log(index);
	            }
	        }
	    ]
	},
	perNum:10,
	pageIndex:3
});
```
### 6. FormTable排序
```
$("#formTable").FormTable({
    data:tableData,
    sortFields:["sysLogTime","ID"],// 定义属性
    sortOpt:{sysLogTime:2, ID:2}, // 按时间降序排列
    columns:[
        {field:"sysLogTime", title:_("Time"), width:170},
        {   
            field:"sysLogType", title:_("Type") , width:140,
            format:function(data){
                switch(data){
                	case 1:
                		return _("System Log");
                	case 2:
                		return _("Attack Log");
                	case 3:
                		return _("Error Log");
                }
            }
        },
        {field:"sysLogMsg", title:_("Log Content")}
    ],
    showIndex:true,
    updateCallback:function(){
        top.ResetHeight.resetHeight();
    },
    changePageNumCallBack:function () {
        top.ResetHeight.resetHeight();
    }
});
```
### 7. FormTable与其他组件混合使用
```
$("#customTable").FormTable({
    requestUrl:"/goform/module", //请求地址
    requestOpt:{getQosUserList:{type:1}, getQosPolicy:""}, //请求参数
    dataTarget:"getQosUserList", //table的data为请求到的数据的的getQosUserList属性值
    showStyle:2, //显示全部数据不分页
    filterProperty:["hostRemark#hostName", "hostIP", "hostMAC"],//数据过滤字段
    columns:[
        {   
            field:"hostRemark", 
            sortable:true, 
            title:_("Host Name"),
            format: function(data, field, rowData){
                var nodes = '<div class="hostNameWrap"><input data-id="' + rowData.ID + '" class="hostName" data-key="FormInput" default-value="' + data + '" data-hostname="' + rowData["hostName"] + '" type="text"/></div>' +
                            '</div>';
                return nodes;
            },
            sortCallBack:function(){
                var opt = {
                    field: sortList[curSortIndex%3],
                    sort:1
                };
                curSortIndex ++;
                return opt;
            },
            rendered:function(field){
                var _this = this;
                _this.$element.find(".hostName").each(function(){
                    var hostname = $(this).attr("data-hostname");
                    $(this).Rcomponent({
                        displayMode:"readEdit",
                        dataField:field,
                        defaultText: hostname || _("Unknown"),
                        required:false,
                        dataOptions:[{type:"hostName"},{type:"byteLen",args:[1, 63]}],
                        changeCallBack:function(){
                            //xxxx
                        },
                        afterChangeCallBack:function(){
                           //xxx
                        },
                        renderedCallBack:function () {
                            //xxx
                        }
                    });
                });
            }
        },
        {   field:"hostUploadSpeed", sortable:true, title:_("Upload Bandwidth"),
            format:function(data){
                return formatSpeed(data) + "/s";
            }
        },
        {   field:"hostDownloadSpeed", sortable:true, title:_("Download Bandwidth"),
            format:function(data){
                return formatSpeed(data) + "/s";
            }
        },
        {   field:"hostUploadLimit", title:_("Upload Limit"), format:function(data, field, rowData){
                return '<div class="UploadLimit" data-down="' + rowData["hostDownloadLimit"] + '" data-id="' + rowData.ID + '" data-field="'+field+'" default-value="'+data+'" data-key="FormDropDownList"></div>';
            },
            rendered:function(){
                this.$element.find(".UploadLimit").Rcomponent({
                    dataValueType:"num",
                    customText:_("Manual (Unit: KB/s)"),
                    showSelfText:QOSTEXT[qosPolicy],
                    dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
                    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"},
                    clickCallBack:function(){
                        $("#allSettingModal").hide();
                    },
                    changeCallBack:function(){
                        //xxx
                    },
                    renderedCallBack:function(){
                        //xxx
                    }
                });
            }
        },
        {   
            field:"hostDownloadLimit", title:_("Download Limit"),
            format:function(data, field, rowData){
                return '<div class="DownloadLimit" data-up="' + rowData["hostUploadLimit"] + '" data-id="' + rowData.ID + '" data-field="'+field+'" default-value="'+data+'" data-key="FormDropDownList"></div>';
            },
            rendered:function(){
                this.$element.find(".DownloadLimit").Rcomponent({
                    dataValueType:"num",
                    customText:_("Manual (Unit: KB/s)"),
                    showSelfText:QOSTEXT[qosPolicy],
                    dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
                    selectArray:{0:_("No limit"), 32:"32 KB/s", 64:"64 KB/s", 128:"128 KB/s"},
                    clickCallBack:function(){
                        $("#allSettingModal").hide();
                    },
                    changeCallBack:function(){
                        //添加定时器
                    },
                    renderedCallBack:function(){
                        //xxx
                    }
                });
            }
        },
        {   
            field:"forbiden", title:_("Blacklist"),
            format:function(data, field, rowData){
                return '<button type="button" data-id="' + rowData["ID"] + '" class="forbidden btn btn-default" >' + _("Blacklist ") + '</button>';
            },
            rendered:function(){
                this.$element.off("click.sysInfo").on("click.sysInfo", ".forbidden", function(){
                //xxxxx
                });
            }
        }
    ],
    showPageLeftBar: false,
    updateCallback:function(){
        //重置高度
        top.resetIframeHeight();
    },
    beforeUpdate:function(){
        qosPolicy = qosUserSettingTable.returnData["getQosPolicy"]["qosPolicy"];
    }
});
```

>  其它API自行验证

---
# ComponentManager
多个组件操作类，提供便捷的组件组群操作

##  配置参数
| 属性名称        | 描述   |  值类型/范围  | 默认值 |
| :--------   | :-----:  | :----:  | :----:  |
| requestUrl    | 数据请求地址 |  string | -- |
| requestData    | 请求数据 |  object  | -- |
| submitUrl     | 数据提交地址  |  string  | -- |
| formCfg | 组件配置项{key:value} | object，key为组件的dataField,value为组件对应的配置信息 | -- |
| container | 组件群容器的选择器（必填） | string |  |
| beforeUpdate | 数据更新前操作，this指向当前ComponentManager实例对象 | function | true |
| afterUpdate | 数据更新后的回调，this指向当前ComponentManager实例对象 | function | -- |
| beforeSubmit | 提交数据前，进行一些列自定义数据校验操作，当然基础的数据校验会在这之前进行调用，失败返回false, 成功返回true或者二次处理后需要提交的数据，this指向当前ComponentManager实例对象 | function | -- |
| afterSubmit | 数据提交后的回调，this指向当前ComponentManager实例对象 | function | -- |

##  方法
| 名称        | 描述   |  参数说明 |
| :--------   | :-----:  | :----:  |
| getComponent(dataField) | 根据组件字段获取对应的组件实例对象 | dataField:组件字段名 |
| reset() | 重置每个组件的值为默认值 | -- |
| updateComponents(data) | 更新组件的值-重置为上一次的值或者给定的值 | 组件群的值Object |
| getComponentByNode(node) | 根据标签节点获取对应的组件实例对象 | html标签节点 |
| setValue(val, dataField) | 设置组件的值 |val:值， dataFiled:字段|
| getValue(dataField) | 获取组件的值 |dataField: 组件字段, 为空则返回所有组件的值|

##  使用
### 1. 基础使用
```
<!--html-->
<div id="text"></div>
    <div id="authUserModal" class="form-wrap">
        <input type="text" data-key="FormInput" data-field="ID" data-value-type="num" visible="false">
        <input type="text" data-key="FormInput" data-field="index" data-value-type="num" visible="false">
        <input type="text" data-key="FormInput" data-field="type" visible="false">
        <input type="text" data-key="FormInput" data-field="authUserID">
        <input type="text" data-key="FormInput" data-field="authUserPwd">
        <input type="text" data-key="FormInput" data-field="authUserRemark"> 
        <input type="text" data-key="FormInput" maxlength="3" data-field="authUserMaxCount">
        <input type="text" data-key="FormInput" maxlength="4" data-field="authUserConnectCount">
        <div data-key="FormDropDownList" data-field="uploadSpeed"></div>
        <div data-key="FormDropDownList" data-field="downLoadSpeed"></div>
    </div>
    
<!--js-->s
 authUserManage = $.componentManager({
    submitUrl:"/goform/module",
    container:"#authUserModal",
    formCfg:{
        authUserID:{dataTitle:_("Account:"), dataOptions:[{type:"pwd"},{type:"byteLen", args:[1,32]}]},
        authUserPwd:{dataTitle:_("Password:"), dataOptions:[{type:"pwd"},{type:"byteLen", args:[1,32]}]},
        authUserRemark:{dataTitle:_("Remark:"), placeholder:_("Optional"), removeSpace:true, required:false, dataOptions:[{type:"remarkTxt"},{type:"byteLen", args:[1,16]}]},
        authUserMaxCount:{dataTitle:_("Login User Number:"), dataValueType:"num", defaultValue:1, dataOptions:[{type:"num", args:[1,300]}]},
        authUserConnectCount:{dataTitle:_("Connection Number:"), dataValueType:"num",  defaultValue:600, dataOptions:[{type:"num", args:[1,9999]}]},
        uploadSpeed:{
            dataTitle:_("Upload Rate:"), dataValueType:"num", description:"KB/s",  
            defaultValue:0, customText:_("Manual"),
            dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
            selectArray:{0:_("No limit"), 32:"32", 64:"64", 128:"128"}
        },
        downLoadSpeed:{
            dataTitle:_("Download Rate:"),dataValueType:"num", description:"KB/s",
            defaultValue:0, customText:_("Manual"),
            dataOptions:[{type:"num", args:[0, MAX_SPEED]}],
            selectArray:{0:_("No limit"), 32:"32", 64:"64", 128:"128"}
        }
    },
    updateCallback:function(){
    },
    beforeSubmit:function(data){
        //增加数据校验
    },
    afterSubmit:function(data){
    }
});
```
---
