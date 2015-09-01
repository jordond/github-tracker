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
gulp.task('build-library', ['clean'], function () {
  gulp.start('uglify');
})

gulp.task('build-demo', ['uglify'], function () {
  gulp.start('demo-build');
});

gulp.task('develop', ['uglify'], function () {
  gulp.start('serve');
});

gulp.task('default', ['clean'], function () {
  gulp.start('build-library');
});
