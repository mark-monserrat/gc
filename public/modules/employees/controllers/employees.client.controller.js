'use strict';

// Employees controller
angular.module('employees').controller('EmployeesController', [
    '$scope',
    '$http',
    '$stateParams',
    '$location',
    '$resource',
    '$timeout',
    'Authentication',
    'Employees',
    'Localization',
    'Countries',
    'MyModules',
    'Employeetypes',
    'blockUI',
    '_',
	function($scope, $http, $stateParams, $location, $resource, $timeout, Authentication, Employees, Localization, Countries, MyModules, Employeetypes, blockUI, _) {
        $scope.authentication = Authentication;

        $scope.local = Localization;
        $scope.lang = Localization.lang;

        // Create new Employee
        $scope.create = function () {
            $scope.modal_is_submitted = !$scope.modal_is_submitted;
            // Redirect after save
            $scope.employee.$save(function (response) {
                $location.path('employees/' + response._id);
            }, function (errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.init = function () {
            $scope.countries = Countries.query();
            $scope.employee = new Employees({
                role:[]
            });
            var modules = MyModules.query();
            var employeetypes = Employeetypes.query();

            $scope.modules = modules;
            $scope.employeetypes = employeetypes;
        };

        // Remove existing Employee
        $scope.remove = function (employee) {
            if (employee) {

                employee.$remove();

                for (var i in $scope.employees) {
                    if ($scope.employees [i] === employee) {
                        $scope.employees.splice(i, 1);
                    }
                }
            } else {
                $scope.employee.$remove(function () {
                    $location.path('employees');
                });
            }
        };

        // Update existing Employee
        $scope.update = function () {
            $scope.modal_is_submitted = !$scope.modal_is_submitted;
            if($scope.frmEmployee.$valid) {
                var employee = $scope.employee;
                employee.$update(function () {
                    $location.path('employees/' + employee._id);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        // Find a list of Employees
        $scope.find = function () {
            var Counter = $resource('/employees/count',{},{
                query : {method:'GET', isArray:false}
            });

            $scope.populate = function(){
                Employees.query({
                    page : $scope.currentPage,
                    sort: $scope.sort,
                    by : $scope.by,
                    status : $scope.status
                }, function(employees ){
                    $scope.employees  = employees ;
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

//        $scope.$on('loaded', function(){
            var checkChange = function(){
                try{
                    if($scope.employee.role!==undefined){
                        var privileges;
                        var employee_types = JSON.parse(JSON.stringify($scope.employeetypes));
                        for(var i in employee_types){
                            if(employee_types[i]._id===$scope.employee.employee_type){
                                privileges = employee_types[i].privileges;
                            }
                        }
                        $scope.isChanged = $scope.employee.employee_type===null || _.difference(privileges,$scope.employee.role).length>0;
                    } else {
                        $scope.isChanged = false;
                    }
                    $scope.employee.employee_type = $scope.isChanged ? null :$scope.employee.employee_type;
                } catch(e){

                }
            };

//        });
//        $scope.$watch('employee.role',function(){
//            checkChange();
//        });

        // Find existing Employee
        $scope.findOne = function () {
            Employees.get({
                employeeId: $stateParams.employeeId
            }, function(employee){
                $scope.employee = employee;

                MyModules.query({}, function(modules){
                    $scope.modules = modules;
                    $scope.initValue();
                });
            });
            var employeetypes = Employeetypes.query();
            $scope.employeetypes = employeetypes;
            $scope.countries = Countries.query();
            $scope.isChanged = false;
        };

        $scope.initValue = function(update){
            var roles;
            var initializeModule = function(_module_){
                $scope.employee.role = roles;
                console.log(roles);
                angular.forEach(roles, function(privilege){
                    angular.forEach(_module_, function(module){
                        if(privilege === module._id){
                            module.checked = true;
                            initializeModule(module.privileges);
                        }
                    });
                });
            };
            if(update){
                $scope.isChange = false;
                $scope.modules = [];
                blockUI.start();
                $timeout(function(){
                    MyModules.query({}, function(modules){
                        $scope.modules = modules;
                        var employee_types = JSON.parse(JSON.stringify($scope.employeetypes));
                        for(var i in employee_types){
                            if(employee_types[i]._id===$scope.employee.employee_type){
                                roles = employee_types[i].privileges;
                            }
                        }
                        initializeModule($scope.modules);
                        blockUI.stop();
                    });
                },100);
            } else {
                roles = $scope.employee.role;
                initializeModule($scope.modules);
            }
        };

        $scope.updateEmployee = function(item){
            console.log('1');
            var found = false;
            for (var i in $scope.employee.role) {
                if($scope.employee.role[i]===item._id){
                    found = true;
                    if(!item.checked){
                        $scope.employee.role.splice(i, 1);
                    }
                }
            }
            if(!found&&item.checked){
                $scope.employee.role.push(item._id);
            }
            if(item.privileges){
                angular.forEach(item.privileges, function(i){
                    i.checked = item.checked;
                    $scope.updateEmployee(i);
                });
            }
            checkChange();
        };

        $scope.generate_password = function(){
            $http.post('/employees/reset_password/'+$scope.employee._id).success(function(response) {
                // If successful show success message and clear form
            }).error(function(response) {
                $scope.error = response.message;
            });
        };

	}
]);