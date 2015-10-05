'use strict';

/**
 * @ngdoc overview
 * @name testApp
 * @description
 * # testApp
 *
 * Main module of the application.
 */
angular
  .module('testApp', ['ngRemoteApiConfig'])
  .config(function (apiConfigServiceProvider) {
    //tell where the configs are stored
    //$httpProvider.defaults.withCredentials = true;
    apiConfigServiceProvider.options.apiConfigPath = '/ui-json.json';
    apiConfigServiceProvider.options.apiRoot = 'http://plants.com';
    apiConfigServiceProvider.options.override = {
      services: {
        forbiddenFruit:'https://localhost/big-apple'
      }
    };
  });
