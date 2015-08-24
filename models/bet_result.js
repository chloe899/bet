'use strict'

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    ModelSchema;



ModelSchema = new Schema({
    name:String,
    team_info:Object,
    rate:Number,
    goal_add:Number, // 让球
    match_id:String,
    game_id:String,
    end_date:Date,
    match_date:Date,
    created_at:Date,
    result:Number, // 0 ,1, 3　负平胜
    data_url:String
});

module.exports = mongoose.model('Game', ModelSchema, "game");