'use strict';

angular.module('core')
    .controller('HeaderController', ['$scope', '$rootScope', 'Authentication', 'Menus', '$location', '$timeout',
        function($scope, $rootScope, Authentication, Menus, $location, $timeout ) {
            $rootScope.user = Authentication.user;

            // If user is not signed in then redirect back home
            if (!$rootScope.user) $location.path('/signin');

            $scope.authentication = Authentication;
            $scope.isCollapsed = false;
            $scope.menu = Menus.getMenu('topbar');

            if($rootScope.user){
                $timeout(function(){
                    $rootScope.$broadcast('dataloaded');
                },100);
            }

            $scope.toggleCollapsibleMenu = function() {
                $scope.isCollapsed = !$scope.isCollapsed;
            };

            // Collapsing the menu after navigation
            $scope.$on('$stateChangeSuccess', function() {
                $scope.isCollapsed = false;
            });
        }
    ]);