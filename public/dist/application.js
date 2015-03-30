'use strict';
// Init the application configuration module for AngularJS application
var ApplicationConfiguration = function () {
    // Init module configuration options
    var applicationModuleName = 'gochannelv10';
    var applicationModuleVendorDependencies = [
        'ngResource',
        'ngCookies',
        'ngAnimate',
        'ngTouch',
        'ngSanitize',
        'ui.router',
        'ui.bootstrap',
        'ui.utils',
        'blockUI',
        'underscore',
        'angucomplete'
      ];
    // Add a new vertical module
    var registerModule = function (moduleName) {
      // Create angular module
      angular.module(moduleName, []);
      // Add the module to the AngularJS configuration file
      angular.module(applicationModuleName).requires.push(moduleName);
    };
    return {
      applicationModuleName: applicationModuleName,
      applicationModuleVendorDependencies: applicationModuleVendorDependencies,
      registerModule: registerModule
    };
  }();'use strict';
//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config([
  '$locationProvider',
  function ($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
//Then define the init function for starting up the application
angular.element(document).ready(function () {
  //Fixing facebook bug with redirect
  if (window.location.hash === '#_=_')
    window.location.hash = '#!';
  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});
angular.module(ApplicationConfiguration.applicationModuleName).controller('Ctrl', [
  '$rootScope',
  'Authentication',
  function ($rootScope, Authentication) {
    $rootScope.user = Authentication.user;
    //    console.log($scope.user!==null);
    //    $scope.$watch('Authentication.user', function(){
    //        alert('asd');
    //    });
    $rootScope.pagewraper = $rootScope.user !== null;
  }
]);'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('billers');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('core');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('countries');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('employees');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('members');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('notifications');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('partners');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('reports');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('services');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('system');'use strict';
// Use applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('transactions');'use strict';
// Use Applicaion configuration module to register a new module
ApplicationConfiguration.registerModule('users');'use strict';
//Setting up route
angular.module('billers').config([
  '$stateProvider',
  function ($stateProvider) {
    // Billers state routing
    $stateProvider.state('listBillers', {
      url: '/billers',
      templateUrl: 'modules/billers/views/list-billers.client.view.html'
    }).state('createBiller', {
      url: '/billers/create',
      templateUrl: 'modules/billers/views/create-biller.client.view.html'
    }).state('viewBiller', {
      url: '/billers/:billerId',
      templateUrl: 'modules/billers/views/view-biller.client.view.html'
    }).state('editBiller', {
      url: '/billers/:billerId/edit',
      templateUrl: 'modules/billers/views/edit-biller.client.view.html'
    });
  }
]);'use strict';
//Billers service used to communicate Billers REST endpoints
angular.module('billers').factory('Billers', [
  '$resource',
  function ($resource) {
    return $resource('billers/:billerId', { billerId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Setting up route
angular.module('core').config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    });
  }
]);'use strict';
angular.module('core').controller('HeaderController', [
  '$scope',
  '$rootScope',
  'Authentication',
  'Menus',
  '$location',
  '$timeout',
  function ($scope, $rootScope, Authentication, Menus, $location, $timeout) {
    $rootScope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$rootScope.user)
      $location.path('/signin');
    $scope.authentication = Authentication;
    $scope.isCollapsed = false;
    $scope.menu = Menus.getMenu('topbar');
    if ($rootScope.user) {
      $timeout(function () {
        $rootScope.$broadcast('dataloaded');
      }, 100);
    }
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);'use strict';
angular.module('core').controller('HomeController', [
  '$scope',
  '$stateParams',
  '$location',
  '$timeout',
  '$resource',
  'Authentication',
  'Transactions',
  'Localization',
  'blockUI',
  function ($scope, $stateParams, $location, $timeout, $resource, Authentication, Transactions, Localization, blockUI) {
    $scope.authentication = Authentication;
    $scope.local = Localization;
    $scope.lang = Localization.lang;
    $scope.statuses = [
      {
        value: 'Active',
        label: Localization.StatusApproved[Localization.lang]
      },
      {
        value: 'Pending',
        label: Localization.StatusPending[Localization.lang]
      },
      {
        value: 'Rejected',
        label: Localization.StatusRejected[Localization.lang]
      }
    ];
    $scope.findTopUps = function () {
      $scope.statusFilter_topup = new StatusFilter('TOPUP', 'Pending');
    };
    $scope.findRemittances = function () {
      $scope.StatusFilter_remittance = new StatusFilter('REMITTANCE', 'Active');
    };
    $scope.findPayBills = function () {
      $scope.StatusFilter_bills_payment = new StatusFilter('BILLS PAYMENT', 'Active');
    };
    $scope.findLoans = function () {
      $scope.StatusFilter_loan_payment = new StatusFilter('LOAN PAYMENT', 'Pending');
    };
    $scope.transactions = {};
    var StatusFilter = function (transaction_type) {
      var populate = function () {
        Transactions.query({
          sort: 'date_created',
          by: false,
          limit: 5,
          transaction_type: transaction_type
        }, function (transactions) {
          $scope.transactions[transaction_type] = transactions;
          $timeout(function () {
            blockUI.stop();
          }, 1);
        });
      };
      populate();
    };
    $scope.pagewraper = true;
  }
]);'use strict';
angular.module('core').directive('formTransclude', function () {
  return {
    restrict: 'E',
    scope: false,
    transclude: true,
    replace: true,
    template: '<div><h1>Transcluded form</h1><div ng-transclude class="form-transclude"></div></div>'
  };
});'use strict';
angular.module('core').directive('lastAction', [
  '$resource',
  'Employees',
  function ($resource, Employees) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        Employees.get({ employeeId: scope.authentication.user._id }, function (employee) {
          var action = attrs.title;
          var found = false;
          if (employee.last_action === undefined) {
            employee.last_action = [];
          }
          for (var i in employee.last_action) {
            if (employee.last_action[i].Title === action) {
              employee.last_action.splice(i, 1);
            }
          }
          if (employee.last_action.length === 5) {
            employee.last_action.splice(0, 1);
          }
          employee.last_action.push({
            Title: action,
            Url: attrs.url
          });
          employee.$update({ employeeId: scope.authentication.user._id }, function () {
            scope.authentication.user = employee;
          });
        });
      }
    };
  }
]);'use strict';
angular.module('core').directive('ngConfirmClick', [function () {
    return {
      priority: -1,
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('click', function (e) {
          var message = attrs.ngConfirmClick;
          if (message && !confirm(message)) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }
        });
      }
    };
  }]);'use strict';
