var mongoose = require('mongoose');

var _ = require("underscore");
var async = require("async");
var log = require("./logger").getLogger();
var siteConfig = require("../config");
var Models = require("../models");





var that = {};

that.prepareAttToken = function(callback){
    var services = siteConfig.services;
    async.each(services, function(service, cb) {

            cb(null, "already exists");

    }, function(err, results){
        if(err){
            log.debug("an error occurred when take the att token");
            log.error(err.stack || err);
        }

        callback(err, results);

    });

};

that.updateSystemConfig = function(data, callback){

    Models.SystemConfig.findOne(function(err, doc){

       if(doc){
           doc.save(data, function(err,doc){
               callback(err, doc);
           });
       } else{

           Models.SystemConfig.create(data, function(err, doc){
               callback(err, doc);
           });

       }

    });


};




that.readConfigFromDb = function(options, callback){
    if(!callback){
        callback = options;
        options = {};
    }
    (function(callback) {
        async.parallel({
                services : function(callback) {
                    callback(null,[]);
                },
                products : function(callback) {
                    // 读取 product 配置
                    callback(null,{});
                }
            },
            // optional callback
            function(err, results) {


                siteConfig["products"] = results['products'];
                siteConfig["services"] = results['services'];


                    callback(err, results);


            });
    })(callback);

};

module.exports = that;