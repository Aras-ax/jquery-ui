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
			var tar = {
				target: "#" + key,
				child:[]
			};
			tar.top = ~~$(tar.target).offset().top;
			var child = navList[key]["child"];
			if(!$.isEmptyObject(child)){
				for(var t in child){
					var tarChild = {
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

			var curItem = allOffset[binary_search(allOffset, scrollTop)];
			removeActive();
			$('a[href="' + curItem.target + '"]').parent().addClass("active");
			if(curItem.child.length > 0){
				var cIndex = binary_search(curItem.child, scrollTop);
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
			var mid = ~~((start + end)/2);
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
		var timeOut;
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
});