(function() {
  'use strict';

  var core = angular.module('app.core');

  /* @ngInject */

  var config = {
    appErrorPrefix: '[Angular Barebones Error] ',
    appTitle: 'Angular Barebones'
  };

  core.value('config', config);

  core.config(configure);

  configure.$inject = [
    '$logProvider',
    'routerHelperProvider',
    'exceptionHandlerProvider'
  ];
  /* @ngInject */
  function configure(
    $logProvider,
    routerHelperProvider,
    exceptionHandlerProvider
  ) {
    if ($logProvider.debugEnabled) {
      $logProvider.debugEnabled(true);
    }
    exceptionHandlerProvider.configure(config.appErrorPrefix);
    routerHelperProvider.configure({
      defaultRoute: 'root',
      defaultRouteUrl: '/',
      docTitle: config.appTitle + ' | '
    });
  }

})();
