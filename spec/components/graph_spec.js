'use strict';

describe('Suit Graph Component', function () {
    beforeEach(function () {
    });

    afterEach(function () {
    });

    describe('Base Graph Component', function () {
        it('should be initialized with all necessary arguments if none were passed', function () {
            var linearGraph = new Suit.Components.Graph({});

            expect(linearGraph.type).toBe('base-graph');
            expect(linearGraph.width).toBe(100);
            expect(linearGraph.height).toBe(100);
            expect(linearGraph.baseColor).toBe('blue');
            expect(linearGraph.showXAxis).toBe(true);
            expect(linearGraph.showYAxis).toBe(true);
        });

        it('should be initialized with all necessary arguments if passed', function () {
            var linearGraph = new Suit.Components.Graph({
                margin: {top: 0},
                data: ['a'],
                width: 505,
                height: 180,
                baseColor: 'purple',
                showXAxis: false,
                showYAxis: false
            });

            expect(linearGraph.margin.top).toBe(0);
            expect(linearGraph.data[0]).toBe('a');
            expect(linearGraph.width).toBe(505);
            expect(linearGraph.height).toBe(180);
            expect(linearGraph.baseColor).toBe('purple');
            expect(linearGraph.color[0]).toBe('rgba(104,91,139,1)');
            expect(linearGraph.showXAxis).toBe(false);
            expect(linearGraph.showYAxis).toBe(false);
            expect(linearGraph.isWidget).toBe(false);
        });

        it('should return the correct formatter based on the sent formatter', function () {
            var linearGraph = new Suit.Components.Graph({
                margin: {top: 0},
                data: ['a'],
                width: 505,
                height: 180,
                baseColor: 'purple',
                showXAxis: false,
                showYAxis: false
            });
            expect(linearGraph.getFormatter('')('a')).toBe('a');
        });

        it('should format the datetime', function () {
            var linearGraph = new Suit.Components.Graph({
                margin: {top: 0},
                data: [],
                width: 100,
                height: 100,
                baseColor: 'purple',
                showXAxis: false,
                showYAxis: false,
                xAxisFormat: 'datetime'
            });
            expect(linearGraph.getFormatter('datetime')('1398697632')).toBe('2014/04/28 15:07');
        });

        it('should format the date', function () {
            var linearGraph = new Suit.Components.Graph({
                margin: {top: 0},
                data: [],
                width: 100,
                height: 100,
                baseColor: 'purple',
                showXAxis: false,
                showYAxis: false,
                xAxisFormat: 'date'
            });
            expect(linearGraph.getFormatter('date')('1398697632')).toBe('2014/04/28');
        });

        it('should work with thousand separator', function () {
            var linearGraph = new Suit.Components.Graph({
                margin: {top: 0},
                data: [],
                width: 100,
                height: 100,
                baseColor: 'purple',
                showXAxis: false,
                showYAxis: false
            });
            expect(linearGraph.getFormatter('thousand')('398697632')).toBe('398,697,632');
        });

        it('should generate colors based on data', function () {
            var linearGraph = new Suit.Components.Graph({
                margin: {top: 0},
                data: ['a', 'b', 'c', 'd', 'e'],
                baseColor: 'purple'
            });

            expect(linearGraph.color[0]).toBe('rgba(104,91,139,1)');
            expect(linearGraph.color[1]).toBe('rgba(104,91,139,0.8)');
            expect(linearGraph.color[2]).toBe('rgba(104,91,139,0.6)');
            expect(linearGraph.color[3]).toBe('rgba(104,91,139,0.4)');
            expect(linearGraph.color[4]).toBe('rgba(104,91,139,0.2)');
        });
    });

    describe('LineGraph Component', function () {
        it('should initialize all paramenters if none were passed', function () {
            var lineGraph = new Suit.Components.LineGraph({
                data: [{key: 'Series 1', values: [{x: 0, y: 0}, {x: 0, y: 0}, {x: 1, y: 5}, {x: 2, y: 10},]}]
            });

            expect(lineGraph.useInteractiveGuideline).toBe(true);
            expect(lineGraph.showLegend).toBe(false);
            expect(lineGraph.xAxisLabel).toBe('Date');
            expect(lineGraph.xAxisFormat).toBe('date');
            expect(lineGraph.yAxisLabel).toBe('Impressions');
            expect(lineGraph.yAxisFormat).toBe('thousand');
            expect(lineGraph.tooltips).toBe(false);
            expect(lineGraph.minY).toBe(0);
            expect(lineGraph.maxY).toBe('auto');
            expect(lineGraph.interactive).toBe(true);
            lineGraph.remove();
        });
        it('should respect minY INT values', function () {
            var lineGraph = new Suit.Components.LineGraph({
                minY: -10,
                data: [{key: 'Series 1', values: [{x: 0, y: 0}, {x: 0, y: 0}, {x: 1, y: 5}, {x: 2, y: 10},]}]
            });
            lineGraph.render();
            expect(lineGraph.chart.yAxis.scale().domain()[0]).toBe(-10);
            lineGraph.remove();
        });

        it('should respect maxY INT values', function () {
            var lineGraph = new Suit.Components.LineGraph({
                maxY: 1000,
                data: [{key: 'Series 1', values: [{x: 0, y: 0}, {x: 0, y: 0}, {x: 1, y: 5}, {x: 2, y: 10},]}]
            });
            lineGraph.render();
            expect(lineGraph.chart.yAxis.scale().domain()[1]).toBe(1000);
            lineGraph.remove();
        });

        it('should respect minY "auto" value', function () {
            var lineGraph = new Suit.Components.LineGraph({
                minY: 'auto',
                data: [{key: 'Series 1', values: [{x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 5}, {x: 2, y: 10},]}]
            });
            lineGraph.render();
            expect(lineGraph.chart.yAxis.scale().domain()[0]).toBe(1);
            lineGraph.remove();
        });

        it('should respect maxY "auto" value', function () {
            var lineGraph = new Suit.Components.LineGraph({
                maxY: 'auto',
                data: [{key: 'Series 1', values: [{x: 0, y: 0}, {x: 0, y: 0}, {x: 1, y: 5}, {x: 2, y: 10},]}]
            });
            lineGraph.render();
            expect(lineGraph.chart.yAxis.scale().domain()[1]).toBe(10);
            lineGraph.remove();
        });

    });

    describe('Pie and Donut Graph Component', function () {
        it('should initialize all paramenters if none were passed', function () {
            var donutGraph = new Suit.Components.PieChart({
                data: [{'label': 'One', 'value': 29.765957771107}, {'label': 'Two', 'value': 10}, {'label': 'Three', 'value': 32.807804682612}, {'label': 'Four', 'value': 20.45946739256}, {'label': 'Five', 'value': 15.19434030906893}],
            });

            expect(donutGraph.showLabels).toBe(false);
            expect(donutGraph.labelType).toBe('percent');
            expect(donutGraph.donut).toBe(false);
            expect(donutGraph.donutRatio).toBe(0.4);
            expect(donutGraph.showLegend).toBe(false);
            expect(donutGraph.tooltips).toBe(false);
        });

        it('should test passed in paramenters of the pie chart', function () {
            var donutGraph = new Suit.Components.PieChart({
                data: [{'label': 'One', 'value': 29}, {'label': 'Two', 'value': 10}, {'label': 'Three', 'value': 32}, {'label': 'Four', 'value': 20}, {'label': 'Five', 'value': 15}],
                width: 500,
                height: 300,
                outerWidth: 500,
                outerHeight: 300,
                donut: true,
                showLegend: true,
                showLabels: true,
                tooltips: true
            });

            expect(donutGraph.showLabels).toBe(true);
            expect(donutGraph.width).toBe(500);
            expect(donutGraph.height).toBe(300);
            expect(donutGraph.donut).toBe(true);
            expect(donutGraph.showLegend).toBe(true);
            expect(donutGraph.tooltips).toBe(true);
            expect(donutGraph.donutRatio).toBe(0.4);
            expect(JSON.stringify(donutGraph.data)).toBe(JSON.stringify([{'label': 'One', 'value': 29}, {'label': 'Two', 'value': 10}, {'label': 'Three', 'value': 32}, {'label': 'Four', 'value': 20}, {'label': 'Five', 'value': 15}]));
        });
    });
});
