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
  githubActivityService.$inject = ["$log", "$http"];
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

angular.module("githubTracker").run(["$templateCache", function($templateCache) {$templateCache.put("app/github-tracker-directive.tpl.html","<div class=\"gt-card c-m-12\"><div class=\"gt-card-content\"><div class=\"gt-card-header\"><h3>Latest Activity</h3><div class=\"btn btn-link pull-right refresh\" ng-click=\"vm.refresh()\"><i class=\"gt-refresh-icon\" ng-class=\"{ \'gt-icon-spin\': vm.isRefreshing }\"></i></div></div><div class=\"gt-card-loading\" ng-hide=\"vm.activity.isLoaded\"><i class=\"gt-loading-icon gt-icon-spin\"></i><h4>{{ vm.loadingMessage }}</h4></div><div class=\"gt-card-info\" ng-show=\"vm.activity.isLoaded\" ng-hide=\"vm.activity.hasError\"><div class=\"gt-row gt-card-event-title\"><div class=\"c-m-4 c-s-6 c-xs-6\"><h4>Repository</h4></div><div class=\"c-m-8 c-s-6 c-xs-6\"><h4>Commits</h4></div></div><div class=\"gt-row gt-card-event\" ng-repeat=\"event in vm.activity.events\"><div class=\"c-m-4\"><a href=\"http://github.com/{{ event.repo.name }}\" target=\"_blank\"><i class=\"gt-github-icon\"></i> {{ event.repo.name }}</a><div am-time-ago=\"event.created_at\"></div></div><div class=\"c-m-8\"><p ng-repeat=\"commit in event.payload.commits | filter:{distinct: true} | limitTo:vm.commitLimit || 3\"><a href=\"http://github.com/{{ event.repo.name }}/tree/{{ event.payload.ref | branch }}\" target=\"_blank\">{{ event.payload.ref | branch }}</a> &commat; <a href=\"http://github.com/{{ event.repo.name }}/commit/{{ commit.sha }}\" target=\"_blank\">{{ commit.sha | limitTo:10 }}</a><br>{{ commit.message }}</p></div></div></div><div class=\"gt-card-error\" ng-show=\"vm.activity.hasError && !vm.isRefreshing\"><h4>Whoops... Something went wrong.</h4><p>{{ vm.activity.message }}</p></div></div></div>");}]);