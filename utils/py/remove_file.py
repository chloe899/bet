#! /usr/bin/env python
# -*- coding: utf-8 -*
import os
import re
from os import path

files = os.listdir("data")
for file_name in files:
    if re.match("\d{4}-\d{2}-\d{2}", file_name):
        arr = re.split("-", os.path.basename(file_name))
        new_file = "data/" + arr[0] + "/" + arr[1]
        if not path.exists("data/" + arr[0]):
            os.mkdir("data/" + arr[0])
        if not path.exists(new_file):
            os.mkdir(new_file)
        new_file = new_file + "/" + file_name
        old_file = "data/" + file_name
        print("old file:{}, new file:{}".format(old_file, new_file))
        os.rename(old_file, new_file)
print "complete";

