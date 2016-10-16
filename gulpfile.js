const args = require('yargs').argv;
const config = require('./gulp.config')();
const del = require('del');
const glob = require('glob');
const gulp = require('gulp');
const _ = require('lodash');
const path = require('path');
const plugins = require('gulp-load-plugins')({
  lazy: true
});

const colors = plugins.util.colors;

/**
 * List the available gulp tasks
 */
gulp.task('help', plugins.taskListing);
gulp.task('default', ['help']);

gulp.task('start', ['inject', 'start-server']);

/**
 * Watch all files to be compiled, run their respective compilation tasks,
 * and livereload.
 */
gulp.task('watch', () => {
  plugins.livereload.listen();

  gulp.watch([config.sass], ['inject', 'styles']);
  gulp.watch(config.js, ['wiredep', 'ngdocs']);
  gulp.watch([config.htmltemplates], ['templates']);
});

/**
 * Compile sass to css
 * @return {Stream}
 */
gulp.task('styles', ['clean-styles'], () => {
  log('Compiling SASS --> CSS');

  return gulp
    .src(config.sass)
    .pipe(plugins.plumber())
    .pipe(plugins.sass())
    .pipe(plugins.autoprefixer({
      browsers: ['last 2 version', '> 5%']
    }))
    .pipe(gulp.dest(config.cssDir))
    .pipe(plugins.livereload());
});

/**
 * Copy fonts
 * @return {Stream}
 */
gulp.task('fonts', ['clean-fonts'], () => {
  log('Copying fonts');

  return gulp
    .src(config.fonts)
    .pipe(gulp.dest(config.build + '/fonts'));
});

/**
 * Compress images
 * @return {Stream}
 */
gulp.task('images', ['clean-images'], () => {
  log('Compressing and copying images');

  return gulp
    .src(config.images)
    .pipe(plugins.imagemin({
      optimizationLevel: 4
    }))
    .pipe(gulp.dest(config.build + '/images'));
});

/**
 * Create $templateCache from the html templates
 * @return {Stream}
 */
gulp.task('templatecache', ['clean-code'], () => {
  log('Creating an AngularJS $templateCache');

  return gulp
    .src(config.htmltemplates)
    .pipe(plugins.if(args.verbose, plugins.bytediff.start()))
    .pipe(plugins.minifyHtml({
      empty: true
    }))
    .pipe(plugins.if(args.verbose, plugins.bytediff.stop(bytediffFormatter)))
    .pipe(plugins.angularTemplatecache(
      config.templateCache.file,
      config.templateCache.options
    ))
    .pipe(gulp.dest(config.clientApp));
});

gulp.task('templates', ['templatecache'], () => {
  log('Wiring the AngularJS templates into the html');
  const templateCache = config.clientApp + '/' + config.templateCache.file;

  return gulp
    .src(config.index)
    .pipe(inject(templateCache, 'templates', undefined, {
      relative: true,
      empty: true
    }))
    .pipe(gulp.dest(config.client));
});

/**
 * Wire-up the bower dependencies
 * @return {Stream}
 */
gulp.task('wiredep', () => {
  log('Wiring the bower dependencies into the html');

  const wiredep = require('wiredep').stream;
  const options = config.getWiredepDefaultOptions();

  // Only include stubs if flag is enabled
  const js = args.stubs ? [].concat(config.js, config.stubsjs) : config.js;

  return gulp
    .src(config.index)
    .pipe(wiredep(options))
    .pipe(inject(js, '', config.jsOrder, {
      relative: true,
      empty: true
    }))
    .pipe(gulp.dest(config.client))
    .pipe(plugins.livereload());
});

gulp.task('inject', ['wiredep', 'styles', 'templates'], () => {
  log('Wire the css into the html, after files are ready');

  return gulp
    .src(config.index)
    .pipe(inject(config.css, undefined, undefined, {
      relative: true,
      empty: true
    }))
    .pipe(gulp.dest(config.client));
});

/**
 * Compile the documentation
 * @return {Stream}
 */
gulp.task('ngdocs', () => {
  log('Compiling documentation');

  plugins.ngdocs.sections(config.ngdocs.sections)
    .pipe(plugins.ngdocs.process(config.ngdocs.options))
    .pipe(gulp.dest(config.ngdocs.dest));
});

/**
 * Publish the documentation to the `gh-pages` branch
 * @return {Stream}
 */
gulp.task('gh-pages', [], () => {
  log('Pushing docs to gh-pages');

  const ghpages = require('gh-pages');

  ghpages.publish(config.ngdocs.dest);
});

/**
 * Optimize all files, move to a build folder,
 * and inject them into the new index.html
 * @return {Stream}
 */
