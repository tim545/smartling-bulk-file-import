#!/usr/bin/env node

const https = require('https');
const os = require('os');
const args = process.argv.slice(2);
const settings = require('./settings.json');

const authOptions = {
  method: 'POST',
  protocol: 'https:',
  host: 'api.smartling.com',
  path: '/auth-api/v2/authenticate',
  headers: {
    'Content-Type': 'application/json'
  }
};

const postData = JSON.stringify({
  userIdentifier: settings.auth.userIdentifier,
  userSecret: settings.auth.userSecret
});

function authenticate() {
  console.log('Opening request to authenticate with Smartling API', os.EOL);

  return new Promise((resolve, reject)=> {
    const req = https.request(authOptions, (res) => {
      console.log(`STATUS: ${res.statusCode}`, os.EOL);

      var chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        var body = JSON.parse(Buffer.concat(chunks).toString());
        console.log('ACCESS TOKEN -', body.response.data.accessToken, os.EOL);

        resolve(body.response.data.accessToken);
      });
    });

    req.on('error', (e) => {
      console.error(`problem with request: ${e.message}`);
      reject(e);
    });

    // write data to request body
    req.write(postData);
    req.end();
  });
}

// A flag to run this file automatically can be parsed in to process args
if (args.includes('-a') || args.includes('--auto'))
  authenticate();

module.exports = authenticate;
