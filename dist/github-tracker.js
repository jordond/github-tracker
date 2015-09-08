(function() {
  'use strict';

  angular
    .module('githubTracker', ['angularMoment']);

})();

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
    .module('githubTracker')
    .filter('branch', branch);

  function branch() {
    return function (input) {
      return input.replace('refs/heads/', '');
    };
  }
}());

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
  function githubActivityService($q, $log, $http) {
    var apiHost = 'https://api.github.com/users/'
      , eventLimit = 2
      , service = {};

    service = {
      apiHost: apiHost,
      getActivity: getActivity
    };

    return service;

    function getActivity(user, limit) {
      if (!user || user === angular.isUndefined()) {
        return $q.when({
          hasError: true,
          message: 'No user was supplied'
        });
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
  githubActivityService.$inject = ["$q", "$log", "$http"];
}());

(function () {
  'use strict';

  /**
   * @ngdoc directive
   * @name github-tracker.directive:github-tracker
   * @restrict EA
   * @element
   *
   * @description
   * Displays the github data retrieved from the factory.
   *
   * @scope
   * user - Which GitHub user to gather data on
   * eventLimit (optional) - ngrepeat limit for number of events (default 3)
   * commitLimit (optional) - ngrepeat limit for number of commits per event (default 3)
   * refreshDelay (optional) - $timeout delay for refreshing, in seconds (default 1)
   */
  angular
    .module('githubTracker')
    .directive('githubTracker', GithubTracker);

  function GithubTracker() {
    var directive = {
      restrict: 'EA',
      scope: {
        user: '@',
        eventLimit: '@?',
        commitLimit: '@?',
        refreshDelay: '@?'
      },
      templateUrl: 'github-tracker-directive.tpl.html',
      replace: false,
      controller: GithubTrackerCtrl,
      controllerAs: 'vm',
      bindToController: true
    };

    GithubTrackerCtrl.$inject = ["$log", "$timeout", "githubActivityService", "witty"];
    return directive;

    /** @ngInject */
    function GithubTrackerCtrl($log, $timeout, githubActivityService, witty) {
      var vm = this;
      vm.activity = {
        isLoaded: false
      };
      vm.refresh = refresh;
      vm.loadingMessage = witty.message();

      activate();

      function activate() {
        return getActivity().then(function () {
          $log.debug('Activated github-tracker View');
        });
      }

      function refresh() {
        if (vm.isRefreshing) {
          return;
        }
        vm.isRefreshing = true;
        vm.activity.isLoaded = false;
        vm.loadingMessage = witty.message();

        function delayed() {
          return getActivity().then(function () {
            vm.isRefreshing = false;
            $log.info('Git activity was refreshed');
          });
        }
        $timeout(delayed, (vm.refreshDelay || 1) * 1000);
      }

      function getActivity() {
        return githubActivityService.getActivity(vm.user, vm.eventLimit || 3)
          .then(function (data) {
            vm.activity = data;
            return vm.activity;
          });
      }
    }
  }
}());

(function () {
  'use strict';

  /**
   * @ngdoc factory
   * @name github-tracker.factory:witty
   * @restrict EA
   * @element
   *
   * @description
   * returns a random 'witty' loading message
   *
   */
  angular
    .module('githubTracker')
    .factory('witty', witty);

  /** @ngInject */
  function witty() {
    var messages
      , service = {};

    messages = [
      'hold your breath, I dare you ;)',
      'you\'re not in Kansas any more',
      'it is still faster than you could grab it',
      'the bits are flowing slowly today',
      'jumping into the rabbit hole',
      'I\'m moving as fast as I can',
      'pay no attention to the man behind the curtain and enjoy the elevator music',
      'a few bits tried to escape, but we caught them',
      'the server is powered by a lemon and two electrodes',
      'checking the gravitational constant in your locale',
      'we\'re testing your patience',
      'follow the white rabbit',
      'pulling Neo from the matrix',
      'dialing the 8th chevron isn\'t easy you know',
      'setting phasers to fun',
      'doo doo doo, la la la, c\'mon already...',
      'I\'m running out of witty loading messages',
      'do you ever sometimes just wake up and wonder if you\'re actually mentally handicapped' +
        ' and everyone around you is just being nice? No? Just me?... Carry on',
      'Hey look over there!',
      'You might wanna go make a sandwich',
      'I wonder if you know I intentionally slowed this process down... muahahahaha',
      'I do believe in fairies! I do! I do!',
      'Okay enough is enough, load already'
    ];

    service = {
      messages: messages,
      message: message
    };

    return service;

    function message() {
      return messages[Math.floor(Math.random() * messages.length)];
    }

  }
}());

angular.module("githubTracker").run(["$templateCache", function($templateCache) {$templateCache.put("github-tracker-directive.tpl.html","<div class=\"gt-card c-m-12\"><div class=\"gt-card-content\"><div class=\"gt-card-header\"><h3>Latest Activity</h3><div class=\"btn btn-link pull-right refresh\" ng-click=\"vm.refresh()\"><img class=\"gt-icon\" ng-class=\"{ \'gt-icon-spin\': vm.isRefreshing }\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDE2IDE2IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxNiAxNjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxnPjxwYXRoIHN0eWxlPSJmaWxsOiMwMzAxMDQ7IiBkPSJNMi4wODMsOUgwLjA2MkgwdjVsMS40ODEtMS4zNjFDMi45MzIsMTQuNjczLDUuMzExLDE2LDgsMTZjNC4wOCwwLDcuNDQ2LTMuMDU0LDcuOTM4LTdoLTIuMDIxYy0wLjQ3NiwyLjgzOC0yLjk0NCw1LTUuOTE3LDVjLTIuMTA2LDAtMy45Ni0xLjA4Ni01LjAzLTIuNzI5TDUuNDQxLDlIMi4wODN6Ii8+PHBhdGggc3R5bGU9ImZpbGw6IzAzMDEwNDsiIGQ9Ik04LDBDMy45MiwwLDAuNTU0LDMuMDU0LDAuMDYyLDdoMi4wMjFDMi41NTksNC4xNjIsNS4wMjcsMiw4LDJjMi4xNjksMCw0LjA3LDEuMTUxLDUuMTI0LDIuODc2TDExLDdoMmgwLjkxN2gyLjAyMUgxNlYybC0xLjQzMiwxLjQzMkMxMy4xMjMsMS4zNTcsMTAuNzIsMCw4LDB6Ii8+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjwvc3ZnPg==\"></div></div><div class=\"gt-card-loading\" ng-hide=\"vm.activity.isLoaded\"><img class=\"gt-icon\" ng-class=\"{ \'gt-icon-spin\': vm.isRefreshing }\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjYuMzQ5cHgiIGhlaWdodD0iMjYuMzVweCIgdmlld0JveD0iMCAwIDI2LjM0OSAyNi4zNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjYuMzQ5IDI2LjM1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGc+PGNpcmNsZSBjeD0iMTMuNzkyIiBjeT0iMy4wODIiIHI9IjMuMDgyIi8+PGNpcmNsZSBjeD0iMTMuNzkyIiBjeT0iMjQuNTAxIiByPSIxLjg0OSIvPjxjaXJjbGUgY3g9IjYuMjE5IiBjeT0iNi4yMTgiIHI9IjIuNzc0Ii8+PGNpcmNsZSBjeD0iMjEuMzY1IiBjeT0iMjEuMzYzIiByPSIxLjU0MSIvPjxjaXJjbGUgY3g9IjMuMDgyIiBjeT0iMTMuNzkyIiByPSIyLjQ2NSIvPjxjaXJjbGUgY3g9IjI0LjUwMSIgY3k9IjEzLjc5MSIgcj0iMS4yMzIiLz48cGF0aCBkPSJNNC42OTQsMTkuODRjLTAuODQzLDAuODQzLTAuODQzLDIuMjA3LDAsMy4wNWMwLjg0MiwwLjg0MywyLjIwOCwwLjg0MywzLjA1LDBjMC44NDMtMC44NDMsMC44NDMtMi4yMDcsMC0zLjA1QzYuOTAyLDE4Ljk5Niw1LjUzNywxOC45ODgsNC42OTQsMTkuODR6Ii8+PGNpcmNsZSBjeD0iMjEuMzY0IiBjeT0iNi4yMTgiIHI9IjAuOTI0Ii8+PC9nPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48L3N2Zz4=\"><h4>{{ vm.loadingMessage }}</h4></div><div class=\"gt-card-info\" ng-show=\"vm.activity.isLoaded\" ng-hide=\"vm.activity.hasError\"><div class=\"gt-row gt-card-event-title\"><div class=\"c-m-4 c-s-6 c-xs-6\"><h4>Repository</h4></div><div class=\"c-m-8 c-s-6 c-xs-6\"><h4>Commits</h4></div></div><div class=\"gt-row gt-card-event\" ng-repeat=\"event in vm.activity.events\"><div class=\"c-m-4 c-s-6 c-xs-6\"><a href=\"http://github.com/{{ event.repo.name }}\" target=\"_blank\"><img class=\"gt-icon\" src=\"data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNDM4LjU0OXB4IiBoZWlnaHQ9IjQzOC41NDlweCIgdmlld0JveD0iMCAwIDQzOC41NDkgNDM4LjU0OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDM4LjU0OSA0MzguNTQ5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PHBhdGggZD0iTTQwOS4xMzIsMTE0LjU3M2MtMTkuNjA4LTMzLjU5Ni00Ni4yMDUtNjAuMTk0LTc5Ljc5OC03OS44QzI5NS43MzYsMTUuMTY2LDI1OS4wNTcsNS4zNjUsMjE5LjI3MSw1LjM2NWMtMzkuNzgxLDAtNzYuNDcyLDkuODA0LTExMC4wNjMsMjkuNDA4Yy0zMy41OTYsMTkuNjA1LTYwLjE5Miw0Ni4yMDQtNzkuOCw3OS44QzkuODAzLDE0OC4xNjgsMCwxODQuODU0LDAsMjI0LjYzYzAsNDcuNzgsMTMuOTQsOTAuNzQ1LDQxLjgyNywxMjguOTA2YzI3Ljg4NCwzOC4xNjQsNjMuOTA2LDY0LjU3MiwxMDguMDYzLDc5LjIyN2M1LjE0LDAuOTU0LDguOTQ1LDAuMjgzLDExLjQxOS0xLjk5NmMyLjQ3NS0yLjI4MiwzLjcxMS01LjE0LDMuNzExLTguNTYyYzAtMC41NzEtMC4wNDktNS43MDgtMC4xNDQtMTUuNDE3Yy0wLjA5OC05LjcwOS0wLjE0NC0xOC4xNzktMC4xNDQtMjUuNDA2bC02LjU2NywxLjEzNmMtNC4xODcsMC43NjctOS40NjksMS4wOTItMTUuODQ2LDFjLTYuMzc0LTAuMDg5LTEyLjk5MS0wLjc1Ny0xOS44NDItMS45OTljLTYuODU0LTEuMjMxLTEzLjIyOS00LjA4Ni0xOS4xMy04LjU1OWMtNS44OTgtNC40NzMtMTAuMDg1LTEwLjMyOC0xMi41Ni0xNy41NTZsLTIuODU1LTYuNTdjLTEuOTAzLTQuMzc0LTQuODk5LTkuMjMzLTguOTkyLTE0LjU1OWMtNC4wOTMtNS4zMzEtOC4yMzItOC45NDUtMTIuNDE5LTEwLjg0OGwtMS45OTktMS40MzFjLTEuMzMyLTAuOTUxLTIuNTY4LTIuMDk4LTMuNzExLTMuNDI5Yy0xLjE0Mi0xLjMzMS0xLjk5Ny0yLjY2My0yLjU2OC0zLjk5N2MtMC41NzItMS4zMzUtMC4wOTgtMi40MywxLjQyNy0zLjI4OWMxLjUyNS0wLjg1OSw0LjI4MS0xLjI3Niw4LjI4LTEuMjc2bDUuNzA4LDAuODUzYzMuODA3LDAuNzYzLDguNTE2LDMuMDQyLDE0LjEzMyw2Ljg1MWM1LjYxNCwzLjgwNiwxMC4yMjksOC43NTQsMTMuODQ2LDE0Ljg0MmM0LjM4LDcuODA2LDkuNjU3LDEzLjc1NCwxNS44NDYsMTcuODQ3YzYuMTg0LDQuMDkzLDEyLjQxOSw2LjEzNiwxOC42OTksNi4xMzZjNi4yOCwwLDExLjcwNC0wLjQ3NiwxNi4yNzQtMS40MjNjNC41NjUtMC45NTIsOC44NDgtMi4zODMsMTIuODQ3LTQuMjg1YzEuNzEzLTEyLjc1OCw2LjM3Ny0yMi41NTksMTMuOTg4LTI5LjQxYy0xMC44NDgtMS4xNC0yMC42MDEtMi44NTctMjkuMjY0LTUuMTRjLTguNjU4LTIuMjg2LTE3LjYwNS01Ljk5Ni0yNi44MzUtMTEuMTRjLTkuMjM1LTUuMTM3LTE2Ljg5Ni0xMS41MTYtMjIuOTg1LTE5LjEyNmMtNi4wOS03LjYxNC0xMS4wODgtMTcuNjEtMTQuOTg3LTI5Ljk3OWMtMy45MDEtMTIuMzc0LTUuODUyLTI2LjY0OC01Ljg1Mi00Mi44MjZjMC0yMy4wMzUsNy41Mi00Mi42MzcsMjIuNTU3LTU4LjgxN2MtNy4wNDQtMTcuMzE4LTYuMzc5LTM2LjczMiwxLjk5Ny01OC4yNGM1LjUyLTEuNzE1LDEzLjcwNi0wLjQyOCwyNC41NTQsMy44NTNjMTAuODUsNC4yODMsMTguNzk0LDcuOTUyLDIzLjg0LDEwLjk5NGM1LjA0NiwzLjA0MSw5LjA4OSw1LjYxOCwxMi4xMzUsNy43MDhjMTcuNzA1LTQuOTQ3LDM1Ljk3Ni03LjQyMSw1NC44MTgtNy40MjFzMzcuMTE3LDIuNDc0LDU0LjgyMyw3LjQyMWwxMC44NDktNi44NDljNy40MTktNC41NywxNi4xOC04Ljc1OCwyNi4yNjItMTIuNTY1YzEwLjA4OC0zLjgwNSwxNy44MDItNC44NTMsMjMuMTM0LTMuMTM4YzguNTYyLDIxLjUwOSw5LjMyNSw0MC45MjIsMi4yNzksNTguMjRjMTUuMDM2LDE2LjE4LDIyLjU1OSwzNS43ODcsMjIuNTU5LDU4LjgxN2MwLDE2LjE3OC0xLjk1OCwzMC40OTctNS44NTMsNDIuOTY2Yy0zLjksMTIuNDcxLTguOTQxLDIyLjQ1Ny0xNS4xMjUsMjkuOTc5Yy02LjE5MSw3LjUyMS0xMy45MDEsMTMuODUtMjMuMTMxLDE4Ljk4NmMtOS4yMzIsNS4xNC0xOC4xODIsOC44NS0yNi44NCwxMS4xMzZjLTguNjYyLDIuMjg2LTE4LjQxNSw0LjAwNC0yOS4yNjMsNS4xNDZjOS44OTQsOC41NjIsMTQuODQyLDIyLjA3NywxNC44NDIsNDAuNTM5djYwLjIzN2MwLDMuNDIyLDEuMTksNi4yNzksMy41NzIsOC41NjJjMi4zNzksMi4yNzksNi4xMzYsMi45NSwxMS4yNzYsMS45OTVjNDQuMTYzLTE0LjY1Myw4MC4xODUtNDEuMDYyLDEwOC4wNjgtNzkuMjI2YzI3Ljg4LTM4LjE2MSw0MS44MjUtODEuMTI2LDQxLjgyNS0xMjguOTA2QzQzOC41MzYsMTg0Ljg1MSw0MjguNzI4LDE0OC4xNjgsNDA5LjEzMiwxMTQuNTczeiIvPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48Zz48L2c+PGc+PC9nPjxnPjwvZz48L3N2Zz4=\"> {{ event.repo.name }}</a><div am-time-ago=\"event.created_at\"></div></div><div class=\"c-m-8 c-s-6 c-xs-6\"><p ng-repeat=\"commit in event.payload.commits | filter:{distinct: true} | limitTo:vm.commitLimit || 3\"><a href=\"http://github.com/{{ event.repo.name }}/tree/{{ event.payload.ref | branch }}\" target=\"_blank\">{{ event.payload.ref | branch }}</a> &commat; <a href=\"http://github.com/{{ event.repo.name }}/commit/{{ commit.sha }}\" target=\"_blank\">{{ commit.sha | limitTo:10 }}</a><br>{{ commit.message }}</p></div></div></div><div class=\"gt-card-error\" ng-show=\"vm.activity.hasError && !vm.isRefreshing\"><h4>Whoops... Something went wrong.</h4><p>{{ vm.activity.message }}</p></div></div></div>");}]);