gulp.task('optimize', ['inject', 'test'], () => {
  log('Optimizing the js, css, and html');

  const assets = plugins.useref.assets({
    searchPath: './'
  });
  // Filters are named for the gulp-useref path
  const cssFilter = plugins.filter('**/*.css');
  const jsAppFilter = plugins.filter('**/' + config.optimized.app);
  const jslibFilter = plugins.filter('**/' + config.optimized.lib);

  const templateCache = config.temp + config.templateCache.file;

  return gulp
    .src(config.index)
    .pipe(plugins.plumber())
    .pipe(inject(templateCache, 'templates'))
    .pipe(assets) // Gather all assets from the html with useref
    // Get the css
    .pipe(cssFilter)
    .pipe(plugins.minifyCss())
    .pipe(cssFilter.restore())
    // Get the custom javascript
    .pipe(jsAppFilter)
    .pipe(plugins.ngAnnotate({
      add: true
    }))
    .pipe(plugins.uglify())
    .pipe(getHeader())
    .pipe(jsAppFilter.restore())
    // Get the vendor javascript
    .pipe(jslibFilter)
    .pipe(plugins.uglify()) // another option is to override wiredep to use min files
    .pipe(jslibFilter.restore())
    // Take inventory of the file names for future rev numbers
    .pipe(plugins.rev())
    // Apply the concat and file replacement with useref
    .pipe(assets.restore())
    .pipe(plugins.useref())
    // Replace the file names in the html with rev numbers
    .pipe(plugins.revReplace())
    .pipe(gulp.dest(config.build));
});

/**
 * Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', (done) => {
  const delconfig = [].concat(config.build, config.temp, config.report);
  log('Cleaning: ' + plugins.util.colors.blue(delconfig));
  del(delconfig, done);
});

/**
 * Remove all fonts from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-fonts', (done) => {
  clean(config.build + '/fonts/**/*.*', done);
});

/**
 * Remove all images from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-images', (done) => {
  clean(config.build + '/images/**/*.*', done);
});

/**
 * Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', (done) => {
  const files = [].concat(
    config.temp + '/**/*.css',
    config.build + '/styles/**/*.css'
  );
  clean(files, done);
});

/**
 * Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', (done) => {
  const files = [].concat(
    config.temp + '/**/*.js',
    config.build + '/js/**/*.js',
    config.build + '/**/*.html'
  );
  clean(files, done);
});

gulp.task('start-server', () => {
  plugins.nodemon({
      script: `${config.server}/app.js`,
      env: {
        'NODE_ENV': 'development'
      },
      watch: [
        'src/server/'
      ]
    })
    .on('start', ['ngdocs', 'watch'])
    .on('restart', () => {
      log('nodemon restarted');
      plugins.livereload();
    });
});

////////////////

/**
 * Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
  log('Cleaning: ' + plugins.util.colors.blue(path));
  del(path, done);
}

/**
 * Inject files in a sorted sequence at a specified inject label
 * @param   {Array} src   glob pattern for source files
 * @param   {String} label   The label name
 * @param   {Array} order   glob pattern for sort order of the files
 * @returns {Stream}   The stream
 */
function inject(src, label, order, options) {
  options = options || {};
  if (label) {
    options.name = 'inject:' + label;
  }

  return plugins.inject(orderSrc(src, order), options);
}

/**
 * Order a stream
 * @param   {Stream} src   The gulp.src stream
 * @param   {Array} order Glob array pattern
 * @returns {Stream} The ordered stream
 */
function orderSrc(src, order) {
  //order = order || ['**/*'];
  return gulp
    .src(src, {
      read: false
    })
    .pipe(plugins.if(order, plugins.order(order)));
}

/**
 * Formatter for bytediff to display the size changes after processing
 * @param  {Object} data - byte data
 * @return {String}      Difference in bytes, formatted
 */
function bytediffFormatter(data) {
  const difference = (data.savings > 0) ? ' smaller.' : ' larger.';
  return data.fileName + ' went from ' +
    (data.startSize / 1000).toFixed(2) + ' kB to ' +
    (data.endSize / 1000).toFixed(2) + ' kB and is ' +
    formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param  {Number} num       Number to format as a percent
 * @param  {Number} precision Precision of the decimal
 * @return {String}           Formatted perentage
 */
function formatPercent(num, precision) {
  return (num * 100).toFixed(precision);
}

/**
 * Format and return the header for files
 * @return {String}           Formatted file header
 */
function getHeader() {
  const pkg = require('./package.json');
  const template = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @authors <%= pkg.authors %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
  ].join('\n');
  return plugins.header(template, {
    pkg: pkg
  });
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof(msg) === 'object') {
    for (const item in msg) {
      if (msg.hasOwnProperty(item)) {
        plugins.util.log(plugins.util.colors.blue(msg[item]));
      }
    }
  } else {
    plugins.util.log(plugins.util.colors.blue(msg));
  }
}

/**
 * Show OS level notification using node-notifier
 */
function notify(options) {
  const notifier = require('node-notifier');
  const notifyOptions = {
    sound: 'Bottle',
    contentImage: path.join(__dirname, 'gulp.png'),
    icon: path.join(__dirname, 'gulp.png')
  };
  _.assign(notifyOptions, options);
  notifier.notify(notifyOptions);
}

module.exports = gulp;
