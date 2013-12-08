var fs = require('fs');
var path = require('path');
var util = require('util');

var setting_path = path.join(path.dirname(require.main.filename), 'settings');

var settings = (fs.existsSync(setting_path + '.js')?
           require(setting_path): undefined);

var defaults = {
  TMP_FOLDER: './tmp'
};

module.exports = util._extend(module.exports, util._extend(defaults, settings));
