$(function() {
    $("#formDropDownList").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        dataValueType:"num",
        showSelfText:"默认显示的文本",
        required:false,
        customText:_("手动输入"),
        dataOptions:[{type:"num", args:[6, 128]}],
        selectArray:[16, 32, 64, 128],
        clickCallBack:function(){
        },
        focusCallBack:function(){
        },
        changeCallBack:function(){
        },
        renderedCallBack:function(){
        }
    });

    $("#formDropDownList1").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });

    $("#formDropDownList2").Rcomponent({
        dataTitle:"FormDropDownList",
        defaultValue:3,
        dataField:"formDropDownList",
        selectArray:{1:"中国", 2:"美国", 3:"英国", 4:"德国", 5:"瑞典"}
    });
        
    $("#formDropDownList3").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        customText:"其它国家",
        defaultText:"奥地利",
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });

    $("#formDropDownList4").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        customText:"其它国家",
        defaultValue:"法国",
        dataOptions:[{type:"len", args:[1, 10]}],
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });


    $("#formDropDownList5").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        showSelfText:"默认显示中国",
        customText:"其它国家",
        defaultValue:"中国",
        dataOptions:[{type:"len", args:[1, 10]}],
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });
        
    $("#formDropDownList6").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        defaultValue:"德国",
        selectArray:["中国", "美国", "英国", "德国", "瑞典"],
        clickCallBack:function(){
            console.log("下拉框打开或者收缩了");
        }
    });

    $("#formDropDownList7").Rcomponent({
        dataTitle:"自定义下拉框组件",
        dataField:"formDropDownList",
        defaultValue:"瑞典",
        customText:"其它国家",
        dataOptions:[{type:"len", args:[1, 10]}],
        selectArray:["中国", "美国", "英国", "德国", "瑞典"],
        focusCallBack:function(){
            console.log("自定义输入框获取到焦点啦！！！");
        }
    });
});