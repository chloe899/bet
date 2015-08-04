'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    league_id:String,
    league_name:String,
    season:String,
    club_name:String,  //对外名称
    club_id:String,
    created_at:Date,
    last_update:Boolean//是否已经发奖


});
//{victory,draw，lost}
module.exports = mongoose.model('LeagueClub', ModelSchema, "league_club");