$(function() {
    $("#formUpload").Rcomponent({
        dataKey: "FormUpload",
        dataTitle:"基本使用：",
        submitUrl:"xxx",
        success: function(){
            alert("success");
        }
    });
    
    $("#formUpload1").Rcomponent({
        dataKey: "FormUpload",
        dataTitle:"只显示上传按钮：",
        submitUrl:"xxx",
        showFileText: false,
        uploadText: _("Upload File")
    });

    $("#formUpload2").Rcomponent({
        dataKey: "FormUpload",
        dataTitle:"上传校验：",
        submitUrl:"xxx",
        uploadText: _("Upload File"),
        beforeUpload:function(){ return false;},
        success: function(){
            alert("success");
        }
    });
});