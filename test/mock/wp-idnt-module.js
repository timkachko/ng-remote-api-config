angular
    .module('wpIdntModule', [])
    .provider('wpIdntModuleConfig', function () {
        'use strict';
        var self = {
            defaults: {},
            $get: function () {
                return {
                    defaults: self.defaults
                };
            }
        };
        return self;
    })
    .provider('wpFacebookConfig', function () {
        'use strict';
        var self = {
            defaults: {},
            $get: function () {
                return {
                    defaults: self.defaults
                };
            }
        };
        return self;
    })
    .provider('wpIdntResources', function () {
        'use strict';
        var self = {
            resources: {forms: {wp2IdntRegisterForm:{labels:{}}}},
            $get: function () {
                return {
                    defaults: self.resources
                };
            }
        };
        return self;
    })
    .provider('wpAmazonConfig', function () {
        'use strict';
        var self = {
            defaults: {},
            $get: function () {
                return {
                    defaults: self.defaults
                };
            }
        };
        return self;
    })
    .factory('wpIdntService', function(){
        'use strict';
        return {};
    })
    .factory('wpIdntState', function($q){
        'use strict';
        return {initLib : {promise:$q.when(1)}};
    })
    .factory('wpIdntServiceConstants', function(){
        'use strict';
        
        return {
            events:{
                siSuccess:1,
                soSuvvess:2
            }
        };

    });
