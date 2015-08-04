'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    number:Number, //轮次
    season:String,
    home_team:String,  //对外名称
    home_team_id:String,
    match_id:String,
    away_team:String,
    away_team_id:String,//是否已经发奖
    match_date:Date,  //比赛时间
    match_result:Object, //比赛结果
    match_result_url:String, //比赛结果URL
    rank_before:Number, //赛前名次
    rank_after:Number,  // 赛后名次
    created_at:{type:Date, default:Date.now}

});
//{victory,draw，lost}
module.exports = mongoose.model('MatchDay', ModelSchema, "match_day");