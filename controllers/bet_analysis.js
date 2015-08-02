var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var log = require("../lib/logger").getLogger();
var that = {};




that.showList = function(req, res, next){

    var Game = Models.Game;
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

            mongoQuery["$or"] = [{"data.team_info.home_team.team_name":name},
                {"data.team_info.visit_team.team_name":name},
            ];
        }else{
            mongoQuery["$or"] = [{"data.team_info.home_team.team_name":{"$in":name}},
                {"data.team_info.visit_team.team_name":{"$in":name}},
            ];
            teamCount = name.length;
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
    async.waterfall([function(cb){

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
            cb(err, arr, docs);

        });
    }], function(err,arr, result){


        var data = {list:arr};
        data.l = query.l || "";
        data.t = query.t || "";
        data.a = query.a;
        data.s = start || "";
        data.e = endDate || "";
        data.teamCount = teamCount ;
        // log.debug(data);
        data.user = req.session.user;
        res.render("bet/analysis.html",data);


    });



};


module.exports =  that;