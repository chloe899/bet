#! /usr/bin/env python
# -*- coding: utf-8 -*
import  sys,os,string,io
def get_files(root_dir='models', arr=[]):
    for lists in os.listdir(root_dir):
        path = os.path.join(root_dir, lists)
        if not os.path.isdir(path):
            #print path
            arr.append(path)
        if os.path.isdir(path):
            get_files(path, arr)
    return arr
def get_export_name(basename):
    arr = basename.split("_")
    export_name= ""
    for sub in arr:
        export_name += string.upper(sub[0:1]) + sub[1:]
    return export_name


def gen_script():
    files = get_files()
    str = "exports.Match = require(\"./game\");"
    files.sort()
    for file in files:
        basename = os.path.basename(file)
        basename, ext = os.path.splitext(basename)
        export_name =  get_export_name(basename)
        print basename
        print ext
        if basename == "index":
            continue
        str = str + "\r\nexports.{0} = require('./{1}');".format(export_name,basename);
        print file
    fp = open('models/index.js', 'w')

    fp.write(str)
    print str


gen_script()