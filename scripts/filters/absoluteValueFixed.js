(function () {
    var absoluteValueFixed = function () {
        return function (val) {
            return Math.abs(val).toFixed(2);
        };
    }

    angular.module('AbsoluteValueFixedFilterModule', [])
        .filter('absoluteValueFixed', absoluteValueFixed);
})();
