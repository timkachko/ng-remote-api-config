/**
 * Created by dkachko on 9/11/15.
 */
'use strict';

describe('Serivice: api config -- plants ', function () {
  var apiConfigService, $httpBackend, uiJson, httpConfigured, httpC;

  beforeEach(module('testApp'));

  beforeEach(function () {
    inject(function (_apiConfigService_) {
      apiConfigService = _apiConfigService_;
    });
  });

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, _uiJsonMock_, _httpConfigured_, _httpC_) {
    $httpBackend = _$httpBackend_;
    httpConfigured = _httpConfigured_;
    uiJson = _uiJsonMock_;
    httpC = _httpC_;
    $httpBackend.whenGET('http://plants.com/ui-json.json').respond(uiJson.plants);
    $httpBackend.whenGET('http://fruits.com/ui-json.json').respond(uiJson.fruits);
    $httpBackend.whenGET('http://veggies.com/ui-json.json').respond(uiJson.veggies);
    $httpBackend.whenGET('http://cultivated.com/ui-json.json').respond(uiJson.cultivatedPlants);

    $httpBackend.when('GET', 'http://veggies.com/green/cucumbers', function (d) {
      return !!d;
    }).respond({collection: 'cucumbers'});

    $httpBackend.when('GET', 'http://veggies.com/green/cucumbers/salted', function (d) {
      return !!d;
    }).respond({collection: 'pickle'});

    $httpBackend.when('POST', 'http://veggies.com/green/cucumbers/salted', function (d) {
      return JSON.parse(d).pepper === 'red';
    }).respond({collection: 'hot'});

    $httpBackend.when('POST', 'http://veggies.com/green/cucumbers/salted', function (d) {
      return JSON.parse(d).pepper === 'green';
    }).respond({collection: 'mild'});

    $httpBackend.when('GET', 'http://veggies.com/green/cucumbers/salted', function (d) {
      return JSON.parse(d).pepper === 'green';
    }).respond({collection: 'mild'});

    $httpBackend.whenGET('http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy/cut/the/thorns')
      .respond('best cactus - tested cactus');

    $httpBackend.whenGET('http://roots.org/potatoes/regular/sweet').respond({collection: 'sweet'});
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
      data: {name: 'Hedgehog'},
      url: 'http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy/cut/the/thorns'
    };
    apiConfigService.get().then(function () {
      httpConfigured(options)
        .then(
        function (d) {
          expect(d.data).toEqual('best cactus - tested cactus');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

  it('httpConfigured should give access to the service with dot operator', function (done) {
    apiConfigService.get().then(function () {
      httpConfigured.service('cucumbers').get()
        .then(
        function (d) {
          expect(d.data.collection).toEqual('cucumbers');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

  it('httpConfigured should give access to the resorce with dot operator', function (done) {
    apiConfigService.get().then(function () {
      httpConfigured.service('cucumbers').resource('/salted').get()
        .then(
        function (d) {
          expect(d.data.collection).toEqual('pickle');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

  it('httpConfigured should give access to the data with dot operator', function (done) {
    apiConfigService.get().then(function () {
      httpConfigured.service('cucumbers').resource('/salted').data({pepper: 'red'}).post()
        .then(
        function (d) {
          expect(d.data.collection).toEqual('hot');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

  it('httpConfigured.service should allow all three arguments', function (done) {
    apiConfigService.get().then(function () {
      httpConfigured.service('cucumbers', '/salted', {pepper: 'green'}).post()
        .then(
        function (d) {
          expect(d.data.collection).toEqual('mild');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });


  it('httpConfigured.s contains shortcut to service', function (done) {
    apiConfigService.get().then(function () {
      httpConfigured.s.cucumbers('/salted', {pepper: 'green'}).post()
        .then(
        function (d) {
          expect(d.data.collection).toEqual('mild');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

  it('httpC defined as shortname', function (done) {
    apiConfigService.get().then(function () {
      httpC.s.cucumbers('/salted', {pepper: 'green'}).post()
        .then(
        function (d) {
          expect(d.data.collection).toEqual('mild');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });


  it('$external section works', function (done) {
    apiConfigService.get().then(function () {
      httpC.s.potatoes('/sweet').get()
        .then(
        function (d) {
          expect(d.data.collection).toEqual('sweet');
        })
        .catch(function (e) {console.error(e);})
        .finally(done);
    });
    $httpBackend.flush();
  });

  it('override works', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.envName).toEqual('qa');
        expect(d.services.apples).toEqual('http://fruits.com/not-oranges/apples');
        expect(d.services.bananas).toEqual('http://fruits.com/not-oranges/bananas');
        expect(d.services.cucumbers).toEqual('http://veggies.com/green/cucumbers');
        expect(d.services.tomatoes).toEqual('http://veggies.com/red/tomatoes');
        expect(d.services.cacti).toEqual('http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy');
        expect(d.services.forbiddenFruit).toEqual('https://localhost/big-apple');
      })
      .finally(done);
    $httpBackend.flush();
  });

});

