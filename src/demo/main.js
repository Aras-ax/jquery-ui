$(function() {
	//标签内容格式化
	$("p").each(function(){
		this.innerHTML = this.innerHTML.replace(/`(.*?)`/g,function(key){ return key.replace(/^`/,'<label class="code">').replace(/`$/,'</label>');});
	});
    //html转义
	$.fn.formatCode = function(){
		this.each(function(){
			var $this = $(this),
				nodeHtml = $this.html();
				// &lt;select id=&quot;formselect4&quot; data-key=&quot;FormSelect&quot;&gt;&lt;/select&gt;
				
			$this.html(nodeHtml.replace(/(^\s*)|(\s*$)/g, "").replace(/</g, "&lt;").replace(/"|'/g, "&quot;").replace(/>/g, "&gt;"));
		});
	}  

	$("div.htmlCode").formatCode();

	//js代码美化
	$("pre").addClass("prettyprint");
	prettyPrint();
	//Rcomponent调用时传递参数
	$("#demo1").Rcomponent({
		dataKey: "FormInput",
		dataField: "demo1",
		dataTitle: "传递参数形式调用",
		placeholder: "测试"
	});

	//自动生成导航
	var navList = {}, navtext= "navTitle"; 
	$(".section").each(function(i){
		var $this = $(this),
			navArr = {},
			text = "";
		text = $this.children("h1.title").attr("id", navtext + i).text();
		$this.find("article.content>h2.con-title").each(function(j){
			var h2Id = navtext + i + "-h2-" + j;
			this.id = h2Id;
			navArr[h2Id] = this.innerText;
		});

		navList[navtext + i] = {
			text: text,
			child: navArr
		};
	});
	var htmlNode = "";
	console.log(navList);
	for(var key in navList){
		if(navList.hasOwnProperty){
			var curItem = navList[key], child = curItem.child;
			htmlNode += '<li class="tab"><a href="#' + key + '">' + curItem.text + '</a>';
			if(!$.isEmptyObject(child)){
				htmlNode += '<ul class="nav">';
				for(var m in child){
					if(child.hasOwnProperty(m)){
						htmlNode += '<li><a href="#' + m + '">' + child[m] + '</a></li>'
					}
				}
				htmlNode += '</ul>';
			}
			htmlNode += '</li>';
		}
	}

	$("#sideNav").html(htmlNode).off("click.nav").on("click.nav", ".tab", function(){
		$("#sideNav").find("li.tab").removeClass("active");
		$(this).addClass("active");
	});
	
	var allOffset = [];
	window.setTimeout(function(){
		for(var key in navList){
			let tar = {
				target: "#" + key,
				child:[]
			};
			tar.top = ~~$(tar.target).offset().top;
			let child = navList[key]["child"];
			if(!$.isEmptyObject(child)){
				for(let t in child){
					let tarChild = {
						target: "#" + t,
					};
					tarChild.top = ~~$(tarChild.target).offset().top;
					tar.child.push(tarChild);
				}
			}
			allOffset.push(tar);
		}
		console.log(allOffset);

		function checkTop(){
			var scrollTop = $(document).scrollTop();
			if(scrollTop > 160){
				var $nav = $(".nav-side");
				if(!$nav.hasClass("FIXED")){
					$nav.addClass("FIXED");
					$nav.css({
						position:"fixed",
						left: $nav.offset().left,
						top: "-40px",
						maxHeight:$(window).outerHeight() + 40,
						"overflow-y":"auto"
					});
				}
			}else{
				$(".nav-side").removeClass("FIXED").attr("style", "");
			}

			let curItem = allOffset[binary_search(allOffset, scrollTop)];
			removeActive();
			$('a[href="' + curItem.target + '"]').parent().addClass("active");
			if(curItem.child.length > 0){
				let cIndex = binary_search(curItem.child, scrollTop);
				$('a[href="' + curItem.child[cIndex].target + '"]').parent().addClass("active");
			}
		}

		function checkLeft(){
			var scrollTop = $(document).scrollTop();
			if(scrollTop > 160){
				$(".nav-side").css({
					left: $("section.left").offset().left + $("section.left").width() + 10,
					maxHeight:$(window).outerHeight() + 40,
					"overflow-y":"auto"
				});
			}
		}
		
		//查找当前所要显示的节点
		function binary_search(arr, val, start, end){
			var len = arr.length -1;
			start = start || 0;
			end = end || len;
			if(start === end){
				return start;
			}else if(start === end -1){
				if(arr[end].top <= val){
					return end;
				}
				return start;
			}
			let mid = ~~((start + end)/2);
			if(arr[mid].top > val){
				return binary_search(arr, val, start, mid);
			}else if(arr[mid].top === val){
				return mid;
			}else{
				return binary_search(arr, val, mid, end);
			}
		}

		function removeActive(){
			$("#sideNav").children("li.active").removeClass("active").find("li.active").removeClass("active");
		}
		let timeOut;
		$(document).off("scroll'").on("scroll", function(){
			checkTop();
		})
		
		$(window).off("resize").on("resize", function(){
			timeOut && clearTimeout(timeOut);
			timeOut = setTimeout(function(){
				checkLeft();
			}, 100);
		})

		checkTop();
		checkLeft();
	}, 10);

	//生成导航 end

	//Rcomponent标签属性传递参数
	$("#demo2").Rcomponent();
	//组件名称显示调用
	$("#demo3").FormInput({
		dataKey: "FormInput",
		dataField: "demo1",
		dataTitle: "组件名称显示调用",
		placeholder: "显示调用"
	});
	//组件属性说明
	$.componentManager({
		container: "#property",
		formCfg: {
			changeCallBack: {
				changeCallBack: function() {
					alert(this.value);
				}
			},
			validateCustom: {
				validateCustom: function(text) {
					if (text) {
						// this.$element.focus();
					}
				}
			},
			validateCallBack: {
				validateCallBack: function() {
					if (this.value.length < 6) {
						return "该字段至少为6位字符";
					}
				}
			},
			renderedCallBack: {
				renderedCallBack: function() {
					this.setValue("组件已渲染完成.")
				}
			}
		}
	});

//FormInput
	$("#formInput1").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "普通文本",
		placeholder: "普通文本测试"
	});

	$("#formInput2").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "密码文本",
		placeholder: "密码文本测试",
		type: "password"
	});

	$("#formInput3").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "密码文本",
		placeholder: "密码文本测试",
		type: "password",
		hasEyes: true
	});

	$("#formInput4").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "只读模式",
		displayMode: "readonly",
		defaultValue: "只读"
	});

	$("#formInput5").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "切换模式",
		placeholder: "切换模式测试",
		displayMode: "readEdit",
		required: false,
		defaultText: "未知数据",
		switchCallBack: function() {
			console.log("切换显示模式为：" + this.displayMode);
		}
	});

	$("#formInput6").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "普通文本",
		placeholder: "请输入1-6位整数",
		dataOptions: [{
			type: "num",
			args: [1, 6]
		}]
	});

	$("#formInput7").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "去除首尾空格",
		placeholder: "removeSpace",
		removeSpace: true,
		focusCallBack: function() {
			console.log("focus");
			console.log(this.value);
		}
	});
