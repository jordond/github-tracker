'use strict';

var gutil = require('gulp-util');

/**
 *  The main paths for build files
 */
var paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  demo: 'demo'
};
exports.paths = paths;

exports.demo = {
  src: paths.demo + '/' + paths.src,
  dist: paths.demo + '/' + paths.dist,
  tmp: paths.demo + '/' + paths.tmp
}

exports.name = 'github-tracker';
exports.moduleName = 'githubTracker';

exports.wiredep = {
  exclude: [/jquery/, /bootstrap/],
  directory: 'bower_components',
  devDependencies: true
};

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function(title) {
  'use strict';

  return function(err) {
    gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
    this.emit('end');
  };
};
