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
         * @param options {[serviceName, resourcePath,][url]}
         * @returns Promise
         */
          //
          apiConfig.getUrl = function (options) {
            if (angular.isString(options.url)) {
              return $q.when(options);
            } else if (!options.serviceName){
              throw ['*** API CONFIG: The service name is not defined. '];
            }{
              return apiConfig.get().then(function (config) {
                var serviceUrl = config.services[options.serviceName];
                if (!serviceUrl) {
                  throw ['*** API CONFIG: The service not found. The serviceName:' + options.serviceName + ' .'];
                }
                options.url = config.services[options.serviceName] + (options.resourcePath || '');
                delete options.serviceName;
                delete options.resourcePath;
                return options;
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
   * provides the same basic functionality as $http
   * but if url is not defined, it is trying to retrieve it from the config
   */
  ngRemoteApiConfigModule.factory('httpConfigured', function () {
    var self = function (options) {
      if (angular.isString(options.url)) {
        return $http(options);
      }
    }
  });

  /**
   * separated module to avoid circular dependencies
   * @type {any|module|angular.IModule|*}
   */
  //var ngRemoteApiConfigModuleInterceptor = angular.module('ngRemoteApiConfigInterceptor', ['ngRemoteApiConfig'] );
  //
  //ngRemoteApiConfigModuleInterceptor.config(function ($httpProvider) {
  //  $httpProvider.interceptors.push('httpConfiguredInterceptor');
  //});
  //
  //ngRemoteApiConfigModuleInterceptor.factory('httpConfiguredInterceptor', function (apiConfigService) {
  //  return {
  //    'request': function (options) {
  //      return apiConfigService.getUrl(options);
  //    }
  //  }
  //});

  if (angular.isFunction(angular.decorator)) {
    // todo create decorator
  }

}(window.angular));


