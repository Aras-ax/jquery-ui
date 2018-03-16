$(function() {
	var formMess = null;
	$("#formtab-fm").Rcomponent({
		dataKey:"FormTab",
		selectArray:{1:"只传消息", 2:"displayTime=0", 3:"displayTime=3000", 4:"setMess", 5:"hide"},
		dataValueType:"num",
		defaultValue:2, //默认选中的按钮项
		changeCallBack:function(){
			switch(this.value){
				case 1:{
					$.formMessage("显示提示信息，一秒后自动关闭。");
				}break;
				case 2:{
					if(!formMess){
						formMess = $.formMessage({
							message:"不会关闭的消息提示框",
							displayTime:0
						});
					}
				}break;
				case 3:{
					$.formMessage({
						message:"3秒后自动关闭",
						displayTime:3000
					});
				}break;
				case 4:{
					if(formMess){
						formMess.setMess("修改提示信息");
					}else{
						formMess = $.formMessage({
							message:"修改提示信息",
							displayTime:0
						});
					}
				}break;
				case 5:{
					if(formMess){
						formMess.hide();
						formMess = null;
					}
				}break;
			}
		}
	});
	
	$("#btn-fm").click(function(){
		$.formMessage("你还真点我啊！！！");
	});
//FormMessage end

//ModalDialog
	var modal1 = null, modal2 = null, modal3 = null;
	$("#btnModel").off("click").on("click", function(){
		if(modal1){
			modal1.show();
		}else{
			modal1 = $.modalDialog({
				title: "弹出框标题",
				content:"<div>这个是弹出框的内容！！！</div>"
			});
		}
	});

	$("#btnModel1").off("click").on("click", function(){
		if(modal2){
			modal2.show();
		}else{
			modal2 = $.modalDialog({
				title: "超高弹出框",
				content:'<div style="height:1000px;">超高弹出框！！！</div>'
			});
		}
	});

	var userCm = $.componentManager({
		container:$("#userMess"),
		formCfg:{
			username:{dataTitle:"用户名：", dataOptions:[{type:"len", args:[3, 14]}]},
			password:{dataTitle:"密码：", dataOptions:[{type:"len", args:[3, 14]}]},
			gender:{dataTitle:"性别：", selectArray:{0:"男", 1:"女"}},
			country:{dataTitle:"国籍：", selectArray:["中国","英国","法国","美国","德国"]},
			birthday:{dataTitle:"出生日期："}
		}
	});

	$("#btnModel2").off("click").on("click", function(){
		if(modal3){
			userCm.reset();
			modal3.show();
		}else{
			modal3 = $.modalDialog({
				title: "新增用户",
				width: 500,
				content:$("#userMess"),
				buttons:[
					{
						text:"新增",
						theme:"ok",
						autoHide:false,
						callback:function(){
							if(userCm.submit()){
								modal3.hide();
							}
						}
					},
					{
						text:"取消"
					}
				]
			});
		}
	});
});