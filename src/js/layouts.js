/**
 * Swap out an existing layout on the page with a new one.  Any main elements
 * within the layout are transferred from the old layout to the new.  Everything
 * else is removed and replaced by any new layout elements.
 * @param {AppConfig} appConfig [description]
 * @param {Logger} logger    [description]
 * @param {EventBus} eventBus  [description]
 */
function Layouts(appConfig, logger, eventBus) {
  var self = this

  /**
   * Detaches main element, removes existing layout, prepends new layout to body
   * element, and replaces new layout's main element with previously detached
   * one
   * @param  {string} name    layout name
   * @return {null}
   */
  this.showLayout = function(name) {
    logger.trace('layout.showLayout: ' + name)

    // IMPROVE: find a way to check that tag is also a layout
    if(!RiotUtils.tagExists(name)){
      // done differently than pager.showLayout, to keep layouts stupid
      eventBus.broadcast(self, 'layout.notfound')
      logger.error('Layouts.showLayout: ' + name + ' not found')
      return
    }

    var alreadyShowing = false
    var existingMain = []

    // unmount layouts, while preserving main element
    var layouts = $(".layout").each(function(index, layout) {
      if (RiotUtils.isTag(layout) && RiotUtils.isMounted(layout)) {
        if (name == layout.nodeName.toLowerCase()) {
          alreadyShowing = true
        } else {
          existingMain = self.unmountLayout(RiotUtils.elToTag(layout))
        }
      }
    })

    // if no layout classes exist (i.e. there is just a <main> under body), then
    // the above block extracted no main elements, and thus that needs to be
    // done here.
    if (!layouts.length) {
      existingMain = $("main").detach()
    }

    if (!alreadyShowing) {
      self.mountLayout(name, existingMain)
    }

    eventBus.broadcast(self, "layout-updated")
  }

  /**
   * Mount new layout and insert existingMain element
   * @param  {string} name         name of layout
   * @param  {element} existingMain main element detached from DOM
   * @return {null}
   */
  this.mountLayout = function(name, existingMain) {
    var bodyEl = $("body")
    if (bodyEl.length) {
      bodyEl.prepend("<" + name + " class='layout'>" + "</" + name + ">")
      riot.mount(name)
      if (existingMain.length) {
        var mainEl = $("main")
        if (mainEl.length) {
          mainEl.replaceWith(existingMain)
        } else {
          logger.error("Could not find <main> element to put page in layout " + name + "!")
        }
      } else {
        logger.warn("Main element not replaced, may be out of order wrt layout.")
      }
    } else {
      logger.error("Could not find <body> element to put layout " + name + "!")
    }
  }

/**
 * Umount standard riot tag, except if there is a main section within the tag,
 * it is detached from the DOM and returned
 * @param  {element} layoutTag existing, mounted, riot tag
 * @return {element}           detached main tag
 */
  this.unmountLayout = function(layoutTag) {
    var existingMain = $("main").detach()
    layoutTag.unmount()
    return existingMain
  }

}
