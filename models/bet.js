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
    match_count:Number

});
//{victory,draw，lost}
module.exports = mongoose.model('Bet', ModelSchema, "bet");