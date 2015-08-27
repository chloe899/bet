var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var log = require("../lib/logger").getLogger();
var that = {};




that.showList = function(req, res, next){

    var BetResult = Models.BetResult ;
    var query = req.query;
    var mongoQuery = {};
    var l = 100;
    var start = query.s;
    var endDate = query.e;
    var teamCount = 1;



    if(query.t){
        l = 1000;
        var name = query.t;

        if(typeof(name) == "string"){

            mongoQuery["$or"] = [{"team_info.home_team.team_name":name},
                {"team_info.visit_team.team_name":name},
            ];
        }else{
            mongoQuery["$or"] = [{"team_info.home_team.team_name":{"$in":name}},
                {"team_info.visit_team.team_name":{"$in":name}},
            ];
            teamCount = name.length;
        }

    }
    if(query.l){
        l = 1000;

        if(typeof(query.l) == "string"){
            mongoQuery["lg"] = query.l;
        }else{
            mongoQuery["lg"] = {"$in":query.l};
        }

    }
    var goal_add  = req.query.goal_add;
    if(goal_add == "none"){

        mongoQuery.goal_add = 0;
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
    async.waterfall([function(cb){

        BetResult.find(mongoQuery).sort({"match_date":-1}).limit(l).exec(function(err,docs){


            cb(err,docs);

        });
    }], function(err,arr){


        log.debug(arr);
        var data = {list:arr};
        data.l = query.l || "";
        data.t = query.t || "";
        data.a = query.a;
        data.s = start || "";
        data.e = endDate || "";
        data.goal_add = goal_add || "";
        data.teamCount = teamCount ;
        // log.debug(data);
        data.user = req.session.user;
        res.render("bet/analysis.html",data);


    });



};


module.exports =  that;