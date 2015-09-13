/**
 * Created by dkachko on 9/11/15.
 */

angular
  .module('testApp')
  .factory('uiJsonMock', function () {
    return {

      // root api config -- you should pass the server and optional path to the module during of configuration phase
      plants: {
        envName: 'qa',
        services: {
          bluegrass: '/grass/bluegrass',
          maple: '/trees/maple'
        },
        urls: {anotherSiteAboutPlants: "https://some-site.org"},
        options: {plantsPictureFormat: "##plantname##-picture-small.jpg"},
        apiHosts: {
          cultivatedPlants: 'http://cultivated.com',
        },

        // todo: implement
        // you should configurate the handler for this
        anyCustomData: {
          theHalfOfUltimateAnswer: 21
        }
      },

      //config for api about cultivated plants
      cultivatedPlants: {
        envName: 'qa',
        services: {
          cacti:'/green-hedgehogs/strange-plant-to-enjoy'
        },
        options: {cultivatingMethodPicture: "##cutlivator##-avatar.jpg"},
        apiHosts: {
          veggies: 'http://veggies.com',
          fruits: 'http://fruits.com'
        }
      },

      // config for fruitful API
      fruits: {envName: 'qa',
        services: {apples: '/not-oranges/apples', bananas: '/not-oranges/bananas'}
      },

      // config for vegetables lovers
      veggies: {
        envName: 'qa',
        urls: {callUsToCultivateVeggies: "https://veggies-are-good.org"},
        services: { cucumbers: '/green/cucumbers', tomatoes: '/red/tomatoes'},

        // you should configurate the handler for this
        anyCustomData: {
          theHalfOfUltimateAnswer: 21
        }
      }
    }
  });
