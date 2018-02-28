const os = require('os');
const utils = {};

const logDivider = '-----------------------------------------------------------------';

utils.log = function(items) {
  console.log(os.EOL);

  items.forEach((item)=> {
    if (item === 'divider') item = logDivider;

    console.log(item);
  });
}

module.exports = utils;
