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
        apiRoot: 'http://localhost'
      };

      self.$get = function ($http, $log, _, $q) {

        var apiConfig = {};

        /**
         * The function retrieves config from the apiRoot
         * then makes recursive calls to retrieve and merge the child configs
         *
         * @param apiRoot
         * @returns {angular.IPromise<TResult>}
         */
        var buildEnv = function (apiRoot) {

          var httpOptions = {
            method: 'GET',
            cache: 'false',
            withCredentials: 'true',
            url: apiRoot + self.options.apiConfigPath
          };

          return $http(httpOptions)
            .then(function (d) {
              var env = {}, uiJson = d.data;

              $log.debug('*** API CONFIG: for apiRoot:', apiRoot, uiJson);

              if (!uiJson) {
                throw(['*** ERROR API CONFIG: for apiRoot:' + apiRoot + ' ui-json.txt is not available ']);
              }

              env.services = _(uiJson.services)
                  .mapValues(function (servicePath) {
                    return apiRoot + servicePath;
                  })
                  .valueOf() || {};

              env.envName = uiJson.envName || 'na';

              env.urls = uiJson.urls || {};

              env.options = uiJson.options || {};

              return {currentEnv: env, uiJson: uiJson};
            })
            .then(function (d) {
              var uiJson = d.uiJson;

              // query for the services on the linked hosts recursevly
              return $q.all(uiJson.apiHosts
                ? _(uiJson.apiHosts).mapValues(function (apiHost) { return buildEnv(apiHost);}).valueOf()
                : null)
                .then(function (apiConfigs) {
                  // merging api configs
                  if (!apiConfigs || _.isEmpty(apiConfigs)) {
                    return d.currentEnv;
                  } else {
                    return _(apiConfigs)
                      .assign({currentEnv__: d.currentEnv})
                      .reduce(function (r, s) {
                        //debugger;
                        if (r.envName !== s.envName) {
                          $log.info('*** API CONFIG : the env names do not fit:', r.envName, s.envName);
                        }

                        r.services = _.assign(r.services || {}, s.services || {});
                        r.urls = _.assign(r.urls || {}, s.urls || {});
                        r.options = _.assign(r.options || {}, s.options || {});
                        return r;

                      });
                  }
                });
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


