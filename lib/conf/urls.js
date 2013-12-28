var fs        = require('fs');
var util      = require('util');
var path      = require('path');
var settings  = require('../settings');

//  Env
var BASE_DIR    = path.dirname(require.main.filename);

var PARAM_PATTERN = /\(.*?\)/g;
var NAMED_PARAM_PATTERN = /\(\?P<([a-zA-Z_\$][0-9a-zA-Z_$]*)>(.*?)\)/;

var URL_PATTERN_STRICT  = settings.URL_PATTERN_STRICT || false;

function include(includepath) {
  var urlspath = path.join(BASE_DIR, includepath.replace('.', '/'));
  var patterns = require(urlspath).patterns;
  return patterns;
}

function compile(regexOrStr, names) {
  var regex = regexOrStr,
      source, tokens, match_key_regex;

  if (regexOrStr instanceof RegExp === false) {
    source = regexOrStr;
    tokens = source.match(PARAM_PATTERN) || [];
    tokens.every(function(token, n) {
      match_key_regex = token.match(NAMED_PARAM_PATTERN);
      if (match_key_regex) {
        names.push(match_key_regex[1]);
        source = source.replace(token, '(' + match_key_regex[2] + ')');
      }
    });
    regex = new RegExp(source);
  }
  if (!URL_PATTERN_STRICT) {
    if (regex.source === '' || endsWith(regex.source, '/$') || endsWith(regex.source, '/?$')) {
      // do nothing
    } else if (endsWith(regex.source, '$')) {
      regex = new RegExp(regex.source.slice(0, -1) + '/?$');
    }
  }
  return regex;
}

function hasNamedFunction(view, method) {
  if (method in view) {
    if (typeof(view[method]) === 'function') {
      return true;
    }
  }
  return false;
}

function isView(view) {
  if (typeof(view) === 'string') {
    return true;
  }
  if (typeof(view) === 'function') {
    return true;
  }
  if (typeof(view) === 'object') {
    var isView = false;
    ['options', 'get', 'head', 'post', 'put', 'delete', 'trace', 'connect'].some(function(method, n) {
      if (hasNamedFunction(view, method)) {
        isView = true;
        return true;
      }
    });
    return isView;
  }
  return false;
}

function isPatterns(view) {
  return util.isArray(view);
}

function getRemainder(urlpath, regex) {
  return urlpath.replace(regex, '');
}

function endsWith(str, suffix) {
  return str.slice(-suffix.length) == suffix;
};

function RegexURLPattern(regexOrStr, view) {
  var names = [],
      regex = compile(regexOrStr, names);

  var instance = {
    match: function(urlpath, fn, params) {
      var matches = urlpath.match(regex) || [],
          params  = params || {},
          matched = false;

      if (matches.length === 0) {
        return false;
      }

      // fill the params, if any
      matches.slice(1).every(function(match, n) {
        params[n] = match;
        if (n in names) {
          params[names[n]] = match;
        }
      });

      // dispatch
      if (isView(view)) {
        fn(view, params);
        matched = true;
      } else if (isPatterns(view)) {
        var remainder = getRemainder(urlpath, regex);
        view.some(function(pattern) {
          if (pattern.match(remainder, fn, params)) {
            matched = true;
            return true;
          }
        });
      }
      if (matched) {
        return true;
      }
      return false;
    },
    toString: function() {
      return util.format('%s -> %s', regexOrStr, view);
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
  return RegexURLPattern(regex, view);
}

module.exports = {
    include: include,
    patterns: patterns,
    url: url
};
