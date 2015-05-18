'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    country:String,
    continent:String,
    team:Object,//{"2014-2015":{start_year:"",end_year:"",teams:Array}}
    created_at:Date,
    official_site:String,
    type:String //cup or league

});
//{victory,draw，lost}
module.exports = mongoose.model('Game', ModelSchema, "game");