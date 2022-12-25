#!/bin/sh

npm i
health_check() {
  echo "Waiting NPM server to start..."
  until $(curl --output /dev/null --silent --head --fail http://localhost:3000); do
      printf '.'
      sleep 5
  done
  echo "Server started..."
}

for i in 1 2 3
do
  npm start&
  health_check
  echo "Killing npm server..."
  pkill -f node
done
npm start&
health_check

for i in 1 2 3 4 5
do
  echo "Warming up server, attempt N $i ..."
  curl --output /dev/null --silent --fail http://localhost:3000
done

echo "Running cypress installation and test"

cd sample_application_cypress
npm i
npm run cypress:run

