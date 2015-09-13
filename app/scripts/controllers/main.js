'use strict';

/**
 * @ngdoc function
 * @name testApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module('testApp')
  .controller('MainCtrl', function ($scope,
                                    apiConfigService,
                                    $log) {

    apiConfigService.get().then(function(configData){
      $log.debug('all set!');
      return configData; // to do something with it e.g. make a call with $http;
    });

  });
