'use strict';

// Employeetypes controller
angular.module('employees').controller('EmployeetypesController', [
    '$scope',
    '$stateParams',
    '$location',
    '$resource',
    'Authentication',
    'Employeetypes',
    'MyModules',
    'Localization',
    '_',
	function($scope, $stateParams, $location, $resource, Authentication, Employeetypes , MyModules, Localization, _) {
		$scope.lang = Localization.lang;
		$scope.local = Localization;
		$scope.authentication = Authentication;

		// Create new Employeetype
		$scope.create = function() {
            $scope.modal_is_submitted = !$scope.modal_is_submitted;
			// Redirect after save
			$scope.employeetype.$save(function(response) {
				$location.path('employees/types/listing/' + response._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

        $scope.init = function(){
            // Create new Employeetype object
            $scope.employeetype = new Employeetypes ({
                name: '',
                privileges: []
            });
            MyModules.query({}, function(modules){
                $scope.modules = modules;
            });
        };

		// Remove existing Employeetype
		$scope.remove = function( employeetype ) {
			if ( employeetype ) { employeetype.$remove();

				for (var i in $scope.employeetypes ) {
					if ($scope.employeetypes [i] === employeetype ) {
						$scope.employeetypes.splice(i, 1);
					}
				}
			} else {
				$scope.employeetype.$remove(function() {
					$location.path('employeetypes');
				});
			}
		};

		// Update existing Employeetype
		$scope.update = function() {
            $scope.modal_is_submitted = !$scope.modal_is_submitted;
			if($scope.frmEmployeeType.$valid){
                var employeetype = $scope.employeetype ;
                employeetype.$update(function() {
                    $location.path('employees/types/listing/' + employeetype._id);
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
		};

		// Find a list of Employeetypes
		$scope.find = function() {
            var Counter = $resource('/employeetypes/count',{},{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                Employeetypes.query({
                    page : $scope.currentPage,
                    sort: $scope.sort,
                    by : $scope.by,
                    status : $scope.status
                }, function(employeetypes){
                    $scope.employeetypes = employeetypes;
                });
            };

            $scope.sortBy = function(field){
                if($scope.sort !== field){
                    $scope.by = true;
                    $scope.sort = field;
                } else {
                    $scope.by = !$scope.by;
                }
                $scope.populate();
            };

            $scope.pageLimit = 10;
            $scope.currentPage = 1;
            Counter.query(function(count){
                $scope.totalItems = count.total;
                $scope.populate();
            });
		};

		// Find existing Employeetype
		$scope.findOne = function() {
            Employeetypes.get({
                employeetypeId: $stateParams.employeetypeId
            }, function(employeetype){
                $scope.employeetype = employeetype;

                MyModules.query({}, function(modules){
                    $scope.modules = modules;
                    $scope.initValue();
                });
            });
		};

        $scope.initValue = function(){
            var initializeModule = function(_module_){
                var roles = $scope.employeetype.privileges;
                $scope.employeetype.privilege = roles;
                angular.forEach(roles, function(privilege){
                    angular.forEach(_module_, function(module){
                        if(privilege === module._id){
                            module.checked = true;
                            initializeModule(module.privileges);
                        }
                    });
                });
            };
            initializeModule($scope.modules);
        };

        $scope.updateEmployee = function(item){
            var found = false;
            for (var i in $scope.employeetype.privileges) {
                if($scope.employeetype.privileges[i]===item._id){
                    found = true;
                    if(!item.checked){
                        $scope.employeetype.privileges.splice(i, 1);
                    }
                }
            }
            if(!found&&item.checked){
                $scope.employeetype.privileges.push(item._id);
            }
            if(item.privileges){
                angular.forEach(item.privileges, function(i){
                    i.checked = item.checked;
                    $scope.updateEmployee(i);
                });
            }
        };
	}
]);