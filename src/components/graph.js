'use strict';

if (!_.has(Suit, 'Components')) {
    Suit.Components = {};
}

Suit.Components.Graph = Suit.Component.extend(/** @lends Suit.Components.Graph.prototype */{
    /**
      * @class Suit.Components.Graph
      *
      * Graph component for drawing SET-flavoured graphs.
      *
      * Constructs a chart based on NVD3 library. It accepts predefined values for
      * drawing the chart.
      *
      * Example of usage:
      * // Initialize the chart on your own view:
      * // you can pass some options for defining your chart look and feel.
      * var linearGraph = new Suit.Components.LineGraph({});
      * // then, append it to your desired location:
      * this.htmlView(linearGraph, '#linear-graph');
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Array} options.data - Chart data
      * @param {Array} options.color - Array of colors
      * @param {Int} options.height - Chart height
      * @param {Boolean} options.showXAxis - Show the `x` axis or not
      * @param {Boolean} options.showYAxis - Show the `y` axis or not
      * @param {Int} options.width - Chart width
      **/
    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);

        // This is for enabling/disabling the logs
        nv.dev = false;

        this.size      = options.size || 'tiny';
        this.data      = options.data || [];
        this.baseColor = options.baseColor || 'blue';
        this.isWidget  = !_.isUndefined(options.isWidget) ? !!options.isWidget : false;
        this.color     = this.generateColors();
        this.height    = options.height || 100;
        this.margin    = !_.isUndefined(options.margin) ? options.margin : {};
        this.showXAxis = !_.isUndefined(options.showXAxis) ? !!options.showXAxis : true;
        this.showYAxis = !_.isUndefined(options.showYAxis) ? !!options.showYAxis : true;
        this.width     = options.width || 100;
        this.noData    = !_.isUndefined(options.noData) ? options.noData : 'No Data';
    },
    /** className for the component. */
    className: function () {
        return 'graph-set-' + this.type;
    },
    /** Base colors map */
    colorsMap: {
        blue: [50, 161, 204],
        purple: [104, 91, 139],
        blueberry: [78, 129, 204],
        green: [64, 168, 128],
        lime: [107, 178, 107],
        yellow: [209, 175, 80],
        tangerine: [216, 161, 80],
        orange: [221, 133, 78],
        red: [200, 70, 60],
        lightestGrey: [247, 247, 247]
    },
    /** Generates a single rgba color string based on rgb array and opacity */
    generateColor: function (rgb, opacity) {
        return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (Math.round(opacity * 100) / 100) + ')';
    },
    /** Generates a color array based on the data sections */
    generateColors: function () {
        var colors = [];
        var baseColor = this.colorsMap[this.baseColor];
        var opacityBase = 1;

        // if is wdiget (label distribution charts) we need 100% and 0% only
        // if not, then we have to make it look like gradient
        if (this.isWidget) {
            if (this.type === 'stacked-areagraph' || this.type === 'areagraph') {
                colors = [
                    '#e0e0e0',
                    this.generateColor(baseColor, 1)
                ];
            } else {
                colors = [
                    this.generateColor(baseColor, 1),
                    this.generateColor(this.colorsMap.lightestGrey, 1)
                ];
            }
        } else {
            var length = this.data.length;

            if (this.type === 'bargraph' && this.data && this.data[0].values) {
                length = this.data[0].values.length;
            } else if (this.type === 'bulletgraph' && this.data && this.data.measures) {
                length = this.data.measures.length;
            }

            if (this.options.hasAverage) {
                length = length - 1;
            }

            for (var i = 0; i < length; i++) {
                colors.push(this.generateColor(baseColor, opacityBase));
                opacityBase = opacityBase - 0.2;
            }
        }

        if (this.options.hasAverage) {
            colors.push('#F7F7F7');
        }

        return colors;
    },
    /** After render, we still need to attach the graph to the view we just made */
    afterRender: function () {
        this.chart = this.generateChart();
    },
    /** Generates the chart. This function needs to be rewritten on singular charts */
    generateChart: function () {
        throw new Error('Needs to be rewritten');
    },
    /** ticker formats */
    formatters: {
        '': 'defaultFormat',
        'date': 'dateFormat',
        'datetime': 'datetimeFormat',
        'thousand': 'thousandFormat',
        'percentage': 'percentageFormat',
        'abbreviate': 'abbreviateFormat',
        'flatPercentage': 'flatPercentageFormat'
    },
    /** Gets the formatter function based on the formatter */
    getFormatter: function (formatter) {
        if (typeof(formatter) === 'function') {
            return formatter;
        }
        return this[this.formatters[formatter]];
    },
    /** Default formatter, only returns the original value */
    defaultFormat: function (d) {
        return d;
    },
    /** Abbreviate Format, will format using MM, B and K */
    abbreviateFormat: function (d) {
        return Suit.Helpers.Formatters.abbreviateNumber(d);
    },
    /** Date formatter will format a timestamp into YYYY/MM/DD */
    datetimeFormat: function (d) {
        return moment.unix(d).utc().format('YYYY/MM/DD HH:mm');
    },
    /** Date formatter will format a timestamp into YYYY/MM/DD */
    dateFormat: function (d) {
        return moment.unix(d).utc().format('YYYY/MM/DD');
    },
    /** Thousand formatter will format numbers with thousand separator */
    thousandFormat: function (d) {
        return d3.format(',r')(d);
    },
    percentageFormat: function (d) {
        return parseFloat(d).toFixed(2) + '%';
    },
    flatPercentageFormat: function (d) {
        return parseInt(d) + '%';
    },
    /** Events that this view responds to */
    events: {},
    /** template */
    template: JST['suit/components/graph'],
    /** Graph type */
    type: 'base-graph',
    /** Charts Data */
    data : []
});

