'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    type:String,
    url:String,
    file_path:String,
    last_modified:Date,
    parse_complete:Boolean,
    complete:Boolean,
    download_times:Number,//下载次数
    created_at:{type:Date, default:Date.now},
    completed_at:Date
});

module.exports = mongoose.model('RequestPlan', ModelSchema, "request_plan");