angular.module('core').directive('shouldRender', [
  'Localization',
  function (Localization) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        var found = false;
        for (var userRoleIndex in scope.user.role) {
          if (parseInt(attrs.shouldRender) === parseInt(scope.user.role[userRoleIndex].priv_id)) {
            found = true;
            //                        scope.title = scope.user.role[userRoleIndex][Localization.lang];
            console.log(attrs.showTitleIn);
            window.jQuery(element).find(attrs.showTitleIn).html(scope.user.role[userRoleIndex][Localization.lang]);
          }
        }
        if (!found) {
          if (attrs.showIt !== 'true') {
            element.remove();
          }
        } else {
          if (attrs.showIt === 'true') {
            element.remove();
          }
        }
      }
    };
  }
]);'use strict';
angular.module('core').directive('showErrors', function () {
  return {
    restrict: 'A',
    require: '^form',
    link: function (scope, el, attrs, formCtrl) {
      // find the text box element, which has the 'name' attribute
      var inputEl = el[0].querySelector('[name]');
      // convert the native text box element to an angular element
      var inputNgEl = angular.element(inputEl);
      // get the name on the text box so we know the property to check
      // on the form controller
      var inputName = inputNgEl.attr('name');
      // only apply the has-error class after the user leaves the text box
      inputNgEl.bind('blur', function () {
        el.toggleClass('has-error', formCtrl[inputName].$invalid);
      });
      scope.$watch('modal_is_submitted', function () {
        if (typeof scope.modal_is_submitted === 'boolean') {
          el.toggleClass('has-error', formCtrl[inputName].$invalid);
        }
      });
    }
  };
});'use strict';
angular.module('core').directive('sideMenu', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      link: function postLink(scope, element, attrs) {
        scope.$on('dataloaded', function () {
          $timeout(function () {
            element.metisMenu();
          }, 100);
        });
      }
    };
  }
]);'use strict';
angular.module('core').factory('Localization', [function () {
    // Localization service logic
    // ...
    // Public API
    return {
      lang: 'en_us',
      menuMembersManagement: {
        en_us: 'Members Management',
        ch_hk: 'Members Management'
      },
      menuMembers: {
        en_us: 'Members',
        ch_hk: 'Members'
      },
      menuAddMember: {
        en_us: 'Add Member',
        ch_hk: 'Add Member'
      },
      menuBeneficiaryApplication: {
        en_us: 'Beneficiary Application',
        ch_hk: 'Beneficiary Application'
      },
      menuBillersApplication: {
        en_us: 'Billers Application',
        ch_hk: 'Billers Application'
      },
      menuEmployeeManagement: {
        en_us: 'Employee Management',
        ch_hk: 'Employee Management'
      },
      menuEmployees: {
        en_us: 'Employees',
        ch_hk: 'Employees'
      },
      menuAddEmployee: {
        en_us: 'Add Employee',
        ch_hk: 'Add Employee'
      },
      menuPartnersManagement: {
        en_us: 'Partners Management',
        ch_hk: 'Partners Management'
      },
      menuPartners: {
        en_us: 'Partners',
        ch_hk: 'Partners'
      },
      menuAddPartner: {
        en_us: 'Add Partner',
        ch_hk: 'Add Partner'
      },
      menuReports: {
        en_us: 'Reports',
        ch_hk: 'Reports'
      },
      menuTransactions: {
        en_us: 'Transactions',
        ch_hk: 'Transactions'
      },
      menuMicrofinanceLoans: {
        en_us: 'Loan Payments',
        ch_hk: 'Loan Payments'
      },
      menuRemittances: {
        en_us: 'Remittances',
        ch_hk: 'Remittances'
      },
      menuBills: {
        en_us: 'Bill Payments',
        ch_hk: 'Bill Payments'
      },
      menuTopUps: {
        en_us: 'Top Ups',
        ch_hk: 'Top Ups'
      },
      menuCardTopUps: {
        en_us: 'Card Top Ups',
        ch_hk: 'Card Top Ups'
      },
      menuAdvanceSearch: {
        en_us: 'Advance Search',
        ch_hk: 'Advance Search'
      },
      menuSystem: {
        en_us: 'System',
        ch_hk: 'System'
      },
      menuAuditTrails: {
        en_us: 'Audit Trails',
        ch_hk: 'Audit Trails'
      },
      menuKYCManagement: {
        en_us: 'KYC Management',
        ch_hk: 'KYC Management'
      },
      FirstName: {
        en_us: 'First Name',
        ch_hk: 'First Name'
      },
      LastName: {
        en_us: 'Last Name',
        ch_hk: 'Last Name'
      },
      MiddleName: {
        en_us: 'Middle Name',
        ch_hk: 'Middle Name'
      },
      NameOnCard: {
        en_us: 'Name on card',
        ch_hk: 'Name on card'
      },
      Title: {
        en_us: 'Title',
        ch_hk: 'Title'
      },
      Mr: {
        en_us: 'Mr.',
        ch_hk: 'Mr.'
      },
      Ms: {
        en_us: 'Ms.',
        ch_hk: 'Ms.'
      },
      Mrs: {
        en_us: 'Mrs.',
        ch_hk: 'Mrs.'
      },
      Dr: {
        en_us: 'Dr.',
        ch_hk: 'Dr.'
      },
      Engr: {
        en_us: 'Engr.',
        ch_hk: 'Engr.'
      },
      Dir: {
        en_us: 'Dir.',
        ch_hk: 'Dir.'
      },
      CivilStatus: {
        en_us: 'Civil status',
        ch_hk: 'Civil status'
      },
      Single: {
        en_us: 'Single',
        ch_hk: 'Single'
      },
      Married: {
        en_us: 'Married',
        ch_hk: 'Married'
      },
      Divorced: {
        en_us: 'Divorced',
        ch_hk: 'Divorced'
      },
      Separated: {
        en_us: 'Separated',
        ch_hk: 'Separated'
      },
      Widowed: {
        en_us: 'Widowed',
        ch_hk: 'Widowed'
      },
      Gender: {
        en_us: 'Gender',
        ch_hk: 'Gender'
      },
      Male: {
        en_us: 'Male',
        ch_hk: 'Male'
      },
      Female: {
        en_us: 'Female',
        ch_hk: 'Female'
      },
      Birthday: {
        en_us: 'Birthday',
        ch_hk: 'Birthday'
      },
      Birthplace: {
        en_us: 'Birthplace',
        ch_hk: 'Birthplace'
      },
      Citizenship: {
        en_us: 'Citizenship',
        ch_hk: 'Citizenship'
      },
      Email: {
        en_us: 'Email',
        ch_hk: 'Email'
      },
      Address1: {
        en_us: 'Address Line 1',
        ch_hk: 'Address Line 1'
      },
      Address2: {
        en_us: 'Address Line 2',
        ch_hk: 'Address Line 2'
      },
      City: {
        en_us: 'City',
        ch_hk: 'City'
      },
      Country: {
        en_us: 'Country',
        ch_hk: 'Country'
      },
      isMailingAddress: {
        en_us: 'Is Mailing address?',
        ch_hk: 'Is Mailing address?'
      },
      CompanyName: {
        en_us: 'Company Name',
        ch_hk: 'Company Name'
      },
      WorkTitle: {
        en_us: 'Work Title',
        ch_hk: 'Work Title'
      },
      NameOfSupervisor: {
        en_us: 'Name Of Supervisor',
        ch_hk: 'Name Of Supervisor'
      },
      CompanyAddressLine1: {
        en_us: 'Company address line 1',
        ch_hk: 'Company address line 1'
      },
      CompanyAddressLine2: {
        en_us: 'Company address line 2',
        ch_hk: 'Company address line 2'
      },
      CompanyZipCode: {
        en_us: 'Company postal code',
        ch_hk: 'Company postal code'
      },
      OfficePhoneNumber: {
        en_us: 'Office phone number',
        ch_hk: 'Office phone number'
      },
      EstimatedAnnualSalary: {
        en_us: 'Estimated annual salary',
        ch_hk: 'Estimated annual salary'
      },
      YearEmployed: {
        en_us: 'Year employed',
        ch_hk: 'Year employed'
      },
      YearsWorked: {
        en_us: 'Year worked',
        ch_hk: 'Year worked'
      },
      MothersFirstName: {
        en_us: 'Mother\'s first name',
        ch_hk: 'Mother\'s first name'
      },
      MothersMaidenSurname: {
        en_us: 'Mother\'s maiden surname',
        ch_hk: 'Mother\'s maiden surname'
      },
      FathersSurname: {
        en_us: 'Father\'s surname',
        ch_hk: 'Father\'s surname'
      },
      FathersFirstName: {
        en_us: 'Father\'s first name',
        ch_hk: 'Father\'s first name'
      },
      MotherBirthday: {
        en_us: 'Mother\'s birthday',
        ch_hk: 'Mother\'s birthday'
      },
      SSSIDNumber: {
        en_us: 'SSS ID number',
        ch_hk: 'SSS ID number'
      },
      SSSIDIssuanceDate: {
        en_us: 'SSS ID Issuance date',
        ch_hk: 'SSS ID Issuance date'
      },
      DriversLicenseID: {
        en_us: 'Driver\'s License ID',
        ch_hk: 'Driver\'s License ID'
      },
      DriversLicenseIssuanceDate: {
        en_us: 'Driver\'s License Issuance date',
        ch_hk: 'Driver\'s License Issuance date'
      },
      DriversLicenseExpiryDate: {
        en_us: 'Driver\'s License expiry date',
        ch_hk: 'Driver\'s License expiry date'
      },
      PassportID: {
        en_us: 'Passport ID',
        ch_hk: 'Passport ID'
      },
      PassportIssuanceDate: {
        en_us: 'Passport Issuance Date',
        ch_hk: 'Passport Issuance Date'
      },
      PassportExpiryDate: {
        en_us: 'Passport Expiry Date',
        ch_hk: 'Passport Expiry Date'
      },
      ZipCode: {
        en_us: 'Zip Code',
        ch_hk: 'Zip Code'
      },
      ProvincialCode: {
        en_us: 'Provincial Code',
        ch_hk: 'Provincial Code'
      },
      ContactNumber: {
        en_us: 'Contact Number',
        ch_hk: 'Contact Number'
      },
      EmployeeType: {
        en_us: 'Employee Type',
        ch_hk: 'Employee Type'
      },
      Status: {
        en_us: 'Account activation status',
        ch_hk: 'Account activation status'
      },
      MemberSince: {
        en_us: 'Member Since',
        ch_hk: 'Member Since'
      },
      Action: {
        en_us: 'Action',
        ch_hk: 'Action'
      },
      PartnerName: {
        en_us: 'Partner Name',
        ch_hk: 'Partner Name'
      },
      PartnerType: {
        en_us: 'Partner Type',
        ch_hk: 'Partner Type'
      },
      PayoutMethod: {
        en_us: 'Payout Method',
        ch_hk: 'Payout Method'
      },
      PayoutMethodName: {
        en_us: 'Payout Method Name',
        ch_hk: 'Payout Method Name'
      },
      PartnerFee: {
        en_us: 'Partner Fee',
        ch_hk: 'Partner Fee'
      },
      GoChannelFee: {
        en_us: 'Kineo Fee',
        ch_hk: 'Kineo Fee'
      },
      BillPayment: {
        en_us: 'Bills Payment',
        ch_hk: 'Bills Payment'
      },
      AddedFees: {
        en_us: 'Added Fees',
        ch_hk: 'Added Fees'
      },
      Phone: {
        en_us: 'Phone number (landline)',
        ch_hk: 'Phone number (landline)'
      },
      Fax: {
        en_us: 'Fax',
        ch_hk: 'Fax'
      },
      Mobile: {
        en_us: 'Mobile phone number',
        ch_hk: 'Mobile phone number'
      },
      Notes: {
        en_us: 'Notes',
        ch_hk: 'Notes'
      },
      Remittances: {
        en_us: 'Remittances',
        ch_hk: 'Remittances'
      },
      NoDataAvailable: {
        en_us: 'No data available.',
        ch_hk: 'No data available.'
      },
      BillPayments: {
        en_us: 'Bill Payments',
        ch_hk: 'Bill Payments'
      },
      Remittance: {
        en_us: 'Remittance and Bills Payments',
        ch_hk: 'Remittance and Bills Payments'
      },
      RemittanceOnly: {
        en_us: 'Remittance Only',
        ch_hk: 'Remittance Only'
      },
      MicroFinance: {
        en_us: 'Microfinance',
        ch_hk: 'Microfinance'
      },
      AddMember: {
        en_us: 'Add Member',
        ch_hk: 'Add Member'
      },
      EditMember: {
        en_us: 'Edit Member',
        ch_hk: 'Edit Member'
      },
      MemberDetails: {
        en_us: 'Member Details',
        ch_hk: 'Member Details'
      },
      BeneficiaryDetails: {
        en_us: 'Beneficiary Details',
        ch_hk: 'Beneficiary Details'
      },
      Profile: {
        en_us: 'Profile',
        ch_hk: 'Profile'
      },
      AddressInfo: {
        en_us: 'Address Info',
        ch_hk: 'Address Info'
      },
      WorkInfo: {
        en_us: 'Work Info',
        ch_hk: 'Work Info'
      },
      References: {
        en_us: 'References',
        ch_hk: 'References'
      },
      GoChannelAccount: {
        en_us: 'Kineo Account',
        ch_hk: 'Kineo Account'
      },
      Beneficiary: {
        en_us: 'Beneficiary',
        ch_hk: 'Beneficiary'
      },
      Biller: {
        en_us: 'Biller',
        ch_hk: 'Biller'
      },
      MicroFinnancingServiceProvider: {
        en_us: 'Micro Finance Service Partner',
        ch_hk: 'Micro Finance Service Partner'
      },
      RemittanceServiceProvider: {
        en_us: 'Remittance Service Partner',
        ch_hk: 'Remittance Service Partner'
      },
      CardIssuer: {
        en_us: 'Card Issuer',
        ch_hk: 'Card Issuer'
      },
      CardNbr: {
        en_us: 'Card Number',
        ch_hk: 'Card Number'
      },
      DateJoined: {
        en_us: 'Date joined',
        ch_hk: 'Date joined'
      },
      AddBeneficiary: {
        en_us: 'Add Beneficiary',
        ch_hk: 'Add Beneficiary'
      },
      Name: {
        en_us: 'Name',
        ch_hk: 'Name'
      },
      StatusActive: {
        en_us: 'Active',
        ch_hk: 'Active'
      },
      StatusInActive: {
        en_us: 'Inactive',
        ch_hk: 'Inactive'
      },
      Billers: {
        en_us: 'Billers',
        ch_hk: 'Billers'
      },
      BillerName: {
        en_us: 'Biller Name',
        ch_hk: 'Biller Name'
      },
      AccountName: {
        en_us: 'Account Name',
        ch_hk: 'Account Name'
      },
      AccountNumber: {
        en_us: 'Account Number',
        ch_hk: 'Account Number'
      },
      CreatedOn: {
        en_us: 'Created On',
        ch_hk: 'Created On'
      },
      ApplicantsName: {
        en_us: 'Applicants Name',
        ch_hk: 'Applicants Name'
      },
      BeneficiaryName: {
        en_us: 'Beneficiary Name',
        ch_hk: 'Beneficiary Name'
      },
      StatusApproved: {
        en_us: 'Approved',
        ch_hk: 'Approved'
      },
      StatusRejected: {
        en_us: 'Rejected',
        ch_hk: 'Rejected'
      },
      StatusApprove: {
        en_us: 'Approve',
        ch_hk: 'Approve'
      },
      StatusReject: {
        en_us: 'Reject',
        ch_hk: 'Reject'
      },
      StatusPending: {
        en_us: 'Pending',
        ch_hk: 'Pending'
      },
      StatusCleared: {
        en_us: 'Cleared',
        ch_hk: 'Cleared'
      },
      StatusClear: {
        en_us: 'Clear',
        ch_hk: 'Clear'
      },
      AccountManagement: {
        en_us: 'Account Management',
        ch_hk: 'Account Management'
      },
      DateCreated: {
        en_us: 'Date Created',
        ch_hk: 'Date Created'
      },
      ReferenceCode: {
        en_us: 'Reference Code',
        ch_hk: 'Reference Code'
      },
      MemberName: {
        en_us: 'Member Name',
        ch_hk: 'Member Name'
      },
      AmountPaid: {
        en_us: 'Amount',
        ch_hk: 'Amount'
      },
      DateModified: {
        en_us: 'Date Modified',
        ch_hk: 'Date Modified'
      },
      SenderName: {
        en_us: 'Sender Name',
        ch_hk: 'Sender Name'
      },
      RecipientName: {
        en_us: 'Recipient Name',
        ch_hk: 'Recipient Name'
      },
      Amount: {
        en_us: 'Amount',
        ch_hk: 'Amount'
      },
      LoanManagement: {
        en_us: 'Loan',
        ch_hk: 'Loan'
      },
      ReferenceNumber: {
        en_us: 'Reference No.',
        ch_hk: 'Reference No.'
      },
      OriginalValue: {
        en_us: 'Original Value',
        ch_hk: 'Original Value'
      },
      RatePerPeriod: {
        en_us: 'Rate Per Period',
        ch_hk: 'Rate Per Period'
      },
      NumberOfPeriods: {
        en_us: 'Number of periods',
        ch_hk: 'Number of periods'
      },
      CurrentPeriod: {
        en_us: 'Current Period',
        ch_hk: 'Current Period'
      },
      PresentValue: {
        en_us: 'Present Value',
        ch_hk: 'Present Value'
      },
      DateDuration: {
        en_us: 'Date Duration',
        ch_hk: 'Date Duration'
      },
      isMember: {
        en_us: 'Is Member',
        ch_hk: 'Is Member'
      },
      BankName: {
        en_us: 'Bank',
        ch_hk: 'Bank'
      },
      EWalletAccountNumber: {
        en_us: 'EWallet Account Number',
        ch_hk: 'EWallet Account Number'
      },
      LatestTransactions: {
        en_us: 'Latest Transactions',
        ch_hk: 'Latest Transactions'
      },
      TransactionDetails: {
        en_us: 'Transaction Details',
        ch_hk: 'Transaction Details'
      },
      PaymentType: {
        en_us: 'Payment Type',
        ch_hk: 'Payment Type'
      },
      TransactionDate: {
        en_us: 'Transaction Date',
        ch_hk: 'Transaction Date'
      },
      DepositDate: {
        en_us: 'Deposit Date',
        ch_hk: 'Deposit Date'
      },
      SlipNo: {
        en_us: 'Slip Reference No',
        ch_hk: 'Slip Reference No'
      },
      DepositSlip: {
        en_us: 'Deposit Slip',
        ch_hk: 'Deposit Slip'
      },
      TransactionListStatus: {
        en_us: 'Status',
        ch_hk: 'Status'
      },
      BatchNumber: {
        en_us: 'Batch Number',
        ch_hk: 'Batch Number'
      },
      BatchStatus: {
        en_us: 'Batch Status',
        ch_hk: 'Batch Status'
      },
      BatchDetails: {
        en_us: 'Batch Details',
        ch_hk: 'Batch Details'
      }
    };
  }]);'use strict';
