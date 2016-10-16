module.exports = () => {
  const client = './src/client';
  const relativeClient = 'src/client';
  const server = './src/server';
  const relativeServer = 'src/server';
  const clientApp = client + '/app';
  const relativeClientApp = relativeClient + '/app';
  const cssDir = client + '/styles'
  const root = './';
  const temp = './.tmp';
  const wiredep = require('wiredep');
  const bowerFiles = wiredep({ devDependencies: true })['js'];
  const bower = {
    json: require('./bower.json'),
    directory: relativeClient + '/bower_components',
    ignorePath: '../..'
  };
  const ngdocs = {
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
  const nodeModules = 'node_modules';

  const config = {
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
  config.getWiredepDefaultOptions = () => {
    const options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };
    return options;
  };

  return config;
};
