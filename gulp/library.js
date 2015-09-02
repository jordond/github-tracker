'use strict';

var path = require('path');
var gulp = require('gulp');

var conf = require('./conf');

var $ = require('gulp-load-plugins')({
  pattern: [
    'gulp-*',
    'main-bower-files',
    'uglify-save-license',
    'del'
  ]
});

gulp.task('lint', function () {
  return gulp.src(path.join(conf.paths.src, '**/*.js'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', ['lint'], function () {
  var htmlFilter = $.filter('**/*.html')
    , jsFilter = $.filter('**/*.js');

  return gulp.src([
    path.join(conf.paths.src, 'js/*.module.js'),
    path.join(conf.paths.src, '**/*.{js,html}')
  ])
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.angularTemplatecache(conf.name + '.tpl.js', {
      module: conf.moduleName,
      root: 'app'
    }))
    .pipe(htmlFilter.restore())
    .pipe(jsFilter)
    .pipe($.ngAnnotate())
    .pipe(jsFilter.restore())
    .pipe($.concat(conf.name + '.js'))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

gulp.task('styles', function () {
  var lessOptions = {
    options: [
      'bower_components',
      conf.paths.src
    ]
  };

  return gulp.src([
    path.join(conf.paths.src, '**/*.less')
  ])
    .pipe($.sourcemaps.init())
    .pipe($.less(lessOptions)).on('error', conf.errorHandler('Less'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe($.concat(conf.name + '.css'))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

gulp.task('uglify', ['scripts', 'styles'], function () {
  var cssFilter = $.filter('*.css')
    , jsFilter = $.filter('*.js');

  return gulp.src([
    path.join(conf.paths.dist, '*.{js,css}')
  ])
    .pipe(jsFilter)
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe($.rename(conf.name + '.min.js'))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe($.sourcemaps.init())
    .pipe($.csso())
    .pipe($.sourcemaps.write())
    .pipe($.rename(conf.name + '.min.css'))
    .pipe(cssFilter.restore())
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

gulp.task('clean', function (done) {
  $.del([path.join(conf.paths.dist, '/**/*'), path.join(conf.paths.tmp, '/**/*')], done);
});

gulp.task('library', ['clean'], function () {
  gulp.start('uglify');
});