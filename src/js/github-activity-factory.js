(function () {
  'use strict';

  /**
   * @ngdoc factory
   * @name github-tracker.factory:GithubActivityService
   * @restrict EA
   * @element
   *
   * @description
   *
   * Grabs the user's GitHub history using $http, and filters out and only
   * saves the PushEvents.
   *
   */
  angular
    .module('githubTracker')
    .factory('githubActivityService', githubActivityService);

  /** @ngInject */
  function githubActivityService($log, $http) {
    var apiHost = 'https://api.github.com/users/'
      , eventLimit = 2
      , service = {};

    service = {
      apiHost: apiHost,
      getActivity: getActivity
    };

    return service;

    function getActivity(user, limit) {
      if (user === '') {
        return {
          hasError: true,
          message: 'No user was supplied'
        };
      }
      eventLimit = limit;
      return $http.get(apiHost + user + '/events')
        .then(getComplete)
        .catch(getFailed);

      function getComplete(response) {
        return handleResponse(response.data);
      }

      function getFailed(error) {
        $log.error('XHR Failed for getActivity.\n' + angular.toJson(error.data, true));
        error.data.hasError = true;
        return error.data;
      }
    }

    function handleResponse(data) {
      var count = 0
        , i = 0
        , pushEvent = {}
        , activity = {
            isLoaded: true,
            events: []
          };

      for (i = 0; i < data.length; i++) {
        if (count < eventLimit) {
          pushEvent = data[i];
          if (pushEvent.type === 'PushEvent') {
            activity.events.push(pushEvent);
            count++;
          }
        } else {
          return activity;
        }
      }
    }
  }
}());