Suit.Components.LineGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.LineGraph.prototype */{
    /**
      * @class Suit.Components.LineGraph
      * @augments Suit.Components.Graph

      * @param options list of options for configuring the chart. These include:
      * minY - minimum value for Y Axis, accepted values are: Int || 'auto'
      * maxY - maximum value for Y Axis, accepted values are: Int || 'auto'
      */
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);

        this.useInteractiveGuideline = options.useInteractiveGuideline || true;
        this.showLegend              = options.showLegend || false;
        this.xAxisLabel              = options.xAxisLabel || 'Date';
        this.xAxisFormat             = options.xAxisFormat || 'date';
        this.yAxisLabel              = options.yAxisLabel || 'Impressions';
        this.yAxisFormat             = options.yAxisFormat || 'thousand';
        this.tooltips                = options.tooltips || false;
        this.minY                    = !_.isUndefined(options.minY) ? options.minY : 0;
        this.maxY                    = !_.isUndefined(options.maxY) ? options.maxY : 'auto';
        this.interactive             = !_.isUndefined(options.interactive) ? options.interactive : true;
    },
    /** Graph type */
    type: 'linegraph',

    /** Generates the chart. */
    generateChart: function () {
        var minMax = this._minMaxValues(this.data),
            chart = nv.models.lineChart()
                    .margin(this.margin)
                    .useInteractiveGuideline(this.useInteractiveGuideline)
                    .showLegend(this.showLegend)
                    .color(this.color)
                    .height(this.height)
                    .width(this.width)
                    .showYAxis(this.showYAxis)
                    .showXAxis(this.showXAxis)
                    .tooltips(this.tooltips);

        // X and Y axis information
        chart.xAxis
            // We need to use the actual values in the data in order to get currect data.
            .tickValues(function (data) {
                var xData = data[0].values;
                var size = xData.length;
                var values = [xData[0].x, xData[Math.floor(size / 2)].x, xData[size - 1].x];
                return values;
            })
            .axisLabel(this.xAxisLabel)
            .tickFormat(this.getFormatter(this.xAxisFormat));

        chart.yAxis
            .axisLabel(this.yAxisLabel)
            .tickFormat(this.getFormatter(this.yAxisFormat));


        // Set min/max values for Axis
        if (this.minY !== 'auto' && this.maxY !== 'auto') {
            chart.forceY([this.minY, this.maxY]);
        } else if (this.minY !== 'auto') {
            chart.forceY([this.minY, minMax.y.max]);
        } else if (this.maxY !== 'auto') {
            chart.forceY([minMax.y.min, this.maxY]);
        }

        // Sets the data
        var chartData = this.data;

        // Draw the chart
        var svg = d3.select(this.el)
            .append('svg')
            .datum(chartData)
            .call(chart);

        // If not interactive (no bullets), then we should remove all the
        // unneeded elements used for hover.
        if (this.interactive === false) {
            // Remove the circles (used for interactivity)
            svg.selectAll('circle').remove();
        }

        nv.addGraph(function () { return chart; });
        return chart;
    },

    _minMaxValues: function (values) {
        var allResults  = _.flatten(_.pluck(values, 'values')),
            allYVals    = _.pluck(allResults, 'y'),
            allXVals    = _.pluck(allResults, 'x');
        return {x:
            {
                min: Math.min.apply(null, allXVals),
                max: Math.max.apply(null, allXVals)
            },
            y: {
                min: Math.min.apply(null, allYVals),
                max: Math.max.apply(null, allYVals)
            }
        };
    }
});

