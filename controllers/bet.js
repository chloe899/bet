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
                log.debug(match);
                if(match){
                    bet.home_team = match.data.team_info.home_team;
                    bet.visit_team = match.data.team_info.visit_team;
                }

            });
            cb(err, docs);



        });




    }], function(err, docs){

        log.debug(docs);
        var data = {list:docs};
        var viewPath = "bet/list.html";
        res.render(viewPath, data);


    });




};

module.exports = that;