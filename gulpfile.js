var
  cldrDownloader = require('cldr-data-downloader'),
  cldr = require('cldr-data'),
  concat = require('gulp-concat'),
  connect = require('gulp-connect'),
  cssnano = require('gulp-cssnano'),
  debug = require('gulp-debug'),
  del = require('del'),
  fs = require('fs'),
  es = require('event-stream'),
  globalizeCompiler = require('globalize-compiler'),
  gulpif = require('gulp-if'),
  gzip = require('gulp-gzip'),
  inject = require('gulp-inject'),
  inline = require('gulp-inline-source'),
  install = require('gulp-install'),
  mkdirp = require('mkdirp'),
  newer = require('gulp-newer'),
  order = require('gulp-order'),
  scss = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  uglify = require('gulp-uglify'),
  watch = require('gulp-watch'),
  yargs = require('yargs').argv,
  gulp = require('gulp');

var scssOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

var src = './src/'
var targetName = 'dist/debug'
if (yargs.production) {
  targetName = 'dist/prod';
}
var target = './' + targetName + '/' // target dir

// with a fresh install, and no node_modules included with source, gulp-install
// won't be available to run, so a 'npm install' would be required anyway. not
// seeing much use in this function (and still can't get it to run only if
// package.json is newer than node_modules).
gulp.task('deps', function() {
  // install any necessary dependencies (per the package.json).  this is a
  // slow task, so only run if package.json is newer than node_modules dir.
  return gulp.src(['package.json'])
    .pipe(newer('node_modules'))
    .pipe(install());
});

gulp.task('clean', function() {
  return del([
    target + '**/*'
  ])
});

gulp.task('copy-components', function() {
  return gulp.src(src + 'components/**/*.html')
    .pipe(gulp.dest(target + 'components/'));
});

gulp.task('globalize-compile', function(callback) {
  var extracts = [src + 'js/globalizer.js'].map(function(input) {
    return globalizeCompiler.extract(input);
  });

  var messagesObj = JSON.parse(fs.readFileSync(src + 'config/messages.json', 'utf8'));

  var targetPath = target + 'js/'
  mkdirp(targetPath)

  // TODO: this works, but takes a long time, and is probably too excessive for
  // 99.99% of the cases.  Instead, locales are read from config/common.js
  //var locales = cldr.availableLocales;
  eval(fs.readFileSync(src + 'config/common.js') + '')
  var locales = Object.keys((new CommonConfig()).locales)
  for (var i = 0; i < locales.length; i++) {
    var locale = locales[i];
    if (!messagesObj.hasOwnProperty(locale)) {
      // fallback on en
      messagesObj[locale] = messagesObj.en
    }
    try {
      var bundle = globalizeCompiler.compileExtracts({
        defaultLocale: locale,
        messages: messagesObj,
        extracts: extracts
      });
      fs.writeFileSync(targetPath + 'formatters-' + locale + '.js', bundle);
    } catch (err) {

    }
  }
  callback();
})

gulp.task('vendor-js', function() {
  return gulp.src([
      './node_modules/jquery/dist/jquery.js',
      './node_modules/uikit/dist/js/uikit.js',
      './node_modules/riot/riot+compiler.js',
      './node_modules/loglevel/dist/loglevel.js',

      // from https://github.com/jquery/globalize/blob/master/examples/globalize-compiler/production.html
      "./node_modules/globalize/dist/globalize-runtime.js",
      'node_modules/globalize/dist/globalize-runtime/message.js',
      'node_modules/globalize/dist/globalize-runtime/number.js',
      'node_modules/globalize/dist/globalize-runtime/plural.js',
      'node_modules/globalize/dist/globalize-runtime/date.js', // load after number.js
      'node_modules/globalize/dist/globalize-runtime/currency.js', // load after number.js
      'node_modules/globalize/dist/globalize-runtime/relative-time.js', // load after number.js and plural.js

      // require.js for loading pre-compiled globalize data
      //'node_modules/requirejs/require.js'
    ])
    .pipe(debug({
      "title": "vendor-js"
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpif(yargs.production, uglify()))
    // concat order wrt uglify seems to matter
    .pipe(concat('vendors.js'))
    // write sourcemap to same dir as source file, and tell the client to find it at /js
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: '/js'
    }))
    // nevermind on gzip?  CDN servers will gzip automatically?  gzip files don't work
    // well with dev servers like node's on-the-fly http-server without additional config
    //.pipe(gulpif(yargs.production, gzip({append:false})))
    .pipe(gulp.dest(target + 'js/'));
});

gulp.task('vendor-css', function() {
  return gulp.src([
      './node_modules/uikit/dist/css/uikit.css',
    ])
    .pipe(sourcemaps.init())
    // TODO: cssnano seems broken with gulp 4 for now
    //.pipe(gulpif(yargs.production, cssnano()))
    .pipe(concat('vendors.css'))
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: '/css'
    }))
    //.pipe(gulpif(yargs.production, gzip({append:false})))
    .pipe(gulp.dest(target + 'css/'));
});

