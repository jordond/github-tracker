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
