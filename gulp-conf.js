'use strict';

var gutil = require('gulp-util');

/**
 *  The main paths for build files
 */
exports.paths = {
  src: 'src',
  dist: 'dist',
  tmp: '.tmp',
  demo: 'demo'
};

exports.name = 'github-tracker';

exports.wiredep = {
  exclude: [/jquery/],
  directory: 'bower_components'
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