Suit.Components.PieChart = Suit.Components.Graph.extend({
    /**
      * @class Suit.Components.DonutGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showLabels - Chart showlabels default is false
      * @param {String} options.labelType - label type default is 'percent'. Can be "key", "value" or "percent"
      * @param {Boolean} options.donut - donut or pie chart, default is false so default is pie chart
      * @param {Float} options.donutRatio - float tocConfigure how big you want the donut hole size to be
      * @param {Int} options.width - Width of the chart including labels.
      * @param {Int} options.height - Chart height including labels.
      * @param {Boolean} options.showLegend - show legend of chart default is false.
      * @param {Int} options.outerWidth - width of containing box of graph
      * @param {Int} options.outerHeight - height of containing box of graph
      *
      */
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
        this.showLabels = this.options.showLabels || false;
        this.labelType  = this.options.labelType || 'percent';
        this.donut      = this.options.donut || false;
        this.donutRatio = this.options.donutRatio || 0.4;
        this.showLegend = this.options.showLegend || false;
        this.tooltips   = this.options.tooltips || false;
    },
    type: 'piegraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this;
        var chart = nv.models.pieChart()
                    .x(function (d) { return d.label; })
                    .y(function (d) { return d.value; })
                    .margin(self.margin)
                    .showLabels(self.showLabels)
                    .labelThreshold(0.01)
                    .labelType(self.labelType)
                    .donut(self.donut)
                    .donutRatio(self.donutRatio)
                    .width(self.width)
                    .height(self.height)
                    .showLegend(self.showLegend)
                    .tooltips(self.tooltips);

        if (!_.isUndefined(self.color)) {
            chart.color(self.color);
        }

       // Sets the data
        var chartData = self.data;

        d3.select(self.el)
            .append('svg')
            .datum(chartData)
            .transition().duration(300)
            .call(chart);

        nv.addGraph(function () { return chart; });

        return chart;
    }
});

Suit.Components.BarGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.BarGraph.prototype */{
    /**
      * @class Suit.Components.BarGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showValues - Chart showValue. Defaults: false.
      * @param {Boolean} options.staggerLabels - Staggering labels for when not enough room. Default: false.
      * @param {Integer} options.transitionDuration - Transition duration. Default: 350.
      * @param {Boolean} options.tooltips - Show labels. Default false.
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);

        this.hasAverage         = this.options.hasAverage || false;
        this.staggerLabels      = this.options.staggerLabels || false;
        this.transitionDuration = this.options.transitionDuration || 350;
        this.showValues         = this.options.showValues || false;
        this.tooltips           = this.options.tooltips || false;
        this.xAxisFormat        = this.options.xAxisFormat || '';
        this.yAxisFormat        = this.options.yAxisFormat || 'abbreviate';
    },
    /** Graph type */
    type: 'bargraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this,
            chart;
        nv.addGraph(function () {
            chart = nv.models.discreteBarChart()
                    .x(function (d) { return d.label; })
                    .y(function (d) { return d.value; })
                    .showValues(self.showValues)
                    .width(self.width)
                    .height(self.height)
                    .staggerLabels(self.staggerLabels)
                    .transitionDuration(self.transitionDuration)
                    .tooltips(self.tooltips)
                    .showYAxis(self.showYAxis)
                    .showXAxis(self.showXAxis);

            if (!_.isUndefined(self.color)) {
                chart.color(self.color);
            }

            // X and Y axis information
            chart.xAxis
                .tickFormat(self.getFormatter(self.xAxisFormat));

            chart.yAxis
                .tickFormat(self.getFormatter(self.yAxisFormat));

            // Sets the data
            var chartData = self.data;
            var svg = d3.select(self.el)
                .append('svg')
                .datum(chartData)
                .call(chart);

            if (self.hasAverage) {
                var maxValue = _.max(self.data[0].values, function (value) {
                    return value.value;
                });
                var averageValue  = self.data[0].values[self.data[0].values.length - 1];
                var chartHeight   = chart.height() - chart.margin().bottom - chart.margin().top;
                var averageHeight = 0;
                var margintTop    = 0;

                // Bars/columns
                var cols = svg.selectAll('.nv-barsWrap .nv-series-0 g');


                if (averageValue && averageValue.value && maxValue && maxValue.value && cols.length > 0 && cols[0].length > 0) {
                    // Calculcate heights
                    averageHeight = (averageValue.value * chartHeight) / maxValue.value;
                    margintTop = chartHeight - averageHeight;

                    // Remove average column (created just for the space)
                    self.$el.find('.nv-barsWrap .nv-series-0 g').last().remove();
                    // Append new element
                    var rect = svg.select('.nv-barsWrap .nv-series-0')
                        .insert('g', ':first-child');

                    rect.append('rect')
                        .attr('width', '100%')
                        .attr('height', averageHeight)
                        .attr('x', 1)
                        .attr('y', margintTop)
                        .attr('fill', '#F7F7F7');

                    rect.append('text')
                        .text('AVG')
                        .attr('x', 200)
                        .attr('y', 230)
                        .attr('fill', '#313233');
                }
            }

            return chart;
        });
        return chart;
    }
});

