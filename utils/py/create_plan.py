#! /usr/bin/env python
# -*- coding: utf-8 -*

import os
from os import path
from datetime import datetime as dt
from datetime import timedelta

import pymongo

conn = pymongo.MongoClient("localhost", port=27017)
db = getattr(conn, "lottery")
last_plan = db.request_plan.find_one({}, {"created_at": -1})
print last_plan
date = dt.now()
now = dt.now()
oneday = timedelta(days=1)
if last_plan is not None:
    # print last_plan
    date = last_plan["created_at"]
# date = dt(2015,07,01)
def add_plan(plan_date):
    file_path = "data/bet/"
    year = plan_date.strftime("%Y")
    month = plan_date.strftime("%m")
    dir_one = file_path + year
    dir_two = dir_one + "/" + month
    name = plan_date.strftime("%Y-%m-%d")
    full_path = dir_two + "/" + name
    url = "http://trade.500.com/jczq/?date=" + name + "&playtype=both"
    plan = db.request_plan.find_one({"url": url})
    if plan is None:
        db.request_plan.insert({"url": url, "created_at": now, "file_path": full_path, "download_times": 0})
        print "insert new plan"
        print plan
        print url
    if not path.exists(dir_one):
        os.mkdir(dir_one)
    if not path.exists(dir_two):
        os.mkdir(dir_two)
    print name


def add_league_plan():
    url = "http://liansai.500.com/"
    plan = db.request_plan.find_one({"url": url})
    full_path = "data/league/500_league.html"
    if plan is None:
        db.request_plan.insert({"url": url, "created_at": now, "file_path": full_path, "download_times": 0})
        print "insert new plan"
        print plan
        print url

while True:
    if date > now:
        break
    add_plan(date)
    date = date + oneday

add_plan(now)
add_league_plan()
