/**
 * User: dcb
 * Date: 15-2-3
 * Time: 上午10:23
 */

var express = require('express');
var async = require("async");
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require("path");
var app = express();
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var morgan  = require('morgan');
var _ = require("underscore");
var routes = require("./routes");

var workEnv = process.env.NODE_ENV || "development";


var log = require("./lib/logger").getLogger();
var siteConfig = require("./config");
var configUtil = require("./lib/config-util");
var that = {};

app.locals.env = workEnv;
app.set("env", workEnv);



// log
app.use(morgan("dev"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());
var salt = "ha ha ha 123s";
app.use(express.static(path.join(__dirname, 'static')));
app.use(session({
    store: new RedisStore({ secret: salt, store: new RedisStore, cookie: {maxAge: 3600000 * 24 * 30} }),
    secret:salt,
    resave:true,
    saveUninitialized:true
}));



app.set('views', __dirname + '/views');
//app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);





var port = siteConfig.port;
app.get("/", function(req, res, next){
    var Game = require("./models/game");
    var query = req.query;
    var mongoQery = {};
    var l = 100;
    var start = query.s;
    var endDate = query.e;
    if(query.t){
        l = 1000;
        var name = query.t;
       mongoQery["$or"] = [{"data.team_info.home_team.team_name":name},
            {"data.team_info.visit_team.team_name":name},
            ];
    }
    if(query.l){
        l = 1000;
        mongoQery["data.lg"] = query.l;
    }
    if(query.a){
      mongoQery.end_date =  {"$gt":new Date()};

    }
    if(start){
        l = 1000;
        start = new Date(Date.parse(start));
        mongoQery["data.team_info.match_date"] = {"$gt":start};
    }
    if(endDate){
        l = 1000;
        endDate = new Date(Date.parse(endDate));
        mongoQery["data.team_info.match_date"] = {"$lt":endDate};
    }
    log.debug(mongoQery);
    Game.find(mongoQery).sort({"data.pdate":-1}).limit(l).exec(function(err,docs){

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
        log.debug(data);
        res.render("list.html",data);

    });





});



routes.init(app);


app.use(express.static(path.join(__dirname, 'static')));


that.start = function(options, callback){
    options = options || {};
    async.waterfall([
            function(cb){
                var db = mongoose.connection;
                db.on("error",function(err){
                    log.error(err.stack || err);
                });
                mongoose.connect(siteConfig.db.mongo, function(err, db){
                    cb(err, cb);
                });
            },
            function(db, cb){

                configUtil.readConfigFromDb({ignoreToken:true},function(err, result){

                    cb(err, result);
                });


            }],
        function(err, results){
            //log.debug(siteConfig.services);
            log.debug("prepare att token done");
            if(callback){
                callback(err, results);
            }
        });
};


if (!module.parent) {
    that.start(null, function(err){

        if(err){
            log.debug(err);
            log.debug("server start failed");
            process.exit(1);
        }
        console.log("\t------------------------------------------------------------\r\n");
        app.listen(port);
        console.log('\tServer has been started on port: %s, env is: ',port,  workEnv);
        console.log("\r\n\t------------------------------------------------------------\r\n")
    });
}
