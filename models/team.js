'use strict'
//球队资料
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    name_en:String,
    name_zh:String,
    created_at:Date,
    website:String,
    country:String,
    status:String,
    nick_name:String,
    manager:String,//教练
    stadium:String,
    found_year:Number

});
//{victory,draw，lost}
module.exports = mongoose.model('Team', ModelSchema, "team");