var fs = require("fs");
var util = require("../lib/common");
var async = require("async");
var iconv = require("iconv-lite");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var Game = require("../models/game.js");
var request = require("request");
var leagueUtil = require("../lib/premier-league");
var _ = require("underscore");
var Models = require("../models");


function parse(){


    var MatchDay = Models.MatchDay;
    MatchDay.find({match_result:{"$exists":false}}, function(err, results){



            async.each(results, function(match, cb){
                 var url = match.match_result_url;
                leagueUtil.request(url, function(err, matchResult){
                    log.debug(matchResult);
                    match.match_result = matchResult;
                    match.save({match_result:matchResult}, function(err, result){
                        cb(err, result);
                    });



                });
            }, function(err, result){

                log.debug("update match result complete");




            });






        }
    )




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
    parse();
});
