var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var log = require("../lib/logger").getLogger();
var that = {};



that.getAllTeam = function(req, res, next){
    var Match = Models.Match;
    async.waterfall([function(cb){
        var query = req.query;
        var mongoQuery = {};
        if(query.l){
            if(typeof(query.l) == "string"){
                mongoQuery["data.lg"] = query.l;
            }else{
                mongoQuery["data.lg"] = {"$in":query.l};
            }
        }
        log.debug(mongoQuery);
        Match.distinct("data.team_info.home_team.team_name", mongoQuery,function(err, docs){

           cb(err, docs);
        });

    }], function(err, items){


       res.send(items);
    });




};


that.getAllLeague = function(req, res, next){

    var Match = Models.Match;
    async.waterfall([function(cb){
        Match.distinct("data.lg", function(err, docs){

            cb(err, docs);
        });

    }], function(err, items){


        res.send(items);
    });

};





module.exports = that;