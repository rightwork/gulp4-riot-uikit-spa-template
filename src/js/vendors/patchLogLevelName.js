// for loglevel library, don't want log as a generic global.  renaming
// it will help accidental use of it as well
var logGlobalDontUseDirectly = log.noConflict();
