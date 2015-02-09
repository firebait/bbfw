'use strict';

describe('Suit Chart Component', function () {

    var collection, view, spy, el, html, chartComponent, model, testDiv;

    beforeEach(function () {

        testDiv = $('<div id="container-' + jasmine.getEnv().currentSpec.id + '"></div>');
        $('body').append(testDiv);
        html = '<div><div id="testChart" style="width: 900px; height: 900px;" suit-component-chart data-source="collection" data-chart-type="line" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
        el = $(html)[0];


        collection = new Suit.Collection([
            {timestamp: moment().add(0, 'days'), vcr: 100, ctr: 150, impressions: 1500},
            {timestamp: moment().add(1, 'days'), vcr: 200, ctr: 300, impressions: 2500},
            {timestamp: moment().add(2, 'days'), vcr: 300, ctr: 350, impressions: 4500},
            {timestamp: moment().add(3, 'days'), vcr: 300, ctr: 350, impressions: 4500},
            {timestamp: moment().add(4, 'days'), vcr: 300, ctr: 350, impressions: 4500},
            {timestamp: moment().add(5, 'days'), vcr: 300, ctr: 350, impressions: 4500},
            {timestamp: moment().add(6, 'days'), vcr: 300, ctr: 350, impressions: 4500}
        ]);

        model = new Suit.Model({timestamp: moment().add(0, 'hours'), vcr: 100, ctr: 150, impressions: 1500});

        view = new Suit.View({el: el, collection: collection});
        view.render();
        chartComponent = view.components.testChart;

    });

    afterEach(function () {
        testDiv.remove();
        view.close();
    });


    describe('rendering as component', function () {
        it('should initialize the chart component', function () {
            spy = sinon.spy(Suit.Components.Chart.prototype, 'initialize');
            view = new Suit.View({el: $(html)[0], collection: collection});
            view.render();
            expect(spy.calledOnce).toEqual(true);
            spy.restore();
        });
    });

    describe('line chart', function () {
        beforeEach(function () {
            html = '<div><div data-legend-for="testChart"><div data-toggle-series="vcr">vcr</div><div data-toggle-series="t">t</div><div data-toggle-series="ctr">ctr</div></div>';
            html += '<div id="testChart" data-min-y="100" data-interactive="false" data-max-y="5000" suit-component-chart data-source="collection" data-chart-type="line" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            view = new Suit.View({el: $(html)[0], collection: collection});
            view.render();
            collection.trigger('add');
        });

        it('should massage source data to conform to nvd3\'s requirements', function () {
            var t = [moment().add(0, 'days'), moment().add(1, 'days'), moment().add(2, 'days'), moment().add(3, 'days')];
            collection = new Suit.Collection([
                {timestamp: t[0], ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: t[1], ctr: 2500, vcr: 2500, t: 2500}
            ]);
            var expectedOutput = [ { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'ctr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'vcr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 't' } ];
            expect(chartComponent.chartData(collection)).toEqual(expectedOutput);

            collection = [
                {timestamp: t[0], ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: t[1], ctr: 2500, vcr: 2500, t: 2500}
            ];
            expectedOutput = [ { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'ctr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'vcr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 't' } ];
            expect(chartComponent.chartData(collection)).toEqual(expectedOutput);
        });

        it('should respond to toggle interactions', function () {
            html = '<div><div data-legend-for="testChart"><div data-toggle-series="vcr">vcr</div><div data-toggle-series="t">t</div><div data-toggle-series="ctr">ctr</div></div>';
            html += '<div id="testChart" data-min-y="auto" data-max-y="5000" suit-component-chart data-source="collection" data-chart-type="line" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            collection = new Suit.Collection([
                {timestamp: moment().add(0, 'days'), ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: moment().add(1, 'days'), ctr: 2500, vcr: 2500, t: 2500},
                {timestamp: moment().add(2, 'days'), ctr: 4500, vcr: 4500, t: 4500},
                {timestamp: moment().add(3, 'days'), ctr: 5000, vcr: 5000, t: 5000}
            ]);

            view = new Suit.View({el: el, collection: collection});
            testDiv.append(view.el);
            view.render();
            chartComponent = view.components.testChart;
            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);

            $('[data-toggle-series="vcr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, true, false]);

            $('[data-toggle-series="ctr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, true, false]);

            $('[data-toggle-series="t"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);



        });


        it('should respond to switch interactions', function () {
            html = '<div><div data-legend-for="testChart"><div data-switch-series="vcr">vcr</div><div data-switch-series="t">t</div><div data-switch-series="ctr">ctr</div></div>';
            html += '<div id="testChart" suit-component-chart data-source="collection" data-chart-type="line" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            collection = new Suit.Collection([
                {timestamp: moment().add(0, 'days'), ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: moment().add(1, 'days'), ctr: 2500, vcr: 2500, t: 2500},
                {timestamp: moment().add(2, 'days'), ctr: 4500, vcr: 4500, t: 4500},
                {timestamp: moment().add(3, 'days'), ctr: 5000, vcr: 5000, t: 5000}
            ]);

            view = new Suit.View({el: el, collection: collection});
            testDiv.append(view.el);
            view.render();
            chartComponent = view.components.testChart;
            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);

            $('[data-switch-series="vcr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, false, true]);

            $('[data-switch-series="ctr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, true, true]);

            $('[data-switch-series="t"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, true, false]);



        });


    });

    describe('stackedarea chart', function () {
        beforeEach(function () {
            html = '<div><div data-legend-for="testChart"><div data-toggle-series="vcr">vcr</div><div data-toggle-series="t">t</div><div data-toggle-series="ctr">ctr</div></div>';
            html += '<div id="testChart" suit-component-chart data-source="collection" data-chart-type="stackedarea" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
        });

        it('should massage source data to conform to nvd3\'s requirements', function () {
            var t = [moment().add(0, 'days'), moment().add(1, 'days'), moment().add(2, 'days'), moment().add(3, 'days')];
            collection = new Suit.Collection([
                {timestamp: t[0], ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: t[1], ctr: 2500, vcr: 2500, t: 2500}
            ]);
            var expectedOutput = [ { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'ctr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'vcr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 't' } ];
            expect(chartComponent.chartData(collection)).toEqual(expectedOutput);

            collection = [
                {timestamp: t[0], ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: t[1], ctr: 2500, vcr: 2500, t: 2500}
            ];
            expectedOutput = [ { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'ctr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'vcr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 't' } ];
            expect(chartComponent.chartData(collection)).toEqual(expectedOutput);
        });

        it('should respond to toggle interactions', function () {
            html = '<div><div data-legend-for="testChart"><div data-toggle-series="vcr">vcr</div><div data-toggle-series="t">t</div><div data-toggle-series="ctr">ctr</div></div>';
            html += '<div id="testChart" suit-component-chart data-source="collection" data-chart-type="stackedarea" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            collection = new Suit.Collection([
                {timestamp: moment().add(0, 'days'), ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: moment().add(1, 'days'), ctr: 2500, vcr: 2500, t: 2500},
                {timestamp: moment().add(2, 'days'), ctr: 4500, vcr: 4500, t: 4500},
                {timestamp: moment().add(3, 'days'), ctr: 5000, vcr: 5000, t: 5000}
            ]);

            view = new Suit.View({el: el, collection: collection});
            testDiv.append(view.el);
            view.render();
            chartComponent = view.components.testChart;
            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);

            $('[data-toggle-series="vcr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, true, false]);

            $('[data-toggle-series="ctr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, true, false]);

            $('[data-toggle-series="t"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);
        });

        it('should hide the controls when the parameter showControls is true', function () {
            html = '<div id="testChart" suit-component-chart data-source="collection" data-show-controls="false" data-chart-type="stackedarea" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            collection = new Suit.Collection([
                {timestamp: moment().add(0, 'days'), ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: moment().add(1, 'days'), ctr: 2500, vcr: 2500, t: 2500},
                {timestamp: moment().add(2, 'days'), ctr: 4500, vcr: 4500, t: 4500},
                {timestamp: moment().add(3, 'days'), ctr: 5000, vcr: 5000, t: 5000}
            ]);

            view = new Suit.View({el: el, collection: collection});
            testDiv.append(view.el);
            view.render();
            el = view.$el;
            expect(el.find('.nv-legend').length).toBe(0);
        });


        it('should show the controls when the parameter showControls is true', function () {
            html = '<div id="testChart" suit-component-chart data-source="collection" data-show-controls="true" data-chart-type="stackedarea" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            collection = new Suit.Collection([
                {timestamp: moment().add(0, 'days'), ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: moment().add(1, 'days'), ctr: 2500, vcr: 2500, t: 2500},
                {timestamp: moment().add(2, 'days'), ctr: 4500, vcr: 4500, t: 4500},
                {timestamp: moment().add(3, 'days'), ctr: 5000, vcr: 5000, t: 5000}
            ]);

            view = new Suit.View({el: el, collection: collection});
            testDiv.append(view.el);
            view.render();
            el = view.$el;
            expect(el.find('.nv-legend').length).toBe(1);
        });

        it('should respond to switch interactions', function () {
            html = '<div><div data-legend-for="testChart"><div data-switch-series="vcr">vcr</div><div data-switch-series="t">t</div><div data-switch-series="ctr">ctr</div></div>';
            html += '<div id="testChart" suit-component-chart data-source="collection" data-chart-type="stackedarea" data-source="collection" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            collection = new Suit.Collection([
                {timestamp: moment().add(0, 'days'), ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: moment().add(1, 'days'), ctr: 2500, vcr: 2500, t: 2500},
                {timestamp: moment().add(2, 'days'), ctr: 4500, vcr: 4500, t: 4500},
                {timestamp: moment().add(3, 'days'), ctr: 5000, vcr: 5000, t: 5000}
            ]);

            view = new Suit.View({el: el, collection: collection});
            testDiv.append(view.el);
            view.render();
            chartComponent = view.components.testChart;
            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);

            $('[data-switch-series="vcr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, false, true]);

            $('[data-switch-series="ctr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, true, true]);

            $('[data-switch-series="t"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, true, false]);



        });


    });

    describe('bar chart', function () {
        beforeEach(function () {
            html = '<div><div id="testChart" suit-component-chart data-source="collection" data-chart-type="bar" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            collection = new Suit.Collection([
                {timestamp: moment().add(0, 'days'), ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: moment().add(1, 'days'), ctr: 2500, vcr: 2500, t: 2500}
            ]);
            view = new Suit.View({el: el, collection: collection});
            view.render();
            chartComponent = view.components.testChart;
        });


        it('should massage source data to conform to nvd3\'s requirements', function () {
            var t = [moment().add(0, 'days'), moment().add(1, 'days'), moment().add(2, 'days'), moment().add(3, 'days')];
            collection = new Suit.Collection([
                {timestamp: t[0], ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: t[1], ctr: 2500, vcr: 2500, t: 2500}
            ]);
            var expectedOutput = [ { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'ctr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'vcr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 't' } ];
            expect(chartComponent.chartData(collection)).toEqual(expectedOutput);
            collection = [
                {timestamp: t[0], ctr: 1500, vcr: 1500, t: 1500},
                {timestamp: t[1], ctr: 2500, vcr: 2500, t: 2500}
            ];
            expectedOutput = [ { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'ctr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 'vcr' }, { values : [ { x : t[0].toDate().getTime() / 1000, y : 1500 }, { x : t[1].toDate().getTime() / 1000, y : 2500 } ], key : 't' } ];
            expect(chartComponent.chartData(collection)).toEqual(expectedOutput);
        });

    });

    describe('pie chart', function () {
        beforeEach(function () {
            model = new Suit.Model({vcr: 1500, ctr: 1500, t: 1500});
            html = '<div><div data-legend-for="testChart"><div data-toggle-series="vcr">vcr</div><div data-toggle-series="t">t</div><div data-toggle-series="ctr">ctr</div></div>';
            html += '<div id="testChart" suit-component-chart data-source="model" data-chart-type="pie" data-source="model" data-x-axis-format="datetime" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            view = new Suit.View({el: el, model: model});
            view.render();
            chartComponent = view.components.testChart;
        });

        it('should massage source data to conform to nvd3\'s requirements', function () {
            model = new Suit.Model({ctr: 1500, vcr: 1500, t: 1500});
            var expectedOutput = [ { label : 'ctr', value : 1500 }, { label : 'vcr', value : 1500 }, { label : 't', value : 1500 } ];
            expect(chartComponent.chartData(model)).toEqual(expectedOutput);

            model = {ctr: 1500, vcr: 1500, t: 1500};
            expectedOutput = [ { label : 'ctr', value : 1500 }, { label : 'vcr', value : 1500 }, { label : 't', value : 1500 } ];
            expect(chartComponent.chartData(model)).toEqual(expectedOutput);
        });

        it('should respond to toggle interactions', function () {
            html = '<div><div data-legend-for="testChart"><div data-toggle-series="vcr">vcr</div><div data-toggle-series="t">t</div><div data-toggle-series="ctr">ctr</div></div>';
            html += '<div id="testChart" suit-component-chart data-source="model" data-chart-type="pie" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            model = new Suit.Model({ctr: 1500, vcr: 1500, t: 1500});

            view = new Suit.View({el: el, model: model});
            testDiv.append(view.el);
            view.render();
            chartComponent = view.components.testChart;
            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);

            $('[data-toggle-series="vcr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, true, false]);

            $('[data-toggle-series="ctr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, true, false]);

            $('[data-toggle-series="t"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);



        });


        it('should respond to switch interactions', function () {
            html = '<div><div data-legend-for="testChart"><div data-switch-series="vcr">vcr</div><div data-switch-series="t">t</div><div data-switch-series="ctr">ctr</div></div>';
            html += '<div id="testChart" suit-component-chart data-source="model" data-chart-type="pie" data-theme="dark" data-tooltips="true"></div></div>';
            el = $(html)[0];
            model = new Suit.Model({ctr: 1500, vcr: 1500, t: 1500});
            view = new Suit.View({el: el, model: model});
            testDiv.append(view.el);
            view.render();
            chartComponent = view.components.testChart;
            expect(chartComponent.chart.state().disabled).toEqual([false, false, false]);

            $('[data-switch-series="vcr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, false, true]);

            $('[data-switch-series="ctr"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([false, true, true]);

            $('[data-switch-series="t"]').trigger('click');

            expect(chartComponent.chart.state().disabled).toEqual([true, true, false]);



        });

    });
});