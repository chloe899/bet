'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    user_id:String,
    balance:Number,//余额
    changes:Number, //增加额
    type:String,　//类型
    desc:String, //备注
    created_at:Date
});
//{victory,draw，lost}
module.exports = mongoose.model('AccountLog', ModelSchema, "account_log");