(function () {
    var StockController = function ($scope, $routeParams, $interval, firstStockData, StockDataFactory) {
        moment.tz.load({
            zones : ['America/New_York|EST EDT|50 40|0101|1Lz50 1zb0 Op0'],
            links : ['America/New_York|US/Eastern'],
            version : '2014e'
        });

        init();

        // firstStockData needed to wait for promise resolved to load template
        // Display stock data before interval fires
        function init () {
            var millisecondsInASecond = 1000,
                intervalSeconds = 60 * millisecondsInASecond;

            displayStockResponse(firstStockData);

            $interval(function () {
                var promise = StockDataFactory.getStockMostRecentData($routeParams.symbol);
                promise.then(function (response) {
                    displayStockResponse(response);
                });
            }, intervalSeconds);
        }

        function displayStockResponse(_response) {
            var _query,
                _time,
                _timeZone,
                _quote,
                _stockExchange,
                _lastTradePriceOnly,
                _changeDecimal,
                _previousClose,
                _changePercentage;

            _query = _response.data.query;
            _time = moment(_query.created).format('MMM D hh:mm A');
            _timeZone = moment(_query.created).tz('America/New_York').format('z');
            _quote = _query.results.quote;
            _lastTradePriceOnly = _quote.LastTradePriceOnly;
            if (!_lastTradePriceOnly) { return };
            _stockExchange = _quote.StockExchange;
            _changeDecimal = _quote.Change;
            _previousClose = _lastTradePriceOnly - _changeDecimal;
            _changePercentage = calculateChangePercentage(_previousClose, _lastTradePriceOnly);

            $scope.name = _quote.Name;
            $scope.symbol = _quote.Symbol;
            $scope.lastTradeDateTime = _time;
            $scope.timeZone = _timeZone;
            $scope.lastTradePriceOnly = _lastTradePriceOnly;
            $scope.stockExchange = _stockExchange;
            $scope.changeDecimal = _changeDecimal;
            $scope.changePercentage = _changePercentage;
        }

        function calculateChangePercentage (_previousClose, _lastTradePriceOnly) {
            var _changePercentage;

            changePercentage = _lastTradePriceOnly * 100 / _previousClose - 100;

            return changePercentage;
        }
    };

    angular.module('StockControllerModule', ['StockDataFactoryModule', 'AbsoluteValueFixedFilterModule'])
        .controller('StockController', StockController);
})();
