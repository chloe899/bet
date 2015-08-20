var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var that = {};





function start(){
    async.waterfall([function(cb){

        var query = {is_win:true,has_award:{"$ne":true}};
        var Bet = Models.Bet;
        Bet.find(query, function(err, docs){
            cb(err, docs);


        });


    }, function(docs, cb){

        var User = Models.User;
        async.map(docs, function(item, cb){
            var winnings = 1;
            _.each(item.matches, function(m){

                winnings *= m.rate;

            });
            winnings = winnings * 2  * item.multi;
            winnings = winnings.toFixed(2);
            User.update({_id:item.user_id},{"$inc":{amount:winnings}}, function(err, result){
                item.has_award = true;
                item.save(function(err, result){
                    cb(err, winnings, result);
                })

            });

        }, function(err, results){
            cb(err, results);
        })

    }], function(err ,result){
          log.debug(arguments);

    });

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