Suit.Components.BulletGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.LineGraph.prototype */{
    /**
      * @class Suit.Components.BarGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showValues - Chart showValue. Defaults: false.
      * @param {Boolean} options.staggerLabels - Staggering labels for when not enough room. Default: false.
      * @param {Integer} options.transitionDuration - Transition duration. Default: 350.
      * @param {Boolean} options.tooltips - Show labels. Default false.
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
    },
    /** Graph type */
    type: 'bulletgraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this;
        var chart = nv.models.bulletChart()
                    .color(self.color)
                    .margin({right: 15})
                    .tooltipContent(function (key, x, y) {
                        return '<p>' + y + '%</p>';
                    })
                    .width(self.width)
                    .height(self.height);

        chart.tickFormat(self.getFormatter('flatPercentage'));

        // Sets the data
        var chartData = self.data;

        // Draw chart
        d3.select(self.el)
            .append('svg')
            .datum(chartData)
            .transition()
            .attr('width', self.width)
            .attr('height', self.height)
            .call(chart);
        nv.addGraph(function () { return chart; });
        return chart;
    }
});

Suit.Components.StackedAreaGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.StackedAreaGraph.prototype */{
    /**
      * @class Suit.Components.StackedAreaGraph
      * @augments Suit.Components.Graph
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Boolean} options.showValues - Chart showValue. Defaults: false.
      * @param {Boolean} options.staggerLabels - Staggering labels for when not enough room. Default: false.
      * @param {Integer} options.transitionDuration - Transition duration. Default: 350.
      * @param {Boolean} options.tooltips - Show labels. Default false.
      * @param {Decimal} options.baseLine - The baseline (in percentage), that shows a black thin line as reference
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
        this.useInteractiveGuideline = this.options.useInteractiveGuideline || false;
        this.xAxisLabel              = this.options.xAxisLabel || '';
        this.xAxisFormat             = this.options.xAxisFormat || 'default';
        this.yAxisLabel              = this.options.yAxisLabel || '';
        this.yAxisFormat             = this.options.yAxisFormat || 'default';
        this.tooltips                = this.options.tooltips || false;
        this.baseLine                = this.options.baseLine || false;
        this.width                   = this.options.width;
        this.height                  = this.options.height;
        this.margin                  = this.options.margin || {left: 10, right: 15, top: 0, bottom: 0};
        this.tooltipContent          = this.options.tooltipContent;
        this.rightAlignYAxis         = this.options.rightAlignYAxis || false;
    },
    /** Graph type */
    type: 'stacked-areagraph',
    /** Generates the chart. */

    generateChart: function () {
        var self = this;
        var chart = nv.models.stackedAreaChart()
                      .x(function (d) { return d[0]; })
                      .y(function (d) { return d[1]; })
                      .width(self.width)
                      .height(self.height)
                      .margin(this.margin)
                      .useInteractiveGuideline(self.useInteractiveGuideline)
                      .rightAlignYAxis(this.rightAlignYAxis)
                      .transitionDuration(500)
                      .interactive(true)
                      .showLegend(false)
                      .showControls(false)
                      .showYAxis(self.showYAxis)
                      .showXAxis(self.showXAxis)
                      .noData(self.noData)
                      .tooltips(self.tooltips);


        if (!_.isUndefined(self.tooltipContent)) {
            chart.tooltipContent(self.tooltipContent);
        }

        if (!_.isUndefined(self.color)) {
            chart.color(self.color);
        }


        chart.xAxis
            // We need to use the actual values in the data in order to get currect data.
            .tickValues(function (data) {
                var xData = data[0].values;
                var size = xData.length;
                // We need to figure out how to define the number of ticks.
                //var values = [xData[0].x, xData[Math.floor(size / 2)].x, xData[size - 1].x];
                var values = [xData[0][0], xData[Math.floor(size / 3)][0], xData[Math.floor(2 * size / 3)][0], xData[size - 1][0]];
                return values;
            })
            .tickFormat(self.getFormatter(self.xAxisFormat));

        chart.yAxis
            .tickFormat(self.getFormatter(self.yAxisFormat));

        // Sets the data
        var chartData = self.data;

        // Draw chart
        d3.select(self.el)
            .append('svg')
            .datum(chartData)
            .transition()
            .call(chart);

        var rect = d3.select('.nv-series-0')
            .insert('g', ':first-child');

        if (self.baseLine) {
            var x = (chart.width() - chart.margin().left - chart.margin().right) * self.baseLine;

            rect.append('rect')
                .attr('width', '1')
                .attr('height', 100)
                .attr('x', x)
                .attr('y', 0)
                .attr('stroke', '#313233');
        }
        nv.addGraph(function () { return chart; });

        return chart;
    }
});

