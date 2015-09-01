'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync');
var wiredep = require('wiredep').stream;
var _ = require('lodash');

gulp.task('inject', ['demo-scripts', 'demo-styles'], function () {
  var injectStyles = gulp.src([
    path.join(conf.demo.tmp, '/serve/app/**/*.css'),
    path.join('!' + conf.demo.src, '/serve/app/vendor.css')
  ], { read: false });

  var injectScripts = gulp.src([
    path.join(conf.demo.src, '/app/**/*.module.js'),
    path.join(conf.demo.src, '/app/**/*.js'),
    path.join('!' + conf.demo.src, '/app/**/*.spec.js'),
    path.join('!' + conf.demo.src, '/app/**/*.mock.js')
  ])
  .pipe($.angularFilesort()).on('error', conf.errorHandler('AngularFilesort'));

  var injectOptions = {
    ignorePath: [conf.demo.src, path.join(conf.demo.tmp, '/serve')],
    addRootSlash: false
  };

  return gulp.src(path.join(conf.demo.src + '/*.html'))
    .pipe($.inject(injectStyles, injectOptions))
    .pipe($.inject(injectScripts, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe(gulp.dest(path.join(conf.demo.tmp, '/serve')));
});