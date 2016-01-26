function Router(basePath, logger, eventBus, _) {
  var self = riot.observable(this)

  self.base = function(path) {
    if (path) {
      self._base = path
      riot.route.base(path)
    }
    return self._base
  }
  self.base(basePath || "/")

  // don't care what the filter is, just want the first element which is
  // the page name.  pages, after they are mounted, will be responsible
  // for processing the rest.
  function second(path, filter) {
    var re = new RegExp('^([^/?#]*).*$')
    if (args = path.match(re)) return args.slice(1)
  }

  riot.route.parser(null, second)

  riot.route('*', function(pageName) {
    eventBus.broadcast(self, "route-updated", pageName)
  })

  self.urlFor = function(pageName, query) {
    if (!query) {
      var array = pageName.trim().match(/^(\S+)\s*(.*)/)
      pageName = array[1]
      queryStr = array[2]
      if (queryStr) {
        queryStr = "{" + queryStr + "}"
        query = RiotUtils.jobjParse(queryStr)
      }
    }

    if(!RiotUtils.tagExists(pageName)){
      logger.warn("Page " + pageName + " does not exist.")
    }
    return self.base() + pageName + self.toQueryStr(query)
  }

  self.route = riot.route

  self.redirect = function(url) {
    if(url.substring(0, self.base().length) != self.base()){
      url = self.base() + url
    }
    window.location.replace(url)
  }

  self.query = function() {
    var queryStr = window.location.search.slice(1);
    return RiotUtils.queryStringToObj(queryStr)
  }

  self.toQueryStr = function(obj) {
    if (!obj || $.isEmptyObject(obj)) {
      return ""
    } else {
      return RiotUtils.nonNestedObjToQueryString(obj)
    }
  }

  self.encodeReturnUrl = function() {
    var hashName = window.location.hash
    if (window.location.hash) {
      return "?returnUrl=" + encodeURIComponent(window.location.hash.replace('#', ''))
    } else {
      return "?returnUrl=" + encodeURIComponent(window.location.pathname)
    }
  }

  self.navigateToReturnUrlOr = function(url) {
    logger.trace('router.routeToReturnUrlOr: ')
    var q = riot.route.query()
    if (q.returnUrl) {
      self.route(decodeURIComponent(q.returnUrl))
    } else {
      self.route(url)
    }
  }

  self.start = function() {
    riot.route.start()
    riot.route.exec()
  }
}
