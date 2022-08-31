#!/bin/sh

if [ -z "$NEXT_BACKEND_API_URL" ]
then
    echo "please set the NEXT_BACKEND_API_URL environment variable" 1>&2
    exit
fi

# replace the environment variable placeholder tokens
# and move the file manually to circumvent permissions issues
sed 's@__NEXT_BACKEND_API_URL__@'"$NEXT_BACKEND_API_URL"'@' server.js > /tmp/server.js
echo "using NEXT_BACKEND_API_URL=$NEXT_BACKEND_API_URL"
cat /tmp/server.js > server.js
rm /tmp/server.js

node server.js
