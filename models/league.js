'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    season:Array,
    created_at:Date,
    multi:Number,
    status:String,
    is_win:Boolean,
    last_update:Boolean,//是否已经发奖
    match_count:Number

});
//{victory,draw，lost}
module.exports = mongoose.model('League', ModelSchema, "league");