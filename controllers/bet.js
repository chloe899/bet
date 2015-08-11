var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var log = require("../lib/logger").getLogger();
var that = {};


that.addBet = function(req, res, next){

    if(!commonUtil.isLogin(req, res, false)){
        commonUtil.badRequest(res, "please login");
        return;
    }
    var data = req.body;
    var selectArr = data.matches;
    var multi = data.multi || 1;
    var user = req.session.user;
    var reduce = multi * selectArr.length * 2;

    async.each(selectArr, function(item, cb){
        var Bet = Models.Bet;
        var data = {matches:item};
        data.created_at = new Date();
        data.multi = multi;
        data.match_count = item.length;
        data.user_id = user._id;
        Bet.create(data, function(err, result){
            cb(err, result);
        });



    }, function(err,result){

        Models.User.findOneAndUpdate({_id:user._id},{"$inc":{"amount":reduce * -1}}, function(err, user){
           log.debug("update complete");
           req.session.user = user;
           res.send({ok:true});

        });




    });





};

that.showBetList = function(req, res, next){
    if(!commonUtil.isLogin(req, res, false)){
        commonUtil.badRequest(res, "please login");
        return;
    }

    var user = req.session.user;

    var Bet = Models.Bet;
    var Match = Models.Match;
    var query = {user_id:user._id};

    async.waterfall([function(cb){
        Bet.find(query).sort({created_at:-1}).exec(function(err, docs){

            cb(err, docs);

        });

    }, function(docs, cb){
        //log.debug(docs);
        var bets = _.pluck(docs, "matches");
        bets = Array.prototype.concat.apply([],bets);
        //log.debug(bets);

        var matchIds = _.map(bets, function(item){

            return item.matchId + "";
        });
        matchIds = _.uniq(matchIds);

        var query = {game_id:{"$in":matchIds}};
        log.debug(query);
        Match.find(query, function(err, matches){
            _.each(bets, function(bet){
                var match = _.findWhere(matches, {game_id: "" + bet.matchId});
                log.debug(match);
                //match = JSON.parse(JSON.stringify(match));
                log.debug(JSON.stringify(match));
                if(match){
                    bet.home_team = match.data.team_info.home_team;
                    bet.visit_team = match.data.team_info.visit_team;
                } else{
                    bet.home_team = {team_info:{}};
                    bet.visit_team = {team_info:{}};
                }

            });
            cb(err, docs);



        });




    }], function(err, docs){

       // log.debug(docs);
        _.each(docs, function(item){

            _.each(item.matches, function(m){
               item.winnings = item.winnings || 1;
               item.winnings *= m.rate;

            });
            item.winnings = item.winnings.toFixed(2);

        });
        var data = {list:docs};
        var viewPath = "bet/list.html";
        res.render(viewPath, data);


    });




};


that.showIndex = function(req, res, next){


    var Game = Models.Game;
    var query = req.query;
    var mongoQuery = {};
    var l = 100;
    var start = query.s;
    var endDate = query.e;
    if(query.t){
        l = 1000;
        var name = query.t;

        if(typeof(name) == "string"){

            mongoQuery["$or"] = [{"data.team_info.home_team.team_name":name},
                {"data.team_info.visit_team.team_name":name},
            ];
        }else{
            mongoQuery["$or"] = [{"data.team_info.home_team.team_name":{"$in":name}},
                {"data.team_info.visit_team.team_name":{"$in":name}},
            ];
        }

    }
    if(query.l){
        l = 1000;

        if(typeof(query.l) == "string"){
            mongoQuery["data.lg"] = query.l;
        }else{
            mongoQuery["data.lg"] = {"$in":query.l};
        }

    }
    if(query.a){
        mongoQuery.end_date =  {"$gt":new Date()};

    }
    if(start){
        l = 1000;
        start = new Date(Date.parse(start));
        mongoQuery["data.team_info.match_date"] = {"$gt":start};
    }
    if(endDate){
        l = 1000;
        endDate = new Date(Date.parse(endDate));
        mongoQuery["data.team_info.match_date"] = {"$lt":endDate};
    }
    log.debug(mongoQuery);
    Game.find(mongoQuery).sort({"data.pdate":-1}).limit(l).exec(function(err,docs){

        //log.debug(docs);
        var arr = _.map(docs, function(doc){
            doc = doc.toJSON();
            var data = doc.data;

            if(data.team_info){

                doc.home_team = data.team_info.home_team;
                doc.visit_team = data.team_info.visit_team;
                var rates = [];
                _.each(data.team_info.rate, function(v,k){
                    v.name = k;
                    rates.push(v);



                });
                doc.rates = rates;


            }else{
                doc.home_team = {};
                doc.visit_team = {};
            }
            doc.rates = doc.rates || [];
            return doc;

        });
        var data = {list:arr};
        data.l = query.l || "";
        data.t = query.t || "";
        data.a = query.a;
        data.s = start || "";
        data.e = endDate || "";
        // log.debug(data);
        data.user = req.session.user;
        res.render("list.html",data);

    });



};

module.exports = that;