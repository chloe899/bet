var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var log = require("../lib/logger").getLogger();
var mongoose = require("mongoose");
var that = {};




function updateBet(bet, callback){


    log.debug(bet);
    var Bet = Models.Bet;
    var is_win = true;
    var is_complete = true;
    _.each(bet.matches, function(m){
        var hScore = m.home_team.score && +m.home_team.score;
        var vScore = m.visit_team.score && +m.visit_team.score;
        log.debug(hScore);
        log.debug(vScore);
        if(typeof(hScore) != "undefined" && typeof(vScore) != "undefined"){

            var r = 0;
            var result = +m.result;
            var ball = +m.ball;
            hScore = hScore + (+(ball));
            if(hScore > vScore){
                r = 3;
            }else if(hScore == vScore){
                r = 1;
            }
            m.is_win = r == result;
            if(!m.is_win){
                is_win = false;
            }

        }else{
            log.debug(bet);
            is_complete = false;
        }

    });
    if(is_complete){
        bet.is_win = !!is_win;
        var data = {is_win:bet.is_win};
        data.status = "complete";
        Bet.update({_id:bet._id},{"$set":data}, function(err, result){


            callback(err, 1);

        });
    }else{
        callback(null);
    }



}

function start(){
    async.waterfall([function(cb){
        log.debug('123123');
        var query = {"status":{"$ne":"complete"}};
        Models.Bet.find(query, function(err, docs){

            cb(err, docs);

        });



    }, function(docs, cb){

        var Match = Models.Match;
        log.debug(docs);
        var bets = _.pluck(docs, "matches");
        bets = Array.prototype.concat.apply([],bets);
        log.debug(bets);

        var matchIds = _.map(bets, function(item){

            return item.matchId + "";
        });
        matchIds = _.uniq(matchIds);

        var query = {game_id:{"$in":matchIds}};
        log.debug(query);
        Match.find(query, function(err, matches){
            _.each(bets, function(bet){
                var match = _.findWhere(matches, {game_id: "" + bet.matchId});
                match = JSON.parse(JSON.stringify(match));
                //log.debug(match);
                if(match){
                    bet.home_team = match.data.team_info.home_team;
                    bet.visit_team = match.data.team_info.visit_team;
                }

            });
            cb(err, docs);



        });




    }, function(docs, cb){
        log.debug(docs);
        async.map(docs, function(item, cb){

            updateBet(item, function(err, result){
                cb(err, result);
            });

        }, function(err, results){
            cb(err ,results);
        });



    }], function(err, result){

        log.debug(arguments);
        log.debug("complete");
        process.exit(0);



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