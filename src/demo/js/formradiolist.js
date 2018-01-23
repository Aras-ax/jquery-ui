$(function() {
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
});