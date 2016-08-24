## appmetrics.js

A small library for measuring things in your web app and reporting the results to Google Analytics.

In browsers that support the full [User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API), the library integrates with DevTools; marking your measurements in the timeline.

INSERT IMAGE

### Usage

To measure how long something takes in your app, first create a new metric:

    let metric = new Metric('my_event'); // each metric name should be unique.

Specify the beginning of your event by calling `start()`. This adds a mark in the DevTools timeline:

    metric.start(); // mark name will be "mark_my_event_start"

When the event completes, call `end()`. This adds another mark in the DevTools timeline
and measures the duration:

    metric.end(); // mark name will be "mark_my_event_end".
    console.log(`${metric.name} took ${metric.duration} ms`);
    metric.log(); // Helper for logging the metric info to the console.

From here, you can examine performance of your measurements in the DevTools timeline under User Timings:

INSERT IMAGE

### Reporting metrics to Google Analytics

**Be sure to load the Google Analytics library on your page.**

Metrics can be reported to Google Analytics using `sendToAnalytics(<category>)`. These show up in the Analytics UI under [User Timing](https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings).

    metric1.sendToAnalytics('page load');
    metric2.sendToAnalytics('render', 'first paint'); // Optional 2nd arg is an event name
    metric3.sendToAnalytics('JS Dependencies', 'load', 1234567890); // Optional 3rd arg to override metric3.duration.

The first argument to `sendToAnalytics()` is the category of your metric ('load', 'gallery', 'video'). The second argument is an optional name of the metric ('first paint', 'reveal', 'watch_started').  By default, `metric.name` is used, but oftentimes it's more convenient to send a shorter to Google Analytics so it renders it nicely in its UI.

### Tips

All methods can be chained for easier use:

    metric.start();
    // ... some time later ...
    metric.end().log().sendToAnalytics('extras', 'syntax highlight');

### Examples

**Example** - measure how long it takes a json file to load, and report it to Google Analytics:

    <script>
      const metric = new Metric('features_loaded');
      metric.start();

      function onFeaturesLoad() {
        metric.end().log().sendToAnalytics('features', 'loaded');
      }
    </script>
    <script src="features.json" onload="onFeaturesLoad()"></script>

**Example** report the first paint to Google Analytics.

    /**
     * Returns the browser's first paint metric (if available).
     * @return {number} The first paint time in ms.
     */
    function getFirstPaintIfSupported() {
      if (window.chrome && window.chrome.loadTimes) {
        let load = window.chrome.loadTimes();
        let fp = (load.firstPaintTime - load.startLoadTime) * 1000;
        return Math.round(fp);
      } else if ('performance' in window) {
        let navTiming = window.performance.timing;
        // See http://msdn.microsoft.com/ff974719
        if (navTiming && navTiming.msFirstPaint && navTiming.navigationStart !== 0) {
          // See http://msdn.microsoft.com/ff974719
          return navTiming.msFirstPaint - navTiming.navigationStart;
        }
      }
      return null;
    }

    // Take measurement after page load.
    window.addEventListener('load', function(e) {
      const fp = getFirstPaintIfSupported();
      if (fp) {
        let metric = new Metric('firstpaint');

        // No need to call start()/end(). Can send a value, directly.
        metric.sendToAnalytics('load', metric.name, fp);
      }
    });

### License

Apache 2. See the LICENSE.


