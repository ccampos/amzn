(function () {
    var ChartDirective = function ($window, $log, $routeParams, StockDataFactory) {
        var WIDTH = 555,
        HEIGHT = 175,
        MARGINS = {
            top: 5,
            right: 5,
            bottom: 50,
            left: 5
        },
        svgWidth = WIDTH - MARGINS.left - MARGINS.right,
        svgHeight = HEIGHT + MARGINS.bottom,
        initialXPositionInteractiveLineAndCircle,
        yAxisTranslateX = -42,
        triangleTranslateY = 20,
        previousCircleXPosition,
        previousCircleYPosition,
        pathClass = 'path',
        trianglePathClass = 'trianglePath',
        d3 = $window.d3;

        return {
            restrict: 'EA',
            template: '<svg width="' + svgWidth + '" height="' + svgHeight + '"></svg>',
            link: function (scope, element, attributes) {
                var _rawSvg = element.find('svg')[0],
                    _svg = d3.select(_rawSvg),
                    _typeOfStockData = 'historical';

                switchTypeOfStockData(_typeOfStockData, _svg);
            }
        }

        function switchTypeOfStockData (_typeOfStockData, _svg) {
            var _promise,
                _chartData,
                _sortedChartData,
                _sortedParsedChartData,
                _lastItemIndex,
                _scales = {},
                _axesGenerators = {},
                _lineGenerator,
                _d3InteractiveLine,
                _initialDateAndStockValue = {},
                _initialDate,
                _initialXPosition,
                _initialStockValue,
                _initialYPosition,
                _d3InteractiveCircle,
                _d3InteractiveRectangle,
                _d3InteractiveTriangleGroup,
                _rectangleFixedYPosition = 5,
                _textFixedYPosition = _rectangleFixedYPosition + 15,
                _rectangleHeight = 23,
                _areInteractiveElementsVisible = false;

            if (_typeOfStockData == 'historical') {
                _promise = StockDataFactory.getStockHistoricalData($routeParams.symbol),
                _promise.then(function (response) {
                    _chartData = response.data.query.results.quote;
                    _sortedChartData = _.sortBy(_chartData, 'Date');
                    _sortedParsedChartData = _.each(_sortedChartData, function (element, index, list) {
                        var thisDate;
                        element.Adj_Close = parseFloat(element.Adj_Close);
                        element.Close = parseFloat(element.Close);
                        element.LongDate = new Date(element.Date);
                        element.High = parseFloat(element.High);
                        element.Low = parseFloat(element.Low);
                        element.Open = parseFloat(element.Open);
                        element.Volume = parseFloat(element.Volume);
                    }),
                    _lastItemIndex = _sortedParsedChartData.length - 1;

                    _scales = scalesGenerator(_sortedParsedChartData, _typeOfStockData);
                    _axesGenerators = axesGenerator(_scales);
                    _lineGenerator = displayAxesAndPath(_svg, _sortedParsedChartData, _scales, _axesGenerators);

                    _d3InteractiveCircle = _svg.append('circle')
                        .attr('class', 'interactiveCircle')
                        .attr('r', 5)

                    _initialDateAndStockValue = getMatchingStockValue(_sortedParsedChartData[_lastItemIndex].Date);
                    if (_initialDateAndStockValue) {
                        _initialDate = new Date(_initialDateAndStockValue.date);
                        _initialStockValue = _initialDateAndStockValue.stockValue;
                        _initialXPosition = _scales.xScale(_initialDate);
                        _initialYPosition = _scales.yScale(_initialStockValue);

                        initialXPositionInteractiveLineAndCircle = _initialXPosition;
                        _d3InteractiveCircle
                            .attr('cx', _initialXPosition)
                            .attr('cy', _initialYPosition)
                    }

                    _d3InteractiveLine = createInteractiveLine(_svg);

                    _d3InteractiveTriangleGroup = createInteractiveTriangle(_svg, _initialXPosition);

                    _d3InteractiveRectangle = createInteractiveRectangle(_svg, _rectangleFixedYPosition, _rectangleHeight);
                    _d3InteractiveTextStockValue = createInteractiveText(_svg, _textFixedYPosition, 'stockValue');
                    _d3InteractiveTextDate = createInteractiveText(_svg, _textFixedYPosition, 'date');

                    _svg.on('mousemove', onMouseMoveListener);
                    _svg.on('mouseout', onMouseOutListener);

                    function onMouseOutListener () {
                        if (_areInteractiveElementsVisible) {
                            _areInteractiveElementsVisible = hideShowInteractiveElements('hide');
                        }

                        previousCircleXPosition = _d3InteractiveCircle.attr('cx');
                        previousCircleYPosition = _d3InteractiveCircle.attr('cy');

                        _d3InteractiveCircle
                            .attr('cy', _initialYPosition)
                            .attr('cx', _initialXPosition)
                    }

                    function onMouseMoveListener () {
                        var _d3MouseCoordinates,
                            _d3MouseCoordinateX,
                            _yScale,
                            _xScale,
                            _dateAndStockValue,
                            _minimumDateAndStockValue,
                            _maximumDateAndStockValue,
                            _minimumChartX,
                            _minimumChartY,
                            _maximumChartX,
                            _maximumChartY,
                            _padding,
                            _textStockValueXCoordinate,
                            _textStockValueWidth,
                            _textDateXCoordinate,
                            _textDateWidth,
                            _rectangleWidth,
                            _defaultDistanceFromMouseXToRectangleXCoordinate,
                            _rectangleXCoordinate,
                            _minimumRectangleXPosition,
                            _maximumRectangleXPosition,
                            _sortedParsedChartDataLastIndex;

                        _d3MouseCoordinates = d3.mouse(this);
                        _d3MouseCoordinateX = _d3MouseCoordinates[0];
                        _xScale = _scales.xScale;
                        _yScale = _scales.yScale;
                        _sortedParsedChartDataLastIndex = _sortedParsedChartData.length - 1;
                        _dateAndStockValue = getMatchingStockValue(_d3MouseCoordinateX);
                        _minimumDateAndStockValue = getMatchingStockValue(_sortedParsedChartData[0].Date);
                        _minimumChartX = _xScale(_minimumDateAndStockValue.longDate);
                        _minimumChartY = _yScale(_minimumDateAndStockValue.stockValue);
                        _maximumDateAndStockValue = getMatchingStockValue(_sortedParsedChartData[_sortedParsedChartDataLastIndex].Date);
                        _maximumChartX = _xScale(_maximumDateAndStockValue.longDate);
                        _maximumChartY = _yScale(_maximumDateAndStockValue.stockValue);
                        _padding = 10;
                        _defaultDistanceFromMouseXToRectangleXCoordinate = 100;
                        _rectangleXCoordinate = _d3MouseCoordinateX - _defaultDistanceFromMouseXToRectangleXCoordinate;
                        _minimumRectangleXPosition = yAxisTranslateX;

                        if (_d3MouseCoordinateX < _minimumChartX) {
                            if (_minimumDateAndStockValue) {
                                _rectangleXCoordinate = _minimumRectangleXPosition;

                                _textStockValueWidth = _d3InteractiveTextStockValue.node().getComputedTextLength();
                                _textDateWidth = _d3InteractiveTextDate.node().getComputedTextLength()
                                _rectangleWidth = _padding * 3 + _textStockValueWidth + _textDateWidth;

                                _textStockValueXCoordinate = _rectangleXCoordinate + _padding;
                                _textDateXCoordinate = _textStockValueXCoordinate + _textStockValueWidth + _padding;
                                _d3InteractiveTextStockValue
                                    .text(_minimumDateAndStockValue.stockValue.toFixed(2));
                                _d3InteractiveTextDate
                                    .text(moment(_minimumDateAndStockValue.longDate).format('MMM D, YYYY'));

                                _d3InteractiveCircle
                                    .attr('cx', _minimumChartX)
                                    .attr('cy', _minimumChartY);
                                _d3InteractiveLine
                                    .attr('x1', _minimumChartX)
                                    .attr('x2', _minimumChartX);
                                _d3InteractiveTriangleGroup
                                    .attr('transform', 'translate(' + _minimumChartX + ',' + triangleTranslateY + ')');
                                _d3InteractiveRectangle
                                    .attr('width', _rectangleWidth)
                                    .attr('x', _rectangleXCoordinate);
                                _d3InteractiveTextStockValue
                                    .attr('x', _textStockValueXCoordinate);
                                _d3InteractiveTextDate
                                    .attr('x', _textDateXCoordinate);
                            }
                        } else if (_minimumChartX < _d3MouseCoordinateX && _d3MouseCoordinateX < _maximumChartX) {
                            if (_dateAndStockValue) {
                                _d3InteractiveCircle
                                    .attr('cx', _d3MouseCoordinateX)
                                    .attr('cy', _yScale(_dateAndStockValue.stockValue));
                                _d3InteractiveLine
                                    .attr('x1', _d3MouseCoordinateX)
                                    .attr('x2', _d3MouseCoordinateX);
                                _d3InteractiveTriangleGroup
                                    .attr('transform', 'translate(' + _d3MouseCoordinateX + ',' + triangleTranslateY + ')');
                                _d3InteractiveTextStockValue
                                    .text(_dateAndStockValue.stockValue.toFixed(2));
                                _d3InteractiveTextDate
                                    .text(moment(_dateAndStockValue.longDate).format('MMM D, YYYY'));

                                _textStockValueWidth = _d3InteractiveTextStockValue.node().getComputedTextLength();
                                _textDateWidth = _d3InteractiveTextDate.node().getComputedTextLength();
                                _rectangleWidth = _padding * 3 + _textStockValueWidth + _textDateWidth;

                                if (_rectangleXCoordinate < _minimumRectangleXPosition) {
                                    _rectangleXCoordinate = _minimumRectangleXPosition;
                                }
                                _textStockValueXCoordinate = _rectangleXCoordinate + _padding;
                                _textDateXCoordinate = _textStockValueXCoordinate + _textStockValueWidth + _padding;

                                _d3InteractiveRectangle
                                    .attr('width', _rectangleWidth)
                                    .attr('x', _rectangleXCoordinate);
                                _d3InteractiveTextStockValue
                                    .attr('x', _textStockValueXCoordinate);
                                _d3InteractiveTextDate
                                    .attr('x', _textDateXCoordinate);
                            }
                        } else if (_maximumChartX < _d3MouseCoordinateX) {
                            if (_maximumDateAndStockValue) {
                                _d3InteractiveTextStockValue
                                    .text(_maximumDateAndStockValue.stockValue.toFixed(2));
                                _d3InteractiveTextDate
                                    .text(moment(_maximumDateAndStockValue.longDate).format('MMM D, YYYY'));

                                _textStockValueWidth = _d3InteractiveTextStockValue.node().getComputedTextLength();
                                _textDateWidth = _d3InteractiveTextDate.node().getComputedTextLength();
                                _rectangleWidth = _padding * 3 + _textStockValueWidth + _textDateWidth;

                                _rectangleXCoordinate = svgWidth - _rectangleWidth - yAxisTranslateX;
                                _textStockValueXCoordinate = _rectangleXCoordinate + _padding;
                                _textDateXCoordinate = _textStockValueXCoordinate + _textStockValueWidth + _padding;

                                _d3InteractiveCircle
                                    .attr('cx', _maximumChartX)
                                    .attr('cy', _maximumChartY);
                                _d3InteractiveLine
                                    .attr('x1', _maximumChartX)
                                    .attr('x2', _maximumChartX);
                                _d3InteractiveTriangleGroup
                                    .attr('transform', 'translate(' + _maximumChartX + ',' + triangleTranslateY + ')');
                                _d3InteractiveRectangle
                                    .attr('width', _rectangleWidth)
                                    .attr('x', _rectangleXCoordinate);
                                _d3InteractiveTextStockValue
                                    .attr('x', _textStockValueXCoordinate);
                                _d3InteractiveTextDate
                                    .attr('x', _textDateXCoordinate);
                            }
                        } else {
                            return undefined;
                        }

                        if (!_areInteractiveElementsVisible) {
                            if (!previousCircleXPosition) {
                                previousCircleXPosition = _initialXPosition;
                                previousCircleYPosition = _initialYPosition;
                            }
                            _d3InteractiveCircle
                                .attr('cx', previousCircleXPosition)
                                .attr('cy', previousCircleYPosition);

                            _areInteractiveElementsVisible = hideShowInteractiveElements('show');
                        }
                    }

                    function getMatchingStockValue(_firstArgument) {
                        var _typeOfFirstArgument = typeof _firstArgument,
                            _mouseCoordinateX,
                            _svgDate,
                            _formattedDate,
                            _matchingObject,
                            _matchingStockValue,
                            _matchingLongDate;

                        if (_typeOfFirstArgument == 'number') {
                            _mouseCoordinateX = _firstArgument;
                            _svgDate = _scales.xScale.invert(_mouseCoordinateX);
                            _formattedDate = moment(_svgDate).format('YYYY-MM-DD');
                        } else if (_typeOfFirstArgument == 'string' && _firstArgument.match(/\d{4}-\d{2}-\d{2}/)) {
                            _formattedDate = _firstArgument;
                        } else {
                            return undefined;
                        }

                        _matchingObject = _.findWhere(_sortedParsedChartData, { Date: _formattedDate });
                        if (_matchingObject) {
                            _matchingStockValue = _matchingObject.Close;
                            _matchingLongDate = _matchingObject.LongDate;

                            return {
                                date: _formattedDate,
                                stockValue: _matchingStockValue,
                                longDate: _matchingLongDate
                            }
                        } else {
                            return undefined;
                        }
                    }

                    function hideShowInteractiveElements (_action) {
                        var _visibilityAction,
                            _areVisible;

                        if (_action === 'show') {
                            _visibilityAction = 'visible';
                            _areVisible = true;
                        } else if (_action === 'hide') {
                            _visibilityAction = 'hidden';
                            _areVisible = false;
                        } else {
                            $log.log("Incorrect argument: needs to be 'show' or 'hide'");
                            return undefined;
                        }

                        _d3InteractiveLine.attr('visibility', _visibilityAction);
                        _d3InteractiveTriangleGroup.attr('visibility', _visibilityAction);
                        _d3InteractiveRectangle.attr('visibility', _visibilityAction);
                        _d3InteractiveTextStockValue.attr('visibility', _visibilityAction);
                        _d3InteractiveTextDate.attr('visibility', _visibilityAction);

                        return _areVisible;
                    }
                });
            } else {
                $log.log('typeOfStockData not found');
                return;
            }
        }

        function createInteractiveLine (_svgElement) {
            var _d3LineElement = _svgElement.append('line')
                .attr('class', 'interactiveLine')
                .attr('visibility', 'hidden')
                .attr('x1', initialXPositionInteractiveLineAndCircle)
                .attr('y1', MARGINS.top)
                .attr('x2', initialXPositionInteractiveLineAndCircle)
                .attr('y2', svgHeight - MARGINS.bottom);

            return _d3LineElement;
        }

        function createInteractiveRectangle (_svgElement, _rectangleFixedYPosition, _rectangleHeight) {
            var _d3RectangleElement = _svgElement.append('rect')
                .attr('class', 'interactiveRectangle')
                .attr('visibility', 'hidden')
                .attr('y', _rectangleFixedYPosition)
                .attr('height', _rectangleHeight);

            return _d3RectangleElement;
        }

        function createInteractiveText (_svgElement, _textFixedYPosition, _className) {
            var _d3TextElement = _svgElement.append('text')
                .attr('class', 'interactiveText ' + _className)
                .attr('y', _textFixedYPosition);

            return _d3TextElement;
        }

        function createInteractiveTriangle (_svgElement, _triangleFixedYPosition, _initialXPosition) {
            var _groupContainer = _svgElement.append('svg:g')
                .attr('transform', 'translate(' + (initialXPositionInteractiveLineAndCircle) + ',' + triangleTranslateY + ')')
                .attr('visibility', 'hidden');

            _groupContainer.append('svg:path')
                .attr({
                    d: 'M0 15 L-15 0 L15 0 Z',
                    'class': trianglePathClass
                })
                .attr('class', 'interactiveTriangle');

            return _groupContainer;
        }

        function scalesGenerator (_dataToPlot, _typeOfStockData) {
            var _dataToPlotFirstItem,
                _dataToPlotLastItem;

            if (_typeOfStockData == 'historical') {
                _dataToPlotFirstItem = _dataToPlot[0].LongDate;
                _dataToPlotLastItem = _dataToPlot[_dataToPlot.length - 1].LongDate;
            } else {
                $log.log('typeOfStockData for scalesGenerator not found');
                return;
            }

            return {
                xScale: d3.time.scale()
                    .domain([_dataToPlotFirstItem, _dataToPlotLastItem])
                    .rangeRound([0, WIDTH - MARGINS.left - MARGINS.right]),
                yScale: d3.scale.linear()
                    .range([HEIGHT - MARGINS.top, MARGINS.bottom])
                    .domain([
                        d3.min(_dataToPlot, function (d) { return d.Close }),
                        d3.max(_dataToPlot, function (d) { return d.Close })
                ])
            }
        }

        function axesGenerator (_scales) {
            return {
                xAxisGenerator: d3.svg.axis()
                    .scale(_scales.xScale)
                    .ticks(6)
                    .tickFormat(d3.time.format('%b %y'))
                    .tickSize(1)
                    .tickPadding(8),
                yAxisGenerator: d3.svg.axis()
                    .scale(_scales.yScale)
                    .ticks(4)
                    .tickSize(1)
                    .orient('right')
                    .tickPadding(8)
            }
        }

        function displayAxesAndPath (_svgElement, _dataToPlot, _scales, _axesGenerators) {
            var lineGenerator;

            _svgElement.append('svg:g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + HEIGHT + ')')
                .call(_axesGenerators.xAxisGenerator);

            _svgElement.append('svg:g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + yAxisTranslateX + ',0)')
                .call(_axesGenerators.yAxisGenerator);

            lineGenerator = d3.svg.line()
                .x( function (d) {
                    var _value = _scales.xScale(d.LongDate);
                    return _value;
                })
                .y( function (d) {
                    var _value = _scales.yScale(d.Close);
                    return _value;
                })
                .interpolate('linear');

            _svgElement.append('svg:path')
                .attr({
                    d: lineGenerator(_dataToPlot),
                    'class': pathClass
                });

            return lineGenerator;
        }
    }

    angular.module('ChartDirectiveModule', ['StockDataFactoryModule'])
        .directive('lineChart', ChartDirective);
})();
