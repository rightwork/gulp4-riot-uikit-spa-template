var RiotUtils = {
  /*
  JSON.parse doesn't handle undefined well.
  def -- default object to return if str is undefined.  {} or [] are popular
  */
  jsonParse: function(str, def) {
    if (typeof def === 'undefined') {
      def = {}
    }
    return (str && JSON.parse(str)) || def
  },

  filenameWithoutExtension: function(path) {
    return path.split('/').pop().split('.').shift()
  },

  /**
   * WARN: use with caution, as this is implementation specific.  Could not find a
   * way to check to see if a tag exists
   */
  tagNames: function() {
    var riotTagEls = $("script[type='riot/tag']")
    var riotTagNames = riotTagEls.map(function() {
      return RiotUtils.filenameWithoutExtension(this.src)
    }).get()

    return riotTagNames
  },

  /**
   * Tag names are currently pulled from the following places (in {}):
   *  <script src="/path/to/{tag-name}.ext" type="riot/tag"
   *   OR
   *  <{tag-name}></tag-name>
   * If neither of these places are returning matches, then the default is to
   * just return true, and trust that it exists (rather than fail and display
   * a blank element.)  Unfortunately, riot doesn't provide a way to list tags
   * by name.  TODO: change this when/if riot provides that capability.
   */
  tagExists: function(name) {
    var inDom = $(name).length
    var tagNames = RiotUtils.tagNames()
    var noDomAndNoTagNames = !inDom && !tagNames.length
    if (noDomAndNoTagNames) {
      return true
    } else if (inDom || $.inArray(name, tagNames) > -1) {
      return true
    } else {
      return false
    }


  },

  // parse javascript object (i.e. JSON but keys aren't required to have quotes)
  jobjParse: function(str) {
    // thanks: http://stackoverflow.com/a/26291352/4978821
    str = str
      // wrap keys without quote with valid double quote
      .replace(/([\$\w]+)\s*:/g, function(_, $1) {
        return '"' + $1 + '":'
      })
      // replacing single quote wrapped ones to double quote
      .replace(/'([^']+)'/g, function(_, $1) {
        return '"' + $1 + '"'
      })
    return RiotUtils.jsonParse(str)
  },

  jsonStringifyOnce: function(obj, replacer, indent) {
    // thanks http://stackoverflow.com/questions/11616630/json-stringify-avoid-typeerror-converting-circular-structure-to-json
    var printedObjects = [];
    var printedObjectKeys = [];

    function printOnceReplacer(key, value) {
      if (printedObjects.length > 2000) { // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
        return 'object too long';
      }
      var printedObjIndex = false;
      printedObjects.forEach(function(obj, index) {
        if (obj === value) {
          printedObjIndex = index;
        }
      });

      if (key == '') { //root element
        printedObjects.push(obj);
        printedObjectKeys.push("root");
        return value;
      } else if (printedObjIndex + "" != "false" && typeof(value) == "object") {
        if (printedObjectKeys[printedObjIndex] == "root") {
          return "(pointer to root)";
        } else {
          return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase() : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
        }
      } else {

        var qualifiedKey = key || "(empty key)";
        printedObjects.push(value);
        printedObjectKeys.push(qualifiedKey);
        if (replacer) {
          return replacer(key, value);
        } else {
          return value;
        }
      }
    }
    return JSON.stringify(obj, printOnceReplacer, indent);
  },

  nonNestedObjToQueryString: function(json) {
    return '?' +
      Object.keys(json).map(function(key) {
        return encodeURIComponent(key) + '=' +
          encodeURIComponent(json[key]);
      }).join('&');
  },

  queryStringToObj: function(query) {
    // thanks http://stackoverflow.com/a/3401265/4978821
    if (query == '') return null;

    var hash = {};

    var vars = query.split("&");

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      var k = decodeURIComponent(pair[0]);
      var v = decodeURIComponent(pair[1]);

      // If it is the first entry with this name
      if (typeof hash[k] === "undefined") {

        if (k.substr(k.length - 2) != '[]') // not end with []. cannot use negative index as IE doesn't understand it
          hash[k] = v;
        else
          hash[k] = [v];

        // If subsequent entry with this name and not array
      } else if (typeof hash[k] === "string") {
        hash[k] = v; // replace it

        // If subsequent entry with this name and is array
      } else {
        hash[k].push(v);
      }
    }
    return hash;
  },

  isTag: function(el) {
    return el.hasOwnProperty("_tag")
  },

  isObservable: function(el) {
    return el.hasOwnProperty("trigger")
  },

  isMounted: function(el) {
    return el._tag && el._tag.isMounted
  },

  elToTag: function(el) {
    return el._tag
  },

}