Suit.Components.AreaGraph = Suit.Components.Graph.extend(/** @lends Suit.Components.AreaGraph.prototype */{
    /**
      * @class Suit.Components.AreaGraph
      * @augments Suit.Components.Graph
      *
      * The AreaGraph is the Graph component that generates multiple areas based
      * on a data series. It is built with regular D3 components, but the data expected
      * is the same as for an NVD3.StackedArea Chart.
      *
      * @param {Object} options - Options that are going to be used for the chart
      * @param {Decimal} options.baseLine - The baseline (in percentage), that shows a black thin line as reference
      **/
    initialize: function (options) {
        Suit.Components.Graph.prototype.initialize.apply(this, [options]);
        this.baseLine = this.options.baseLine || false;
    },
    /** Graph type */
    type: 'areagraph',
    /** Generates the chart. */
    generateChart: function () {
        var self = this;

        // Chart sizes
        var margin = {left: 10, right: 15, top: 0, bottom: 0};
        var width  = self.width - margin.left - margin.right;
        var height = self.height - margin.top - margin.bottom;

        // Data for the Chart
        var chartData = self.data;

        // X-Axis Scale, based on the x-min and x-max
        var xScale = d3.scale.linear()
            .domain([
                d3.min(chartData, function (d) {
                    return d3.min(d.values, function (v) { return v[0]; });
                }),
                d3.max(chartData, function (d) {
                    return d3.max(d.values, function (v) { return v[0]; });
                })
            ])
            .range([0, width]);

        // Y-Axis Scale, based on the y-min and y-max
        var yScale = d3.scale.linear()
            .domain([
                d3.min(chartData, function (d) {
                    return d3.min(d.values, function (v) { return v[1]; });
                }),
                d3.max(chartData, function (d) {
                    return d3.max(d.values, function (v) { return v[1]; });
                })
            ])
            .range([height, margin.top]);

        // SVG and SVG Areas for all areas. Areas are generated based on the
        // data series received. If 3 series are sent, then 3 areas are created.
        var svg = d3.select(self.el).append('svg');
        var area = d3.svg.area()
                        .x(function (d) {
                            return xScale(d[0]) + margin.left;
                        })
                        .y0(height)
                        .y1(function (d) {
                            return yScale(d[1]);
                        });

        // Filling the areas with the expected colors, which are generated
        // based on the multiple areas
        _.each(chartData, function (d, i) {
            svg.append('path')
            .datum(d.values)
            .attr('class', 'area')
            .attr('d', area)
            .style('fill', function () {
                return self.color[i];
            })
            .style('opacity', 1);
        });

        // Adding the baseline component, which creates a black thin line for the
        // expected current status.
        if (self.baseLine) {
            var rect = d3.select('svg')
                .insert('g');

            var x = (width * self.baseLine) + 10;

            rect.append('rect')
                .attr('width', '1')
                .attr('height', 100)
                .attr('x', x)
                .attr('y', 0)
                .attr('stroke', '#313233');
        }
    }
});
