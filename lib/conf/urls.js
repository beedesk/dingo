var fs    = require('fs');
var util  = require('util');
var path  = require('path');

//  Env
var BASE_DIR    = path.dirname(require.main.filename);

function match(xregex, path) {
  // borrowed and modified from expressjs: lib/router/route.js
  var keys = xregex.keys
    , params = xregex.params = []
    , m = xregex.regexp.exec(path);

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];

    var val = 'string' == typeof m[i]
      ? utils.decode(m[i])
      : m[i];

    if (key) {
      params[key.name] = val;
    } else {
      params.push(val);
    }
  }

  return true;
}

function include(includepath) {
  var urlspath = path.join(BASE_DIR, includepath.replace('.', '/'));
  var patterns = require(urlspath).patterns;
  console.log('include: ' + JSON.stringify(patterns));
  return patterns;
}

function RegexURLPattern(regex, view) {
  function isView(view) {
    return (typeof(view) === 'string') || (typeof(view) === 'function');
  }
  function isPatterns() {
    return util.isArray(view);
  }

  var instance = {
    match: function(urlpath, fn) {
      var matched = urlpath.match(regex);
      if (!matched) {
        return false;
      }
      if (isView(view)) {
        fn(view);
      } else if (isPatterns(view)) {
        var remainder = urlpath.replace(regex, '');
        view.some(function(pattern) {
          if (pattern.match(remainder, fn)) {
            return false;
          }
        });
      } else {
        console.warn(util.format('unknown urlpattern %s type for url %s with regex.', view, urlpath, regex.source));
        return false;
      }
    }
  };
  return instance;
}

function patterns(prefix, args) {
  var list = [];
  var items = Array.prototype.slice.call(arguments).splice(1);
  items.forEach(function(item) {
    list.push(item);
  });
  return list;
}

function url(regex, view) {
  console.log(util.format('url(%s, %s)', regex, view));
  return RegexURLPattern(regex, view);
}

module.exports = {
    include: include,
    patterns: patterns,
    url: url
};