gulp.task('app-js', function() {
  var userConfigSource = src + 'config/user.js'
  var commonConfigSource = src + 'config/common.js'
  var targetConfigSource = src + 'config/dev.js'
  if (yargs.production) {
    targetConfigSource = src + 'config/prod.js'
  }
  // lesson learned.  use gulp.src for ordering, not gulp-order which
  // gave arbitrary results.
  return gulp.src([
      src + 'js/**/patchLogLevelName.js', //patches to vendors
      userConfigSource, // user config settings
      commonConfigSource, // common settings
      targetConfigSource, // target specific settings
      src + 'js/**/mixins.js',
      src + 'js/**/!(app|main)*.js', // all other files, i.e. workers
      src + 'js/**/app.js', // composition root
      src + 'js/**/main.js' // bootstrap
    ])
    .pipe(debug({
      "title": "app-js"
    }))
    .pipe(sourcemaps.init())
    .pipe(gulpif(yargs.production, uglify()))
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: '/js'
    }))
    //.pipe(gulpif(yargs.production, gzip({append:false})))
    .pipe(gulp.dest(target + 'js/'));
});

gulp.task("app-css", function() {
  var scssStream = gulp.src(src + "components/**/*.scss")
    //        .pipe(debug({"title":"scss"}))
    .pipe(scss(scssOptions)).on('error', scss.logError)

  var staticCssStream = gulp.src(src + 'css/**/*.css')

  var cssStream = es.merge(scssStream, staticCssStream)
    .pipe(sourcemaps.init())
    // TODO: cssnano seems broken with gulp 4 for now
    //.pipe(gulpif(yargs.production, cssnano()))
    .pipe(concat('app.css'))
    .pipe(sourcemaps.write('.', {
      sourceMappingURLPrefix: '/css'
    }))
    //.pipe(gulpif(yargs.production, gzip({append:false})))
    .pipe(gulp.dest(target + "css/"));

  return cssStream;
});

gulp.task('index-html-includes', function() {
  return gulp.src(src + 'index.html')
    .pipe(inject(
      gulp.src([
        //target + 'js/**/formatters-es.js',
        //target + 'js/**/formatters-en.js',
        //target + 'js/**/formatters-de.js',
        target + 'js/**/!(formatters)*.js',
        target + 'components/**/*.html',
        target + 'css/**/*.css'
      ], {
        read: false
      })
      //		.pipe(debug({"title":"target css and js and html files. /" + targetName + '/js/vendors.js'}))
      .pipe(order([
        '**/vendors.js',
        //'**/formatters*.js',
        '**/app.js',
        '**/vendors.css',
        '**/app.css'
      ])), {
        transform: function(filepath) {
          if (filepath.slice(-5) === '.html') {
            return '<script src="' + filepath + '" type="riot/tag" inline></script>'
          } else if (filepath.slice(-3) === '.js') {
            return '<script src="' + filepath + '" inline></script>';
          }
          if (filepath.slice(-4) === '.css') {
            return '<link rel="stylesheet" href="' + filepath + '" inline>';
          }
          // Use the default transform as fallback:
          return inject.transform.apply(inject.transform, arguments);
        },
        ignorePath: targetName,
        removeTags: true
      }
    ))
    // TODO: inlining concated, minified code doesn't work with sourcemaps.
    // Stepping into a JS file, for example, puts the current instruction on
    // the wrong line.  change to production if there is a fix around.
    .pipe(gulpif(yargs.productionn,
      inline({
        rootpath: targetName,
        compress: false
      })))
    //        .pipe(gulpif(yargs.production, gzip()))
    .pipe(gulp.dest(target))
});

gulp.task('build', gulp.series(
  //'clean',
  gulp.parallel('copy-components', 'app-css', 'globalize-compile', 'app-js', 'vendor-css', 'vendor-js'),
  'index-html-includes'
))

gulp.task('run', function() {
  // monitor the entire source directory, brute force style.  mainly to prevent
  // using the same glob patterns as above.  DRY.  if anything changes, re-run
  // the entire build (it's quick).  since this is an SPA, then the aim is to
  // regenerate the index.html file.  then, monitor that for changes (below)
  // to live reload.
  gulp.watch(src + '**/*', gulp.series('build'))

  // oddly enough, this works beautifully in IE by default.  chrome has issues
  // and the LiveReload chrome extension MUST be installed for this to work.
  // ALSO, if live reload is not working, you may need to load the web page
  // AFTER the server is started to get the livereload port connection going
  // correctly.  if the server is brought down, then the livereload connection
  // on the browser side is lost and won't work.
  gulp.watch(target + 'index.html', function() {
    return gulp.src(target + 'index.html')
      .pipe(connect.reload())
  })

  // not sure how to return this to avoid "did you forget to signal async" error
  // but it works.
  connect.server({
    root: targetName,
    fallback: target + "index.html",
    livereload: true
  });

});
