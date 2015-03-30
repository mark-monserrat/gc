'use strict';

(function() {
	// Employeetypes Controller Spec
	describe('Employeetypes Controller Tests', function() {
		// Initialize global variables
		var EmployeetypesController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Employeetypes controller.
			EmployeetypesController = $controller('EmployeetypesController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Employeetype object fetched from XHR', inject(function(Employeetypes) {
			// Create sample Employeetype using the Employeetypes service
			var sampleEmployeetype = new Employeetypes({
				name: 'New Employeetype'
			});

			// Create a sample Employeetypes array that includes the new Employeetype
			var sampleEmployeetypes = [sampleEmployeetype];

			// Set GET response
			$httpBackend.expectGET('employeetypes').respond(sampleEmployeetypes);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.employeetypes).toEqualData(sampleEmployeetypes);
		}));

		it('$scope.findOne() should create an array with one Employeetype object fetched from XHR using a employeetypeId URL parameter', inject(function(Employeetypes) {
			// Define a sample Employeetype object
			var sampleEmployeetype = new Employeetypes({
				name: 'New Employeetype'
			});

			// Set the URL parameter
			$stateParams.employeetypeId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/employeetypes\/([0-9a-fA-F]{24})$/).respond(sampleEmployeetype);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.employeetype).toEqualData(sampleEmployeetype);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Employeetypes) {
			// Create a sample Employeetype object
			var sampleEmployeetypePostData = new Employeetypes({
				name: 'New Employeetype'
			});

			// Create a sample Employeetype response
			var sampleEmployeetypeResponse = new Employeetypes({
				_id: '525cf20451979dea2c000001',
				name: 'New Employeetype'
			});

			// Fixture mock form input values
			scope.name = 'New Employeetype';

			// Set POST response
			$httpBackend.expectPOST('employeetypes', sampleEmployeetypePostData).respond(sampleEmployeetypeResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Employeetype was created
			expect($location.path()).toBe('/employeetypes/' + sampleEmployeetypeResponse._id);
		}));

		it('$scope.update() should update a valid Employeetype', inject(function(Employeetypes) {
			// Define a sample Employeetype put data
			var sampleEmployeetypePutData = new Employeetypes({
				_id: '525cf20451979dea2c000001',
				name: 'New Employeetype'
			});

			// Mock Employeetype in scope
			scope.employeetype = sampleEmployeetypePutData;

			// Set PUT response
			$httpBackend.expectPUT(/employeetypes\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/employeetypes/' + sampleEmployeetypePutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid employeetypeId and remove the Employeetype from the scope', inject(function(Employeetypes) {
			// Create new Employeetype object
			var sampleEmployeetype = new Employeetypes({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Employeetypes array and include the Employeetype
			scope.employeetypes = [sampleEmployeetype];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/employeetypes\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleEmployeetype);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.employeetypes.length).toBe(0);
		}));
	});
}());