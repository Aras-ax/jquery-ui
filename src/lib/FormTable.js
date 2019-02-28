(function($) {
  let PAGELEFTTYPE = {
      TOTAL: 1, // 共X页，X条数据
      SELECT: 2 // 显示每页条数选择框，且显示总条数
    },
    htmlCode = {
      ' ': '&nbsp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    };
  let DEFAULT = {
    data: [], //表格数据
    requestUrl: "",
    requestOpt: {},
    perArray: [10, 20, 30, 50], //每页显示条数数组
    perNum: 10, //每页显示的数据数
    pageIndex: 0, //当前起始页
    showStyle: 1, //数据显示类型  1:分页，2：不分页
    limit: 0, //最多显示几条数据，默认值为0，显示所有
    pageLeftType: PAGELEFTTYPE.TOTAL,
    maxLength: 0,
    columns: [
      // {
      //     field:"",
      //     title："",//列显示标题
      //     width:"20%",
      //     sortable:false,
      //     sortValueType:0,0:字段自身类型，1：Number,2:string, 3:ip
      //     format:function(data, field, dataObj){
      //         data:当前字段的值，
      //         field:当前的字段
      //         dataObj:当前行对象的值
      //         //需要返回值
      //         //可以对数据值进行格式转换等一系列操作，返回处理后的值
      //         return data + "哈哈";
      //         //也可以按自己的需求渲染标签
      //         return '<input type="text" value="' + data + '" class="xxxx"/>'
      //         //return '<div data-field="'+ key +'" data-key="FormInput" defaultValue="'+ data +'"> '
      //     },
      //     sortCallBack:function(){},//返回需要排序的字段和排序方式{field:'', sort:1}
      //     headRendered: function(){

      //     }, //表头渲染完成后的回调，类似rendered用法
      //     rendered:function(){
      //          //自定义列渲染完成后回调
      //          //可用于调用者实现自己的逻辑，例如事件绑定，组件初始化等操作
      //          //时间绑定
      //          let _this = this; //this 指向当前的formtable实例
      //          _this.$element.off("change.FormTable").on("change.FormTable",".xxxx", function(){
      //              //
      //          });
      //          或者 组件渲染
      //          _this.$element.find("change.Form").Rcomponent({
      //  dataTitle:"formchecklist",
      //  dataField:"formchecklist",
      //  defaultValue:"test1",
      //  selectArray:['test1', 'test2', 'test3', 'test4'],
      //  changeCallBack:function(){
      //      console.log(this.value);
      //  }
      // });
      //     }
      // }
    ],
    dataTarget: "",
    filterProperty: [],
    actionColumn: {
      columnName: _("Operation"),
      actions: [
        // {
        //     id:"",//标识按钮
        //     type:"edit",//delete,other
        //     text:"",
        //     icon:"",
        //     callback:function(){
        //         //to do you own job
        //     }
        // }
      ]
    },
    key: "ID",
    editColumn: [],
    showCheckbox: false, //显示checkbox
    showPageLeftBar: true, //显示底部左侧显示页数切换栏
    showPageRightBar: true, //显示分页按钮
    showTotalColumn: [], //显示总数列
    showIndex: false, //显示序号
    sortFields: [],
    sortOpt: {},
    requestType: "post",
    autoHighLight: false, //高亮与查询字段匹配的字符
    sortFunction: null, //排序函数和排序字段不能同时存在
    maxIndex: 7, //分页栏最多显示按钮数
    beforeUpdate: null, //数据更新前操作，可进行数据的二次处理，若有返回值，则返回新的数据
    updateCallback: null, //数据更新回调
    completeCallback: null, //数据请求后回调，无论是请求成功还是失败
    changePageNumCallBack: null, //改变每页显示条数回调
    disabledCheck: null, //将行的CheckBox置灰逻辑，需要置灰返回true，否则false，有一个参数rowData行数据，function(rowData){ return true};
    afterRendered: null
  };

  function FormTable($element, opt) {
    this.$element = $element.addClass('form-table');
    let option = $.extend({}, DEFAULT, opt);

    function initProperty() {
      this.perNum = option.perNum || option.perArray[0];
      if (option.perArray.indexOf(this.perNum) == -1) {
        this.perNum = option.perArray[0];
      }

      for (let key in option) {
        if (option.hasOwnProperty(key) && key !== "perNum") {
          this[key] = option[key];
        }
      }
      //初始请求或者给定的数据
      this.orignalData = option.data;
      //排序筛选后的数据
      this.data = [];
      this.hasActionColumn = option.actionColumn.actions.length > 0 ? true : false;

      if (this.limit > 0) {
        this.showStyle = 2;
        this.perArray = [this.limit];
      }

      if (this.showStyle === 2) {
        this.showPageLeftBar = this.showPageRightBar = false;
      } else {
        this.showPageRightBar = option.showPageRightBar;
        this.showPageLeftBar = option.showPageLeftBar;
      }
      this.filterValue = "";
      // this.sortOpt = option.sortOpt; //记录字段的排序规则 1：升序，2：降序

      //sortOpt
      if (this.sortFields.length > 0) {
        //优先级最高的排序字段放在数组最后面
        this.sortFields.reverse();
      }

      //第一条数据索引值
      this.dataIndex = 0;
      //总页数
      this.pageNum = 1;
      //表格数据列数
      this.columnCount = 0;
      //表格总列数
      this.totalColumn = 0;
      this.selectedRow = [];
      //表头数组
      this.tHead = [];
      //标记已经初始化变量
      this.hasInit = false;
      //表格底部操作栏
      this.footBar = {
        //当前页 从1开始
        pageIndex: option.pageIndex + 1,
        //按钮栏是否可见
        visible: true,
        maxIndex: option.maxIndex,
        //按钮栏容器 jQuery对象
        $insertArea: {},
        $rightHtml: {},
        //隐藏页按钮html
        hiddenInfo: '<span class="info-hidden-flag">...</span>'
      };

      if (this.orignalData && !this.requestUrl) {
        this.orignalData = this.dataTarget ? this.orignalData[this.dataTarget] : this.orignalData || [];
      }

      this.$thead = $('<thead></thead>');
      this.$tbody = $('<tbody></tbody>');
      this.$element.children('tbody').remove();
      this.editData = {};
      this.defaultOption = option;
    }

    initProperty.call(this);
    // 行缓存池
    this.rowPool = [];
    this.init();
  }

  FormTable.prototype = {
    constructor: FormTable.prototype,
    init: function() {

      if (this.$element === null || !this.$element.length) {
        throw new Error('please specify the element for table');
      }

      $('<div class="table-wrapper"></div>').insertBefore(this.$element).append(this.$element);

      if (!this.hasInit) {
        this.$element.attr("cellSpacing", 0);
        this.footBar.$insertArea = $('<div class="form-table-footbar clearfix" id="' + $.IGuid() + '"></div>');
        this.$element.after(this.footBar.$insertArea);
      }
      let obj = {};
      for (let i = 0, l = this.columns.length; i < l; i++) {
        let t = this.columns[i];
        obj[t.field] = t;
      }
      this.columns = obj;

      let _this = this;
      this.hasInit || this.tableHandle.createHead.call(this);
      if (this.requestUrl) {
        this.requestData(function() {
          _this.hasInit || _this.bindEvent.call(_this);
          _this.hasInit = true;
          _this.showPageLeftBar || _this.footBar.$pageLeft && _this.footBar.$pageLeft.hide();
          _this.showPageRightBar || _this.footBar.$pageRight && _this.footBar.$pageRight.hide();
          _this.afterRendered && _this.afterRendered();
        });
      } else {
        if (typeof _this.beforeUpdate == 'function') {
          _this.beforeUpdate.call(_this, this.orignalData);
        }
        this.updateData();
        this.hasInit || this.bindEvent.call(this);
        this.hasInit = true;
        this.showPageLeftBar || this.footBar.$pageLeft && this.footBar.$pageLeft.hide();
        this.showPageRightBar || this.footBar.$pageRight && this.footBar.$pageRight.hide();
        _this.afterRendered && _this.afterRendered();
      }
    },
    //更新表格数据
    updateTable: function() {
      let length = this.data.length;
      if (this.maxLength && this.maxLength < length) {
        length = this.maxLength;
        this.data = this.data.splice(0, length);
      }

      if (this.showStyle == 1) {
        this.pageNum = Math.ceil(length / this.perNum);
      }

      this.$thead.find('.th-total').text(length ? ` (${length})` : '');
      this.getData.call(this);
      this.goPage(this.footBar.pageIndex);
      if (this.showPageLeftBar) {
        var pageCount = Math.ceil(length / this.perNum),
          text = pageCount > 1 ? '%s pages %s data' : '%s page %s data';
        if (this.pageLeftType == PAGELEFTTYPE.TOTAL) {
          this.footBar.$pageLeft.find(".page-total").html(_(text, [pageCount, length]));
        } else {
          this.footBar.$pageLeft.find("em.page-total").text(_(text, [pageCount, length]));
        }
      }
    },

    //请求数据
    requestData: function(cb) {
      let _this = this;
      _this.showLoader && _this.$tbody.html('<tr><td colspan="' + _this.totalColumn + '" class="text-center">' + _("Loading data...") + '</td></tr>');

      _this.xhr = $.ajax({
        url: this.requestUrl + "?" + (new Date().getTime()),
        cache: false,
        type: _this.requestType,
        dataType: "text",
        contentType: "application/json",
        data: JSON.stringify(this.requestOpt),
        async: true,
        success: function(data, status) {
          if (data.indexOf("login.js") > 0) {
            window.location.reload();
            return;
          }
          if (data.indexOf("quickset.js") > 0) {
            window.location.href = "quickset.html";
            return;
          }

          // try {
          data = JSON.parse(data);

          _this.returnData = data; //请求返回的数据

          if (typeof _this.beforeUpdate == 'function') {
            _this.beforeUpdate.call(_this, data, status);
          }

          _this.orignalData = _this.dataTarget ? data[_this.dataTarget] : data;
          // 若数据请求失败，则重新请求
          if (_this.orignalData === -1) {
            _this.requestData(cb);
            return;
          }
          _this.updateData();

          if (cb && typeof cb === 'function') {
            cb();
          }
          // } catch (e) {
          //     window.console && window.console.log && window.console.log(e);
          // }
        },
        error: function(msg, status) {
          // console && console.log && console.log(_("Data request failed!"));
        },
        complete: function(xhr) {
          xhr = null;
          _this.completeCallback && _this.completeCallback.call(_this);
        }
      });
    },

    //刷新table
    reLoad: function(data) {
      this.selectedRow = [];
      if (data) {
        this.orignalData = data;
        this.updateData();
        // if (typeof this.updateCallback == 'function') {
        //     this.updateCallback.apply(this, arguments);
        // }
      } else if (this.requestUrl) {
        this.requestData();
      }
      this.editData = [];
    },

    //数据二次处理
    updateData: function() {
      //对数据进行过滤
      this.filterData();
      //对数据进行排序
      this.sort();

      if (typeof this.updateCallback == 'function') {
        this.updateCallback.apply(this, arguments);
      }
    },
    //获取当前页数据
    getData: function() {
      if (this.showStyle === 2) {
        if (this.data && this.data instanceof Array) {
          this.pageData = this.data;
        } else {
          this.data = this.pageData = [];
        }
      } else {
        if (this.data && this.data instanceof Array) {
          if (this.dataIndex >= this.data.length && this.data.length > 0) {
            this.dataIndex -= this.perNum;
            this.footBar.pageIndex -= 1;
          }
          this.pageData = this.data.slice(this.dataIndex, this.dataIndex + this.perNum);
        } else {
          this.data = this.pageData = [];
        }
      }
    },

    sort: function() {
      let _this = this;

      //进行排序
      if (_this.sortFunction) {
        _this.data.sort(function(a, b) {
          return _this.sortFunction.apply(_this, arguments);
        });
      } else if (_this.sortFields && _this.sortFields.length > 0) {
        _this.data.sort(function(a, b) {
          return SortByProps(a, b, _this.sortFields, _this.sortOpt, _this.columns);
        });
      }

      //刷新数据,对数据进行排序时不改变数据的页数
      _this.updateTable();
    },

    filterData: function() {
      this.data = [];
      let k = this.filterProperty.length,
        p = this.filterProperty;
      if (this.filterValue !== "" && this.filterValue !== undefined && p && k > 0) {
        for (let i = 0, l = this.orignalData.length; i < l; i++) {
          let curData = this.orignalData[i];
          for (let j = 0; j < k; j++) {
            let curP = p[j],
              pData = curData[curP];
            if (pData !== "" && pData !== undefined) {
              if (typeof pData === 'string') {
                if (pData.indexOf(this.filterValue) > -1) {
                  this.data.push(curData);
                  break;
                }
              } else {
                if (pData === this.filterValue) {
                  this.data.push(curData);
                  break;
                }
              }
            } else if (curP.indexOf("#") > -1) { //对于A#B类型的筛选字段，如A有值则按A字段查找，否则按B字段查找
              let curps = curP.split("#");
              if (curData[curps[0]]) {
                if (curData[curps[0]].indexOf(this.filterValue) > -1) {
                  this.data.push(curData);
                  break;
                }
              } else if (curps.length > 1 && curData[curps[1]] && curData[curps[1]].indexOf(this.filterValue) > -1) {
                this.data.push(curData);
                break;
              }
            }
          }
        }
      } else {
        this.data = this.orignalData;
      }
    },

    setIndex: function(index) {
      index = index > this.pageNum ? this.pageNum : index;
      this.dataIndex = (index - 1) * this.perNum;
      this.dataIndex = this.dataIndex < 0 ? 0 : this.dataIndex;
      this.footBar.pageIndex = index <= 0 ? 1 : index;
    },

    goPage: function(pageIndex) {
      if (this.showStyle == 1) {
        this.setIndex(pageIndex);
      } else {
        this.dataIndex = 0;
        this.footBar.pageIndex = pageIndex;
      }

      this.tableHandle.createTable.call(this);
      this.showStyle === 1 && this.updateFootBar.call(this);
    },

    initBaseHtml: function() {
      if (!this.emptyHtml) {
        this.emptyHtml = `<tr class="form-table-empty">
                                        <td colspan="${this.totalColumn}" class="text-center nodata">
                                            <i class="icon-no-data"></i>
                                            <div>${_("No data")}</div>
                                        </td>
                                    </tr>`,
          this.loadingHtml = `<tr class="form-table-empty">
                                    <td colspan="${this.totalColumn}" class="text-center nodata">
                                        <div>${_("Loading data...")}</div>
                                    </td>
                                </tr>`;
      }

      if (!this.rowHtml) {
        let rowHtml = `<tr class="form-table-tr" data-id="{{dateKey}}" data-index="{{tableDataIndex}}">`;
        // 添加选择checkbox
        this.showCheckbox && (rowHtml += `<td data-field="checkColumn">
                                    <label for="{{ID}}" class="table-ckeck-l {{checkCss}}">
                                        <input id="{{ID}}" type="checkbox" data-index="{{tableDataIndex}}" data-key="{{dateKey}}" class="table-check check-single {{disabled}}" {{disabled}} {{checked}}/>
                                    </label>
                                </td>`);

        this.showIndex && (rowHtml += '<td width="40px" data-field="rowIndex">{{rowIndex}}</td>');

        // if (this.tHead.length > 0 && this.tHead[0]) {
        for (let j = 0; j < this.columnCount; j++) {
          let field = this.tHead[j],
            fObj = this.columns[field] || {},
            width = fObj["width"] || '';
          // 确定width的单位
          width += '';
          if (width && !/(%|px)$/.test(width)) {
            width += "px";
          }
          width = width ? `width="${width}"` : '';
          rowHtml += `<td ${width} ${fObj.format ? '' : 'class="ellipsis cell" title="{[' + field + '-title]}"'} data-field="${field}">{[{${field}}]}</td>`;
        }
        // }

        if (this.hasActionColumn) {
          rowHtml += '<td data-field="actionColumn">';
          let actions = this.actionColumn.actions;
          for (let j = 0, k = actions.length; j < k; j++) {
            let action = actions[j],
              css = "icon-" + action.type;

            rowHtml += '<i class="table-icon ' + css + '" data-key="{{dateKey}}" data-index="{{tableDataIndex}}" data-type="' + action.type + '"></i>';
          }
          rowHtml += '</td>';
        }
        rowHtml += '</tr>';
        this.rowHtml = rowHtml;
      }
    },

    tableHandle: {
      fillTable: function() {
        let _this = this;
        this.getData.call(this);

        let bodyHtml = '',
          dateKey = this.key,
          selected = 0,
          total = 0;

        this.initBaseHtml();

        this.$tbody.children('.form-table-empty').remove();

        this.rowPool = [];
        this.rowPool = Array.prototype.slice.call(this.$tbody.children(), 0);
        // 从对象池中取出已经构建的行进行复用
        if (!!this.pageData.length) {
          for (let i = 0, l = this.pageData.length; i < l; i++) {
            if (_this.limit && i >= _this.limit) {
              break;
            }
            let dataObj = this.pageData[i],
              tableDataIndex = this.dataIndex + i,
              checked = false,
              rowHtml = this.rowHtml;


            if (this.selectedRow.indexOf(dataObj[dateKey]) > -1) {
              checked = true;
              selected++;
            }

            if (this.rowPool.length > 0) {
              let $row = $(this.rowPool.shift());

              // 设置tr相关信息
              $row.attr({
                'data-id': dataObj[dateKey],
                'data-index': tableDataIndex
              });

              this.showCheckbox || total++;

              $row.children().each((index, col) => {
                let $col = $(col),
                  dataField = $col.attr('data-field');
                switch (dataField) {
                  // checkbox列
                  case 'checkColumn':
                    {
                      let css = '',
                        disabled = false;
                      if (this.disabledCheck && this.disabledCheck(dataObj)) {
                        //将checkbox置灰
                        disabled = true;
                        css = 'icon-check-off table-check-disabled';
                      } else {
                        css = checked ? "icon-check-on" : "icon-check-off";
                        total++;
                      }
                      let $check = $col.children('.table-ckeck-l').attr('class', 'table-ckeck-l ' + css).children('input');
                      $check.attr({
                        'data-index': tableDataIndex,
                        'data-key': dataObj[dateKey]
                      }).prop('checked', checked);
                      if (disabled) {
                        $check.addClass('disabled').prop('disabled', true);
                      } else {
                        $check.removeClass('disabled').removeAttr('disabled');
                      }
                      break;
                    }
                    // 序号列
                  case 'rowIndex':
                    $col.text(tableDataIndex + 1);
                    break;
                    // 操作按钮列
                  case 'actionColumn':
                    $col.find('i.table-icon').attr({
                      'data-key': dataObj[dateKey],
                      'data-index': tableDataIndex
                    });
                    break;
                    // 字段列
                  default:
                    let fObj = this.columns[dataField] || {},
                      node = dataObj[dataField];

                    if (fObj && fObj.format && typeof fObj.format === "function") {
                      node = fObj.format(node, fObj.field, dataObj);
                    } else if (node) {
                      node = node + '';
                      node = node.replace(/(\s|<|>|")/g, function(a) {
                        return htmlCode[a];
                      });
                      //高亮筛选字符
                      if (this.autoHighLight && this.filterValue && node && this.filterProperty.indexOf(dataField) > -1) {
                        node = node.replace(new RegExp(this.filterValue, "g"), '<span  class="bold">' + this.filterValue + '</span>');
                      }
                      $col.attr('title', dataObj[dataField]);
                      //end
                    }

                    node = node === '' ? '--' : node;
                    $col.html(node);
                    break;
                }

              });

              $row.removeClass('none');
            } else {
              // 设置tr相关信息
              rowHtml = rowHtml.replace(/\{\{dateKey\}\}/g, dataObj[dateKey]).replace(/\{\{tableDataIndex\}\}/g, tableDataIndex);
              let ID = $.IGuid();

              //渲染CheckBox disabledCheck
              if (this.showCheckbox) {
                let css = '',
                  checkedCss = '',
                  disabled = false;
                if (this.disabledCheck && this.disabledCheck(dataObj)) {
                  //将checkbox置灰
                  disabled = true;
                  css = 'icon-check-off table-check-disabled';
                } else {
                  css = checked ? "icon-check-on" : "icon-check-off";
                  checkedCss = checked ? "checked" : "";
                  total++;
                }
                rowHtml = rowHtml.replace(/\{\{ID\}\}/g, ID).replace(/\{\{checkCss\}\}/g, css).replace(/\{\{checked\}\}/g, checkedCss).replace(/\{\{disabled\}\}/g, disabled ? 'disabled' : '');
              } else {
                total++;
              }

              //渲染序号 rowIndex
              this.showIndex && (rowHtml = rowHtml.replace(/\{\{rowIndex\}\}/g, tableDataIndex + 1));

              if (this.tHead.length > 0 && this.tHead[0]) {
                for (let j = 0; j < this.columnCount; j++) {
                  let field = this.tHead[j],
                    fObj = this.columns[field] || {},
                    node = dataObj[field];

                  if (fObj && fObj.format && typeof fObj.format === "function") {
                    node = fObj.format(node, fObj.field, dataObj);
                  } else if (node) {
                    node = node + '';
                    node = node.replace(/(\s|<|>)/g, function(a) {
                      return htmlCode[a];
                    });
                    //高亮筛选字符
                    if (this.autoHighLight && this.filterValue && node && this.filterProperty.indexOf(field) > -1) {
                      node = node.replace(new RegExp(this.filterValue, "g"), '<span  class="bold">' + this.filterValue + '</span>');
                    }
                    //end
                  }

                  let reg = new RegExp('\\{\\[\\{' + field + '\\}\\]\\}', 'g'),
                    reg1 = new RegExp('\\{\\[' + field + '\\-title\\]\\}', 'g'),
                    titleText = (dataObj[field] === "" || dataObj[field] === undefined) ? '' : dataObj[field];

                  rowHtml = rowHtml.replace(reg, (node === "" || node === undefined) ? "--" : node).replace(reg1, titleText);
                }
              }
              bodyHtml += rowHtml;
            }
          }

          this.rowPool.forEach(row => {
            $(row).addClass('none');
          });
          bodyHtml && this.$tbody.append(bodyHtml);
        } else {
          this.$tbody.html(_this.emptyHtml);
        }

        this.$thead.data("selected", selected);
        this.$thead.data("total", total);
        if (this.showCheckbox && selected === this.pageData.length && selected > 0) {
          this.$checkAll && this.$checkAll.prop('checked', true).parent().removeClass('icon-check-off').addClass('icon-check-on');
        } else {
          this.$checkAll && this.$checkAll.prop('checked', false).parent().addClass('icon-check-off').removeClass('icon-check-on');
        }
      },
      createHead: function() {
        let _this = this,
          headHtml = "";

        _this.columnCount = 0;

        headHtml = '<tr>';
        for (let key in _this.columns) {
          _this.tHead.push(key);
          let colObj = _this.columns[key],
            hasTotal = _this.showTotalColumn.indexOf(key) > -1,
            width = colObj["width"] || '';
          width += '';
          _this.columnCount++;
          if (width && !/(%|px)$/.test(width)) {
            width += "px";
          }
          width = width ? `width="${width}"` : "";
          let sortText = colObj.sortable ? `class="sortabled" title="${_("Click to sort")}"` : '',
            titleText = (colObj['title'] || key) + (hasTotal ? `<span class="th-total"></span>` : ''),
            sortIcon = colObj.sortable ? `<i class="table-sort ${(_this.sortOpt[key] ? (_this.sortOpt[key] === 1 ? 'asc' : 'desc') : '')}"></i>` : '';

          headHtml += `<th data-field="${key}" ${sortText} ${width}>
                                    <label>
                                        ${titleText}
                                    </label>
                                        ${sortIcon}
                                </th>`;
        }
        headHtml += '</tr>';

        _this.totalColumn = _this.columnCount;
        if (_this.showIndex) {
          headHtml = headHtml.replace(/(<tr>)/g, '$1<th>' + _("ID") + '</th>');
          _this.totalColumn = _this.columnCount + 1;
        }

        if (_this.showCheckbox) {
          let ID = $.IGuid();
          headHtml = headHtml.replace(/(<tr>)/g, '$1<th class="check"><label for="' + ID + '" class="table-ckeck-l icon-check-off"><input id="' + ID + '" type="checkbox" class="table-check check-all"/></label></th>');
          _this.totalColumn = _this.columnCount + 1;
        }

        if (_this.hasActionColumn) {
          let actionObj = _this.actionColumn;
          headHtml = headHtml.replace(/(<\/tr>)/g, '<th ' + (actionObj["width"] ? 'width="' + actionObj["width"] + '"' : "") + '>' + _this.actionColumn.columnName + '</th>$1');
          _this.totalColumn = _this.columnCount + 1;
        }

        _this.$thead.html(headHtml).find("th").addClass('form-table-th').end().appendTo(_this.$element);
        _this.$tbody.html(_this.loadingHtml);
      },

      createTable: function() {
        this.tableHandle.fillTable.call(this);
        this.hasInit || this.render();

        for (let key in this.columns) {
          if (this.columns.hasOwnProperty(key)) {
            let item = this.columns[key];
            if (item.rendered && typeof item.rendered === "function") {
              item.rendered.call(this, item.field);
            }

            if (!this.hasInit && item.headRendered && typeof item.headRendered === "function") {
              item.headRendered.call(this, item.field);
            }
          }
        }
      },

      refreshTable: function() {
        this.selectedRow = this.getSelected();
        this.tableHandle.fillTable.call(this);
        // this.render();
        for (let key in this.columns) {
          if (this.columns.hasOwnProperty(key)) {
            let item = this.columns[key];
            if (item.rendered && typeof item.rendered === "function") {
              item.rendered.call(this, item.field);
            }
          }
        }
      }
    },

    bindEvent: function() {
      let _this = this;
      this.footBar.$insertArea.off("click.FormTable").on('click.FormTable', 'a', function() {
        if (this.className.indexOf('disabled') > -1 || this.className.indexOf('active') > -1) {
          return false;
        }
        if (this.className.indexOf('pre') > -1) {
          _this.footBar.pageIndex = _this.footBar.pageIndex < 2 ? 1 : _this.footBar.pageIndex - 1;
        } else if (this.className.indexOf('next') > -1) {
          _this.footBar.pageIndex = _this.footBar.pageIndex > _this.pageNum - 1 ? _this.pageNum : +_this.footBar.pageIndex + 1;
        } else {
          _this.footBar.pageIndex = ~~(this.innerHTML);
        }
        // _this.selectedRow = _this.getSelected();
        _this.goPage(_this.footBar.pageIndex);
        _this.goPageCallBack && _this.goPageCallBack.call(_this);
        return false;
      });

      //点击排序
      this.$element.off("click.FormTableHead").on("click.FormTableHead", "th.sortabled", function() {
        let $this = $(this),
          fieldOld = $this.attr("data-field"),
          field;

        field = fieldOld;
        if (_this.columns[field].sortCallBack) {
          let opt = _this.columns[field].sortCallBack();
          if (opt) {
            field = opt.field;
            _this.sortOpt[field] = opt.sort;
            _this.columns[fieldOld].sortValueType = opt.sortValueType || 0;
            field && _this.sortFields.splice(_this.sortFields.indexOf(field), 1);
          }
        } else {
          if (_this.sortOpt[field]) {
            _this.sortOpt[field] = _this.sortOpt[field] === 1 ? 2 : 1;
            _this.sortFields.splice(_this.sortFields.indexOf(field), 1);
          } else {
            _this.sortOpt[field] = 1;
          }

          if (_this.sortOpt[field] !== 1) {
            $this.find('.table-sort').addClass("desc").removeClass("asc");
          } else {
            $this.find('.table-sort').removeClass("desc").addClass("asc");
          }
        }
        _this.sortFields.push(field);

        //低版本IE8字体库兼容性问题
        if (!$.support.leadingWhitespace) {
          let $tar = $this.find('.table-sort').removeClass('table-sort');
          setTimeout(function() {
            $tar.addClass('table-sort');
          }, 100);
        }
        //end

        _this.sort();
      });

      //分页
      this.footBar.$insertArea.off("change.FormTable").on("change.FormTable", ".select-page", function() {
        _this.perNum = ~~(this.value);
        // console.log(_this.perNum);
        //重新渲染table
        _this.updateTable.call(_this);
        _this.changePageNumCallBack && _this.changePageNumCallBack.call(_this);
      });

      if (this.showCheckbox) {
        this.$element.off("change.FormTable").on("change.FormTable", ".table-check", function(e) {
          _this.$checkAll = _this.$checkAll || _this.$thead.find('input.check-all');
          if (this.className.indexOf("check-all") > -1) { //全选
            if (_this.data.length === 0) {
              return false;
            }
            let $par = _this.$element.children('tbody').children('tr:not(.none)').find("input.table-check").not('.disabled').prop("checked", this.checked).parent();
            this.checked ? $par.removeClass('icon-check-off').addClass('icon-check-on') : $par.addClass('icon-check-off').removeClass('icon-check-on');

            if (this.checked) {
              _this.$thead.data("selected", _this.$thead.data("total"));
            } else {
              _this.$thead.data("selected", 0);
            }
          } else if (this.className.indexOf("check-single") > -1) { //单选
            if (this.checked) {
              let selected = parseInt(_this.$thead.data("selected")) + 1;

              selected == _this.$thead.data("total") && _this.$checkAll.prop("checked", true).parent().removeClass('icon-check-off').addClass('icon-check-on');
              _this.$thead.data("selected", selected);
            } else {
              _this.$checkAll.prop("checked", false).parent().addClass('icon-check-off').removeClass('icon-check-on');
              _this.$thead.data("selected", parseInt(_this.$thead.data("selected")) - 1);
            }
          }
          this.checked ? $(this).parent().removeClass('icon-check-off').addClass('icon-check-on') : $(this).parent().addClass('icon-check-off').removeClass('icon-check-on');
        });
      }

      if (_this.hasActionColumn) {
        _this.actionCallback = {};
        for (let i = 0, len = _this.actionColumn.actions.length; i < len; i++) {
          let action = _this.actionColumn.actions[i];
          _this.actionCallback[action.type] = action.callback;
        }

        _this.$element.off("click.FormTable").on("click.FormTable", ".table-icon", function(event) {
          let $this = $(this),
            index = parseInt($this.attr("data-index")),
            type = $this.attr("data-type");

          _this.actionCallback[type].call(this, index);
        });
      }
    },

    abort: function() {
      if (this.xhr) {
        this.xhr.abort();
      }
    },

    showBtn: function(visible) {
      if (visible === true && typeof visible == 'boolean') {
        if (this.pageNum < 2 || !this.pageData.length) {
          this.footBar.$pageRight.hide();
          this.footBar.$pageLeft.hide();
        } else {
          this.footBar.$pageRight.show();
          this.footBar.$pageLeft.show();
        }
      } else {
        this.footBar.$pageRight.hide();
        this.footBar.$pageLeft.hide();
      }
    },

    updateFootBar: function() {
      let btnEle = '',
        btnPre = '',
        btnNext = '',
        min = 0,
        max = 0,
        btnFirst = '',
        btnLast = '';

      if (this.pageNum < this.footBar.maxIndex) {
        min = 2;
        max = this.pageNum > min ? this.pageNum - 1 : min;
      } else {
        let area = Math.ceil(this.footBar.maxIndex - 3) / 2;
        max = +this.footBar.pageIndex + area >= this.pageNum - 1 ? this.pageNum - 1 : +this.footBar.pageIndex + area;
        min = +this.footBar.pageIndex - area <= 2 ? 2 : +this.footBar.pageIndex - area;

        if (this.footBar.pageIndex - min < area) { //如果最小值按钮个数不够，则从最大值那边添数
          max = (max + area - (this.footBar.pageIndex - min)) >= this.pageNum - 1 ? this.pageNum - 1 : +max + area - (this.footBar.pageIndex - min);
        } else if (max - this.footBar.pageIndex < area) {
          min = (min - area + (max - this.footBar.pageIndex)) <= 2 ? 2 : min - area + (max - this.footBar.pageIndex);
        }
      }

      if (min <= max && min < this.pageNum) {
        for (let i = min; i <= max; i++) {
          if (i != this.footBar.pageIndex) {
            btnEle += '<a class="btn-page">' + i + '</a>';
          } else {
            btnEle += '<a class="btn-page active">' + i + '</a>';
          }
        }
      }

      if (this.footBar.pageIndex == 1) {
        btnFirst = '<a class="btn-page active">1</a>';
        btnLast = '<a class="btn-page">' + this.pageNum + '</a>';
      } else if (this.footBar.pageIndex == this.pageNum) {
        btnFirst = '<a class="btn-page">1</a>';
        btnLast = '<a class="btn-page active">' + this.pageNum + '</a>';
      } else {
        btnFirst = '<a class="btn-page">1</a>';
        btnLast = '<a class="btn-page">' + this.pageNum + '</a>';
      }

      if (min > 2) {
        btnFirst += this.footBar.hiddenInfo;
      }
      if (max < this.pageNum - 1) {
        btnLast = this.footBar.hiddenInfo + btnLast;
      }

      let rightHtml = [];
      rightHtml.push('<div class="page-right">');
      rightHtml.push('<a class="btn-page pre ' + (this.footBar.pageIndex == 1 ? 'disabled" disabled="disabled"' : '"') + '>' + _("Previous") + '</a>');
      rightHtml.push(btnFirst);
      rightHtml.push(btnEle);
      rightHtml.push(btnLast);
      rightHtml.push('<a class="btn-page next ' + (this.footBar.pageIndex == this.pageNum ? 'disabled" disabled="disabled"' : '"') + '">' + _("Next") + '</a>');
      rightHtml.push('</div>');
      this.footBar.$pageRight = $(rightHtml.join(""));

      var pageCount = Math.ceil(this.data.length / this.perNum),
        text = pageCount > 1 ? '%s pages %s data' : '%s page %s data';
      if (!this.hasInit) {
        let leftHtml = [];
        if (this.pageLeftType === PAGELEFTTYPE.TOTAL) {
          leftHtml.push('<div class="page-left page-total">' + _(text, [pageCount, this.data.length]));
          leftHtml.push('</div>');
        } else {
          let select = '<select class="select-page">';
          for (let i = 0, l = this.perArray.length; i < l; i++) {
            let count = this.perArray[i];
            select += '<option value="' + count + '" ' + (count === this.perNum ? 'selected' : '') + '>' + count + '</option>';
          }
          select += '</select>';

          leftHtml.push('<div class="page-left">' + select);
          leftHtml.push('<em class="page-total">' + _(text, [pageCount, this.data.length]) + '</em>');
          leftHtml.push('</div>');
        }
        this.footBar.$pageLeft = $(leftHtml.join(""));

        this.showPageLeftBar && this.footBar.$insertArea.html(this.footBar.$pageLeft);
        this.showPageRightBar && this.footBar.$insertArea.append(this.footBar.$pageRight);
      } else {
        if (this.pageLeftType === PAGELEFTTYPE.TOTAL) {
          this.footBar.$pageLeft.html(_(text, [pageCount, this.data.length]));
        } else {
          this.footBar.$pageLeft.find('em.page-total').html(_(text, [pageCount, this.data.length]));
        }
        this.showPageRightBar && this.footBar.$insertArea.children('.page-right').replaceWith(this.footBar.$pageRight);
      }

      this.footBar.$insertArea.find('input').val(this.footBar.pageIndex);
      this.showBtn.call(this, true);
    },

    render: function() {
      this.$element.append(this.$tbody);
    },

    //以下为调用者可操作的方法
    getSelected: function() {
      let index = [];
      // this.$tbody.children('tr:not(.none)').find('input.table-check:checked').each(function(argument) {
      //     index.push(parseInt($(this).attr("data-key")));
      // });
      this.$tbody.children('tr:not(.none)').find('input.table-check:checked').each(function(argument) {
        index.push(parseInt($(this).attr("data-key")));
      });
      return index;
    },
    getSelectedData: function() {
      let data = [],
        that = this;
      this.$tbody.children('tr:not(.none)').find('input.table-check:checked').each(function(argument) {
        let index = parseInt($(this).attr("data-index"));
        data.push(that.data[index]);
      });
      return data;
    },

    deleteRow: function(index) {
      if (index) {
        if (Object.prototype.toString.call(index) === "[object Array]") {
          for (let i = 0, l = index.length; i < l; i++) {
            this.data.splice(index[i], 1);
          }
        } else {
          this.data.splice(index, 1);
        }
        this.updateTable();
      }
    },

    addRow: function(data) {
      if (!data || typeof data != "object") {
        return;
      }

      if (Object.prototype.toString.call(data) === "[object Object]") {
        this.data.unshift(data);
      } else if (Object.prototype.toString.call(data) === "[object Array]") {
        this.data = data.concat(this.data);
      }

      this.update();
    },

    setRowDisabled: function() {
      //
    },

    //获取当前table过滤和排序后用于显示数据
    getValue: function() {
      return this.orignalData;
    },
    // 获取筛选后的数据
    getFilterValue: function() {
      return this.data;
    },

    addEditData: function(index, field, value) {
      let data = this.data[index];
      index = data[this.key] || index;
      if (!this.editData[index]) {
        this.editData[index] = {};
        this.editData[index][this.key] = index;
        for (let i = 0, l = this.editColumn.length; i < l; i++) {
          let key = this.editColumn[i];
          this.editData[index][key] = data[key];
        }
      }
      this.editData[index][field] = value;
    },

    getEditData: function() {
      let data = [];
      for (let key in this.editData) {
        if (this.editData.hasOwnProperty(key)) {
          data.push(this.editData[key]);
        }
      }
      return data;
    },

    updatRow: function(index, dataObj) {
      if (this.data.length <= index || !dataObj) {
        return;
      }
    },

    getDataIndex: function(tar) {
      if (tar) {
        return parseInt($(tar).closest('tr.form-table-tr').attr("data-index"));
      }
      return -1;
    },

    //如果自定义列有改变当前单元格的值，则在回调函数中必需返回修改后值的key:value键值对
    //用以更新列表的数据，若无返回值，则不发同步更新数据
    //只能给当前的列元素绑定事件
    addEvent: function(eventName, eventTarget, callback) {
      let _this = this;
      eventName += ".FormTableScr";
      _this.$element.off(eventName).on(eventName, eventTarget, function() {
        if (callback) {
          let index = _this.getDataIndex(this);
          let obj = callback();
          obj && _this.updatRow(index, obj);
        }
      });
    },

    hide: function() {
      this.$element.hide();
      this.footBar.$insertArea.hide();
    },
    show: function() {
      this.$element.show();
      this.footBar.$insertArea.show();
    }
  };

  $.fn.FormTable = function(opt) {
    let args = Array.prototype.slice.call(arguments, 1),
      outData, formtable;

    this.each(function() {
      let $this = $(this);
      formtable = $this.data("formtable");
      if (formtable && opt && typeof opt === "string") {
        if (formtable[opt]) {
          outData = formtable[opt].apply(formtable, args);
        }

      } else {
        if (formtable) {
          formtable.footBar.$insertArea.remove && formtable.footBar.$insertArea.remove();
          opt = $.extend({}, formtable.defaultOption, opt);
          $this.html("");
        }
        formtable = new FormTable($this, opt);
        $this.data('formtable', formtable);
      }
    });
    if (outData) {
      return outData;
    }
    return formtable;
  };

  $.fn.TablePage = $.fn.FormTable;

  /**
   * 
   * @param {*} item1 值1
   * @param {*} item2 值2
   * @param {*} fields 当前需要进行排序的字段
   * @param {*} options 当前的排序规格
   * @param {*} columns 当前列的配置信息
   */
  function SortByProps(item1, item2, fields, options, columns) {
    "use strict";

    let cps = []; // 存储排序属性比较结果。

    let asc = true; //升序

    if (fields && fields.length > 0) {
      for (let i = fields.length - 1; i >= 0; i--) {
        let prop = fields[i];
        let data1 = item1[prop],
          data2 = item2[prop];
        asc = options[prop] === 1;
        if (columns[prop]) {
          switch (columns[prop]["sortValueType"]) {
            case 1:
              data1 = Number(data1);
              data2 = Number(data2);
              break;
            case 2:
              data1 = String(data1);
              data2 = String(data2);
              break;
            case 3:
              data1 = ipNumber(data1);
              data2 = ipNumber(data2);
              break;
          }
        }

        if (data1 > data2) {
          cps.push(asc ? 1 : -1);
          break; // 大于时跳出循环。
        } else if (data1 === data2) {
          cps.push(0);
        } else {
          cps.push(asc ? -1 : 1);
          break; // 小于时跳出循环。
        }
      }
    }

    for (let j = 0; j < cps.length; j++) {
      if (cps[j] === 1 || cps[j] === -1) {
        return cps[j];
      }
    }
    return 0;
  }

  function ipNumber(ip) {
    var ipArr = ip.split("."),
      ipStr = "",
      i;
    for (i = 0; i < ipArr.length; i++) {
      switch (3 - ipArr[i].length) {
        case 0:
          ipStr += ipArr[i];
          break;
        case 1:
          ipStr += "0" + ipArr[i];
          break;
        case 2:
          ipStr += "00" + ipArr[i];
          break;
      }
    }
    return Number(ipStr);
  }

}(jQuery));