#!/usr/bin/env bash
cd /development/lottery/
python utils/py/create_plan.py
node spider
node import_to_db
node utils/update_bet
node utils/award
