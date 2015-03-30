'use strict';

angular.module('system').factory('KycSending', [
    '$resource',
	function($resource) {
		// Kyc sending service logic
		// ...

		// Public API
        return $resource('kyc-sending/:kycsendingId', {
            audittrailsId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
	}
]);