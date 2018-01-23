$(function() {
    $("#formMultiInpit").Rcomponent({
        dataKey: "FormMultiInput",
        dataTitle:"FormMultiInput：",
        inputCount:4
    });

    $("#formMultiInpit1").Rcomponent({
        dataKey: "FormMultiInput",
        dataTitle:"IP地址：",
        inputCount:2,
        text: "192.168.",
        validateCallBack:function(){
            console.log(1);
        },
        changeCallBack:function(){
            console.log(this.value);
        }
    });
 
    $("#formMultiInpit2").Rcomponent({
        dataKey: "FormMultiInput",
        inputCount:4,
        dataTitle:"序列号",
        defaultValue:"8545-2345-3445-5676",
        joiner:"-"
    });
    
    $("#formMultiInpit3").Rcomponent({
        dataKey: "FormMultiInput",
        dataTitle:"数据校验：",
        inputCfg:[
            {dataValueType:'num', dataOptions: {type:"num",args:[192,255]}},
            {dataValueType:'num', dataOptions: {type:"num",args:[1,255]}},
            {dataValueType:'num', dataOptions: {type:"num",args:[1,255]}},
            {dataValueType:'num', dataOptions: {type:"num",args:[1,255]}}
        ]
    });
});