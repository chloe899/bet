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
    game_id:String
});
//{victory,draw，lost}
module.exports = mongoose.model('Game', ModelSchema, "game");