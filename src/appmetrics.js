/* eslint-disable no-unused-vars */

/**
 * @fileoverview
 * Class for recording metrics in the DevTools timeline using the User Timing
 * API and (optionally) reporting those timings to Google Analytics.
 */

'use strict';

class Metric {

  /**
   * True if the the browser supports the Navigation Timing API.
   * @type {boolean}
   * @static
   */
  static get supportsPerfNow() {
    return performance && performance.now;
  }

  /**
   * True if the the browser supports the User Timing API.
   * @type {boolean}
   * @static
   */
  static get supportsPerfMark() {
    return performance && performance.mark;
  }

  /**
   * Returns the duration of the timing metric or -1 if there a measurement has
   * not been made.
   * @type {number}
   */
  get duration() {
    let duration = this._end - this._start;

    // Use User Timing API results if available, otherwise return
    // performance.now() fallback.
    if (Metric.supportsPerfMark) {
      // Note: this assumes the user has made only one measurement for the given
      // name. Return the first one found.
      const entry = performance.getEntriesByName(this.name)[0];
      if (entry && entry.entryType !== 'measure') {
        duration = entry.duration;
      }
    }

    return duration || -1;
  }

  /**
   * @param {string} name A name for the metric.
   */
  constructor(name) {
    if (!name) {
      throw Error('Please provide a metric name');
    }

    if (!Metric.supportsPerfMark) {
      console.warn(`Timeline won't be marked for "${name}".`);

      if (!Metric.supportsPerfNow) {
        throw Error('This library cannot be used in this browser.');
      }
    }

    // if (window.PerformanceObserver) {}
    //   let observer = new PerformanceObserver(list => {
    //     list.getEntries().forEach(entry => {
    //       // Display each reported measurement on console
    //       if (console) {
    //         console.log("Name: "       + entry.name      +
    //                     ", Type: "     + entry.entryType +
    //                     ", Start: "    + entry.startTime +
    //                     ", Duration: " + entry.duration  + "\n");
    //       }
    //     })
    //   });
    //   observer.observe({entryTypes: ['resource', 'mark', 'measure']});
    // }

    this.name = name;
  }

  /**
   * Prints the metric's duration to the console.
   * @return {Metric} Instance of this object.
   */
  log() {
    console.info(this.name, this.duration, 'ms');
    return this;
  }

  /**
   * Prints all the metrics for a given name to the console.
   *
   * @param {string=} name If provided, prints the stats of another metric.
   * @return {Metric} Instance of this object.
   */
  logAll(name = this.name) {
    // Use User Timing API results if available, otherwise return
    // performance.now() fallback.
    if (Metric.supportsPerfNow) {
      let items = performance.getEntriesByName(name);
      for (let i = 0; i < items.length; ++i) {
        let item = items[i];
        console.info(name, item.duration, 'ms');
      }
    }
    return this;
  }

  /**
   * Call to begin a measurement.
   * @return {Metric} Instance of this object.
   */
  start() {
    if (this._start) {
      console.warn('Recording already started.');
      return this;
    }

    this._start = performance.now();

    // Support: developer.mozilla.org/en-US/docs/Web/API/Performance/mark
    if (Metric.supportsPerfMark) {
      performance.mark(`mark_${this.name}_start`);
    }

    return this;
  }

  /**
   * Call to end a measurement.
   * @return {Metric} Instance of this object.
   */
  end() {
    if (this._end) {
      console.warn('Recording already stopped.');
      return this;
    }

    this._end = performance.now();

    // Support: developer.mozilla.org/en-US/docs/Web/API/Performance/mark
    if (Metric.supportsPerfMark) {
      let startMark = `mark_${this.name}_start`;
      let endMark = `mark_${this.name}_end`;
      performance.mark(endMark);
      performance.measure(this.name, startMark, endMark);
    }

    return this;
  }

  /**
   * Sends the metric to Google Analytics as a user timing metric.
   *
   * @param {string} category The category of the metric.
   * @param {string} metric Optional name of the metric to record in Analytics.
   *     By default, the metric `name` is used.
   * @param {Number} duration How long the measurement took. The user can
   *     optionally specify another value.
   * @return {Metric} Instance of this object.
   */
  sendToAnalytics(category, metric = this.name, duration = this.duration) {
    if (!window.ga) {
      console.warn('Google Analytics has not been loaded');
    } else if (duration >= 0) {
      ga('send', 'timing', category, metric, duration);
    }
    return this;
  }
}
