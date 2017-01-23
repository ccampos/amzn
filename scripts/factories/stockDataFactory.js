(function () {
    var StockDataFactory = function ($log, $http) {
        var exports = {};

        exports.getStockMostRecentData = function (symbol) {
            return $http({
                method: 'GET',
                url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22' + symbol + '%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
            })
            .error(function(data, status, headers, config) {
                $log.log('error in StockDataFactory Most Recent Data, status:', status);
            });
        }

        exports.getStockHistoricalData = function (symbol) {
            return $http({
                method: 'GET',
                   url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22' + symbol + '%22%20and%20startDate%20%3D%20%222014-03-11%22%20and%20endDate%20%3D%20%222015-04-28%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
            })
            .error(function(data, status, headers, config) {
                $log.log('error in StockDataFactory Historical Data, status:', status);
            });
        }

        exports.getStockInfo = function (symbol) {
            return $http({
                method: 'GET',
                url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.stocks%20where%20symbol%3D%22' + symbol + '%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback='
            })
            .error(function(data, status, headers, config) {
                $log.log('error in StockDataFactory Stock Info Data, status:', status);
            });
        }

        return exports;
    };

    angular.module('StockDataFactoryModule', [])
        .factory('StockDataFactory', StockDataFactory)
})();
