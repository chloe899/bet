'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    name_en:String,
    created_at:Date,
    website:String,
    status:String,
    nick_name:String,
    manager:String,//是否已经发奖
    stadium:String,
    found_year:Number

});
//{victory,draw，lost}
module.exports = mongoose.model('Team', ModelSchema, "team");