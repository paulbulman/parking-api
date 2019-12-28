#!/bin/sh
if [ "$CODEBUILD_BUILD_SUCCEEDING" = "1" ]
then
  rm -rf node_modules
  npm i --production
  zip -r src.zip .
  aws lambda update-function-code --function-name $FUNCTION_NAME --zip-file fileb://src.zip
fi