$(function() {
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
});