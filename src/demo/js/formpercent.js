$(function() {
    $("#formPercent").Rcomponent({
        dataKey: "FormPercent",
        dataField: "formPercent",
        showInput: false,
        dataTitle:"FormPercent："
    });
    
    $("#formPercent1").Rcomponent({
        dataKey: "FormPercent",
        dataTitle:"负数场景：",
        dataField: "formPercent1",
        end:-220,
        fixed: 1,
        defaultValue: -100
    });
    
    $("#formPercent2").Rcomponent({
        dataKey: "FormPercent",
        dataField: "formPercent2",
        dataTitle:"开始值大于结束值：",
        start:160,
        end:0,
        fixed: 0
    });
});