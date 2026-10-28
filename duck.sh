#!/bin/bash
# DuckDNS IP Update Script
DOMAIN="golden-money"
TOKEN="f3a4a66d-c134-4f14-98ee-c30b5dd1d3eb"

echo url="https://www.duckdns.org/update?domains=$DOMAIN&token=$TOKEN&ip=" | curl -k -o /tmp/duck.log -K -
