## appmetrics.js

> A small library for measuring things in your web app, annotating the DevTools timeline, and reporting the results to Google Analytics.

This library is a smaller wrapper around the the [User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API). It makes it easier to use. appmetrics.js allows you to instrument your app, record performance metrics, and (optionally) report those metrics to [Google Analytics](https://analytics.google.com). Over time, you'l be able to track the performance of your web app!

### What does it do?

If you want to measure the performance of certain events in your web app. How long did that take?

In browsers that support the full [User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API), this library integrates with DevTools. App measurements in the timeline:

[![User timing inputs show up in the DevTools timeline](https://s16.postimg.org/bm2owyvqd/Screen_Shot_2016_08_23_at_6_03_30_PM.png)](https://postimg.org/image/icj66eiw1/)

Marks you create will also show up in [webpagetest.org](https://www.webpagetest.org/) results:

[![Screen Shot 2016-08-23 at 6.22.37 PM.png](https://s16.postimg.org/rxa0gsuxx/Screen_Shot_2016_08_23_at_6_22_37_PM.png)](https://postimg.org/image/6nme5yen5/)

If you chose to send metrics to Google Analytics, values will show up its UI. See below.

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

From here, you can examine performance of your measurements in the console:

[![Logging records to the console](https://s4.postimg.org/b47jz5699/Screen_Shot_2016_08_23_at_6_08_26_PM.png)](https://postimg.org/image/h558w7svd/)

Or view the records in the DevTools Timeline under "Input" (see screen shot above).

### Reporting metrics to Google Analytics (optional)

**Be sure to load the Google Analytics library on your page.**

Metrics can be reported to Google Analytics using `sendToAnalytics(<category>)`. These show up in the Analytics UI under [User Timing](https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings).

    metric1.sendToAnalytics('page load');
    metric2.sendToAnalytics('render', 'first paint'); // Optional 2nd arg is an event name
    metric3.sendToAnalytics('JS Dependencies', 'load', 1234567890); // Optional 3rd arg to override metric3.duration.

The first argument to `sendToAnalytics()` is the category of your metric ('load', 'gallery', 'video'). The second argument is an optional name of the metric ('first paint', 'reveal', 'watch_started').  By default, `metric.name` is used, but oftentimes it's more convenient to send a shorter to Google Analytics so it renders it nicely in its UI.

Values sen to Analytics will show up in its UI under **Behavior > Site Speed > User Timings**:

[![Screen Shot 2016-08-23 at 6.40.03 PM.png](https://s3.postimg.org/6y0ay534j/Screen_Shot_2016_08_23_at_6_40_03_PM.png)](https://postimg.org/image/6l8wrykun/)

### Examples

Example - measure how long it takes a json file to load, and report it to Google Analytics:

    <script>
      const metric = new Metric('features_loaded');
      metric.start();

      function onFeaturesLoad() {
        metric.end().log().sendToAnalytics('features', 'loaded');
      }
    </script>
    <script src="features.json" onload="onFeaturesLoad()"></script>

Example - report the first paint to Google Analytics.

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

### Browser support

Any browser that supports `performance.now()`! That's  all the modern stuff: Chrome, Firefox, Safari 9.2+, Edge, IE 10, Android Browser 4.4, UC Browser.

**Caveat**: In Safari, the [User Timing API](http://caniuse.com/#feat=user-timing) (`performance.mark()`) is not available, so the DevTools timeline will not be annotated with marks.

See [caniuse.com](http://caniuse.com/#feat=high-resolution-time) for full support.

### Tips

All methods can be chained for easier use:

    metric.start();
    // ... some time later ...
    metric.end().log().sendToAnalytics('extras', 'syntax highlight');

### License

Apache 2. See the LICENSE.


