$(function() {
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
});