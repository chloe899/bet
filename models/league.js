'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    external_name:String,  //对外名称
    internal_name:String, //所在国家的名称
    country:String,//所在国家
    season:String,
    created_at:Date,
    start_year:Number,
    end_year:Number,
    last_modified:Date,//是否已经发奖
    club_count:Number,  //俱乐部数量
    league_type:String, //类型　league or cup
    league_id:String, //外部league_id
    unique_name:String, //唯一名称
    source:String //数据来源
});
//{win,draw，lost}
module.exports = mongoose.model('League', ModelSchema, "league");
