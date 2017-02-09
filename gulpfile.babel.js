'use strict';

import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import gulpLoadPlugins from 'gulp-load-plugins';
import closure from 'gulp-closure-compiler';
import injectVersion from 'gulp-inject-version';

const $ = gulpLoadPlugins();
const SRC_DIR = 'src';
const DIST_DIR = 'dist';

function license() {
  return $.license('Apache', {
    organization: 'Eric Bidelman. All rights reserved. - @version %%GULP_INJECT_VERSION%%',
    tiny: true
  });
}

gulp.task('lint', () => {
  return gulp.src([
    `${SRC_DIR}/*.js`
  ])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

// Run scripts through Closure compiler.
gulp.task('build', () => {
  return gulp.src([
    `${SRC_DIR}/appmetrics.js`
  ])
    .pipe(closure({
      compilerPath: 'node_modules/google-closure-compiler/compiler.jar',
      fileName: 'appmetrics.js',
      compilerFlags: {
        compilation_level: 'SIMPLE_OPTIMIZATIONS',
        // warning_level: 'VERBOSE',
        language_in: 'ECMASCRIPT6_STRICT',
        language_out: 'ECMASCRIPT5'
      }
    }))
    .pipe(license()) // Add license to top.
    .pipe(injectVersion())
    .pipe($.rename({suffix: '.min'}))
    .pipe(gulp.dest(DIST_DIR));
});

// gulp.task('test', function() {
//   return gulp.src(['test/*.js'], {read: false})
//     .pipe($.mocha())
//     .on('error', function(error) {
//       console.error(error);
//       process.exit(1);
//     });
// });

// Clean generated files.
gulp.task('clean', () => {
  del([DIST_DIR], {dot: true});
});

// Build production files.
gulp.task('default', ['clean'], cb =>
  runSequence('lint', 'build', cb)
);
