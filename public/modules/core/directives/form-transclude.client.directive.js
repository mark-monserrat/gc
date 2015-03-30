'use strict';

angular.module('core').directive('formTransclude', function(){
    return {
        restrict: 'E',
        scope: false,
        transclude: true,
        replace: true,
        template: '<div><h1>Transcluded form</h1><div ng-transclude class="form-transclude"></div></div>'
    };
});