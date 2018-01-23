$(function() {
	$("#formCheckbox").Rcomponent({
		dataTitle:"FormCheckbox",
		dataField:"formcheckbox",
		changeCallBack:function(){
			alert("点我干嘛");
		}
	});
	$("#formCheckbox1").Rcomponent({
		dataTitle:"FormCheckbox",
		dataField:"formcheckbox",
		text:"FormCheckbox",
		changeCallBack:function(){
			alert(this.value);
		}
	});
});