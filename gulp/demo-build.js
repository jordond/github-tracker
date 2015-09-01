'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')();

var browserSync = require('browser-sync');
var wiredep = require('wiredep').stream;
var _ = require('lodash');

gulp.task('demo-scripts', function () {
  return gulp.src(path.join(conf.demo.src, '/app/**/*.js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(browserSync.reload({ stream: true }))
    .pipe($.size())
});

gulp.task('demo-styles', function () {
  var lessOptions = {
    options: [
      'bower_components',
      path.join(conf.demo.src, '/app')
    ]
  };

  var injectFiles = gulp.src([
    path.join(conf.demo.src, '/app/**/*.less'),
    path.join('!' + conf.demo.src, '/app/index.less')
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(conf.demo.src + '/app/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };

  return gulp.src([
    path.join(conf.demo.src, '/app/index.less')
  ])
    .pipe($.inject(injectFiles, injectOptions))
    .pipe(wiredep(_.extend({}, conf.wiredep)))
    .pipe($.sourcemaps.init())
    .pipe($.less(lessOptions)).on('error', conf.errorHandler('Less'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.demo.tmp, '/serve/app/')))
    .pipe(browserSync.reload({ stream: true }));
});