//FormInput end

//FormSelect
	$("#formselect1").Rcomponent({
		dataTitle: "selectArray为数组",
		dataField: "formselect1",
		selectArray: ['test1', 'test2', 'test3', 'test4'],
		changeCallBack: function() {
			console.log(this.value);
		}
	});

	$("#formselect2").Rcomponent({
		dataTitle: "selectArray为对象",
		dataField: "formselect2",
		defaultValue: 3,
		selectArray: {
			1: 'test1',
			2: 'test2',
			3: 'test3',
			4: 'test4'
		},
		changeCallBack: function() {
			console.log(this.value);
		}
	});

	$("#formselect3").Rcomponent({
		dataTitle: "hasNullItem为true",
		dataField: "formselect3",
		hasNullItem: true,
		nullText: "请选择",
		defaultValue: "test1",
		selectArray: ['test1', 'test2', 'test3', 'test4'],
		changeCallBack: function() {
			console.log(this.value);
		}
	});

	var $select = $("#formselect4").Rcomponent({
		dataTitle: "FormSelect",
		dataField: "formselect2",
		defaultValue: 3,
		selectArray: {
			1: 'test1',
			2: 'test2',
			3: 'test3',
			4: 'test4'
		},
		changeCallBack: function() {
			console.log(this.value);
		},
		renderedCallBack: function() {

			$("#selecttab").Rcomponent({
				dataKey: "FormTab",
				selectArray: {
					1: "addItem(5)",
					2: "addItem({6:'text6', 7:'text7'})",
					3: "removeItem(1)",
					4: "removeItem([3,5])",
					5: "getValue",
					6: "setValue(2)"
				},
				dataValueType: "num",
				defaultValue: 1,
				changeCallBack: function() {
					switch (this.value) {
						case 1:
							{
								$select.addItem(5);
							}
							break;
						case 2:
							{
								$select.addItem({
									6: 'test6',
									7: 'test7'
								});
							}
							break;
						case 3:
							{
								$select.removeItem(1);
							}
							break;
						case 4:
							{
								$select.removeItem([3, 5]);
							}
							break;
						case 5:
							{
								alert($select.getValue());
							}
							break;
						case 6:
							{
								$select.setValue(2);
							}
							break;
					}
				}
			});
		}
	});
