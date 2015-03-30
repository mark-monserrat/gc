'use strict';

angular.module('members').factory('Memberbiller', ['$resource',
    function($resource) {
        return $resource('memberbiller/:memberbillerId', {
            memberbillerId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);