//Menu service used for managing  menus
angular.module('core').service('Menus', [function () {
    // Define the menus object
    this.menus = {};
    // A private function for rendering decision 
    var shouldRender = function (user) {
      if (user) {
        for (var userRoleIndex in user.role) {
          if (parseInt(this.roles) === parseInt(user.role[userRoleIndex].priv_id)) {
            return true;
          }
        }
      } else {
        return this.isPublic;
      }
      return false;
    };
    // Validate menu existance
    this.validateMenuExistance = function (menuId) {
      if (menuId && menuId.length) {
        if (this.menus[menuId]) {
          return true;
        } else {
          throw new Error('Menu does not exists');
        }
      } else {
        throw new Error('MenuId was not provided');
      }
      return false;
    };
    // Get the menu object by menu id
    this.getMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      return this.menus[menuId];
    };
    // Add new menu object by menu id
    this.addMenu = function (menuId, isPublic, roles) {
      // Create the new menu
      this.menus[menuId] = {
        isPublic: isPublic || false,
        roles: roles,
        items: [],
        shouldRender: shouldRender
      };
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenu = function (menuId) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Return the menu object
      delete this.menus[menuId];
    };
    // Add menu item object
    this.addMenuItem = function (menuId, menuItemTitle, menuItemURL, menuItemType, menuItemUIRoute, menuIcon, menuOrder, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Push new menu item
      this.menus[menuId].items.push({
        title: menuItemTitle,
        link: menuItemURL,
        menuItemType: menuItemType || 'item',
        menuItemClass: menuItemType,
        uiRoute: menuItemUIRoute || '/' + menuItemURL,
        isPublic: isPublic || this.menus[menuId].isPublic,
        roles: roles,
        items: [],
        shouldRender: shouldRender,
        menuIcon: menuIcon,
        menuOrder: menuOrder
      });
      // Return the menu object
      return this.menus[menuId];
    };
    // Add submenu item object
    this.addSubMenuItem = function (menuId, rootMenuItemURL, menuItemTitle, menuItemURL, menuItemUIRoute, isPublic, roles) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === rootMenuItemURL) {
          // Push new submenu item
          this.menus[menuId].items[itemIndex].items.push({
            title: menuItemTitle,
            link: menuItemURL,
            uiRoute: menuItemUIRoute || '/' + menuItemURL,
            isPublic: isPublic || this.menus[menuId].isPublic,
            roles: roles,
            shouldRender: shouldRender
          });
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeMenuItem = function (menuId, menuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        if (this.menus[menuId].items[itemIndex].link === menuItemURL) {
          this.menus[menuId].items.splice(itemIndex, 1);
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    // Remove existing menu object by menu id
    this.removeSubMenuItem = function (menuId, submenuItemURL) {
      // Validate that the menu exists
      this.validateMenuExistance(menuId);
      // Search for menu item to remove
      for (var itemIndex in this.menus[menuId].items) {
        for (var subitemIndex in this.menus[menuId].items[itemIndex].items) {
          if (this.menus[menuId].items[itemIndex].items[subitemIndex].link === submenuItemURL) {
            this.menus[menuId].items[itemIndex].items.splice(subitemIndex, 1);
          }
        }
      }
      // Return the menu object
      return this.menus[menuId];
    };
    //Adding the topbar menu
    this.addMenu('topbar');
  }]);'use strict';
angular.module('core').factory('MyModules', [
  '$resource',
  function ($resource) {
    return $resource('modules/:moduleId', { moduleId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Setting up route
angular.module('countries').config([
  '$stateProvider',
  function ($stateProvider) {
    // Countries state routing
    $stateProvider.state('listCountries', {
      url: '/countries',
      templateUrl: 'modules/countries/views/list-countries.client.view.html'
    }).state('createCountry', {
      url: '/countries/create',
      templateUrl: 'modules/countries/views/create-country.client.view.html'
    }).state('viewCountry', {
      url: '/countries/:countryId',
      templateUrl: 'modules/countries/views/view-country.client.view.html'
    }).state('editCountry', {
      url: '/countries/:countryId/edit',
      templateUrl: 'modules/countries/views/edit-country.client.view.html'
    });
  }
]);'use strict';
// Countries controller
angular.module('countries').controller('CountriesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Countries',
  function ($scope, $stateParams, $location, Authentication, Countries) {
    $scope.authentication = Authentication;
    // Create new Country
    $scope.create = function () {
      // Create new Country object
      var country = new Countries({ name: this.name });
      // Redirect after save
      country.$save(function (response) {
        $location.path('countries/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Country
    $scope.remove = function (country) {
      if (country) {
        country.$remove();
        for (var i in $scope.countries) {
          if ($scope.countries[i] === country) {
            $scope.countries.splice(i, 1);
          }
        }
      } else {
        $scope.country.$remove(function () {
          $location.path('countries');
        });
      }
    };
    // Update existing Country
    $scope.update = function () {
      var country = $scope.country;
      country.$update(function () {
        $location.path('countries/' + country._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Countries
    $scope.find = function () {
      $scope.countries = Countries.query();
    };
    // Find existing Country
    $scope.findOne = function () {
      $scope.country = Countries.get({ countryId: $stateParams.countryId });
    };
  }
]);'use strict';
//Countries service used to communicate Countries REST endpoints
angular.module('countries').factory('Countries', [
  '$resource',
  function ($resource) {
    return $resource('countries/:countryId', { countryId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('employees').run([
  'Menus',
  'Localization',
  function (Menus, Localization) {
    var local = Localization;
    var lang = local.lang;
    // Set top bar menu items
    Menus.addMenuItem('topbar', local.menuEmployeeManagement[lang], 'employees', 'dropdown', '/employees(/create)?(/types)?', 'male', 4, false, 3);
    Menus.addSubMenuItem('topbar', 'employees', local.menuEmployees[lang], 'employees', undefined, false, 18);
    Menus.addSubMenuItem('topbar', 'employees', local.menuAddEmployee[lang], 'employees/create', undefined, false, 20);
    Menus.addSubMenuItem('topbar', 'employees', 'List Employee Types', 'employees/types/listing', undefined, false, 29);
    Menus.addSubMenuItem('topbar', 'employees', 'Create Employee Types', 'employees/types/create', undefined, false, 30);
  }
]);'use strict';
//Setting up route
angular.module('employees').config([
  '$stateProvider',
  function ($stateProvider) {
    // Employees state routing
    $stateProvider.state('listEmployees', {
      url: '/employees',
      templateUrl: 'modules/employees/views/list-employees.client.view.html'
    }).state('createEmployee', {
      url: '/employees/create',
      templateUrl: 'modules/employees/views/create-employee.client.view.html'
    }).state('viewEmployee', {
      url: '/employees/:employeeId',
      templateUrl: 'modules/employees/views/list-employees.client.view.html'
    }).state('editEmployee', {
      url: '/employees/:employeeId/edit',
      templateUrl: 'modules/employees/views/edit-employee.client.view.html'
    }).state('listEmployeetypes', {
      url: '/employees/types/listing',
      templateUrl: 'modules/employees/views/list-employeetypes.client.view.html'
    }).state('createEmployeetype', {
      url: '/employees/types/create',
      templateUrl: 'modules/employees/views/create-employeetype.client.view.html'
    }).state('viewEmployeeType', {
      url: '/employees/types/listing/:employeeId',
      templateUrl: 'modules/employees/views/list-employeetypes.client.view.html'
    }).state('editEmployeetype', {
      url: '/employees/types/:employeetypeId/edit',
      templateUrl: 'modules/employees/views/edit-employeetype.client.view.html'
    });
  }
]);'use strict';
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
  function ($scope, $http, $stateParams, $location, $resource, $timeout, Authentication, Employees, Localization, Countries, MyModules, Employeetypes, blockUI, _) {
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
      $scope.employee = new Employees({ role: [] });
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
          if ($scope.employees[i] === employee) {
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
      if ($scope.frmEmployee.$valid) {
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
      var Counter = $resource('/employees/count', {}, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        Employees.query({
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by,
          status: $scope.status
        }, function (employees) {
          $scope.employees = employees;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    //        $scope.$on('loaded', function(){
    var checkChange = function () {
      try {
        if ($scope.employee.role !== undefined) {
          var privileges;
          var employee_types = JSON.parse(JSON.stringify($scope.employeetypes));
          for (var i in employee_types) {
            if (employee_types[i]._id === $scope.employee.employee_type) {
              privileges = employee_types[i].privileges;
            }
          }
          $scope.isChanged = $scope.employee.employee_type === null || _.difference(privileges, $scope.employee.role).length > 0;
        } else {
          $scope.isChanged = false;
        }
        $scope.employee.employee_type = $scope.isChanged ? null : $scope.employee.employee_type;
      } catch (e) {
      }
    };
    //        });
    //        $scope.$watch('employee.role',function(){
    //            checkChange();
    //        });
    // Find existing Employee
    $scope.findOne = function () {
      Employees.get({ employeeId: $stateParams.employeeId }, function (employee) {
        $scope.employee = employee;
        MyModules.query({}, function (modules) {
          $scope.modules = modules;
          $scope.initValue();
        });
      });
      var employeetypes = Employeetypes.query();
      $scope.employeetypes = employeetypes;
      $scope.countries = Countries.query();
      $scope.isChanged = false;
    };
    $scope.initValue = function (update) {
      var roles;
      var initializeModule = function (_module_) {
        $scope.employee.role = roles;
        console.log(roles);
        angular.forEach(roles, function (privilege) {
          angular.forEach(_module_, function (module) {
            if (privilege === module._id) {
              module.checked = true;
              initializeModule(module.privileges);
            }
          });
        });
      };
      if (update) {
        $scope.isChange = false;
        $scope.modules = [];
        blockUI.start();
        $timeout(function () {
          MyModules.query({}, function (modules) {
            $scope.modules = modules;
            var employee_types = JSON.parse(JSON.stringify($scope.employeetypes));
            for (var i in employee_types) {
              if (employee_types[i]._id === $scope.employee.employee_type) {
                roles = employee_types[i].privileges;
              }
            }
            initializeModule($scope.modules);
            blockUI.stop();
          });
        }, 100);
      } else {
        roles = $scope.employee.role;
        initializeModule($scope.modules);
      }
    };
    $scope.updateEmployee = function (item) {
      console.log('1');
      var found = false;
      for (var i in $scope.employee.role) {
        if ($scope.employee.role[i] === item._id) {
          found = true;
          if (!item.checked) {
            $scope.employee.role.splice(i, 1);
          }
        }
      }
      if (!found && item.checked) {
        $scope.employee.role.push(item._id);
      }
      if (item.privileges) {
        angular.forEach(item.privileges, function (i) {
          i.checked = item.checked;
          $scope.updateEmployee(i);
        });
      }
      checkChange();
    };
    $scope.generate_password = function () {
      $http.post('/employees/reset_password/' + $scope.employee._id).success(function (response) {
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
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
  function ($scope, $stateParams, $location, $resource, Authentication, Employeetypes, MyModules, Localization, _) {
    $scope.lang = Localization.lang;
    $scope.local = Localization;
    $scope.authentication = Authentication;
    // Create new Employeetype
    $scope.create = function () {
      $scope.modal_is_submitted = !$scope.modal_is_submitted;
      // Redirect after save
      $scope.employeetype.$save(function (response) {
        $location.path('employees/types/listing/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.init = function () {
      // Create new Employeetype object
      $scope.employeetype = new Employeetypes({
        name: '',
        privileges: []
      });
      MyModules.query({}, function (modules) {
        $scope.modules = modules;
      });
    };
    // Remove existing Employeetype
    $scope.remove = function (employeetype) {
      if (employeetype) {
        employeetype.$remove();
        for (var i in $scope.employeetypes) {
          if ($scope.employeetypes[i] === employeetype) {
            $scope.employeetypes.splice(i, 1);
          }
        }
      } else {
        $scope.employeetype.$remove(function () {
          $location.path('employeetypes');
        });
      }
    };
    // Update existing Employeetype
    $scope.update = function () {
      $scope.modal_is_submitted = !$scope.modal_is_submitted;
      if ($scope.frmEmployeeType.$valid) {
        var employeetype = $scope.employeetype;
        employeetype.$update(function () {
          $location.path('employees/types/listing/' + employeetype._id);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
    // Find a list of Employeetypes
    $scope.find = function () {
      var Counter = $resource('/employeetypes/count', {}, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        Employeetypes.query({
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by,
          status: $scope.status
        }, function (employeetypes) {
          $scope.employeetypes = employeetypes;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    // Find existing Employeetype
    $scope.findOne = function () {
      Employeetypes.get({ employeetypeId: $stateParams.employeetypeId }, function (employeetype) {
        $scope.employeetype = employeetype;
        MyModules.query({}, function (modules) {
          $scope.modules = modules;
          $scope.initValue();
        });
      });
    };
    $scope.initValue = function () {
      var initializeModule = function (_module_) {
        var roles = $scope.employeetype.privileges;
        $scope.employeetype.privilege = roles;
        angular.forEach(roles, function (privilege) {
          angular.forEach(_module_, function (module) {
            if (privilege === module._id) {
              module.checked = true;
              initializeModule(module.privileges);
            }
          });
        });
      };
      initializeModule($scope.modules);
    };
    $scope.updateEmployee = function (item) {
      var found = false;
      for (var i in $scope.employeetype.privileges) {
        if ($scope.employeetype.privileges[i] === item._id) {
          found = true;
          if (!item.checked) {
            $scope.employeetype.privileges.splice(i, 1);
          }
        }
      }
      if (!found && item.checked) {
        $scope.employeetype.privileges.push(item._id);
      }
      if (item.privileges) {
        angular.forEach(item.privileges, function (i) {
          i.checked = item.checked;
          $scope.updateEmployee(i);
        });
      }
    };
  }
]);'use strict';
//Employees service used to communicate Employees REST endpoints
angular.module('employees').factory('Employees', [
  '$resource',
  function ($resource) {
    return $resource('employees/:employeeId', { employeeId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Employeetypes service used to communicate Employeetypes REST endpoints
angular.module('employees').factory('Employeetypes', [
  '$resource',
  function ($resource) {
    return $resource('employeetypes/:employeetypeId', { employeetypeId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('members').run([
  'Menus',
  'Localization',
  function (Menus, Localization) {
    var local = Localization;
    var lang = local.lang;
    // Set top bar menu items
    Menus.addMenuItem('topbar', local.menuMembersManagement[lang], 'members', 'dropdown', '/members(/create)?', 'users', 1, false, 2);
    Menus.addSubMenuItem('topbar', 'members', local.menuMembers[lang], 'members', undefined, false, 10);
    Menus.addSubMenuItem('topbar', 'members', local.menuAddMember[lang], 'members/create', undefined, false, 12);
    Menus.addSubMenuItem('topbar', 'members', local.menuBeneficiaryApplication[lang], 'members/beneficiary-applications', undefined, false, 14);
    Menus.addSubMenuItem('topbar', 'members', local.menuBillersApplication[lang], 'members/billers-applications', undefined, false, 16);
  }
]);'use strict';
//Setting up route
angular.module('members').config([
  '$stateProvider',
  function ($stateProvider) {
    // Members state routing
    $stateProvider.state('billers-applications', {
      url: '/members/billers-applications',
      templateUrl: 'modules/members/views/billers-applications.client.view.html'
    }).state('edit-beneficiary', {
      url: '/edit-beneficiary/:memberId/edit',
      templateUrl: 'modules/members/views/edit-beneficiary.client.view.html'
    }).state('beneficiary-applications', {
      url: '/members/beneficiary-applications',
      templateUrl: 'modules/members/views/beneficiary-applications.client.view.html'
    }).state('listMembers', {
      url: '/members',
      templateUrl: 'modules/members/views/list-members.client.view.html'
    }).state('createMember', {
      url: '/members/create',
      templateUrl: 'modules/members/views/create-member.client.view.html'
    }).state('viewMember', {
      url: '/members/:memberId',
      templateUrl: 'modules/members/views/list-members.client.view.html'
    }).state('editMember', {
      url: '/members/:memberId/edit',
      templateUrl: 'modules/members/views/edit-member.client.view.html'
    });
  }
]);'use strict';
angular.module('members').controller('BeneficiaryApplicationsController', [
  '$scope',
  '$rootScope',
  '$location',
  '$stateParams',
  '$resource',
  '$modal',
  'Localization',
  'Beneficiaries',
  'Countries',
  'Authentication',
  function ($scope, $rootScope, $location, $stateParams, $resource, $modal, Localization, Beneficiaries, Countries, Authentication) {
    $rootScope.local = Localization;
    $rootScope.lang = $scope.local.lang;
    $scope.authentication = Authentication;
    $scope.list = function () {
      $scope.statuses = [
        {
          value: Localization.StatusApproved.en_us,
          label: Localization.StatusApproved[Localization.lang]
        },
        {
          value: Localization.StatusPending.en_us,
          label: Localization.StatusPending[Localization.lang]
        },
        {
          value: Localization.StatusRejected.en_us,
          label: Localization.StatusRejected[Localization.lang]
        }
      ];
      $scope.status = Localization.StatusPending.en_us;
      var Counter = $resource('/beneficiaries/count', { status: $scope.status }, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        Beneficiaries.query({
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by,
          status: $scope.status
        }, function (members) {
          console.log(members);
          $scope.beneficiaries = members;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    $scope.statusFilter = function () {
      $scope.beneficiaries = Beneficiaries.query({ status: $scope.status });
    };
    $scope.findOne = function () {
      $scope.countries = Countries.query();
      $scope.beneficiary = Beneficiaries.get({ beneficiaryId: $stateParams.memberId });
    };
    $scope.update = function (beneficiary, status) {
      if (beneficiary) {
        beneficiary.status = status;
        beneficiary.$update(function () {
          $scope.statusFilter();
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      } else {
        $scope.beneficiary.$update(function () {
          $location.path('members/beneficiary-applications');
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
    // Remove existing Member
    $scope.remove = function (beneficiary) {
      if (beneficiary) {
        beneficiary.$remove();
        for (var i in $scope.beneficiaries) {
          if ($scope.beneficiaries[i] === beneficiary) {
            $scope.beneficiaries.splice(i, 1);
          }
        }
      } else {
        $scope.beneficiaries.$remove(function () {
          $location.path('members/beneficiary-applications');
        });
      }
    };
    var ModalCtrl = function ($scope, $modalInstance, data) {
      $scope.local = Localization;
      $scope.lang = Localization.lang;
      $scope.data = data;
      $scope.ok = function () {
        $modalInstance.close();
      };
    };
    $scope.open_member = function (member) {
      var modalInstance = $modal.open({
          templateUrl: 'MemberDetails',
          controller: ModalCtrl,
          resolve: {
            data: function () {
              return member;
            }
          }
        });
      modalInstance.result.then(function (data) {
      }, function () {
      });
    };
    $scope.open_beneficiary = function (beneficiary) {
      var modalInstance = $modal.open({
          templateUrl: 'BeneficiaryDetails',
          controller: ModalCtrl,
          resolve: {
            data: function () {
              return beneficiary;
            }
          }
        });
      modalInstance.result.then(function (data) {
      }, function () {
      });
    };
  }
]);'use strict';
// Billers controller
angular.module('members').controller('BillersApplicationController', [
  '$scope',
  '$stateParams',
  '$location',
  '$resource',
  '$modal',
  'Authentication',
  'Memberbiller',
  'Localization',
  function ($scope, $stateParams, $location, $resource, $modal, Authentication, Memberbiller, Localization) {
    $scope.local = Localization;
    $scope.lang = $scope.local.lang;
    $scope.authentication = Authentication;
    // Remove existing Biller
    $scope.remove = function (biller) {
      if (biller) {
        biller.$remove();
        for (var i in $scope.billers) {
          if ($scope.billers[i] === biller) {
            $scope.billers.splice(i, 1);
          }
        }
      } else {
        $scope.biller.$remove(function () {
          $location.path('billers');
        });
      }
    };
    // Update existing Biller
    $scope.update = function (biller, status) {
      if (biller) {
        biller.status = status;
        biller.$update(function () {
          $scope.statusFilter();
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      } else {
        $scope.biller.$update(function () {
          $location.path('members/billers-applications');
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
    $scope.statusFilter = function () {
      $scope.billers = Memberbiller.query({ status: $scope.status });
    };
    // Find a list of Billers
    $scope.find = function () {
      $scope.statuses = [
        {
          value: Localization.StatusApproved.en_us,
          label: Localization.StatusApproved[Localization.lang]
        },
        {
          value: Localization.StatusPending.en_us,
          label: Localization.StatusPending[Localization.lang]
        },
        {
          value: Localization.StatusRejected.en_us,
          label: Localization.StatusRejected[Localization.lang]
        }
      ];
      $scope.status = Localization.StatusPending.en_us;
      var Counter = $resource('/memberbiller/count', { status: $scope.status }, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        Memberbiller.query({
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by,
          status: $scope.status
        }, function (billers) {
          $scope.billers = billers;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    // Find existing Biller
    $scope.findOne = function () {
      $scope.biller = Memberbiller.get({ memberbillerId: $stateParams.memberId });
    };
    var ModalCtrl = function ($scope, $modalInstance, data) {
      $scope.local = Localization;
      $scope.lang = Localization.lang;
      $scope.data = data;
      $scope.ok = function () {
        $modalInstance.close();
      };
    };
    $scope.open_member = function (member) {
      var modalInstance = $modal.open({
          templateUrl: 'MemberDetails',
          controller: ModalCtrl,
          resolve: {
            data: function () {
              return member;
            }
          }
        });
      modalInstance.result.then(function (data) {
      }, function () {
      });
    };
  }
]);'use strict';
angular.module('members').controller('MembersController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$location',
  'Authentication',
  'Members',
  'Localization',
  'Countries',
  'Partners',
  'Beneficiaries',
  'Employees',
  'Billers',
  '$modal',
  '$timeout',
  '$http',
  '$resource',
  function ($scope, $rootScope, $stateParams, $location, Authentication, Members, Localization, Countries, Partners, Beneficiaries, Employees, Billers, $modal, $timeout, $http, $resource) {
    $rootScope.local = Localization;
    $rootScope.lang = $scope.local.lang;
    $scope.authentication = Authentication;
    $scope.active = 1;
    var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
      $scope.countries = Countries.query();
      $scope.data = data;
      $scope.banks = [
        { name: 'BDO' },
        { name: 'BPI' }
      ];
      $scope.ok = function () {
        $scope.modal_is_submitted = !$scope.modal_is_submitted;
        if ($scope.frmBeneficiary.$valid) {
          $modalInstance.close($scope.data);
        }
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
      $scope.changeCountry = function (countryid) {
        console.log(countryid);
        angular.forEach($scope.countries, function (country) {
          if (country._id === countryid) {
            $scope.data.country = country;
          }
        });
      };
    };
    // Create new Member
    $scope.create = function () {
      $scope.modal_is_submitted = !$scope.modal_is_submitted;
      // Redirect after save
      $scope.member.$save(function (response) {
        $location.path('members/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
        if (errorResponse.data.member) {
          alert(errorResponse.data.message.general);
          $location.url('members/' + errorResponse.data.member._id + '/edit');
        }
      });
    };
    $scope.init = function () {
      $scope.member = new Members({
        beneficiaries_link: [],
        biller_link: [],
        loans_link: []
      });
      $scope.countries = Countries.query();
      $scope.microfinancing_partners = Partners.query({ partner_type: $scope.local.MicroFinance.en_us });
      $scope.remittance_partners = Partners.query({ partner_type: $scope.local.Remittance.en_us });
    };
    // Remove existing Member
    $scope.remove = function (member) {
      if (member) {
        member.$remove();
        for (var i in $scope.members) {
          if ($scope.members[i] === member) {
            $scope.members.splice(i, 1);
          }
        }
      } else {
        $scope.member.$remove(function () {
          $location.path('members');
        });
      }
    };
    // Remove existing Member
    $scope.removeBen = function (beneficiary) {
      if (beneficiary) {
        for (var i in $scope.member.beneficiaries_link) {
          if ($scope.member.beneficiaries_link[i] === beneficiary) {
            $scope.member.beneficiaries_link.splice(i, 1);
          }
        }
      }
    };
    // Remove existing Member
    $scope.removeBil = function (biller) {
      if (biller) {
        for (var i in $scope.member.biller_link) {
          if ($scope.member.biller_link[i] === biller) {
            $scope.member.biller_link.splice(i, 1);
          }
        }
      }
    };
    // Remove existing Loanm
    $scope.removeLoan = function (loan) {
      if (loan) {
        for (var i in $scope.member.loans_link) {
          if ($scope.member.loans_link[i] === loan) {
            $scope.member.loans_link.splice(i, 1);
          }
        }
      }
    };
    // Update existing Member
    $scope.update = function () {
      $scope.modal_is_submitted = !$scope.modal_is_submitted;
      if ($scope.frmMember.$valid) {
        var member = $scope.member;
        member.$update(function () {
          $location.path('members/' + member._id);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
    // Find a list of Members
    $scope.find = function () {
      var Counter = $resource('/members/count', {}, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        Members.query({
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by
        }, function (members) {
          $scope.members = members;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    // Find existing Member
    $scope.findOne = function () {
      $scope.member = Members.get({ memberId: $stateParams.memberId });
      $scope.countries = Countries.query();
      $scope.remittance_partners = Partners.query({ partner_type: $scope.local.Remittance.en_us });
      $scope.microfinancing_partners = Partners.query({ partner_type: $scope.local.MicroFinance.en_us });
    };
    $scope.open = function (beneficiary) {
      var modalInstance = $modal.open({
          templateUrl: 'beneficiary_form',
          controller: ModalInstanceCtrl,
          resolve: {
            data: function () {
              return beneficiary;
            }
          }
        });
      modalInstance.result.then(function (data) {
        var found = false;
        angular.forEach($scope.member.beneficiaries_link, function (beneficiary) {
          if (beneficiary === data) {
            found = true;
          }
        });
        if (!found) {
          $scope.member.beneficiaries_link.push(data);
        }
      }, function () {
      });
    };
    $scope.open_loan = function (loan) {
      var modalInstance = $modal.open({
          templateUrl: 'loanForm',
          controller: ModalInstanceCtrl,
          resolve: {
            data: function () {
              return loan;
            }
          }
        });
      modalInstance.result.then(function (data) {
        if (!$scope.member.loans_link)
          $scope.member.loans_link = [];
        var found = false;
        angular.forEach($scope.member.loans_link, function (loan) {
          if (loan === data) {
            found = true;
          }
        });
        if (!found) {
          $scope.member.loans_link.push(data);
        }
      }, function () {
      });
    };
    var ModalBillerCtrl = function ($scope, $modalInstance, data, member) {
      $scope.partner = Partners.get({ partnerId: member.remittance });
      console.log($scope.partner);
      $scope.data = data;
      $scope.ok = function () {
        $scope.modal_is_submitted = !$scope.modal_is_submitted;
        if ($scope.frmBiller.$valid) {
          $modalInstance.close($scope.data);
        }
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
      $scope.selectBiller = function (billerid) {
        angular.forEach($scope.partner.biller_link, function (biller) {
          if (biller._id === billerid) {
            $scope.data.biller = biller;
          }
        });
      };
    };
    $scope.open_biller = function (biller) {
      console.log($scope.member);
      var modalInstance = $modal.open({
          templateUrl: 'billerForm',
          controller: ModalBillerCtrl,
          resolve: {
            data: function () {
              return biller;
            },
            member: function () {
              return $scope.member;
            }
          }
        });
      modalInstance.result.then(function (data) {
        var found = false;
        angular.forEach($scope.member.biller_link, function (biller) {
          if (biller === data) {
            found = true;
          }
        });
        if (!found) {
          $scope.member.biller_link.push(data);
        }
      }, function () {
      });
    };
    $scope.generate_password = function () {
      $http.post('/members/reset_password/' + $scope.member._id).success(function (response) {
        alert('Password has been reset');
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
//Beneficiaries service used to communicate Beneficiaries REST endpoints
angular.module('members').factory('Beneficiaries', [
  '$resource',
  function ($resource) {
    return $resource('beneficiaries/:beneficiaryId', { beneficiaryId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
angular.module('members').factory('Memberbiller', [
  '$resource',
  function ($resource) {
    return $resource('memberbiller/:memberbillerId', { memberbillerId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Members service used to communicate Members REST endpoints
angular.module('members').factory('Members', [
  '$resource',
  function ($resource) {
    return $resource('members/:memberId', { memberId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
//Setting up route
angular.module('notifications').config([
  '$stateProvider',
  function ($stateProvider) {
    // Notifications state routing
    $stateProvider.state('listNotifications', {
      url: '/notifications',
      templateUrl: 'modules/notifications/views/list-notifications.client.view.html'
    }).state('createNotification', {
      url: '/notifications/create',
      templateUrl: 'modules/notifications/views/create-notification.client.view.html'
    }).state('viewNotification', {
      url: '/notifications/:notificationId',
      templateUrl: 'modules/notifications/views/view-notification.client.view.html'
    }).state('editNotification', {
      url: '/notifications/:notificationId/edit',
      templateUrl: 'modules/notifications/views/edit-notification.client.view.html'
    });
  }
]);'use strict';
// Notifications controller
angular.module('notifications').controller('NotificationsController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Notifications',
  function ($scope, $stateParams, $location, Authentication, Notifications) {
    $scope.authentication = Authentication;
    // Create new Notification
    $scope.create = function () {
      // Create new Notification object
      var notification = new Notifications({ name: this.name });
      // Redirect after save
      notification.$save(function (response) {
        $location.path('notifications/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Notification
    $scope.remove = function (notification) {
      if (notification) {
        notification.$remove();
        for (var i in $scope.notifications) {
          if ($scope.notifications[i] === notification) {
            $scope.notifications.splice(i, 1);
          }
        }
      } else {
        $scope.notification.$remove(function () {
          $location.path('notifications');
        });
      }
    };
    // Update existing Notification
    $scope.update = function () {
      var notification = $scope.notification;
      notification.$update(function () {
        $location.path('notifications/' + notification._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Notifications
    $scope.find = function () {
      $scope.notifications = Notifications.query();
    };
    // Find existing Notification
    $scope.findOne = function () {
      $scope.notification = Notifications.get({ notificationId: $stateParams.notificationId });
    };
  }
]);'use strict';
//Notifications service used to communicate Notifications REST endpoints
angular.module('notifications').factory('Notifications', [
  '$resource',
  function ($resource) {
    return $resource('notifications/:notificationId', { notificationId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('partners').run([
  'Menus',
  'Localization',
  function (Menus, Localization) {
    var local = Localization;
    var lang = local.lang;
    // Set top bar menu items
    Menus.addMenuItem('topbar', local.menuPartnersManagement[lang], 'partners', 'dropdown', '/partners(/create)?', 'bank', 2, false, 1);
    Menus.addSubMenuItem('topbar', 'partners', local.menuPartners[lang], 'partners', undefined, false, 7);
    Menus.addSubMenuItem('topbar', 'partners', local.menuAddPartner[lang], 'partners/create', undefined, false, 8);
  }
]);'use strict';
//Setting up route
angular.module('partners').config([
  '$stateProvider',
  function ($stateProvider) {
    // Partners state routing
    $stateProvider.state('listPartners', {
      url: '/partners',
      templateUrl: 'modules/partners/views/list-partners.client.view.html'
    }).state('createPartner', {
      url: '/partners/create',
      templateUrl: 'modules/partners/views/create-partner.client.view.html'
    }).state('viewPartner', {
      url: '/partners/:partnerId',
      templateUrl: 'modules/partners/views/list-partners.client.view.html'
    }).state('editPartner', {
      url: '/partners/:partnerId/edit',
      templateUrl: 'modules/partners/views/edit-partner.client.view.html'
    });
  }
]);'use strict';
// Partners controller
angular.module('partners').controller('PartnersController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$location',
  '$resource',
  'Authentication',
  'Partners',
  'Localization',
  'Countries',
  '$modal',
  function ($scope, $rootScope, $stateParams, $location, $resource, Authentication, Partners, Localization, Countries, $modal) {
    $rootScope.local = Localization;
    $rootScope.lang = $scope.local.lang;
    $scope.authentication = Authentication;
    var ModalInstanceCtrl = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.ok = function () {
        $modalInstance.close($scope.data);
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
    // Create new Partner
    $scope.create = function () {
      $scope.modal_is_submitted = !$scope.Modal_is_submitted;
      $scope.partner.$save(function (response) {
        $location.path('partners/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    $scope.init = function () {
      $scope.countries = Countries.query();
      $scope.partner = new Partners({
        payout_method: [],
        biller_link: []
      });
    };
    // Remove existing Partner
    $scope.remove = function (partner) {
      if (partner) {
        partner.$remove();
        for (var i in $scope.partners) {
          if ($scope.partners[i] === partner) {
            $scope.partners.splice(i, 1);
          }
        }
      } else {
        $scope.partner.$remove(function () {
          $location.path('partners');
        });
      }
    };
    // Remove existing Payout Method
    $scope.removePayoutMethod = function (method) {
      if (method) {
        for (var i in $scope.partner.payout_method) {
          if ($scope.partner.payout_method[i] === method) {
            $scope.partner.payout_method.splice(i, 1);
          }
        }
      }
    };
    // Update existing Partner
    $scope.update = function () {
      $scope.modal_is_submitted = !$scope.modal_is_submitted;
      if ($scope.frmPartner.$valid) {
        var partner = $scope.partner;
        partner.$update(function () {
          $location.path('partners/' + partner._id);
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
    // Find a list of Partners
    $scope.find = function () {
      var Counter = $resource('/partners/count', {}, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        Partners.query({
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by,
          status: $scope.status
        }, function (partners) {
          $scope.partners = partners;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    // Find existing Partner
    $scope.findOne = function () {
      $scope.countries = Countries.query();
      $scope.partner = Partners.get({ partnerId: $stateParams.partnerId });
    };
    $scope.open = function (method) {
      var modalInstance = $modal.open({
          templateUrl: 'payoutMethodForm',
          controller: ModalInstanceCtrl,
          resolve: {
            data: function () {
              return method;
            }
          }
        });
      modalInstance.result.then(function (data) {
        var found = false;
        angular.forEach($scope.partner.payout_method, function (method) {
          if (method === data) {
            found = true;
          }
        });
        if (!found) {
          $scope.partner.payout_method.push(data);
        }
      }, function () {
      });
    };
    $scope.openBillerForm = function (biller) {
      var modalInstance = $modal.open({
          templateUrl: 'billerForm',
          controller: ModalInstanceCtrl,
          resolve: {
            data: function () {
              return biller;
            }
          }
        });
      modalInstance.result.then(function (data) {
        if (data._id === undefined) {
          var found = false;
          angular.forEach($scope.partner.biller_link, function (biller) {
            if (biller === data) {
              found = true;
            }
          });
          if (!found) {
            $scope.partner.biller_link.push(data);
          }
        }
      }, function () {
      });
    };
    $scope.removeBiller = function (biller) {
      for (var i in $scope.partner.biller_link) {
        if ($scope.partner.biller_link[i] === biller) {
          $scope.partner.biller_link.splice(i, 1);
        }
      }
    };
    $scope.changeCountry = function (countryid) {
      console.log(countryid);
      angular.forEach($scope.countries, function (country) {
        if (country._id === countryid) {
          $scope.partner.country = country;
        }
      });
    };
  }
]);'use strict';
//Partners service used to communicate Partners REST endpoints
angular.module('partners').factory('Partners', [
  '$resource',
  function ($resource) {
    return $resource('partners/:partnerId', { partnerId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Reports module config
angular.module('reports').run([
  'Menus',
  'Localization',
  function (Menus, Localization) {
    var local = Localization;
    var lang = local.lang;
    Menus.addMenuItem('topbar', local.menuReports[lang], 'reports', 'dropdown', '/reports(/create)?', 'folder-open', 5);
  }
]);'use strict';
angular.module('reports').controller('ReportsController', [
  '$scope',
  function ($scope) {
  }
]);'use strict';
//Setting up route
angular.module('services').config([
  '$stateProvider',
  function ($stateProvider) {
    // Services state routing
    $stateProvider.state('listServices', {
      url: '/services',
      templateUrl: 'modules/services/views/list-services.client.view.html'
    }).state('createService', {
      url: '/services/create',
      templateUrl: 'modules/services/views/create-service.client.view.html'
    }).state('viewService', {
      url: '/services/:serviceId',
      templateUrl: 'modules/services/views/view-service.client.view.html'
    }).state('editService', {
      url: '/services/:serviceId/edit',
      templateUrl: 'modules/services/views/edit-service.client.view.html'
    });
  }
]);'use strict';
// Services controller
angular.module('services').controller('ServicesController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Services',
  function ($scope, $stateParams, $location, Authentication, Services) {
    $scope.authentication = Authentication;
    // Create new Service
    $scope.create = function () {
      // Create new Service object
      var service = new Services({ name: this.name });
      // Redirect after save
      service.$save(function (response) {
        $location.path('services/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Service
    $scope.remove = function (service) {
      if (service) {
        service.$remove();
        for (var i in $scope.services) {
          if ($scope.services[i] === service) {
            $scope.services.splice(i, 1);
          }
        }
      } else {
        $scope.service.$remove(function () {
          $location.path('services');
        });
      }
    };
    // Update existing Service
    $scope.update = function () {
      var service = $scope.service;
      service.$update(function () {
        $location.path('services/' + service._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Services
    $scope.find = function () {
      $scope.services = Services.query();
    };
    // Find existing Service
    $scope.findOne = function () {
      $scope.service = Services.get({ serviceId: $stateParams.serviceId });
    };
  }
]);'use strict';
//Services service used to communicate Services REST endpoints
angular.module('services').factory('Services', [
  '$resource',
  function ($resource) {
    return $resource('services/:serviceId', { serviceId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// System module config
angular.module('system').run([
  'Menus',
  'Localization',
  function (Menus, Localization) {
    var local = Localization;
    var lang = local.lang;
    // Set top bar menu items
    Menus.addMenuItem('topbar', local.menuSystem[lang], 'system', 'dropdown', '/system(/create)?(/types)?', 'male', 4, false, 31);
    Menus.addSubMenuItem('topbar', 'system', local.menuAuditTrails[lang], 'system', undefined, false, 32);
    Menus.addSubMenuItem('topbar', 'system', local.menuKYCManagement[lang], 'kyc-management', undefined, false, 40);
  }
]);'use strict';
//Setting up route
angular.module('system').config([
  '$stateProvider',
  function ($stateProvider) {
    // System state routing
    $stateProvider.state('kyc-management', {
      url: '/kyc-management',
      templateUrl: 'modules/system/views/kyc-management.client.view.html'
    }).state('system', {
      url: '/system',
      templateUrl: 'modules/system/views/system.client.view.html'
    });
  }
]);'use strict';
angular.module('system').controller('KycManagementController', [
  '$scope',
  '$rootScope',
  '$resource',
  '$http',
  '$modal',
  'Members',
  'Authentication',
  'Localization',
  'KycSending',
  function ($scope, $rootScope, $resource, $http, $modal, Members, Authentication, Localization, KycSending) {
    $rootScope.local = Localization;
    $rootScope.lang = $scope.local.lang;
    $scope.authentication = Authentication;
    $rootScope.reloadAll = false;
    $scope.find = function (status) {
      var count_resource;
      if (status === 'Sent') {
        count_resource = '/kyc-sending/count';
      } else {
        count_resource = '/members/count';
      }
      var Counter = $resource(count_resource, { KYCStatus: status }, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        var Model = status === 'Sent' ? KycSending : Members;
        Model.query({
          KYCStatus: status,
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by
        }, function (results) {
          $scope.results = results;
          angular.forEach($scope.results, function (result) {
            $scope.checkboxes[result._id] = false;
          });
          $rootScope.reloadAll = false;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    $rootScope.$watch('reloadAll', function (value) {
      if (value) {
        $scope.populate();
      }
    });
    $scope.checkboxes = {};
    $scope.checkAll = function () {
      angular.forEach($scope.checkboxes, function (checkbox, value) {
        $scope.checkboxes[value] = $scope.checkall;
      });
    };
    $scope.isCheckedAll = function () {
      var found = true;
      angular.forEach($scope.checkboxes, function (checkbox, value) {
        if (!checkbox) {
          found = false;
        }
      });
      var ret = $scope.checkall = found;
      return ret;
    };
    $scope.sendBatch = function () {
      $http.post('/members/sendbatch/', $scope.checkboxes).success(function (response) {
        if (response.result === 'ok') {
          alert('KYC has been sent.');
        } else {
          alert('Theres an error in member. KYC Not sent');
        }
        $rootScope.reloadAll = true;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.resendBatch = function () {
      $http.post('/members/resendbatch/', $scope.checkboxes).success(function (response) {
        if (response.result === 'ok') {
          alert('KYC has been sent.');
        } else {
          alert('Theres an error in member. KYC Not sent');
        }
        $rootScope.reloadAll = true;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.setOnHold = function () {
      $http.post('/members/onhold/', $scope.checkboxes).success(function (response) {
        if (response.result === 'ok') {
          alert('KYC has been hold.');
        } else {
          alert('Theres an error in member. KYC Not hold');
        }
        $rootScope.reloadAll = true;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    $scope.openBatchDetails = function (batch) {
      var modalInstance = $modal.open({
          templateUrl: 'BatchDetails',
          controller: ModalCtrl,
          resolve: {
            data: function () {
              return batch;
            }
          }
        });
      modalInstance.result.then(function (data) {
      }, function () {
      });
    };
    var ModalCtrl = function ($scope, $modalInstance, data) {
      $scope.data = data;
      $scope.ok = function () {
        $modalInstance.close($scope.data);
      };
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
  }
]);'use strict';
angular.module('system').controller('SystemController', [
  '$scope',
  '$resource',
  'AuditTrails',
  'Localization',
  function ($scope, $resource, AuditTrails, Localization) {
    $scope.local = Localization;
    $scope.lang = Localization.lang;
    $scope.find = function () {
      var Counter = $resource('/audittrails/count', {}, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        AuditTrails.query({
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by,
          status: $scope.status
        }, function (audittrails) {
          $scope.audittrails = audittrails;
        });
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
  }
]);'use strict';
angular.module('system').factory('AuditTrails', [
  '$resource',
  function ($resource) {
    return $resource('audittrails/:audittrailsId', { audittrailsId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
angular.module('system').factory('KycSending', [
  '$resource',
  function ($resource) {
    // Kyc sending service logic
    // ...
    // Public API
    return $resource('kyc-sending/:kycsendingId', { audittrailsId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Configuring the Articles module
angular.module('transactions').run([
  'Menus',
  'Localization',
  function (Menus, Localization) {
    var local = Localization;
    var lang = local.lang;
    // Set top bar menu items
    Menus.addMenuItem('topbar', local.menuTransactions[lang], 'transactions', 'dropdown', '/transactions(/create)?', 'exchange', 3, false, 5);
    Menus.addSubMenuItem('topbar', 'transactions', local.menuMicrofinanceLoans[lang], 'transactions/list-loanpayments', undefined, false, 40);
    Menus.addSubMenuItem('topbar', 'transactions', local.menuRemittances[lang], 'transactions/list-remittances', undefined, false, 27);
    Menus.addSubMenuItem('topbar', 'transactions', local.menuBills[lang], 'transactions/list-billpayments', undefined, false, 26);
    Menus.addSubMenuItem('topbar', 'transactions', local.menuTopUps[lang], 'transactions/list-topups', undefined, false, 24);
    Menus.addSubMenuItem('topbar', 'transactions', local.menuCardTopUps[lang], 'transactions/card-topups', undefined, false, 33);
  }
]);'use strict';
//Setting up route
angular.module('transactions').config([
  '$stateProvider',
  function ($stateProvider) {
    // Transactions state routing
    $stateProvider.state('card-topups', {
      url: '/transactions/card-topups',
      templateUrl: 'modules/transactions/views/card-topups.client.view.html'
    }).state('list-remittances', {
      url: '/transactions/list-remittances',
      templateUrl: 'modules/transactions/views/list-remittances.client.view.html'
    }).state('list-topups', {
      url: '/transactions/list-topups',
      templateUrl: 'modules/transactions/views/list-topups.client.view.html'
    }).state('list-loanpayments', {
      url: '/transactions/list-loanpayments',
      templateUrl: 'modules/transactions/views/list-loanpayments.client.view.html'
    }).state('list-billpayments', {
      url: '/transactions/list-billpayments',
      templateUrl: 'modules/transactions/views/list-billpayments.client.view.html'
    });
  }
]);'use strict';
// Transactions controller
angular.module('transactions').controller('TransactionsController', [
  '$scope',
  '$rootScope',
  '$stateParams',
  '$location',
  '$timeout',
  '$resource',
  '$modal',
  '$http',
  'Authentication',
  'Transactions',
  'Members',
  'Localization',
  'Partners',
  'blockUI',
  function ($scope, $rootScope, $stateParams, $location, $timeout, $resource, $modal, $http, Authentication, Transactions, Members, Localization, Partners, blockUI) {
    $scope.authentication = Authentication;
    $scope.local = Localization;
    $scope.lang = Localization.lang;
    $rootScope.parseFloat = function (value) {
      if (parseFloat(value) - parseFloat(value) !== 0)
        value = 0;
      console.log(value);
      return parseFloat(value);
    };
    $scope.statuses = [
      {
        value: Localization.StatusApproved[Localization.lang],
        label: Localization.StatusApproved[Localization.lang]
      },
      {
        value: Localization.StatusPending[Localization.lang],
        label: Localization.StatusPending[Localization.lang]
      },
      {
        value: Localization.StatusRejected[Localization.lang],
        label: Localization.StatusRejected[Localization.lang]
      }
    ];
    $scope.microfinancing_partners = Partners.query({ partner_type: $scope.local.MicroFinance.en_us });
    $scope.remittance_partners = Partners.query({ partner_type: $scope.local.Remittance.en_us });
    $scope.findTopUps = function () {
      $scope.transaction_type = 'TOPUP';
      $scope.status = Localization.StatusPending.en_us;
      $scope.statusFilter();
    };
    $scope.findCardTopUps = function () {
      $scope.transaction_type = 'CARD-TOPUP';
      $scope.status = Localization.StatusPending.en_us;
      $scope.statusFilter();
    };
    $scope.showTopUPFORM = function () {
      var modalInstance = $modal.open({
          templateUrl: 'TopUP',
          controller: TopUpCtrl,
          resolve: {
            data: function () {
              return {};
            }
          }
        });
      modalInstance.result.then(function (data) {
        console.log(data);
        $http.post('/transactions/cardtopup', data).success(function (response) {
          $scope.findCardTopUps();
        }).error(function (response) {
          $scope.error = response.message;
        });
      }, function () {
      });
    };
    $scope.checkboxes = {};
    $scope.checkAll = function () {
      angular.forEach($scope.checkboxes, function (checkbox, value) {
        $scope.checkboxes[value] = $scope.checkall;
      });
    };
    $scope.isCheckedAll = function () {
      var found = true;
      angular.forEach($scope.checkboxes, function (checkbox, value) {
        if (!checkbox) {
          found = false;
        }
      });
      var ret = $scope.checkall = found;
      return ret;
    };
    $scope.approve = function () {
      angular.forEach($scope.transactions, function (transaction) {
        if ($scope.checkboxes[transaction._id] === true && String(transaction.status) === 'Pending') {
          $scope.update(transaction, Localization.StatusApproved.en_us);
        }
      });
    };
    $scope.decline = function () {
      angular.forEach($scope.transactions, function (transaction) {
        if ($scope.checkboxes[transaction._id] === true && String(transaction.status) === 'Pending') {
          $scope.update(transaction, Localization.StatusRejected.en_us);
        }
      });
    };
    $scope.findRemittances = function () {
      $scope.transaction_type = 'REMITTANCE';
      $scope.status = Localization.StatusPending.en_us;
      $scope.statusFilter();
    };
    $scope.findPayBills = function () {
      $scope.transaction_type = 'BILLS PAYMENT';
      $scope.status = Localization.StatusPending.en_us;
      $scope.statusFilter();
    };
    $scope.findLoans = function () {
      $scope.transaction_type = 'LOAN PAYMENT';
      $scope.status = Localization.StatusPending.en_us;
      $scope.statusFilter();
    };
    $scope.statusFilter = function () {
      var Counter = $resource('/transactions/count', {
          transaction_type: $scope.transaction_type,
          status: $scope.status,
          partner_name: $scope.partner_name
        }, {
          query: {
            method: 'GET',
            isArray: false
          }
        });
      $scope.populate = function () {
        var member = $scope.selectedPerson ? $scope.selectedPerson.originalObject._id : null;
        Transactions.query({
          wildcard_search: $scope.wildcard_search,
          page: $scope.currentPage,
          sort: $scope.sort,
          by: $scope.by,
          transaction_type: $scope.transaction_type,
          status: $scope.status,
          partner: $scope.partner,
          member: member,
          transaction_date_from: $scope.transaction_date_from,
          transaction_date_to: $scope.transaction_date_to
        }, function (transactions) {
          $scope.transactions = transactions;
          angular.forEach($scope.transactions, function (transaction) {
            $scope.checkboxes[transaction._id] = false;
          });
        });
        $timeout(function () {
          blockUI.stop();
        }, 0);
      };
      $scope.sortBy = function (field) {
        if ($scope.sort !== field) {
          $scope.by = true;
          $scope.sort = field;
        } else {
          $scope.by = !$scope.by;
        }
        $scope.populate();
      };
      $scope.pageLimit = 10;
      $scope.currentPage = 1;
      Counter.query(function (count) {
        $scope.totalItems = count.total;
        $scope.populate();
      });
    };
    // Create new Transaction
    $scope.create = function () {
      // Create new Transaction object
      var transaction = new Transactions({ name: this.name });
      // Redirect after save
      transaction.$save(function (response) {
        $location.path('transactions/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing Transaction
    $scope.remove = function (transaction) {
      if (transaction) {
        transaction.$remove();
        for (var i in $scope.transactions) {
          if ($scope.transactions[i] === transaction) {
            $scope.transactions.splice(i, 1);
          }
        }
      } else {
        $scope.transaction.$remove(function () {
          $location.path('transactions');
        });
      }
    };
    // Update existing Transaction
    $scope.update = function (transaction, status) {
      if (transaction) {
        transaction.status = status;
        transaction.$update(function () {
          $scope.statusFilter();
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
    // Find a list of Transactions
    $scope.find = function () {
      $scope.transactions = Transactions.query();
    };
    // Find existing Transaction
    $scope.findOne = function () {
      $scope.transaction = Transactions.get({ transactionId: $stateParams.transactionId });
    };
    $scope.members = Members.query();
    var TopUpCtrl = function ($scope, $modalInstance, data) {
      $scope.local = Localization;
      $scope.lang = Localization.lang;
      $scope.member = {};
      $scope.populateCardNbr = function (member) {
        console.log(member);
        $scope.data.CardNbr = member.CardNbr;
        $scope.data.member = member._id;
      };
      $scope.members = Members.query({ hasCardNumber: true });
      $scope.data = data;
      $scope.ok = function () {
        $scope.modal_is_submitted = !$scope.modal_is_submitted;
        if ($scope.frmTopup.$valid) {
          $modalInstance.close($scope.data);
        }
      };
    };
    var ModalTransCtrl = function ($scope, $modalInstance, data) {
      $scope.local = Localization;
      $scope.lang = Localization.lang;
      $scope.data = data;
      $scope.ok = function () {
        $modalInstance.close();
      };
    };
    $scope.open_transaction = function (transaction) {
      var modalInstance = $modal.open({
          templateUrl: 'TransactionDetails',
          controller: ModalTransCtrl,
          resolve: {
            data: function () {
              return transaction;
            }
          }
        });
      modalInstance.result.then(function (data) {
      }, function () {
      });
    };
  }
]);'use strict';
//Transactions service used to communicate Transactions REST endpoints
angular.module('transactions').factory('Transactions', [
  '$resource',
  function ($resource) {
    return $resource('transactions/:transactionId', { transactionId: '@_id' }, { update: { method: 'PUT' } });
  }
]);'use strict';
// Config HTTP Error Handling
angular.module('users').config([
  '$httpProvider',
  function ($httpProvider) {
    // Set the httpProvider "not authorized" interceptor
    $httpProvider.interceptors.push([
      '$q',
      '$location',
      'Authentication',
      function ($q, $location, Authentication) {
        return {
          responseError: function (rejection) {
            switch (rejection.status) {
            case 401:
              // Deauthenticate the global user
              Authentication.user = null;
              // Redirect to signin page
              $location.path('signin');
              break;
            case 403:
              // Add unauthorized behaviour 
              break;
            }
            return $q.reject(rejection);
          }
        };
      }
    ]);
  }
]);'use strict';
// Setting up route
angular.module('users').config([
  '$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider.state('profile', {
      url: '/settings/profile',
      templateUrl: 'modules/users/views/settings/edit-profile.client.view.html'
    }).state('password', {
      url: '/settings/password',
      templateUrl: 'modules/users/views/settings/change-password.client.view.html'
    }).state('accounts', {
      url: '/settings/accounts',
      templateUrl: 'modules/users/views/settings/social-accounts.client.view.html'
    }).state('signup', {
      url: '/signup',
      templateUrl: 'modules/users/views/signup.client.view.html'
    }).state('signin', {
      url: '/signin',
      templateUrl: 'modules/users/views/signin.client.view.html'
    });
  }
]);'use strict';
angular.module('users').controller('AuthenticationController', [
  '$scope',
  '$rootScope',
  '$http',
  '$location',
  'Authentication',
  function ($scope, $rootScope, $http, $location, Authentication) {
    $scope.authentication = Authentication;
    //If user is signed in then redirect back home
    if ($scope.authentication.user)
      $location.path('/');
    $scope.signin = function () {
      $http.post('/auth/signin', $scope.credentials).success(function (response) {
        //If successful we assign the response to the global user model
        $scope.authentication.user = response;
        //And redirect to the index page
        $location.path('/');
        $rootScope.user = response;
        //                $scope.$apply(function(){
        //                });
        $rootScope.$broadcast('dataloaded');
        $rootScope.pagewraper = true;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
angular.module('users').controller('SettingsController', [
  '$scope',
  '$http',
  '$location',
  '$resource',
  'Users',
  'Authentication',
  function ($scope, $http, $location, $resource, Users, Authentication) {
    $scope.user = Authentication.user;
    // If user is not signed in then redirect back home
    if (!$scope.user)
      $location.path('/');
    // Check if there are additional accounts 
    $scope.hasConnectedAdditionalSocialAccounts = function (provider) {
      for (var i in $scope.user.additionalProvidersData) {
        return true;
      }
      return false;
    };
    // Check if provider is already in use with current user
    $scope.isConnectedSocialAccount = function (provider) {
      return $scope.user.provider === provider || $scope.user.additionalProvidersData && $scope.user.additionalProvidersData[provider];
    };
    // Remove a user social account
    $scope.removeUserSocialAccount = function (provider) {
      $scope.success = $scope.error = null;
      $http.delete('/users/accounts', { params: { provider: provider } }).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.user = Authentication.user = response;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
    // Update a user profile
    $scope.updateUserProfile = function () {
      $scope.success = $scope.error = null;
      var user = new Users($scope.user);
      user.$update(function (response) {
        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
    // Change user password
    $scope.changeUserPassword = function () {
      $scope.success = $scope.error = null;
      $http.put('/users/password/' + Authentication.user._id, $scope.passwordDetails).success(function (response) {
        // If successful show success message and clear form
        $scope.success = true;
        $scope.passwordDetails = null;
      }).error(function (response) {
        $scope.error = response.message;
      });
    };
  }
]);'use strict';
// Users controller
angular.module('users').controller('UsersController', [
  '$scope',
  '$stateParams',
  '$location',
  'Authentication',
  'Users',
  function ($scope, $stateParams, $location, Authentication, Users) {
    $scope.authentication = Authentication;
    // Create new User
    $scope.create = function () {
      // Create new User object
      var user = new Users({ name: this.name });
      // Redirect after save
      user.$save(function (response) {
        $location.path('users/' + response._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
      // Clear form fields
      this.name = '';
    };
    // Remove existing User
    $scope.remove = function (user) {
      if (user) {
        user.$remove();
        for (var i in $scope.users) {
          if ($scope.users[i] === user) {
            $scope.users.splice(i, 1);
          }
        }
      } else {
        $scope.user.$remove(function () {
          $location.path('users');
        });
      }
    };
    // Update existing User
    $scope.update = function () {
      var user = $scope.user;
      user.$update(function () {
        $location.path('users/' + user._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };
    // Find a list of Users
    $scope.find = function () {
      $scope.users = Users.query();
    };
    // Find existing User
    $scope.findOne = function () {
      $scope.user = Users.get({ userId: $stateParams.userId });
    };
  }
]);'use strict';
// Authentication service for user variables
angular.module('users').factory('Authentication', [function () {
    var _this = this;
    _this._data = { user: window.user };
    return _this._data;
  }]);'use strict';
// Users service used for communicating with the users REST endpoint
angular.module('users').factory('Users', [
  '$resource',
  function ($resource) {
    return $resource('users', {}, { update: { method: 'PUT' } });
  }
]);