//FormSelect end
	
//FormRadioList
	$("#FormRadioList1").Rcomponent({
		dataTitle: "selectArray为数组",
		dataField: "FormRadioList1",
		selectArray: ['test1', 'test2', 'test3', 'test4'],
		changeCallBack: function() {
			console.log(this.value);
		}
	});

	$("#FormRadioList2").Rcomponent({
		dataTitle: "selectArray为对象",
		dataField: "FormRadioList2",
		defaultValue: 3,
		selectArray: {
			1: 'test1',
			2: 'test2',
			3: 'test3',
			4: 'test4'
		},
		changeCallBack: function() {
			console.log(this.value);
		}
	});

	var $FormRadioList = $("#FormRadioList3").Rcomponent({
		dataTitle: "FormRadioList",
		dataField: "FormRadioList3",
		defaultValue: 3,
		selectArray: {
			1: 'test1',
			2: 'test2',
			3: 'test3',
			4: 'test4'
		},
		changeCallBack: function() {
			console.log(this.value);
		},
		renderedCallBack: function() {

			$("#selecttab1").Rcomponent({
				dataKey: "FormTab",
				selectArray: {
					1: "addItem(5)",
					2: "addItem({6:'text6', 7:'text7'})",
					3: "removeItem(1)",
					4: "removeItem([3,5])",
					5: "getValue",
					6: "setValue(2)"
				},
				dataValueType: "num",
				changeCallBack: function() {
					switch (this.value) {
						case 1:
							{
								$FormRadioList.addItem(5);
							}
							break;
						case 2:
							{
								$FormRadioList.addItem({
									6: 'test6',
									7: 'test7'
								});
							}
							break;
						case 3:
							{
								$FormRadioList.removeItem(1);
							}
							break;
						case 4:
							{
								$FormRadioList.removeItem([3, 5]);
							}
							break;
						case 5:
							{
								alert($FormRadioList.getValue());
							}
							break;
						case 6:
							{
								$FormRadioList.setValue(2);
							}
							break;
					}
				}
			});
		}
	});
//FormRadioList end
	
//FormCheckList
	$("#FormCheckList1").Rcomponent({
		dataTitle: "selectArray为数组",
		dataField: "FormCheckList1",
		defaultValue: "test2",
		selectArray: ['test1', 'test2', 'test3', 'test4'],
		changeCallBack: function() {
			console.log(this.value);
		}
	});

	$("#FormCheckList2").Rcomponent({
		dataTitle: "selectArray为对象",
		dataField: "FormCheckList2",
		defaultValue: 3,
		selectArray: {
			1: 'test1',
			2: 'test2',
			3: 'test3',
			4: 'test4'
		},
		changeCallBack: function() {
			console.log(this.value);
		}
	});

	var $FormCheckList = $("#FormCheckList3").Rcomponent({
		dataTitle: "FormCheckList",
		dataField: "FormCheckList3",
		defaultValue: 3,
		selectArray: {
			1: 'test1',
			2: 'test2',
			3: 'test3',
			4: 'test4'
		},
		changeCallBack: function() {
			console.log(this.value);
		},
		renderedCallBack: function() {

			$("#selecttab3").Rcomponent({
				dataKey: "FormTab",
				selectArray: {
					1: "addItem(5)",
					2: "addItem({6:'text6', 7:'text7'})",
					3: "removeItem(1)",
					4: "removeItem([3,5])",
					5: "getValue",
					6: "setValue(2)"
				},
				dataValueType: "num",
				changeCallBack: function() {
					switch (this.value) {
						case 1:
							{
								$FormCheckList.addItem(5);
							}
							break;
						case 2:
							{
								$FormCheckList.addItem({
									6: 'test6',
									7: 'test7'
								});
							}
							break;
						case 3:
							{
								$FormCheckList.removeItem(1);
							}
							break;
						case 4:
							{
								$FormCheckList.removeItem([3, 5]);
							}
							break;
						case 5:
							{
								alert($FormCheckList.getValue());
							}
							break;
						case 6:
							{ 
								$FormCheckList.setValue(2);
							}
							break;
					}
				}
			});
		}
	});
//FormCheckList end

//FormCheckbox
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
//FormCheckbox end

