'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    type:String,
    url:String,
    complete:Boolean,
    created_at:{type:Date, default:Date.now},
    completed_at:Date
});

module.exports = mongoose.model('RequestPlan', ModelSchema, "request_plan");