$(function() {
    $("#formPercent").Rcomponent({
        dataKey: "FormPercent",
        dataTitle:"FormPercent："
    });
    
    $("#formPercent1").Rcomponent({
        dataKey: "FormPercent",
        dataTitle:"负数场景：",
        end:-220,
        fixed: 1,
        defaultValue: -100
    });
    
    $("#formPercent2").Rcomponent({
        dataKey: "FormPercent",
        dataTitle:"开始值大于结束值：",
        start:160,
        end:0,
        fixed: 0
    });
});