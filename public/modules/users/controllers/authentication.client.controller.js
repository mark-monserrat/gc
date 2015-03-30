'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$rootScope', '$http', '$location', 'Authentication',
	function($scope, $rootScope, $http, $location, Authentication) {
		$scope.authentication = Authentication;

		//If user is signed in then redirect back home
		if ($scope.authentication.user) $location.path('/');

		$scope.signin = function() {
			$http.post('/auth/signin', $scope.credentials).success(function(response) {
				//If successful we assign the response to the global user model
				$scope.authentication.user = response;
				//And redirect to the index page
				$location.path('/');

                $rootScope.user = response;

//                $scope.$apply(function(){
//                });

                $rootScope.$broadcast('dataloaded');
                $rootScope.pagewraper = true;
			}).error(function(response) {
				$scope.error = response.message;
			});
		};
	}
]);