(function () {
    var StockSearchDirective = function ($log) {
        return {
            restrict: 'EA',
            template: '<input placeholder="Search Stock" ng-keyup="onKeyUpListener($event)">',
            link: function (scope, element, attributes) {

                scope.onKeyUpListener  = function ($event) {
                    var enterKey = 13;
                    if ($event.keyCode === enterKey) {
                        console.log('enter key pressed');
                    }
                }
            }
        }
    }

    angular.module('StockSearchDirectiveModule', [])
        .directive('stockSearch', StockSearchDirective);
})();
