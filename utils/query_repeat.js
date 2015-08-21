var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var that = {};




function deleteRepeatItem(idArr, callback){
    async.eachSeries(idArr, function(id, cb){
        Models.Game.findOne({game_id:id},{created_at:-1}, function(err, doc){

           Models.Game.remove({game_id:id, "_id":{"$ne":doc._id + ""}}, function(err){

               log.debug(err);
               cb(err);



           })


        });





    }, function(err){

        callback(err);
    })





}

function start(){


    var query = [{"$group":{_id:{"game_id":"$game_id"},sum:{"$sum":1}}},
        {"$match":{"sum":{"$gt":1}}}

];
    Models.Game.aggregate(query, function(err, list){

       list = _.map(list,function(item){return item._id});
        log.debug(list);
        deleteRepeatItem(_.pluck(list,"game_id"), function(compelte){

            log.debug("complete");
        });



    })



}


async.waterfall([function(cb){


    var db = mongoose.connection;
    db.on("error",function(err){
        log.error(err.stack || err);
    });
    mongoose.connect("mongodb://localhost/lottery", function(err, db){
        cb(err, db);
    });



}], function(err, result){

    start();




});