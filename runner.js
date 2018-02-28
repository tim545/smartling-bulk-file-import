#!/usr/bin/env node

const newman = require('newman');
const collection = require('./collection.json');
const glob = require('glob');
const auth = require('./auth.js');
const os = require('os');
const logMultiline = require('./utils.js').log;
const fs = require('fs');
const settings = require('./settings.json');

const newmanOptions = {
  collection: collection,
  reporters: ['cli'],
  iterationData: [],
  environment: {
    values: []
  }
};

function applySettings() {
  newmanOptions.environment.values = [
    {enabled: true, key: 'auth', value: '', type: 'text'},
    {enabled: true, key: 'project', value: settings.project, type: 'text'},
    {enabled: true, key: 'locale', value: settings.targetLocale, type: 'text'},
    {enabled: true, key: 'fileType', value: (settings.fileType || 'json'), type: 'text'},
    {enabled: true, key: 'fileUri', value: settings.fileUri, type: 'text'},
    {enabled: true, key: 'directory', value: settings.directory, type: 'text'},
    {enabled: true, key: 'translationState', value: settings.translationState, type: 'text'},
    {enabled: true, key: 'overwrite', value: (settings.overwrite || "false"), type: 'text'}
  ];
}

function getFiles() {
  return new Promise((resolve, reject)=> {
    glob(`${settings.directory}/*.${settings.fileType}`, (err, files)=> {
      const parsedFiles = files.map((filename)=> {
        return {
          fileName: filename.slice(filename.lastIndexOf('/')+1, filename.lastIndexOf('.'))
        };
      });

      resolve(parsedFiles);
    });
  });
}

function setAuthToken(token) {
  newmanOptions.environment.values.forEach((env)=> {
    if (env.key === 'auth') env.value = token;
  });
}

function uploadFiles(files) {
  newmanOptions.iterationData = files;

  console.log(`Attempting to upload ${files.length} files to ${settings.targetLocale}:`, os.EOL);

  const runner = newman.run(newmanOptions);

  runner.on('start', function (err, args) {
    console.log('running a collection...', os.EOL);
  });

  runner.on('request', function(err, args) {
    if (err) console.error(err);
    console.log(args.response.stream.toString());
  });

  runner.on('done', function (err, summary) {
    if (err || summary.error) {
      console.error('collection run encountered an error.');
    } else {
      logMultiline(['divider', 'Translation import completed', 'divider', os.EOL]);
    }

    process.exit();
  })

  runner.on('exception', function(err, args) {
    console.error('ERROR:', '\n', err);
  });
}

function validateSettings() {
  const notValid = (err)=> {
    console.error('ERROR:', err, os.EOL);
  };

  if (settings.directory === undefined || !fs.existsSync(settings.directory) || !fs.statSync(settings.directory).isDirectory())
    return notValid('The directory setting must be a valid directory in the current file system');

  if (settings.targetLocale == undefined)
    return notValid('targetLocale setting is required. Files will be uploaded as the provided locale to Smartling');

  if (!settings.targetLocale.match(/^([a-z]){2}-([A-Z]){2}$/))
    return notValid('target locale setting must be in the form of xx-XX');

  if (settings.project === undefined)
    return notValid('project setting is required. This should be the Smartling project ID from your Smartling dashboard');

  if (settings.fileUri === undefined)
    return notValid('fileUri setting is required. This is the file location set on your Smartling dashboard');

  // Set default file type
  if (settings.fileType === undefined) {
    settings.fileType = 'json';
    console.warn('WARNING: No fileType setting specified, using ".json" by default', os.EOL);
  }

  if (settings.overwrite === undefined || typeof settings.overwrite === 'boolean') {
    settings.overwrite = 'false';
    console.warn('WARNING: Overwrite setting not specified, using "false" by default', os.EOL);
  }

  if (settings.translationState === undefined || !['PUBLISHED', 'POST_TRANSLATION'].includes(settings.translationState)) {
    settings.translationState = 'PUBLISHED';
    console.warn('WARNING: translationState setting not specified or not valid, using "PUBLISHED" by default', os.EOL);
  }

  // Remove directory trailing slash
  if (settings.directory.slice(settings.directory.length-1) === '/') {
    settings.directory = settings.directory.slice(0, -1);
    console.warn('WARNING: Trailing "/" removed from directory setting', os.EOL);
  }

  return true;
}


// Actions
// ---
logMultiline(['divider', 'Smartling bulk translation import', 'divider']);

if (validateSettings()) {
  applySettings();

  auth().then((token)=> {
    setAuthToken(token);

    getFiles().then((files)=> {
      uploadFiles(files);

    }).catch((err) => console.error('Retrieving upload files failed:', err, os.EOL));
  }).catch((err) => console.error('Authentication failed:', err, os.EOL));
}