//FormDropDownList
    $("#formDropDownList").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        dataValueType:"num",
        showSelfText:"默认显示的文本",
        required:false,
        customText:_("手动输入"),
        dataOptions:[{type:"num", args:[6, 128]}],
        selectArray:[16, 32, 64, 128],
        clickCallBack:function(){
        },
        focusCallBack:function(){
        },
        changeCallBack:function(){
        },
        renderedCallBack:function(){
        }
    });

    $("#formDropDownList1").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });
    
    $("#formDropDownList2").Rcomponent({
        dataTitle:"FormDropDownList",
        defaultValue:3,
        dataField:"formDropDownList",
        selectArray:{1:"中国", 2:"美国", 3:"英国", 4:"德国", 5:"瑞典"}
    });
        
    $("#formDropDownList3").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        customText:"其它国家",
        defaultText:"奥地利",
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });

    $("#formDropDownList4").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        customText:"其它国家",
        defaultValue:"法国",
        dataOptions:[{type:"len", args:[1, 10]}],
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });

    
    $("#formDropDownList5").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        showSelfText:"默认显示中国",
        customText:"其它国家",
        defaultValue:"中国",
        dataOptions:[{type:"len", args:[1, 10]}],
        selectArray:["中国", "美国", "英国", "德国", "瑞典"]
    });
        
    $("#formDropDownList6").Rcomponent({
        dataTitle:"FormDropDownList",
        dataField:"formDropDownList",
        defaultValue:"德国",
        selectArray:["中国", "美国", "英国", "德国", "瑞典"],
        clickCallBack:function(){
            console.log("下拉框打开或者收缩了");
        }
    });
    
    $("#formDropDownList7").Rcomponent({
        dataTitle:"自定义下拉框组件",
        dataField:"formDropDownList",
        defaultValue:"瑞典",
        customText:"其它国家",
        dataOptions:[{type:"len", args:[1, 10]}],
        selectArray:["中国", "美国", "英国", "德国", "瑞典"],
        focusCallBack:function(){
            console.log("自定义输入框获取到焦点啦！！！");
        }
    });
//FormDropDownList end

//FormCalendar
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
//FormCalendar end

//FormList

//FormList end

//Formtab
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
            alert(`点击${this.value}`);
        }
    });
//Formtab end

