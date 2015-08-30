(function () {
  'use strict';

  /**
   * @ngdoc filter
   * @name github-tracker.filter:branch
   * @restrict EA
   * @element
   *
   * @description
   * Filters out the uneeded stuff, and returns the branch name
   *
   */
  angular
    .module('resume')
    .filter('branch', branch);

  function branch() {
    return function (input) {
      return input.replace('refs/heads/', '');
    };
  }
}());
