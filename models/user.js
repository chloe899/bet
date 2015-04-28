'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    email:String,
    password:String,
    last_login:Date,
    amount:Date,
    created_at:Date,
    salt:String
});
//{victory,draw，lost}
module.exports = mongoose.model('User', ModelSchema, "users");