//FormTable
	var tableData = [
		{ID:1, A:'AAA1', B:"BBB1",C:"CCC1", D:"DDD1", E:"EEE1"},
		{ID:2, A:'AAA2', B:"BBB2",C:"CCC2", D:"DDD2", E:"EEE2"},
		{ID:3, A:'AAA3', B:"BBB3",C:"CCC3", D:"DDD3", E:"EEE3"},
		{ID:4, A:'AAA4', B:"BBB4",C:"CCC4", D:"DDD4", E:"EEE4"},
	];

	$("#formTable").FormTable({
		data:tableData
	});

	$("#formTable1").FormTable({
		requestUrl:'./data/tabledata.json',
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		]
	});

	$("#formTable2").FormTable({
		requestUrl:'./data/data.json',
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		],
		showCheckbox:true,
		dataTarget:"getQosUserList"
	});

	$("#formTable3").FormTable({
		requestUrl:'./data/tabledata.json',
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		],
		perArray:[5, 10, 20, 30, 50],
		perNum:5,
		pageIndex:1
	});
	
	$("#formTable4").FormTable({
		requestUrl:'./data/tabledata.json',
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		],
		perArray:[5, 10, 20, 30, 50],
		perNum:5,
		limit:7,
		showIndex:true
	});

	$("#formTable5").FormTable({
		requestUrl:'./data/tabledata.json',
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		],
		showStyle:2
	});

	$("#formTable6").FormTable({
		requestUrl:'./data/tabledata.json',
		columns:[
			{title:"主机名称", field:"hostName", width:"20%"},
			{title:"认证类型", field:"hostAuthType", width:50},
			{title:"IP地址", field:"hostIP", width:100},
			{title:"下载总流量", field:"hostDownloadSum", width:"24%"},
			{title:"备注", field:"hostRemark"}
		]
	});
	
	$("#formTable7").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", sortable:true, field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", sortable:true, field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		]
	});
	$("#formTable7a").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		sortOpt:{hostDownloadSum:1, hostAuthType:2},
		sortFields:["hostDownloadSum", "hostAuthType"],
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", sortable:true, field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", sortable:true, field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		]
	});
	
	$("#formTable8").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		columns:[
			{title:"主机名称", sortable:true, field:"hostName"},
			{title:"认证类型",  field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		],
		sortFunction:function(a, b){
			if(typeof this.sortOpt.hostName === "undefined" || this.sortOpt.hostName === 2){
				return b.hostName < a.hostName;
			}else{
				return b.hostName > a.hostName;
			}
		}
	});
	
	$("#formTable9").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		columns:[
			{title:"主机名称", sortable:true, field:"hostName"},
			{title:"认证类型",  field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		],
		actionColumn:{
			columnName: "操作按钮",
			actions: [
				{
					type:"edit",
                    text:"编辑",
                    callback:function(){
                        alert("Edit");
                    }
				},
				{
					type:"delete",
                    text:"删除",
                    callback:function(){
                        alert("Delete");
                    }
				}
			]
		}
	});

	$("#formTable10").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", field:"hostAuthType", format:function(data, dataField, rowData){
					switch(data){
						case "Web":
							return "portal认证";
						case "WeChat":
							return "微信连WiFi";
						case "PPoE":
							return "PPoE认证";
					}
				}
			},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum", format:function(data, dataField, rowData){
					return formatSpeed(data);
				}
			},
			{title:"备注", field:"hostRemark"}
		]
	});

	function formatSpeed(val,num){
		if(num === "" || num === undefined){
			num = 2;
		}
		if(val){
			val = ~~val;
			var speedArr = [" KB", " MB", " GB", " TB"], index = 0;
			while(val > 1024){
				val = val / 1024.0;
				index++;
			}
			val = val.toFixed(num) + speedArr[index];
		}else{
			 val += " KB";
		}
		return val;
	}

	$("#formTable11").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		columns:[
			{title:"主机名称", field:"hostName"},
			{title:"认证类型", field:"hostAuthType", 
				format:function(data, dataField, rowData){
					return '<select class="auth-select" data-key="FormSelect" default-value="' + data + '"></secect>';
				},
				rendered:function(){
					this.$element.find("select.auth-select").Rcomponent({
						selectArray:{PPoE:"portal认证", Web:"PPoE认证", WeChat:"微信连WiFi"},
						changeCallBack:function(){
							alert(this.value);
						}
					});
				}
			},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum", format:function(data, dataField, rowData){
					return '<input type="text" default-value="' + data + '" data-key="FormInput" class="sum-input">';
				},
				rendered:function(){
					this.$element.find("input.sum-input").Rcomponent({
						placeholder: '输入下载流量',
						displayMode: "readEdit",
						dataOptions:[{type:"num", args:[1,10000]}],//[{type:"",args:[]}]
					});
				}
			},
			{title:"操作按钮", field:"", format:function(data, dataField, rowData){
					return '<i class="table-icon icon-edit" data-key="' + rowData["ID"] + '" data-type="edit"></i>' + '<i class="table-icon icon-delete" data-key="' + rowData["ID"] + '" data-type="delete"></i>';
				},
				rendered:function(){
					this.$element.off("click.acton").on("click.acton", ".table-icon", function(){
						var $this = $(this);
						if($this.hasClass("icon-edit")){
							alert("edit");
						}else if($this.hasClass("icon-delete")){
							alert("delete");
						}
					});
				}
			}
		]
	});

	
	var tableTar = $("#formTable13").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		showCheckbox: true,
		columns:[
			{title:"主机名称", sortable:true, field:"hostName"},
			{title:"认证类型",  field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		]
	});

	$("#getSelected").off("click.get").on("click.add", function(){
		alert(tableTar.getSelected().join(","));
	});

	$("#formTable14").FormTable({
		requestUrl:'./data/tabledata.json',
		perArray:[5,10,20],
		perNum:5,
		showCheckbox: true,
		columns:[
			{title:"主机名称", sortable:true, field:"hostName"},
			{title:"认证类型",  field:"hostAuthType"},
			{title:"IP地址", field:"hostIP"},
			{title:"下载总流量", field:"hostDownloadSum"},
			{title:"备注", field:"hostRemark"}
		],
		updateCallBack:function(){
			console.log("数据更新完毕，共" + this.orignalData.length + "条数据");
		},
		changePageNumCallBack:function(){
			alert("changePageNum");
		},
		beforeUpdate:function(data){
			if(data && data.length > 0){
				data.forEach(function(item){
					switch(item.hostAuthType){
						case "Web":
							item.hostAuthType = "portal认证";
							break;
						case "WeChat":
							item.hostAuthType = "微信连WiFi";
							break;
						case "PPoE":
							item.hostAuthType = "PPoE认证";
							break;
					}
				});
			}
		}
	});
//FormTable end

//FormMessage
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
//ModalDialog end

//ComponmentManager
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
//ComponmentManager end
});