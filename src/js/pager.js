function Pager(appConfig, logger, eventBus, router, auth) {
  var self = this

  eventBus.onBroadcast(self, 'route-updated', function(pageName) {
    if(pageName){
      self.showPage(pageName)
    }
    else {
      self.redirectToHomePage()
    }
  })

  self.authenticateAndAuthorizeForTag = function(tag) {
    if (!auth.authenticate()) {
      self.unmount(tag)
      self.redirectToLoginPage()
    } else if (!auth.authorizeForTag(tag)) {
      self.unmount(tag)
      self.redirectToNotAuthorizedPage(tag)
    }
  }

  self.redirectToHomePage = function() {
    router.redirect(appConfig.homePage)
  }

  self.redirectToNotAuthorizedPage = function() {
    router.redirect(appConfig.notAuthorizedPage)
  }

  self.redirectToErrorPage = function(number, message) {
    var url = appConfig.errorPage + router.toQueryStr({
      number: number,
      message: message
    })
    router.redirect(url)
  }

  self.redirectToPostLoginPage = function() {
    router.navigateToReturnUrlOr(appConfig.welcomePage)
  }

  self.redirectToLoginPage = function() {
    router.redirect(appConfig.loginPage + router.encodeReturnUrl())
  }

  /*
   riot.js supplement to unmount a tag and mount a new one.
  */
  this.showPage = function(name, options) {
    logger.trace('pager.showPage: ' + name)

    // IMPROVE: find a way to check that tag is also a page
    if(!RiotUtils.tagExists(name)){
      self.redirectToErrorPage("404", "Page does not exist")
      return
    }

    var alreadyShowing = false

    var pages = $(".page").each(function(index, page) {
      if (RiotUtils.isTag(page) && RiotUtils.isMounted(page)) {
        if (name == page.nodeName.toLowerCase()) {
          alreadyShowing = true
        } else {
          self.unmount(RiotUtils.elToTag(page))
        }
      }
    })

    if (!alreadyShowing) {
      self.mountPage(name)
    }
  }

  this.mountPage = function(name, options){
    var mainEl = $("main")
    if(mainEl.length){
      mainEl.prepend("<" + name + " class='page'>" + "</" + name + ">")
      riot.mount(name)
    }
    else{
      logger.error("Could not find <main> element to put page!")
    }
  }
  /*
  Much wasted time over this one.  riot.unmount removes the html element.
  When trying to mount again, the html element doesn't exist so nothing is
  rendered.  there is riot.unmount(true), which means to keep the parent
  element, except that it still renders the parent element without rendering
  the children element.  what is needed is an unmount that keeps the mount
  point, so that it can be mounted again.  that is what this func does.
    https://github.com/riot/riot/issues/576
     and
    https://github.com/riot/riot/issues/575
  don't seem to help. TODO: remove this comment when ready
  */
  self.unmount = function(tag) {
    //var el = tag.root
    //var clone = el.cloneNode(false)
    //$(clone).insertAfter($(el))
    tag.unmount()
  }

}
