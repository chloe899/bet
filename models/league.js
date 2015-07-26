'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    external_name:String,  //对外名称
    season:String,
    created_at:Date,
    last_update:Boolean,//是否已经发奖
    club_count:Number  //俱乐部数量

});
//{victory,draw，lost}
module.exports = mongoose.model('League', ModelSchema, "league");
