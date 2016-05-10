module.exports = function() {
  var client = './src/client';
  var relativeClient = 'src/client';
  var server = './src/server';
  var relativeServer = 'src/server';
  var clientApp = client + '/app';
  var relativeClientApp = relativeClient + '/app';
  var cssDir = client + '/styles'
  var root = './';
  var temp = './.tmp';
  var wiredep = require('wiredep');
  var bowerFiles = wiredep({ devDependencies: true })['js'];
  var bower = {
    json: require('./bower.json'),
    directory: relativeClient + '/bower_components',
    ignorePath: '../..'
  };
  var ngdocs = {
      dest: relativeClient + '/docs/',
      sections: {
          client: {
              glob: [relativeClientApp + '/**/*.js'],
              title: 'Client'
          }
      },
      options: {
          title: 'Angular Barebones',
          titleLink: 'https://github.com/jfeigel/angular-barebones',
          imageLink: 'https://github.com/jfeigel/angular-barebones',
          startPage: '/client/app.root',
          bestMatch: true,
          html5Mode: false
      }
  };
  var nodeModules = 'node_modules';

  var config = {
    /**
     * File paths
     */
    // all javascript that we want to vet
    alljs: [
      './src/**/*.js',
      './*.js'
    ],
    build: './build',
    client: client,
    clientApp: clientApp,
    cssDir: cssDir,
    css: cssDir + '/styles.css',
    fonts: bower.directory + '/font-awesome/fonts/**/*.*',
    html: client + '/**/*.html',
    htmltemplates: relativeClientApp + '/**/*.html',
    images: client + '/images/**/*.*',
    index: client + '/index.html',
    // app js, with no specs
    js: [
      relativeClientApp + '/**/*.module.js',
      relativeClientApp + '/**/*.js',
      '!' + relativeClientApp + '/**/*.spec.js'
    ],
    jsOrder: [
      relativeClientApp + '/app.module.js',
      relativeClientApp + '/**/*.module.js',
      relativeClientApp + '/**/*.route.js',
      relativeClientApp + '/**/*.controller.js',
      relativeClientApp + '/**/*.js'
    ],
    sass: cssDir + '/_src/**/*.scss',
    ngdocs: ngdocs,
    root: root,
    server: server,
    source: './src/',
    temp: temp,

    /**
     * optimized files
     */
    optimized: {
      app: 'app.js',
      lib: 'lib.js'
    },

    /**
     * template cache
     */
    templateCache: {
      file: 'app.templates.js',
      options: {
        module: 'app.core',
        root: 'app/',
        standalone: false
      }
    },

    /**
     * Bower and NPM files
     */
    bower: bower,
    packages: [
      './package.json',
      './bower.json'
    ],

    /**
     * Node settings
     */
    nodeServer: server + '/app.js',
    defaultPort: '8001'
  };

  /**
   * wiredep and bower settings
   */
  config.getWiredepDefaultOptions = function() {
    var options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };
    return options;
  };

  return config;
};
