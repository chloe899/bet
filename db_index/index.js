db.parse_record.ensureIndex({name:1},{backgroud:1});
db.game.ensureIndex({"game_id":1},{backgroud:1});

db.game.ensureIndex({"data.team_info.visit_team.team_name":1,"data.team_info.home_team.team_name":1},{backgroud:1});
db.game.ensureIndex({"data.lg":1,"data.team_info.visit_team.team_name":1,"data.team_info.home_team.team_name":1},{backgroud:1});