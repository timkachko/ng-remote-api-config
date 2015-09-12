/**
 * Created by dkachko on 9/1/15.
 */
angular.module('partnerApp').
    factory('apiConfigService', function (ENV, $http, $log, _, $q, $) {
        'use strict';

        var apiConfig = {};

        var apiRoot = null;

        if (ENV.apiRoot) {
            apiRoot = ENV.apiRoot;
        } else {
            apiRoot = 'http://fishlab8.digitalink.com';
            $log.info('No API root in ENV, using default: ', apiRoot);

        }

        var buildEnv = function (apiRoot) {

            var options = {
                method: 'GET',
                cache: 'false',
                withCredentials: 'true',
                url: apiRoot + '/ui-json.json'
            };

            return $http(options)
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

                    return $q.all(uiJson.apiHosts ?
                        // query for the services on the linked hosts recursevly
                                  _(uiJson.apiHosts).mapValues(function (apiHost) { return buildEnv(apiHost);}).valueOf()
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
                                            $log.info('*** API CONFIG : the env names not fit:', r.envName, s.envName);
                                        }
                                        r.services = _.assign(r.services || {}, s.services || {});
                                        r.urls = _.assign(r.urls || {}, s.urls || {});
                                        r.options = _.assign(r.options || {}, s.options || {});
                                        return r;
                                    });
                            }
                        });
                });
        };   // buildEnv

        // cache for promise -- if it is retrieving/has been retrieved already, don't try again
        var apiRootPromise = null;

        /**
         *
         * @returns {$q.promise}
         */
        apiConfig.get = function () {
            apiRootPromise = apiRootPromise || buildEnv(apiRoot);
            return apiRootPromise;
        };

        /**
         * return promise resolved with options
         * leave options.url if it is defined in options
         * otherwise define it from the apiConfig
         * @param options {[serviceName, resourcePath,][url]}
         * @returns $p.Promise
         */

        apiConfig.getUrl = function (options) {
            if (options.url) {
                return $.when(options);
            } else {
                return apiConfig.get().then(function (config) {
                    var serviceUrl = config.services[options.serviceName];
                    if (!serviceUrl) {
                        throw (['*** API CONFIG: The service ' + options.serviceName + ' not found.']);
                    }
                    options.url = config.services[options.serviceName] + options.resourcePath || '';
                    return options;
                });
            }
        };

        apiConfig.get().then(function (config) {$log.debug('*** API CONFIG retrieved:', config); });

        return apiConfig;

    }
);


