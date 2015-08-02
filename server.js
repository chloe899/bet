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



app.use(function(req, res, next){
    if(req.session.user){
        res.locals = res.locals || {};
        res.locals.user = req.session.user;
    }
    next();


});

var port = siteConfig.port;




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
