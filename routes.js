var userCtrl = require("./controllers/user");
var betCtrl = require("./controllers/bet");
var betAnaCtrl = require("./controllers/bet_analysis");
var teamCtrl = require("./controllers/match");
var leagueCtrl =  require("./controllers/league");



var that = {};

that.init = function(app){

    app.get("/", betCtrl.showIndex);
    app.get("/user/login.html", userCtrl.showLogin);
    app.post("/user/login", userCtrl.login);
    app.get("/user/signup.html",userCtrl.showSignup);
    app.post("/user/signup.html",userCtrl.signup);
    app.get("/user/index.html",userCtrl.showMe);
    app.post("/bet/add",betCtrl.addBet);
    app.get("/bet/list.html",betCtrl.showBetList);
    app.get("/bet/analysis.html",betAnaCtrl.showList);

    app.get("/team/all_team/", teamCtrl.getAllTeam);
    app.get("/team/all_league/", teamCtrl.getAllLeague);

    app.get("/league/match_list.html", leagueCtrl.showMatchList);
    app.get("/league/index.html", leagueCtrl.showIndex);

};


module.exports = that;