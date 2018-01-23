$(function() {
    $("#formTab").Rcomponent({
        selectArray:{1:"新增", 2:"修改", 3:"删除", 4:"导入", 5:"导出"},
        dataValueType:"num",
        theme:"bg-theme",
        defaultValue:2, //默认选中的按钮项
        changeCallBack:function(){
            switch(this.value){
                case 1:{
                    alert("点击新增");
                }break;
                case 2:{
                    alert("点击修改");
                }break;
                case 3:{
                    alert("点击删除");
                }break;
                case 4:{
                    alert("点击导入");
                }break;
                case 5:{
                    alert("点击导出");
                }break;
            }
        }
    });

    $("#formTab1").Rcomponent({
        selectArray:["新增", "修改", "删除", "导入", "导出"],
        changeCallBack:function(){
            alert("点击" + this.value);
        }
    });
});