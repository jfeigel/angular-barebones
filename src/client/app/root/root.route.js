(function() {
    'use strict';

    angular
        .module('app.root')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'root',
                config: {
                    url: '/',
                    templateUrl: 'app/root/root.html',
                    controller: 'RootController',
                    controllerAs: 'rootVm',
                    title: 'Root'
                }
            }
        ];
    }
})();
