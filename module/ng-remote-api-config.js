/**
 * Created by dkachko on 9/1/15.
 */

(function (angular) {

  'use strict';

  var ngRemoteApiConfigModule = angular.module('ngRemoteApiConfig', ['lodashAngularWrapper']);

  ngRemoteApiConfigModule.provider('apiConfigService', function () {

      var self = this;

      self.options = {
        apiConfigPath: '/ ',
        apiRoot: 'http://localhost',
        sectionHandlers: {
          services :{
            valueProcessor: function (section, currentApiRoot) {
              return _.mapValues(section, function(v){
                return currentApiRoot + v })
            }
          },
          envName : {
            reduceFunction: function(reduced, current){
              if (reduced!==current){
                $log.warn('*** envName do not match: ', reduced, current);
              }
              return current;
            }
          }
        }
      };

      self.$get = function ($http, $log, _, $q) {

        var apiConfig = {}, options = self.options;

        /**
         * The function retrieves config from the apiRoot
         * then makes recursive calls to retrieve and merge the child configs
         *
         * @param currentApiRoot
         * @returns {angular.IPromise<TResult>}
         */
        var buildEnv = function (currentApiRoot) {

          var httpOptions = {
            method: 'GET',
            cache: 'false',
            url: currentApiRoot + self.options.apiConfigPath
          };

          return $http(httpOptions)
            .then(function (d) {
              var processed = {}, currentConfigJson = d.data;
              $log.debug('*** API CONFIG: for apiRoot:', currentApiRoot, currentConfigJson);

              if (!currentConfigJson) {
                throw(['*** ERROR API CONFIG: for apiRoot:' + currentApiRoot + ' config json is not available ']);
              }

              _.forEach(currentConfigJson, function(v, k){
                // omit keys beginning with '$'
                if (k[0]!=='$'){
                  if (options.sectionHandlers[k] && options.sectionHandlers[k].valueProcessor){
                    processed[k] = options.sectionHandlers[k].valueProcessor(v, currentApiRoot);
                  } else {
                    processed[k] = v;
                  }
                }
              });

              if(currentConfigJson.$apiHosts) {
                // query for the services on the linked hosts recursevly
                return $q.all(
                  _(currentConfigJson.$apiHosts)
                  .mapValues(function (apiHost) { return buildEnv(apiHost);})
                  .valueOf())
                  .then(function (apiConfigs) {
                    // merging api configs
                    if (!apiConfigs || _.isEmpty(apiConfigs)) {
                      return processed;
                    } else {
                      return _(apiConfigs)
                        .assign({currentEnv__: processed})
                        .reduce(function (result, currentObj) {
                          _.forEach(currentObj, function(v, k){
                            // omit keys beginning with '$'
                            if (k[0]!=='$'){
                              if (options.sectionHandlers[k] && options.sectionHandlers[k].reduceFunction){
                                result[k] = options.sectionHandlers[k].reduceFunction(result[k], v);
                              } else {
                                if (_.isObject(v)){
                                  result[k] = _.assign(result[k] || {}, v);
                                } else {
                                  result[k] = v;
                                }
                              }
                            }
                          });

                          return result;

                        });
                    }
                  })
              } else {
                return $q.when(processed);
              };
            })

        };   // buildEnv

        // cache for promise -- if it is retrieving/has been retrieved already, don't try again
        var apiRootPromise = null;

        /**
         *
         * @returns {Promise}
         */
        apiConfig.get = function () {
          apiRootPromise = apiRootPromise || buildEnv(self.options.apiRoot);
          return apiRootPromise;
        };

        /**
         * return promise resolved with options
         * leave options.url if it is defined in options
         * otherwise define it from the apiConfig
         * @param options Object
         * @returns Promise
         */
          //
        apiConfig.getUrl = function (options) {
          if (angular.isString(options.url)) {
            return $q.when(options);
          } else if (!options.serviceName) {
            throw ['*** API CONFIG: The service name is not defined. '];
          }
          {
            return apiConfig.get().then(function (config) {
              var serviceUrl = config.services[options.serviceName],
                optionsCopy = angular.extend({}, options)
              if (!serviceUrl) {
                throw ['*** API CONFIG: The service not found. The serviceName:' + options.serviceName + ' .'];
              }
              optionsCopy.url = config.services[options.serviceName] + (options.resourcePath || '');
              delete optionsCopy.serviceName;
              delete optionsCopy.resourcePath;
              return optionsCopy;
            });
          }
        };

        apiConfig.get().then(function (config) {$log.debug('*** API CONFIG retrieved:', config); });

        return apiConfig;

      }
    }
  );

  /**
   * wrapper around the $http
   * provides the same basic functionality as $http()
   * but if url is not defined, it is trying to retrieve it from the config
   */
  ngRemoteApiConfigModule.factory('httpConfigured', function ($http, apiConfigService) {
    var GET = 'GET',
      POST = 'POST',
      DELETE = 'DELETE',
      PUT = 'PUT';

    var build = function (initialOptions) {
      // you can call httpConfigured(fullOptions) it returns promise
      var core = function (fullOptions) {
        if (angular.isString(fullOptions.url)) {
          return $http(fullOptions);
        } else {
          return apiConfigService.getUrl(fullOptions)
            .then(function (config) {
              return $http(config);
            })
        }
      };
      // or you can build options and then call method
      core.options = initialOptions;
      /**
       *
       * @param {string} serviceName
       * @optional {string} [resourcePath]
       * @param {object} [data]
       * @returns {Function}
       */
      core.service = function (serviceName, resourcePath, data) {
        core.data(data).resource(resourcePath);
        angular.extend(core.options, {serviceName: serviceName});
        return core;
      };

      core.resource = function (resourcePath, data) {
        core.data(data);
        if (angular.isString(resourcePath) && resourcePath) {
          angular.extend(core.options, {resourcePath: resourcePath});
        }
        return core;
      };

      core.get = function (data) {
        core.data(data);
        angular.extend(core.options, {method: GET});
        return core(core.options);
      };

      core.post = function (data) {
        core.data(data);
        angular.extend(core.options, {method: POST});
        return core(core.options);
      };

      core.put = function (data) {
        core.data(data);
        angular.extend(core.options, {method: PUT});
        return core(core.options);
      };

      core.delete = function (data) {
        core.data(data);
        angular.extend(core.options, {method: DELETE});
        return core(core.options);
      };

      core.data = function (data) {
        if (angular.isObject(data) && data) {
          angular.extend(core.options, {data: data});
        }
        return core;
      };

      // define shourtcuts to the services

      function makeShortcut(serviceName) {
        return function (resourcePath, data) {
          return core.service(serviceName, resourcePath, data);
        }
      };

      core.s = {};

      apiConfigService.get().then(function (config) {
        angular.forEach(config.services, function (serviceUrl, serviceName) {
          core.s[serviceName] = makeShortcut(serviceName);
        });
      });
      return core;
    }

    return build({});
  })
    // define shortname for httpConfigured
    .factory('httpC', function (httpConfigured) {return httpConfigured;});

}(window.angular));


