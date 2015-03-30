'use strict';

angular.module('system').factory('AuditTrails', ['$resource',
    function($resource) {
        return $resource('audittrails/:audittrailsId', {
               audittrailsId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);