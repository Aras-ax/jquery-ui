$(function() {
    $("#formMultiInpit").Rcomponent({
        dataKey: "FormMultiInput",
        dataTitle:"FormMultiInput：",
        dataField: "formMultiInpit",
        inputCount:4,
        maxLength: 4
    });

    $("#formMultiInpit1").Rcomponent({
        dataKey: "FormMultiInput",
        dataField: "formMultiInpit",
        dataTitle:"IP地址：",
        regExp: '[0-9]',
        maxLength: 3,
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
        dataField: "formMultiInpit",
        inputCount:4,
        maxLength: 4,
        regExp: '[a-zA-Z0-9]',
        dataTitle:"序列号",
        defaultValue:"8545-2345-3445-5676",
        joiner:"-"
    });
    
    $("#formMultiInpit3").Rcomponent({
        dataKey: "FormMultiInput",
        dataField: "formMultiInpit",
        dataTitle:"数据校验：",
        inputCfg:[
            {dataValueType:'num', dataOptions: {type:"num",args:[192,255]}},
            {dataValueType:'num', dataOptions: {type:"num",args:[1,255]}},
            {dataValueType:'num', dataOptions: {type:"num",args:[1,255]}},
            {dataValueType:'num', dataOptions: {type:"num",args:[1,255]}}
        ]
    });
});