$(function() {
	$.componentManager({
		submitUrl:"/goform/module",
		container:"#cmp",
		formCfg:{
			remark:{dataTitle:"IP组："},
			timeGroup:{dataTitle:"时间组："},
			connectNum:{dataTitle:"最大连接数：", dataValueType:"num",dataOptions:[{type:"num", args:[1, 9999]}]},
			listUpStream:{dataTitle:"上传速率：", dataValueType:"num", description:"KB/s", dataOptions:[{type:"num", args:[0, 1002]}]},
			downStream:{dataTitle:"下载速率：", dataValueType:"num", description:"KB/s", dataOptions:[{type:"num", args:[0, 2342]}]}
		}
	});

	var cmp = $.componentManager({
		submitUrl:"/goform/module",
		container:"#cmp1",
		showSubmitBar:true,
		formCfg:{
			remark:{dataTitle:"IP组：", dataOptions:[{type:"ip.all"}]},
			timeGroup:{dataTitle:"时间组："},
			connectNum:{dataTitle:"最大连接数：", dataValueType:"num",dataOptions:[{type:"num", args:[1, 9999]}]},
			listUpStream:{dataTitle:"上传速率：", dataValueType:"num", description:"KB/s", dataOptions:[{type:"num", args:[0, 1002]}]},
			downStream:{dataTitle:"下载速率：", dataValueType:"num", description:"KB/s", dataOptions:[{type:"num", args:[0, 2342]}]}
		},
		beforeUpdate: function(data){
			//key在这个地方手动的给组件添加默认值
			if($.isEmptyObject(data)){
				data = {
					remark: "192.168.3.1",
					timeGroup: "周末",
					connectNum: 12,
					listUpStream: 350,
					downStream:480
				}
			}
			return data;
		},
		updateCallback:function(){
			$.formMessage("数据已加载成功！");
		},
		beforeSubmit:function(data){
			console.log(data);
			if(data.listUpStream > data.downStream){
				alert("上传速率不能大于下载速率。");
				return false;
			}
		},
		afterSubmit:function(data){	
			$.formMessage("数据提交成功！");
		}
	});
	cmp.updateComponents({});

	var cmp1 = $.componentManager({
		submitUrl:"/goform/module",
		container:"#cmp2",
		showSubmitBar:true,
		formCfg:{
			remark:{dataTitle:"IP组：", dataOptions:[{type:"ip.all"}]},
			timeGroup:{dataTitle:"时间组："},
			connectNum:{dataTitle:"最大连接数：", dataValueType:"num",dataOptions:[{type:"num", args:[1, 9999]}]},
			listUpStream:{dataTitle:"上传速率：", dataValueType:"num", description:"KB/s", dataOptions:[{type:"num", args:[0, 1002]}]},
			downStream:{dataTitle:"下载速率：", dataValueType:"num", description:"KB/s", dataOptions:[{type:"num", args:[0, 2342]}]}
		},
		beforeUpdate: function(data){
			//key在这个地方手动的给组件添加默认值
			if($.isEmptyObject(data)){
				data = {
					remark: "192.168.3.1",
					timeGroup: "周末",
					connectNum: 12,
					listUpStream: 350,
					downStream:480
				}
			}
			return data;
		}
	});
	cmp1.updateComponents({});
	$("#formtab-cm").Rcomponent({
		dataKey:"FormTab",
		selectArray:{1:"reset", 2:"update", 3:"setValue", 4:"getValue", 5:"getComponent"},
		dataValueType:"num",
		defaultValue:2, //默认选中的按钮项
		changeCallBack:function(){
			switch(this.value){
				case 1:{
					cmp1.reset();
				}break;
				case 2:{
					cmp1.updateComponents({
						listUpStream:666,
						downStream:888
					});
				}break;
				case 3:{
					cmp1.setValue("弄啥嘞", "timeGroup");
				}break;
				case 4:{
					$.formMessage("IP组: " + cmp1.getValue("remark"))
				}break;
				case 5:{
					var t = cmp1.getComponent("connectNum");
					$.formMessage("连接数: " + t.getValue());
				}break;
			}
		}
	});
});