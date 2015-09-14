# ngRemoteAppConfig 

Simple AngularJS module created to keep environment configuration managed remotely from the single API endpoint.

## Motivation

In the case when an API which is delivered from several servers/endpoints and a set of client applications rely on the API,
you have a problem of multiple coupling between the client and server part, when hard to maintain/move/restructure the API.
The problem also appears during the production cycle, when the client app is pushed from developing to testing environments,
and further to the production.

This module provides API configuration object that is collected from several servers during application startup for use 
in $http calls.

## Installation

to add it in your project 

- install the package: `bower install ng-remote-app-config --save`

- add dependency to your Angular module: `.module('testApp', ['ngRemoteApiConfig'])`

- config the provider with api root and optional path:

 ```
 .config(function(apiConfigServiceProvider){
   //tell where the configs are stored
   apiConfigServiceProvider.options.apiConfigPath = '/ui-json.json';
   apiConfigServiceProvider.options.apiRoot = 'http://plants.com';
 });
 ```
 
- inject the service in any of your controllers/services to have configuration promise, which will be resolved when all 
the data is collected: 
```
.controller('MainCtrl', function ($scope,
                                   apiConfigService,
                                   $log) {
   apiConfigService.get().then(function(configData){
     $log.debug('all set!');
     return configData; // to do something with it e.g. make a call with $http;
   });
 });
```

### Use httpConfigured

The service `httpConfigured(options)` is a wrapper around `$http(options)`. Just use instead `options.url`
 the properties `options.serviceName` and `options.resourcePath`:
 ```
var options = {
  serviceName: 'cacti',
  method: 'GET',
  resourcePath: '/cut/the/thorns',
  data: 'Hedgehog' };
 
httpConfigured(options)
  .then(
  function (d) {
   console.log(d);
   expect(d.data).toEqual('best cactus - tested cactus'); })
 ```
(you can still use urls though)

### Server-side configuration

Each configuration object should have the same path relative to the root of the api. E.g. if the API hosted with URI 
the `http://kitty.cat/api`, the best way is to have the server to respond with the configuration object on the GET request
to the root of the api (apiConfigPath is set '/' by default). If we have the config on the different path, e.g. 
`http://kitty.cat/api/config/api.json`, we should set apiConfigPath = '/config/api.json' and it will be the same for the
 other servers. For example, part of API is located on `http://cats-food/prices`, then configuration object should be 
 available on `http://cats-food/prices/config/api.json`, so the client apps know that the config is located on the 
 same path for each server. Right now dynamic change of the path is not implemented as having a low priority.
 
Please have a look into the [ui-json.mock.js](test/mock/ui-json.mock.js) for the sample configuration objects.

## Testing

Running `grunt test` will run the unit tests with karma.

## Dependencies
```
    "angular": "^1.3.0",
    "lodash-angular-wrapper": "*"
```

## To Do 

[List](TODO.md)

## License

[MIT](https://opensource.org/licenses/MIT) (c) 2015, Dmitriy Kachko

## Kudos 
Thanks to those who created great js tools as
_node, npm, bower, grunt, karma, jasmine, yoeman_ and _angular_ (LBNL)



