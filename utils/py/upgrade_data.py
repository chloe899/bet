#! /usr/bin/env python
# -*- coding: utf-8 -*

from os import path
import string
from datetime import datetime as dt
from pymongo import MongoClient


conn = MongoClient('localhost', port=27017)
db = conn.lottery


records = db.parse_record.find({})
plan = db.request_plan
for item in records:
    filename = path.basename(item["name"])
    url = "http://trade.500.com/jczq/?date=" + filename + "&playtype=both"
    arr = filename.split("-")
    arr = arr[0:2]
    file_path = "data/bet/" + string.join(arr, "/")
    file_path = file_path + "/" + filename

    r = plan.find_one({"url": url})
    # print r is None
    if r is None:
        # print "url:{},path:{}".format(url, file_path)
        now = dt.now()
        complete = path.exists(file_path)
        plan.insert({"created_at": now, "complete": complete, "last_modified": now, "url": url, "file_path": file_path})
    else:
        print r
        print "exists"
    oldPath = "data/" + filename

print "complete, exit 88"
exit(0)
