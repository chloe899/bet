'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    number:Number, //轮次
    home_team:String,  //对外名称
    home_team_id:String,
    visit_team:String,
    visit_team_id:String,//是否已经发奖
    match_date:Number,  //比赛时间
    match_result:Object, //比赛结果
    rank_before:Number, //赛前名次
    rank_after:Number  // 赛后名次

});
//{victory,draw，lost}
module.exports = mongoose.model('MatchDay', ModelSchema, "match_day");