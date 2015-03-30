'use strict';

(function() {
	// Billers Controller Spec
	describe('Billers Controller Tests', function() {
		// Initialize global variables
		var BillersController,
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

			// Initialize the Billers controller.
			BillersController = $controller('BillersController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Biller object fetched from XHR', inject(function(Billers) {
			// Create sample Biller using the Billers service
			var sampleBiller = new Billers({
				name: 'New Biller'
			});

			// Create a sample Billers array that includes the new Biller
			var sampleBillers = [sampleBiller];

			// Set GET response
			$httpBackend.expectGET('billers').respond(sampleBillers);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.billers).toEqualData(sampleBillers);
		}));

		it('$scope.findOne() should create an array with one Biller object fetched from XHR using a billerId URL parameter', inject(function(Billers) {
			// Define a sample Biller object
			var sampleBiller = new Billers({
				name: 'New Biller'
			});

			// Set the URL parameter
			$stateParams.billerId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/billers\/([0-9a-fA-F]{24})$/).respond(sampleBiller);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.biller).toEqualData(sampleBiller);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Billers) {
			// Create a sample Biller object
			var sampleBillerPostData = new Billers({
				name: 'New Biller'
			});

			// Create a sample Biller response
			var sampleBillerResponse = new Billers({
				_id: '525cf20451979dea2c000001',
				name: 'New Biller'
			});

			// Fixture mock form input values
			scope.name = 'New Biller';

			// Set POST response
			$httpBackend.expectPOST('billers', sampleBillerPostData).respond(sampleBillerResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Biller was created
			expect($location.path()).toBe('/billers/' + sampleBillerResponse._id);
		}));

		it('$scope.update() should update a valid Biller', inject(function(Billers) {
			// Define a sample Biller put data
			var sampleBillerPutData = new Billers({
				_id: '525cf20451979dea2c000001',
				name: 'New Biller'
			});

			// Mock Biller in scope
			scope.biller = sampleBillerPutData;

			// Set PUT response
			$httpBackend.expectPUT(/billers\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/billers/' + sampleBillerPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid billerId and remove the Biller from the scope', inject(function(Billers) {
			// Create new Biller object
			var sampleBiller = new Billers({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Billers array and include the Biller
			scope.billers = [sampleBiller];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/billers\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBiller);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.billers.length).toBe(0);
		}));
	});
}());