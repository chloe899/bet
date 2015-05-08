'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    user_id:String,
    matches:Array,
    created_at:Date,
    multi:Number,
    status:String,
    is_win:Boolean,
    has_award:Boolean,//是否已经发奖
    match_count:Number

});
//{victory,draw，lost}
module.exports = mongoose.model('Bet', ModelSchema, "bet");