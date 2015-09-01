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
