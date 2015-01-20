'use strict';

Suit.Components = Suit.Components || {};

Suit.Components.Chart = Suit.Component.extend(/** @lends Suit.Components.Table.prototype */{
    /**
      * @class Suit.Components.Table
      * @classdesc Suit Component Framework Table Component.
      *
      * This component is meant to be used along with tabular data. The data will
      * be handled from the source (which is passed as a keypath to the
      * component element's data-table-source attribute).
      *
      * The Table Component will provide with sorting functionalities (linked to
      * source's default sorting functionality). If the user trigger a source
      * sort change, the Table Component will interact with the changes.
      *
      * @augments Suit.Component
      * @constructs Suit.Components.Table
      */

    formatters: {
        '': 'defaultFormat',
        'date': 'dateFormat',
        'datetime': 'datetimeFormat',
        'thousand': 'thousandFormat',
        'percentage': 'percentageFormat',
        'abbreviate': 'abbreviateFormat',
        'flatPercentage': 'flatPercentageFormat'
    },

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

    initialize: function (options) {
        Suit.Component.prototype.initialize.apply(this, [options]);
        this.baseColor               = this.options.baseColor || 'blue';
        this.theme                   = this.options.theme || 'dark';
        this.chartType               = this.options.chartType || 'line';
        this.margin                  = {left: this.options.marginLeft || 50,
                                        right: this.options.marginRight || 0,
                                        top: this.options.marginTop || 40,
                                        bottom: this.options.marginBottom || 40};
        this.hasAverage              = this.options.hasAverage || false;
        this.staggerLabels           = this.options.staggerLabels || false;
        this.transitionDuration      = this.options.transitionDuration || 350;
        this.showValues              = this.options.showValues || false;
        this.tooltips                = this.options.tooltips || false;
        this.xAxisFormat             = this.options.xAxisFormat || '';
        this.yAxisFormat             = this.options.yAxisFormat || 'abbreviate';
        this.xAxisLabel              = this.options.xAxisLabel || 'Date';
        this.yAxisLabel              = this.options.yAxisLabel || 'Impressions';
        this.showXAxis               = this.options.showXAxis || false;
        this.showYAxis               = this.options.showYAxis || false;
        this.showLabels              = this.options.showLabels || false;
        this.labelType               = this.options.labelType || 'percent';
        this.donut                   = this.options.donut || false;
        this.donutRatio              = this.options.donutRatio || 0.4;
        this.useInteractiveGuideline = this.options.useInteractiveGuideline || true;
        this.showLegend              = this.options.showLegend || false;
        this.showControls            = this.options.showControls || false;
        this.minY                    = this.options.minY || 0;
        this.maxY                    = this.options.maxY || 'auto';
        this.interactive             = this.options.interactive || true;
        this.rightAlignYAxis         = this.options.rightAlignYAxis || false;
        this.xAttr                   = this.options.xAttr || 'timestamp';
        this.source                  = this.options.source || [];
        this.data                    = [];
        if (this.source instanceof Suit.Collection) {
            this.listenTo(this.source, 'reset', this.renderChart);
            this.listenTo(this.source, 'add', this.updateChart);
        }
    },

    beforeClose: function () {
        if (this.legend) {
            this.legend.off('click');
        }
    },

    afterRender: function () {
        this.$container = this.$el.find('[data-chart]');
        if (!this.$container || this.$container.length < 1) {
            this.$container = $('<div class="chart-container"></div>');
            this.$el.append(this.$container);
        }
        this.$container.addClass('chart-theme-' + this.theme);
        this.renderChart();
        this.activateLegend();

    },

    activateLegend: function () {
        this.legend = $('body [data-legend-for="' + this.$el.attr('id') + '"]');
        this.legend.on('click', '[data-toggle-series]', _.bind(this.toggleChartSeries, this));
        this.legend.on('click', '[data-switch-series]', _.bind(this.switchChartSeries, this));
    },

    switchChartSeries: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(e.target),
            state = this.chart.state(),
            index = this.findSeriesIndexByKey(target.data('switchSeries'));
        state.disabled = _.map(state.disabled, function (value, key) {
            if (key === index) {
                return false;
            }
            return true;
        });
        this.chart.dispatch.changeState(state);
        this.chart.update();

    },

    findSeriesIndexByKey: function (key) {
        var result;
        _.each(this.data, function (series, index) {
            if (series.key === key) {
                result = index;
            }
        });
        return result;
    },

    toggleChartSeries: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var target = $(e.target),
            state = this.chart.state(),
            index = this.findSeriesIndexByKey(target.data('toggleSeries')),
            stateCount;
        target.toggleClass('disabled');
        state.disabled[index] = target.hasClass('disabled');
        stateCount = _.countBy(state.disabled, function (bool) { return bool ? 'true': 'false'; });

        if (!stateCount.false) {
            this.legend.find('[data-toggle-series]').removeClass('disabled');
            state.disabled = _.map(state.disabled, function () { return false; });
        }
        this.chart.dispatch.changeState(state);
        this.chart.update();
    },

    chartData: function (source) {
        var results,
            self = this;



        if (this.chartType === 'pie') {
            results = [];
            if (source instanceof Suit.Model) {
                for (var sourceKey in source.attributes) {
                    results.push({label: sourceKey, value: source.get(sourceKey)});
                }
            } else if (source.constructor === Object) {
                for (var sobjKey in source) {
                    results.push({label: sobjKey, value: source[sobjKey]});
                }
            }
            return results;
        }

        results = {};

        if (source instanceof Suit.Collection) {
            source = source.models;
        }
        var momentObject = moment().constructor;
        _.each(source, function (item) {
            if (item instanceof Suit.Model) {
                for (var key in item.attributes) {
                    if (key !== self.xAttr) {
                        results[key] = results[key] || [];
                        results[key].push({x: (item.get(self.xAttr) instanceof momentObject) ? item.get(self.xAttr).toDate().getTime() / 1000 : item.get(self.xAttr), y: item.get(key)});
                    }
                }
            } else if (item.constructor === Object) {
                for (var objKey in item) {
                    if (objKey !== self.xAttr) {
                        results[objKey] = results[objKey] || [];
                        results[objKey].push({x: (item[self.xAttr] instanceof momentObject) ? item[self.xAttr].toDate().getTime() / 1000 : item[self.xAttr], y: item[objKey]});
                    }
                }
            }
        });
        var finalResults = [];
        for (var rkey in results) {
            finalResults.push({ values: results[rkey], key: rkey});
        }
        return finalResults;

    },

    updateChart: function () {
        this.svg.datum(this.chartData(this.source));
        this.svg.call(this.chart);
    },

    renderChart: function () {
        this.data = this.chartData(this.source);
        this.color = this.color || this.generateColors();
        var chart,
            minMax;
        if (this.chartType === 'line') {
            minMax = this._minMaxValues(this.data);
            chart = nv.models.lineChart();
            chart.useInteractiveGuideline(this.useInteractiveGuideline)
            .rightAlignYAxis(this.rightAlignYAxis)
            .showYAxis(this.showYAxis)
            .showXAxis(this.showXAxis)
            .showLegend(this.showLegend);
            chart.xAxis.tickValues(_.bind(this.xTicks, this));
        } else if (this.chartType === 'stackedarea') {
            minMax = this._minMaxValues(this.data);
            chart = nv.models.stackedAreaChart();
            chart.useInteractiveGuideline(this.useInteractiveGuideline)
                .rightAlignYAxis(this.rightAlignYAxis)
                .showYAxis(this.showYAxis)
                .showXAxis(this.showXAxis)
                .showLegend(this.showLegend)
                .showControls(this.showControls)
                .rightAlignYAxis(this.rightAlignYAxis);
            chart.xAxis.tickValues(_.bind(this.xTicks, this));
        } else if (this.chartType === 'bar') {
            minMax = this._minMaxValues(this.data);
            chart = nv.models.discreteBarChart();
            chart.rightAlignYAxis(this.rightAlignYAxis)
                .showYAxis(this.showYAxis)
                .showXAxis(this.showXAxis);
        } else if (this.chartType === 'pie') {
            chart = nv.models.pieChart()
                    .x(function (d) { return d.label; })
                    .y(function (d) { return d.value; })
                    .showLabels(this.showLabels)
                    .labelThreshold(0.01)
                    .labelType(this.labelType)
                    .donut(this.donut)
                    .donutRatio(this.donutRatio)
                    .showLegend(this.showLegend);
        }
        chart.margin(this.margin)
            .color(this.color)
            .height(this.$el.height())
            .width(this.$el.width())
            .tooltips(this.tooltips);

        if (this.chartType !== 'pie') {
            // X and Y axis information
            chart.xAxis
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
        }

        // // Sets the data
        // var chartData = this.data;

        // Draw the chart
        this.$container.height(this.$el.height()).empty();
        var svg = d3.select(this.$container[0])
            .append('svg')
            .datum(this.data)
            .call(chart);

        // If not interactive (no bullets), then we should remove all the
        // unneeded elements used for hover.
        if (this.interactive === false) {
            // Remove the circles (used for interactivity)
            svg.selectAll('circle').remove();
        }

        // nv.addGraph(function () { return chart; });
        // return chart;
        this.svg = svg;
        this.chart = chart;
        var m = svg.selectAll('.nv-x .nv-axisMaxMin')[0];
        $(m[0]).css({transform: 'translate(45px, 0)'});
        $(m[1]).css({transform: 'translate(' + (this.$el.width() - (this.margin.left + 50)) + 'px, 0)'});
        return this.chart;
    },

    xTicks: function (data) {
        var w = this.$el.width(),
            xData = data[0].values,
            span = $('<span style="visibility: hidden;">' + this.getFormatter(this.xAxisFormat)(xData[0].x) + '</span>'),
            num,
            values;
        $('body').append(span);
        num = Math.floor(w / (span.width() + 20)) - 2;
        span.remove();
        if (num >= xData.length) {
            values = _.map(xData, function (item) {
                return item.x;
            });
        } else {
            var inc = Math.floor(xData.length / num);
            values = [xData[0].x];
            for (var i = inc; i < xData.length - 3; i += inc) {
                values.push(xData[i].x);
            }
            values.push(xData[xData.length - 1].x);
        }
        return values;
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
    },
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
            var length = this.data.length || 4;

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
    }

});

Suit.Components.registerComponent('Chart');
