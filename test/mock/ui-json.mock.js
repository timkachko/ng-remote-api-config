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
        $apiHosts: {
          // reference to the cultivated plants API
          cultivatedPlants: 'http://cultivated.com',
        },

        // todo: implement
        // if you need to have custom clauses as following
        // you should configurate the handlers,
        // describing how agregate it (not implemented yet)
        anyCustomData: {
          theHalfOfUltimateAnswer: 21
        }
      },

      //config for the cultivated plants API
      cultivatedPlants: {
        envName: 'qa',
        services: {
          cacti: '/green-hedgehogs/strange-plant-to-enjoy'
        },
        options: {cultivatingMethodPicture: "##cutlivator##-avatar.jpg"},
        $apiHosts: {
          // references to the other sub-APIs
          veggies: 'http://veggies.com',
          fruits: 'http://fruits.com'
        }
      },

      // config for the fruiteesh API
      fruits: {
        envName: 'qa',
        services: {apples: '/not-oranges/apples', bananas: '/not-oranges/bananas', forbiddenFruit:'/big-apple'}
      },

      // config for the vegetables API
      veggies: {
        envName: 'qa',
        urls: {callUsToCultivateVeggies: "https://veggies-are-good.org"},
        services: {cucumbers: '/green/cucumbers', tomatoes: '/red/tomatoes'},

        // if you need to have custom clauses as following
        // you should configurate the handlers for it,
        // describing how agregate it
        anyCustomData: {
          // to be collected and added to another half
          theHalfOfUltimateAnswer: 21
        },
        $external: {
          roots: {
            $url: 'http://roots.org',
            services: {
              potatoes: '/potatoes/regular',
              carrots: '/carrots/yellow'
            }
          }
        }
      }
    }
  });
