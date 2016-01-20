function EventBus(logger){
  var self = riot.observable(this)
  self.eventBus = riot.observable()

  self.broadcast = function(tag, events/*, varargs*/ ) {
    logger.trace("broadcast: " + events + ' ' + RiotUtils.jsonStringifyOnce(arguments))
    var slicedArgs = Array.prototype.slice.call(arguments, 1);
    if(RiotUtils.isObservable(tag)){
      tag.trigger.apply(tag, slicedArgs)
    }
    return self.eventBus.trigger.apply(self.eventBus, slicedArgs)
  }

  self.onBroadcast = function(tag, events, fn) {
    logger.trace("onBroadcast: " + events)
    if(RiotUtils.isObservable(tag)){
      tag.on('before-unmount', function(){
        self.eventBus.off(events, fn)
      })
      tag.on(events, fn)
    }
    return self.eventBus.on(events, fn)
  }
}
