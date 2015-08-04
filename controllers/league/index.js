
var async = require("async");
var _ = require("underscore");
var Models = require("../../models");


var that = {};





that.showIndex = function(req, res){

    Models.MatchDay.distinct("season", function(err, array){


        var result  = _.map(array, function(s){

           return {season:s,name:s,league:"pm"};

        });

       res.render("league/index.html",{list:result});

    });

};


that.showMatchList = function(req, res ,next){

    var season = req.query.season || "2014-2015";
    async.waterfall([function(cb){
        Models.MatchDay.distinct("season", function(err, array){

            var seasons  = _.map(array, function(s){

                return {season:s,name:s,league:"pm"};

            });

            cb(err, seasons);


        })


    }, function(seasons, cb){

       Models.MatchDay.find({season:season}).sort({match_date:1}).exec(function(err, matches){


           cb(err, seasons, matches);

       });






    }], function(err, seasons, matches){


        var renderData = {};
        renderData.seasons = seasons;
        renderData.season = season;
        renderData.matches = matches;
        renderData.list = matches;
        res.render("league/match_list.html",renderData);
    });





};




module.exports = that;

