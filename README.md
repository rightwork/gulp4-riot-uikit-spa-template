# gulp4-riot-uikit-spa-template
Starter template for an SPA using gulp4, riotjs, and uikit

1. Install NPM
2. Install [gulp4](http://blog.reactandbethankful.com/posts/2015/05/01/how-to-install-gulp-4/)
3. Clone repo
4. CD into repo
5. run `npm install`
6. run `gulp build`
7. run `gulp run`
8. open webrowser to `http://localhost:8080/`

Live reload is used, so hack away in your favorite editor and watch your changes live update in the browser.  Live reload will be triggered any time a file in the src/ directory is changed.

# Configurations
The default gulp commands are considered "dev".  To create or run a production build, tack on `--production` to the `gulp build` and `gulp run` commands.

# Components directory
The components directory contains all layouts, pages, and riot components.  layouts and pages are also riot components.

# Pages
Pages are riot tags with content that is intended to belong in HTML [<main>](http://html5doctor.com/the-main-element/) tags

# Layouts
Layouts are content in the body of the HTML document that contain headers, footers, side bars, etc... Like pages, layouts are just riot components, and can therefore contain nested riot components, such as a leftnav component.  Layouts can be loaded on the fly without impacting the currently loaded page.

# Magic
Where possible, I try not to do things by convention (i.e. magic).  However, there were a few spots I got lazy and/or couldn't help myself:

* Page names must be the same as the filename that contains it
* Layout names must be the same as the filename that contains it
* The url base is the name of the page.  I.e, if there is a riot tag file in the components directory called `page-home` then its URL is /page-home
* All files in the src directory are automatically referenced in the index.html via gulp build.  All that's needed is to create a page file (i.e. page-test.html) in the component directory, and then it is automatically accessible via `/page-test` after doing a `gulp build`
