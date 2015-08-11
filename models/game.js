'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    game_date:Date,
    home_team:String,
    visit_team:String,
    result:String,
    rate:Object,
    data:Object,
    match_id:String,
    game_id:String,
    end_date:Date,
    match_date:Date,
    data_url:String
});

module.exports = mongoose.model('Game', ModelSchema, "game");