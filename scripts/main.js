(function () {
    var router = function ($routeProvider) {
        $routeProvider
            .when('/stock/:symbol', {
                templateUrl: './templates/stockCard.html',
                controller: 'StockController',
                resolve: {
                    firstStockData: function ($route, StockDataFactory) {
                        return StockDataFactory.getStockMostRecentData($route.current.params.symbol);
                    }
                }
            })
            .otherwise({
                redirectTo: '/phones'
            });
    };

    var run = function ($rootScope) {
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (next.$$route && next.$$route.resolve) {
                // Show a loading message until promises aren't resolved
                $rootScope.loadingView = true;
            }
        });

        $rootScope.$on('$routeChangeSuccess', function (event, next, current) {
            // Hide loading message
            $rootScope.loadingView = false;
        });
    };

    angular.module('voo', ['ngRoute', 'StockControllerModule', 'ChartDirectiveModule', 'StockSearchDirectiveModule'])
        .config( ['$routeProvider', router ] )
        .run(run);
})();
