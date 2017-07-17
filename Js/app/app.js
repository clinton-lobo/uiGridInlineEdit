var app = angular.module('app',
    [
        'ui.grid',
        'ui.grid.pagination',
        'ui.grid.selection',
        'ui.grid.edit',
        'ui.grid.rowEdit',
        'ui.grid.saveState'
    ]);

app.filter('genderFilter', function () {
    var genderHash = {
        'M': 'male',
        'F': 'female'
    };

    return function (input) {
        var result;
        var match;
        if (!input) {
            return '';
        } else if (result = genderHash[input]) {
            return result;
        } else if ((match = input.match(/(.+)( \([$\d,.]+\))/)) && (result = genderHash[match[1]])) {
            return result + match[2];
        } else {
            return input;
        }
    };
});

app.filter('maritalFilter', function () {
    var genderHash = {
        'M': 'Married',
        'S': 'Single'
    };

    return function (input) {
        var result;
        var match;
        if (!input) {
            return '';
        } else if (result = genderHash[input]) {
            return result;
        } else if ((match = input.match(/(.+)( \([$\d,.]+\))/)) && (result = genderHash[match[1]])) {
            return result + match[2];
        } else {
            return input;
        }
    };
})

app.controller('gridCtrl', ['$scope', '$http', '$log', '$timeout', 'uiGridConstants', '$q', '$interval',
    function ($scope, $http, $log, $timeout, uiGridConstants, $q, $interval) {
        $scope.gridOptions = {
             	      enableSorting: true,
	        enableFiltering: true,
	        enableRowSelection: true,
	        enableFullRowSelection: false,
	        enableSelectAll: true,
	        enableInlineRowEditing : true,
	        enableGridMenu: false,
	        disableMouseWheel:true,
	        gridMenuShowHideColumns: false,
	        enableColumnMenus: false,
	        enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
	        paginationPageSizes: [5, 10, 15],
	        enablePaginationControls: true,
	        paginationPageSize: 10,
	        onRegisterApi: function (gridApi) {
          	$scope.grid1Api = gridApi;
	            $timeout(function() {  
	            	gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW);
	            },300);
	            gridApi.selection.on.rowSelectionChanged($scope,function(row){
	        		  setInlineEditing(row);
	            });
	            gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
	                var filtered = _.filter(gridApi.grid.rows, function(o) { return o.visible; });
  	               filtered.forEach(function(thisRow){
  	            		setInlineEditing(thisRow);
  	            	});	
	            });
	            gridApi.core.on.canvasHeightChanged($scope, function(oldHeight, newHeight) {
	            	handleWindowResize();
	            });
          },
	        columnDefs: [
                { name: 'employeeid', enableCellEdit: false, enableCellEditOnDblClick:false, type: "number" },
                { name: 'managerid', enableCellEdit: true, enableCellEditOnDblClick:false },
                { name: 'title', enableCellEdit: true, enableCellEditOnDblClick:false},
                { name: 'birthdate', enableCellEdit: false, type: "date", cellFilter: 'date:"yyyy/MM/dd"' },
                {
                    name: 'gender', enableCellEdit: false, enableCellEditOnDblClick:false, cellFilter: 'genderFilter',
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'gender',
                    editDropdownOptionsArray: [
                        { id: 'M', gender: 'male' },
                        { id: 'F', gender: 'female' }]
                },                
                {
                    name: 'maritalstatus', enableCellEdit: true, enableCellEditOnDblClick:false, cellFilter: "maritalFilter",
                    editableCellTemplate: 'ui-grid/dropdownEditor',
                    editDropdownValueLabel: 'maritalstatus',
                    editDropdownOptionsArray: [
                        { id: 'M', maritalstatus: 'Married' },
                        { id: 'S', maritalstatus: 'Single' }]
                }
            ]
        };

        $http.get('../../data/employeeData.json')
            .success(function (data) {
                $scope.gridOptions.data = data.slice(0, 55);
            });

      	function setInlineEditing(row){
      		if(row.isSelected && row.inlineEdit){
      			row.inlineEdit.isEditModeOn = true;
      			row.inlineEdit.enterEditMode();
      		}
      		if(!row.isSelected && row.inlineEdit){
      		  console.log("In setInlineEditing = false");
      		  row.inlineEdit.isEditModeOn = false;
      			row.inlineEdit.cancelEdit();
      		}
      	}
      	function handleWindowResize(){
      		if($scope.grid1Api){
      	    	$interval(function(){
      	    		$scope.grid1Api.core.handleWindowResize();
      	    	},250,5);			
      		} 
      	}
      	$scope.saveAll = function(){
        		$scope.grid1Api.grid.rows.forEach(function(row) {
        			if(row.inlineEdit && row.inlineEdit.isEditModeOn){
        				row.inlineEdit.saveEdit();
        			}			
        		});
	      };
	      $scope.cancelAll = function(){
        	$scope.grid1Api.selection.clearSelectedRows();
      		$("form[name='inputForm']").parent(".ng-scope").remove();
      		$(".ui-grid-cell-contents-hidden").removeClass("ui-grid-cell-contents-hidden");
      	};
    }]);