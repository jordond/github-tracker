'use strict';

var gulp = require('gulp');
var wrench = require('wrench');

/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});

/**
 *  Main gulp tasks
 */

/**
 * Will build the library for distribution, including creating minified and
 * non minified versions of the files.
 */
gulp.task('dist:library', ['clean'], function () {
  gulp.start('uglify');
})

/**
 * Will build the demo for distribution, first requires the building of the
 * library to ensure an up-to-date dependency
 */
gulp.task('dist:demo', ['library'], function () {
  gulp.start('demo');
});

/**
 * Used when developing the library or the demo, it will build a dist version
 * of the library, then a non optimized version of the demo.
 */
gulp.task('develop', ['library'], function () {
  gulp.start('serve');
});

/**
 * Build both the library and the demo for distribution
 */
gulp.task('dist', function () {
  gulp.start('dist:demo');
});

/**
 * Default task is building the library for distribution
 */
gulp.task('default', ['clean'], function () {
  gulp.start('dist:library');
});
