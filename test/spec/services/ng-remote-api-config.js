/**
 * Created by dkachko on 9/11/15.
 */
'use strict';

describe('Serivice: api config -- plants ', function () {
  var apiConfigService, $httpBackend;

  //beforeEach(module('ngRemoteApiCong'));
  //beforeEach(module('ngTemplates'));
  beforeEach(module('testApp'));

  beforeEach(function () {
    inject(function (_apiConfigService_) {
      apiConfigService = _apiConfigService_;
    });
  });

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, _uiJsonMock_) {
    $httpBackend = _$httpBackend_;
    var uiJson = _uiJsonMock_;
    $httpBackend.whenGET('http://plants.com/ui-json.json').respond(uiJson.plants);
    $httpBackend.whenGET('http://fruits.com/ui-json.json').respond(uiJson.fruits);
    $httpBackend.whenGET('http://veggies.com/ui-json.json').respond(uiJson.veggies);
    $httpBackend.whenGET('http://cultivated.com/ui-json.json').respond(uiJson.cultivatedPlants);
  }));

  it('apiconfig, .get should be defined, be a function and return promise', function () {
    expect(apiConfigService).toBeDefined();
    expect(apiConfigService.get).toBeDefined();
    expect(typeof apiConfigService.get).toEqual('function');
    expect(typeof apiConfigService.get().then).toEqual('function');
  });

  it('the promise resolved with object with envName and services defined', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.envName).toBeDefined();
        expect(d.services).toBeDefined();
        expect(typeof d.services).toEqual('object');
      })
      .catch(function (e) {
        console.error('error happened: ', e);
      })
      .finally(done);
    $httpBackend.flush();
  });

  it('root case: calling fruits returns bluegrass and maple full urls', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.envName).toEqual('qa');
        expect(d.services.bluegrass).toEqual('http://plants.com/grass/bluegrass');
        expect(d.services.maple).toEqual('http://plants.com/trees/maple');
      })
      .finally(done);
    $httpBackend.flush();
  });

  it('children case: calling fruits returns apples, bananas, cucumbers, tomatoes full urls', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.envName).toEqual('qa');
        expect(d.services.apples).toEqual('http://fruits.com/not-oranges/apples');
        expect(d.services.bananas).toEqual('http://fruits.com/not-oranges/bananas');
        expect(d.services.cucumbers).toEqual('http://veggies.com/green/cucumbers');
        expect(d.services.tomatoes).toEqual('http://veggies.com/red/tomatoes');
        expect(d.services.cacti).toEqual('http://cultivated.com/green-hedgehogs/strange-plant-to-enjoy');
      })
      .catch(function (e) {
        console.error('error happened: ', e);
      })
      .finally(done);
    $httpBackend.flush();
  });

  it('other clauses: options, urls', function (done) {
    apiConfigService.get().then(
      function (d) {
        expect(d.options.plantsPictureFormat).toEqual('##plantname##-picture-small.jpg');
        expect(d.options.cultivatingMethodPicture).toEqual('##cutlivator##-avatar.jpg');
        expect(d.urls.callUsToCultivateVeggies).toEqual('https://veggies-are-good.org');
        expect(d.urls.anotherSiteAboutPlants).toEqual( 'https://some-site.org');
      })
      .catch(function (e) {
        console.error('error happened: ', e);
      })
      .finally(done);
    $httpBackend.flush();
  });

});

