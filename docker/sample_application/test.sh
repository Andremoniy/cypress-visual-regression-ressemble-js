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

npm start&
health_check

echo "Running cypress installation and test"

cd sample_application_cypress
npm i
npm run cypress:run

