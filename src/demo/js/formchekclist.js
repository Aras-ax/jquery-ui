$(function() {
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
});