#!/bin/bash
if [ -d "/Applications/Google Chrome.app" ]; then
  open -na "Google Chrome" --args --app="http://192.168.100.13:8787/"
else
  open "http://192.168.100.13:8787/"
fi
