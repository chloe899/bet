var async = require("async");
var _ = require("underscore");
var commonUtil= require("../lib/common");
var Models = require("../models");
var that = {};







that.showLogin = function(req, res, next){

   res.render("login.html");




};

that.login  = function(req, res, next){


    var  User = Models.User;
    var email = req.body.email;
    var password = req.body.password;
    email = email.toLowerCase();
    async.waterfall([function(cb){

        User.findOne({email:email}, function(item,doc){
            if(doc){

                var hexContent = commonUtil.getSha1Sum(password, doc.salt);
                if(hexContent == doc.password){
                    cb(null, doc)
                }else{
                    cb("password error");
                }

            }else{
                cb("user not exists");
            }



        });



    }], function(err, user){

        if(err){
            res.send({error:true, reason:err});
        }else{
            res.send(user);
        }



    });




};

that.showSignup = function(req, res, next){

    var data = {err_msg:""};
    res.render("user/signup.html",data);

};


that.signup = function(req, res, next){



    var  User = Models.User;

    var data = req.body;

    var email = data.email;
    email = email.toLowerCase();

    async.waterfall([function(cb){

        User.findOne({email:email}, function(err, doc){

            cb(err, doc);

        });

    },function(user, cb){

        if(user){
            cb("user exists");
        }else{


            var newUser = {email:email};
            newUser.created_at = new Date();
            newUser.amount = 2000;
            newUser.salt =  "" + Date.now();
            newUser.password = commonUtil.getSha1Sum(data.password, newUser.salt);


            User.create(newUser, function(err, userCreated){

               cb(err, userCreated);
            });
        }

    }], function(err, userCreated){

       if(err){
           var data = {err_msg:err};
           res.render("user/signup.html", data);
       }
        else{
           res.redirect("/");
       }


    });





};


module.exports = that;