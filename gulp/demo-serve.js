'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');

var util = require('util');

var proxyMiddleware = require('http-proxy-middleware');

function isOnlyChange(event) {
  return event.type === 'changed';
}

gulp.task('watch', ['inject'], function () {

  gulp.watch([path.join(conf.demo.src, '/*.html'), 'bower.json'], ['inject']);

  gulp.watch([
    path.join(conf.demo.src, '/app/**/*.css'),
    path.join(conf.demo.src, '/app/**/*.less')
  ], function(event) {
    if(isOnlyChange(event)) {
      gulp.start('demo:styles');
    } else {
      gulp.start('inject');
    }
  });

  gulp.watch(path.join(conf.demo.src, '/app/**/*.js'), function(event) {
    if(isOnlyChange(event)) {
      gulp.start('demo:scripts');
    } else {
      gulp.start('inject');
    }
  });

  gulp.watch(path.join(conf.demo.src, '/app/**/*.html'), function(event) {
    browserSync.reload(event.path);
  });

  gulp.watch(path.join(conf.paths.src, '**/*'), function () {
    gulp.start('rebuild');
  });
});


function browserSyncInit(baseDir, browser) {
  browser = browser === undefined ? 'default' : browser;

  var routes = null;
  if(baseDir === conf.demo.src || (util.isArray(baseDir) && baseDir.indexOf(conf.demo.src) !== -1)) {
    routes = {
      '/bower_components': 'bower_components',
      '/dist': 'dist'
    };
  }

  var server = {
    baseDir: baseDir,
    routes: routes
  };

  browserSync.instance = browserSync.init({
    startPath: '/',
    server: server,
    browser: browser
  });
}

browserSync.use(browserSyncSpa({
  selector: '[ng-app]'
}));

gulp.task('rebuild', ['uglify'], function () {
  gulp.start('inject');
});

gulp.task('serve', ['watch'], function () {
  browserSyncInit([path.join(conf.demo.tmp, '/serve'), conf.demo.src]);
});
