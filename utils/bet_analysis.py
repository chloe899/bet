#! /usr/bin/env python
# -*- coding: utf-8 -*
from datetime import datetime as dt
import time
import pymongo

conn = pymongo.Connection('localhost', port=27017)
db = conn.lottery
query = {"data.team_info.home_team.score": {"$exists": True},}
games = db.game.find(query)
bet_result = db.bet_result
insert_count = 0
start_time = time.time()
i = 0

for item in games:
    game_id = item["game_id"]
    r = bet_result.find_one({"game_id": game_id})
    # print r is None
    if r is None:
        # print "url:{},path:{}".format(url, file_path)
        now = dt.now()
        s_data = item["data"]
        team_info = item["data"]["team_info"]
        if "lg" not in s_data:
            print item
            # exit(0)
            continue
        data = {"created_at": now,
                "game_id": game_id,
                "team_info": team_info,
                "lg": s_data["lg"],
                "match_date": team_info["match_date"]
                }
        all_rate = team_info["rate"]
        # print team_info
        home_score = int(team_info["home_team"]["score"])
        away_score = int(team_info["visit_team"]["score"])

        for key in all_rate.keys():
            goal_add = int(key)
            game_result = home_score + goal_add - away_score

            if game_result < 0:
                game_result = 0
            elif game_result > 0:
                game_result = 3
            else:
                game_result = 1
            goal_rate = all_rate[key]
            # print(goal_rate)
            rate_key = str(game_result)
            final_rate = 1
            if rate_key in goal_rate:
                final_rate = float(goal_rate[rate_key])
            else:
                print "rate_key %s not exists, goal_add is : %s" % (rate_key, goal_add)
                print "all_rate is %s" % all_rate
                print goal_rate
                print rate_key
            data["result"] = game_result
            data["rate"] = final_rate
            data["goal_add"] = goal_add
            if s_data["lg"] == u"英超":
                print "rate_key is %s , goal_add is : %s" % (rate_key, goal_add)
                print "all_rate is %s, math_date is %s" % (all_rate, team_info["match_date"])
                print data
            bet_result.insert(data)
            data.pop("_id")
            insert_count += 1
            # print("insert new")
    else:
        # print r
        i += 1
        # print "exists" + str(i)



end_time = time.time()
time_use = end_time - start_time
print "complete, exit 88, time use  %s ms, %s result imported" % (time_use, insert_count)
exit(0)

