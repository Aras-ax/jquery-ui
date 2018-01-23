$(function() {
    $("#formCalendar").Rcomponent({
        dataTitle:"日历组件",
        dataField:"formCalendar",
        hasWeekday:true,
        startYear:2000,
        endYear:2020,
        scanAble:false
    });

    $("#formCalendar1").Rcomponent({
        dataTitle:"日历组件-显示星期",
        dataField:"formCalendar",
        hasWeekday:true
    });

    $("#formCalendar2").Rcomponent({
        dataTitle:"日历组件-设置起止时间",
        dataField:"formCalendar",
        startYear:2000,
        endYear:2020
    });

    $("#formCalendar3").Rcomponent({
        dataTitle:"日历组件-不可输入",
        dataField:"formCalendar",
        scanAble:false
    });
});