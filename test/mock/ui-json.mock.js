/**
 * Created by dkachko on 9/11/15.
 */

angular
  .module('testApp')
  .factory('uiJsonMock', function () {
    return {

      fruits: {
        envName: 'qa',
        services: {
          apples: '/apples',
          bananas: '/bananas'
        }
      },

      veggies: {
        envName: 'qa',
        services: {
          cucumbers: '/cucumbers',
          tomatoes: '/tomatoes'
        }
      },

      plants: {
        envName: 'qa',
        services: {
          bluegrass: '/grass/bluegrass',
          maple: '/trees/maple'
        },
        urls:{ profile: "https://washingtonpost.com"},
        options:{partnerLogoImgFormat: "##partnerid##-logo-small.jpg"},
        apiHosts: {
          veggies: 'http://veggies',
          fruits: 'http://fruits'
        }
      },



      realQA: {
        "envName": "qa",
        "services": {
          "person": "/person",
          "subscriptions": "/subscriptions",
          "voucher": "/subscriptions/voucher",
          "associate": "/subscriptions/associate",
          "amtrack": "/subscriptions/amtrack",
          "settings": "/settings/service",
          "print": "/printservices",
          "offers": "/offers/service",
          "uiEvents": "/uieventservice",
          "drawbridge": "/drawbridgeservice"
        },
        "urls": {
          "profile": "https://washingtonpost.com",
          "main": "https://fishlab8.digitalink.com/main",
          "newsletters": "https://fishlab8.digitalink.com/newsletters/#/newsletters",
          "login": "https://fishlab8.digitalink.com/loginregistration/index.html#/register/group/default?action=login",
          "loginOnlyUrl": "https://subscribe.digitalink.com/loginregistration/index.html#/loginOnly?destination=##destination##",
          "partnerLogoImgServerUrl": "https://partnerresources-a.akamaihd.net/test/partresources/",
          "publicUrls": {
            "viewAllComments": "http://www.washingtonpost.com/mycomments",
            "browsingHistory": "http://posthistory.washingtonpost.com/browsinghistory/",
            "moreNewsletters": "https://subscribe.washingtonpost.com/newsletters/#/newsletters",
            "helpDescPage": "http://www.washingtonpost.com/actmgmt/help/",
            "termsOfSale": "http://www.washingtonpost.com/terms-of-sale-for-digital-products/2014/05/06/b7763844-cbf9-11e3-93eb-6c0037dde2ad_story.html",
            "termsOfService": "http://www.washingtonpost.com/terms-of-service/2011/11/18/gIQAldiYiN_story.html",
            "privacyPolicy": "http://www.washingtonpost.com/privacy-policy/2011/11/18/gIQASIiaiN_story.html",
            "sendUsMessage": "http://help.washingtonpost.com/ics/support/ticketnewwizard.asp?style=classic&deptID=15080",
            "zipCodeCheckUrl": "https://subscribe.washingtonpost.com/acquisition/acquisitionapp.html?#/offers/promo/digital01/oscode/RPXU/zip/",
            "liveChatCheckButtonUrl": "https://s5.parature.com/ics/csrchat/ChatButtonHttpModule.aspx?buttonId=e26ad9ea-7979-4031-8195-dd843db92f72&clientId=15067&deptId=15080",
            "livaChatUrl": "https://s5.parature.com/ics/support/chat/chatstart.asp?deptID=15080&deploymentId=e26ad9ea-7979-4031-8195-dd843db92f72"
          }
        },
        "options": {
          "partnerLogoImgFormat": "##partnerid##-logo-small.jpg",
          "facebook": {"appId": "98319225937", "scope": "email"},
          "amazon": {
            "sellerId": "A1Y7L5Q3A0CSJY",
            "clientId": "amzn1.application-oa2-client.e0f05d8a1cf343ff97a6114bb44bf23d",
            "amazonWidgetScriptUrl": "https://static-na.payments-amazon.com/OffAmazonPayments/us/sandbox/js/Widgets.js?sellerId=",
            "scope": "profile postal_code"
          }
        }
      }
    }
  });
