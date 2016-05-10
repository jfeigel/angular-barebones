/**
 * @ngdoc controller
 * @name app.root.controller:RootController
 * @description
 * Root controller for the whole application
 */
(function () {
    'use strict';

    angular
        .module('app.root')
        .controller('RootController', RootController);

    RootController.$inject = [];
    /* @ngInject */
    function RootController() {
        var vm = this;

        activate();

        ////////////

        function activate() {
            console.log("Root loaded!");
        }
    }
})();
