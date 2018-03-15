$(function() {
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
		placeholder: "请输入1-666的整数",
		dataOptions: [{
			type: "num",
			args: [1, 666]
		}]
	});
	$("#formInput7").Rcomponent({
		dataKey: 'FormInput',
		dataField: 'username',
		dataTitle: '只能输入字母',
		placeholder: '输入字母',
		description: '最多输入6位字母',
		regExp: /[a-zA-z]/,
		maxLength: 6
	});

	$("#formInput8").Rcomponent({
		dataKey: "FormInput",
		dataField: 'username',
		dataTitle: "去除首尾空格",
		placeholder: "removeSpace",
		dataOptions: [{
			type: "len",
			args: [1, 6]
		}],
		removeSpace: true,
		focusCallBack: function() {
			console.log("focus");
			console.log(this.value);
		}
	});
});