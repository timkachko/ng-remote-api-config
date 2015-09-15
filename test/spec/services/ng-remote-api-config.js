/**
 * Created by dkachko on 9/11/15.
 */
'use strict';

describe('Serivice: api config -- plants ', function () {
  var apiConfigService, $httpBackend, uiJson, httpConfigured;

  beforeEach(module('testApp'));

  beforeEach(function () {
    inject(function (_apiConfigService_) {
      apiConfigService = _apiConfigService_;
    });
  });

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, _uiJsonMock_, _httpConfigured_) {
    $httpBackend = _$httpBackend_;
    httpConfigured = _httpConfigured_;
    uiJson = _uiJsonMock_;
    $httpBackend.whenGET('http://plants.com/ui-json.json').respond(uiJson.plants);
    $httpBackend.whenGET('http://fruits.com/ui-json.json').respond(uiJson.fruits);
    $httpBackend.whenGET('http://veggies.com/ui-json.json').respond(uiJson.veggies);
    $httpBackend.whenGET('http://cultivated.com/ui-json.json').respond(uiJson.cultivatedPlants);
    $httpBackend.whenGET('http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy/cut/the/thorns')
      .respond('best cactus - tested cactus');
  }));

  afterEach(
    function () {
      //$httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

  it('apiconfig, .get should be defined, be a function and return a promise', function () {
    expect(apiConfigService).toBeDefined();
    expect(apiConfigService.get).toBeDefined();
    expect(typeof apiConfigService.get).toEqual('function');
    expect(typeof apiConfigService.get().then).toEqual('function');
    $httpBackend.flush();

  });

  it('the promise should be resolved with object with envName and services defined', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.envName).toBeDefined();
        expect(d.services).toBeDefined();
        expect(typeof d.services).toEqual('object');
      })
      .finally(done);
    $httpBackend.flush();
  });

  it('root case: calling fruits config returns bluegrass and maple full urls', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.envName).toEqual('qa');
        expect(d.services.bluegrass).toEqual('http://plants.com/grass/bluegrass');
        expect(d.services.maple).toEqual('http://plants.com/trees/maple');
      })
      .finally(done);
    $httpBackend.flush();
  });

  it('children case: calling fruits config  returns apples, bananas, cucumbers, tomatoes full urls', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.envName).toEqual('qa');
        expect(d.services.apples).toEqual('http://fruits.com/not-oranges/apples');
        expect(d.services.bananas).toEqual('http://fruits.com/not-oranges/bananas');
        expect(d.services.cucumbers).toEqual('http://veggies.com/green/cucumbers');
        expect(d.services.tomatoes).toEqual('http://veggies.com/red/tomatoes');
        expect(d.services.cacti).toEqual('http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy');
      })
      .finally(done);
    $httpBackend.flush();
  });

  it('getUrl should left options without change when the options object contains url', function (done) {
    var options = {url: 'http://cat.foot/zaps/dog', method: 'POST', data: 'Tom'};
    var options2 = angular.extend({}, options);
    apiConfigService.get()
      .then(
      apiConfigService.getUrl.bind(apiConfigService, options))
      .then(
      function (d) {
        expect(d).toEqual(options2);
      })
      .catch(function (e) {console.error(e);})
      .finally(done);
    $httpBackend.flush();
  });

  it('getUrl should insert url if service exists and serviceName is defined', function (done) {
    var options = {serviceName: 'cacti', method: 'GET', data: 'Hedgehog'};
    var options2 = angular.extend({}, options);
    apiConfigService.get()
      .then(
      apiConfigService.getUrl.bind(apiConfigService, options))
      .then(
      function (d) {
        expect(d).not.toEqual(options2);
        expect(d.serviceName).not.toBeDefined();
        expect(d.url).toEqual('http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy');
      })
      .catch(function (e) {console.error(e);})
      .finally(done);
    $httpBackend.flush();
  });

  it('getUrl should add resource to the url if the resourcePath exists', function (done) {
    var options = {serviceName: 'cacti', method: 'GET', resourcePath: '/cut/the/thorns', data: 'Hedgehog'};
    var options2 = angular.extend({}, options);
    apiConfigService.get()
      .then(
      apiConfigService.getUrl.bind(apiConfigService, options))
      .then(
      function (d) {
        expect(d).not.toEqual(options2);
        expect(d.serviceName).not.toBeDefined();
        expect(d.resourcePath).not.toBeDefined();
        expect(d.url).toEqual('http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy/cut/the/thorns');
      })
      .catch(function (e) {console.error(e);})
      .finally(done);
    $httpBackend.flush();
  });

  it('httpConfigured should retrieve the url for the request accordingly', function (done) {
    var options = {
      serviceName: 'cacti',
      method: 'GET',
      resourcePath: '/cut/the/thorns',
      data: 'Hedgehog'
    };
    apiConfigService.get().then(function () {
      httpConfigured(options)
        .then(
        function (d) {
          console.log(d);
          expect(d.data).toEqual('best cactus - tested cactus');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

  it('httpConfigured should pass the url if it does exist', function (done) {
    var options = {
      method: 'GET',
      data: 'Hedgehog',
      url:'http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy/cut/the/thorns'
    };
    apiConfigService.get().then(function () {
      httpConfigured(options)
        .then(
        function (d) {
          console.log(d);
          expect(d.data).toEqual('best cactus - tested cactus');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

});

