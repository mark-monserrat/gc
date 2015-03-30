'use strict';

angular.module('core').factory('MyModules', ['$resource',
    function($resource) {
        return $resource('modules/:moduleId', { moduleId: '@_id'
        }, {
            update: {
                method: 'PUT'
            }
        });
    }
]);