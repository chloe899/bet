'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    created_at:Date,
    multiple:Number,
    detail:Array,//[object {home_name,visit_name,result:"",rate:}]
    user:String,
    amount:Number

});
//{victory,draw，lost}
module.exports = mongoose.model('Order', ModelSchema, "orders");