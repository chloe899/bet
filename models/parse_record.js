'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    complete:Boolean,
    created_at:Date,
    match_count:Number,
    complete_date:Date
});
//{victory,draw，lost}
module.exports = mongoose.model('ParseRecord', ModelSchema, "parse_record");