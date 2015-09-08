(function() {
  'use strict';

  angular
    .module('demo')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController() {
    var vm = this;
    vm.name = 'demo';
  }
})();
