'use strict';

angular.module('core').factory('Localization', [
	function() {
		// Localization service logic
		// ...

		// Public API
		return {
            lang : 'en_us',

            // START Menus
            menuMembersManagement : {
                en_us : 'Members Management',
                ch_hk : 'Members Management'
            },
            menuMembers : {
                en_us : 'Members',
                ch_hk : 'Members'
            },
            menuAddMember: {
                en_us : 'Add Member',
                ch_hk : 'Add Member'
            },
            menuBeneficiaryApplication: {
                en_us : 'Beneficiary Application',
                ch_hk : 'Beneficiary Application'
            },
            menuBillersApplication: {
                en_us : 'Billers Application',
                ch_hk : 'Billers Application'
            },
            menuEmployeeManagement: {
                en_us : 'Employee Management',
                ch_hk : 'Employee Management'
            },
            menuEmployees: {
                en_us : 'Employees',
                ch_hk : 'Employees'
            },
            menuAddEmployee: {
                en_us : 'Add Employee',
                ch_hk : 'Add Employee'
            },
            menuPartnersManagement: {
                en_us : 'Partners Management',
                ch_hk : 'Partners Management'
            },
            menuPartners: {
                en_us : 'Partners',
                ch_hk : 'Partners'
            },
            menuAddPartner: {
                en_us : 'Add Partner',
                ch_hk : 'Add Partner'
            },
            menuReports: {
                en_us : 'Reports',
                ch_hk : 'Reports'
            },
            menuTransactions: {
                en_us : 'Transactions',
                ch_hk : 'Transactions'
            },
            menuMicrofinanceLoans: {
                en_us : 'Loan Payments',
                ch_hk : 'Loan Payments'
            },
            menuRemittances: {
                en_us : 'Remittances',
                ch_hk : 'Remittances'
            },
            menuBills: {
                en_us : 'Bill Payments',
                ch_hk : 'Bill Payments'
            },
            menuTopUps: {
                en_us : 'Top Ups',
                ch_hk : 'Top Ups'
            },
            menuCardTopUps: {
                en_us : 'Card Top Ups',
                ch_hk : 'Card Top Ups'
            },
            menuAdvanceSearch: {
                en_us : 'Advance Search',
                ch_hk : 'Advance Search'
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

            // END Menus
			FirstName: {
                en_us : 'First Name',
                ch_hk : 'First Name'
            },
			LastName: {
                en_us : 'Last Name',
                ch_hk : 'Last Name'
            },
            MiddleName: {
                en_us : 'Middle Name',
                ch_hk : 'Middle Name'
            },
            NameOnCard: {
                en_us : 'Name on card',
                ch_hk : 'Name on card'
            },
            Title: {
                en_us : 'Title',
                ch_hk : 'Title'
            },
            Mr: {
                en_us : 'Mr.',
                ch_hk : 'Mr.'
            },
            Ms: {
                en_us : 'Ms.',
                ch_hk : 'Ms.'
            },
            Mrs: {
                en_us : 'Mrs.',
                ch_hk : 'Mrs.'
            },
            Dr: {
                en_us : 'Dr.',
                ch_hk : 'Dr.'
            },
            Engr: {
                en_us : 'Engr.',
                ch_hk : 'Engr.'
            },
            Dir: {
                en_us : 'Dir.',
                ch_hk : 'Dir.'
            },
            CivilStatus: {
                en_us : 'Civil status',
                ch_hk : 'Civil status'
            },
            Single: {
                en_us : 'Single',
                ch_hk : 'Single'
            },
            Married: {
                en_us : 'Married',
                ch_hk : 'Married'
            },
            Divorced: {
                en_us : 'Divorced',
                ch_hk : 'Divorced'
            },
            Separated: {
                en_us : 'Separated',
                ch_hk : 'Separated'
            },
            Widowed: {
                en_us : 'Widowed',
                ch_hk : 'Widowed'
            },
            Gender: {
                en_us : 'Gender',
                ch_hk : 'Gender'
            },
            Male: {
                en_us : 'Male',
                ch_hk : 'Male'
            },
            Female: {
                en_us : 'Female',
                ch_hk : 'Female'
            },
            Birthday: {
                en_us : 'Birthday',
                ch_hk : 'Birthday'
            },
            Birthplace: {
                en_us : 'Birthplace',
                ch_hk : 'Birthplace'
            },
            Citizenship: {
                en_us : 'Citizenship',
                ch_hk : 'Citizenship'
            },
			Email: {
                en_us : 'Email',
                ch_hk : 'Email'
            },
			Address1: {
                en_us : 'Address Line 1',
                ch_hk : 'Address Line 1'
            },
            Address2: {
                en_us : 'Address Line 2',
                ch_hk : 'Address Line 2'
            },
            City: {
                en_us : 'City',
                ch_hk : 'City'
            },
            Country: {
                en_us : 'Country',
                ch_hk : 'Country'
            },
            isMailingAddress: {
                en_us : 'Is Mailing address?',
                ch_hk : 'Is Mailing address?'
            },
            CompanyName: {
                en_us : 'Company Name',
                ch_hk : 'Company Name'
            },
            WorkTitle: {
                en_us : 'Work Title',
                ch_hk : 'Work Title'
            },
            NameOfSupervisor: {
                en_us : 'Name Of Supervisor',
                ch_hk : 'Name Of Supervisor'
            },
            CompanyAddressLine1: {
                en_us : 'Company address line 1',
                ch_hk : 'Company address line 1'
            },
            CompanyAddressLine2: {
                en_us : 'Company address line 2',
                ch_hk : 'Company address line 2'
            },
            CompanyZipCode: {
                en_us : 'Company postal code',
                ch_hk : 'Company postal code'
            },
            OfficePhoneNumber: {
                en_us : 'Office phone number',
                ch_hk : 'Office phone number'
            },
            EstimatedAnnualSalary: {
                en_us : 'Estimated annual salary',
                ch_hk : 'Estimated annual salary'
            },
            YearEmployed: {
                en_us : 'Year employed',
                ch_hk : 'Year employed'
            },
            YearsWorked: {
                en_us : 'Year worked',
                ch_hk : 'Year worked'
            },
            MothersFirstName: {
                en_us : 'Mother\'s first name',
                ch_hk : 'Mother\'s first name'
            },
            MothersMaidenSurname: {
                en_us : 'Mother\'s maiden surname',
                ch_hk : 'Mother\'s maiden surname'
            },
            FathersSurname: {
                en_us : 'Father\'s surname',
                ch_hk : 'Father\'s surname'
            },
            FathersFirstName: {
                en_us : 'Father\'s first name',
                ch_hk : 'Father\'s first name'
            },
            MotherBirthday: {
                en_us : 'Mother\'s birthday',
                ch_hk : 'Mother\'s birthday'
            },
            SSSIDNumber: {
                en_us : 'SSS ID number',
                ch_hk : 'SSS ID number'
            },
            SSSIDIssuanceDate: {
                en_us : 'SSS ID Issuance date',
                ch_hk : 'SSS ID Issuance date'
            },
            DriversLicenseID: {
                en_us : 'Driver\'s License ID',
                ch_hk : 'Driver\'s License ID'
            },
            DriversLicenseIssuanceDate: {
                en_us : 'Driver\'s License Issuance date',
                ch_hk : 'Driver\'s License Issuance date'
            },
            DriversLicenseExpiryDate: {
                en_us : 'Driver\'s License expiry date',
                ch_hk : 'Driver\'s License expiry date'
            },
            PassportID: {
                en_us : 'Passport ID',
                ch_hk : 'Passport ID'
            },
            PassportIssuanceDate: {
                en_us : 'Passport Issuance Date',
                ch_hk : 'Passport Issuance Date'
            },
            PassportExpiryDate: {
                en_us : 'Passport Expiry Date',
                ch_hk : 'Passport Expiry Date'
            },
			ZipCode: {
                en_us : 'Zip Code',
                ch_hk : 'Zip Code'
            },
            ProvincialCode: {
                en_us : 'Provincial Code',
                ch_hk : 'Provincial Code'
            },
			ContactNumber: {
                en_us : 'Contact Number',
                ch_hk : 'Contact Number'
            },
			EmployeeType: {
                en_us : 'Employee Type',
                ch_hk : 'Employee Type'
            },
			Status: {
                en_us : 'Account activation status',
                ch_hk : 'Account activation status'
            },
            MemberSince : {
                en_us: 'Member Since',
                ch_hk: 'Member Since'
            },
            Action : {
                en_us: 'Action',
                ch_hk: 'Action'
            },
            PartnerName : {
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
            AddMember : {
                en_us: 'Add Member',
                ch_hk: 'Add Member'
            },
            EditMember : {
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
            Billers : {
                en_us: 'Billers',
                ch_hk: 'Billers'
            },
            BillerName : {
                en_us : 'Biller Name',
                ch_hk : 'Biller Name'
            },
            AccountName : {
                en_us : 'Account Name',
                ch_hk : 'Account Name'
            },
            AccountNumber : {
                en_us : 'Account Number',
                ch_hk : 'Account Number'
            },
            CreatedOn : {
                en_us : 'Created On',
                ch_hk : 'Created On'
            },
            ApplicantsName : {
                en_us : 'Applicants Name',
                ch_hk : 'Applicants Name'
            },
            BeneficiaryName : {
                en_us : 'Beneficiary Name',
                ch_hk : 'Beneficiary Name'
            },
            StatusApproved: {
                en_us : 'Approved',
                ch_hk : 'Approved'
            },
            StatusRejected: {
                en_us : 'Rejected',
                ch_hk : 'Rejected'
            },
            StatusApprove: {
                en_us : 'Approve',
                ch_hk : 'Approve'
            },
            StatusReject: {
                en_us : 'Reject',
                ch_hk : 'Reject'
            },
            StatusPending: {
                en_us : 'Pending',
                ch_hk : 'Pending'
            },
            StatusCleared: {
                en_us : 'Cleared',
                ch_hk : 'Cleared'
            },
            StatusClear: {
                en_us : 'Clear',
                ch_hk : 'Clear'
            },
            AccountManagement: {
                en_us : 'Account Management',
                ch_hk : 'Account Management'
            },
            DateCreated: {
                en_us : 'Date Created',
                ch_hk : 'Date Created'
            },
            ReferenceCode: {
                en_us : 'Reference Code',
                ch_hk : 'Reference Code'
            },
            MemberName: {
                en_us : 'Member Name',
                ch_hk : 'Member Name'
            },
            AmountPaid: {
                en_us : 'Amount',
                ch_hk : 'Amount'
            },
            DateModified: {
                en_us : 'Date Modified',
                ch_hk : 'Date Modified'
            },
            SenderName: {
                en_us : 'Sender Name',
                ch_hk : 'Sender Name'
            },
            RecipientName: {
                en_us : 'Recipient Name',
                ch_hk : 'Recipient Name'
            },
            Amount: {
                en_us : 'Amount',
                ch_hk : 'Amount'
            },
            LoanManagement: {
                en_us : 'Loan',
                ch_hk : 'Loan'
            },
            ReferenceNumber: {
                en_us : 'Reference No.',
                ch_hk : 'Reference No.'
            },
            OriginalValue: {
                en_us : 'Original Value',
                ch_hk : 'Original Value'
            },
            RatePerPeriod: {
                en_us : 'Rate Per Period',
                ch_hk : 'Rate Per Period'
            },
            NumberOfPeriods: {
                en_us : 'Number of periods',
                ch_hk : 'Number of periods'
            },
            CurrentPeriod: {
                en_us : 'Current Period',
                ch_hk : 'Current Period'
            },
            PresentValue: {
                en_us : 'Present Value',
                ch_hk : 'Present Value'
            },
            DateDuration: {
                en_us : 'Date Duration',
                ch_hk : 'Date Duration'
            },
            isMember: {
                en_us : 'Is Member',
                ch_hk : 'Is Member'
            },
            BankName: {
                en_us : 'Bank',
                ch_hk : 'Bank'
            },
            EWalletAccountNumber: {
                en_us : 'EWallet Account Number',
                ch_hk : 'EWallet Account Number'
            },
            LatestTransactions: {
                en_us : 'Latest Transactions',
                ch_hk : 'Latest Transactions'
            },
            TransactionDetails: {
                en_us : 'Transaction Details',
                ch_hk : 'Transaction Details'
            },
            PaymentType: {
                en_us : 'Payment Type',
                ch_hk : 'Payment Type'
            },
            TransactionDate: {
                en_us : 'Transaction Date',
                ch_hk : 'Transaction Date'
            },
            DepositDate: {
                en_us : 'Deposit Date',
                ch_hk : 'Deposit Date'
            },
            SlipNo: {
                en_us : 'Slip Reference No',
                ch_hk : 'Slip Reference No'
            },
            DepositSlip: {
                en_us : 'Deposit Slip',
                ch_hk : 'Deposit Slip'
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
	}
]);