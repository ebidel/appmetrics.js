/* eslint-env node, mocha */

const assert = chai.assert;

describe('appmetrics.js', function() {
  const METRIC_NAME = 'test_metric';
  let metric = new Metric(METRIC_NAME);

  function loadAnalytics() {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-XXXXX-Y', 'auto');
  }

  function isAnalyticsRequest(entry) {
    return entry.name.includes('/collect') && entry.name.includes('t=timing');
  }

  if (!window.PerformanceObserver) {
    throw 'Cannot run tests in a browser PerformanceObserver';
  }

  before(function() {
    if (!location.origin.includes('localhost')) {
      assert.fail(false, true, 'Tests need to be run from a web server.');
    }
    loadAnalytics();
  });

  beforeEach(function() {

  });

  describe('init', function() {
    it('constructor fails without name', function() {
      assert.throws(function test() { return new Metric(); });
    });
    it('name is correct', function() {
      assert.equal(metric.name, 'test_metric');
    });
    it('.duration returns -1 before start of recording', function() {
      assert.equal(metric.duration, -1);
    });
    it('has correct feature detection', function() {
      assert.equal(Metric.supportsPerfNow, performance.now);
      assert.equal(Metric.supportsPerfMark, performance.mark);
    });
  });

  describe('start()', function() {

    it('creates a mark', function(done) {
      let observer = new PerformanceObserver(list => {
        observer.disconnect();

        let entries = list.getEntriesByName(`mark_${METRIC_NAME}_start`);
        assert.equal(entries[0].entryType, 'mark', 'not a mark entry');
        assert.equal(entries.length, 1);

        done();
      });
      observer.observe({entryTypes: ['mark']});

      assert.instanceOf(metric.start(), Metric);
    });

    it('can call again without issue', function() {
      let start = metric._start;
      assert.instanceOf(metric.start(), Metric, 'Attempt to call start() again');
      assert.equal(metric._start, start, 'start time did not change on 2nd call to start()');
      assert.equal(metric.duration, -1, 'duration should not be populated yet');

      // TODO: capture and test console.warn output.
    });
  });

  describe('end()', function() {

    it('creates a mark', function(done) {

      let observer = new PerformanceObserver(list => {
        observer.disconnect();

        let markEntries = list.getEntriesByName(`mark_${METRIC_NAME}_end`);
        assert.equal(markEntries.length, 1);
        assert.equal(markEntries[0].entryType, 'mark', 'not a mark entry');

        let measureEntries = list.getEntriesByName(METRIC_NAME);
        assert.equal(measureEntries[0].entryType, 'measure', 'not a measurement entry');
        assert.equal(measureEntries.length, 1);

        done();
      });
      observer.observe({entryTypes: ['mark', 'measure']});

      assert.instanceOf(metric.end(), Metric);
    });

    it('can call again without issue', function() {
      let end = metric._end;
      assert.instanceOf(metric.end(), Metric, 'Attempt to call end() again');
      assert.equal(metric._end, end, 'end time did not change on 2nd call to end()');
      assert.notEqual(metric.duration, -1, 'duration should be populated');

      // TODO: capture and test console.warn output.
    });
  });

  describe('log()', function() {
    it('can be chained', function() {
      assert.instanceOf(metric.log(), Metric);
    });

    // TODO: capture and test console.info output.
  });

  describe('logAll()', function() {
    it('can be chained', function() {
      assert.instanceOf(metric.logAll(), Metric);
    });

    // TODO: capture and test console.info output.
  });

  describe('sendToAnalytics()', function() {

    it('sends default request', function(done) {
      let observer = new PerformanceObserver(list => {
        observer.disconnect();

        let entries = list.getEntries().filter(entry => {
          return isAnalyticsRequest(entry) &&
                 entry.name.includes(metric.duration) &&
                 entry.name.includes(metric.name) &&
                 entry.name.includes('category_name');
        });

        assert.equal(entries.length, 1, 'single timing entry');
        done();
      });
      observer.observe({entryTypes: ['resource']});

      metric.sendToAnalytics('category_name');
    });

    it('can override duration and name', function(done) {
      let observer = new PerformanceObserver(list => {
        observer.disconnect();

        let entries = list.getEntries().filter(entry => {
          return isAnalyticsRequest(entry) &&
                 entry.name.includes('1234567890') &&
                 entry.name.includes('category_name') &&
                 entry.name.includes('metric_name');
        });

        assert.equal(entries.length, 1, 'one timing entry');
        done();
      });
      observer.observe({entryTypes: ['resource']});

      metric.sendToAnalytics('category_name', 'metric_name', 1234567890);
    });

    it('can send a duration without measuring', function(done) {
      let duration = Date.now();

      let observer = new PerformanceObserver(list => {
        observer.disconnect();

        let entries = list.getEntries().filter(entry => {
          return isAnalyticsRequest(entry) &&
                 entry.name.includes(duration) &&
                 entry.name.includes('category_name') &&
                 entry.name.includes('override_duration');
        });

        assert.equal(entries.length, 1, 'one timing entry');
        done();
      });
      observer.observe({entryTypes: ['resource']});

      let metric = new Metric('override_duration');
      metric.sendToAnalytics('category_name', metric.name, duration);
    });

    it('no requests are to GA before a measurement', function(done) {
      // If the perf observer sees a request, the test should fail.
      let observer = new PerformanceObserver(list => {
        observer.disconnect();
        assert.fail(false, true, 'Google Analytics request was sent before a measurement was made.');
        done();
      });
      observer.observe({entryTypes: ['resource']});

      let metric = new Metric('test_metric');
      metric.sendToAnalytics('should_not_be_sent');

      setTimeout(done, 500);
    });
  });

});
