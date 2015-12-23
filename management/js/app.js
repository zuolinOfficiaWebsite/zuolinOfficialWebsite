window.myModule = angular.module('management', ['ngSanitize', 'ui.router', 'ngMaterial', 'ngAnimate', 'zeroclipboard', 'ng.zl', 'ng.zl.grid', 'ng.zl.pick', 'ng.zl.uploader', 'angularLocalStorage', 'ui.bootstrap', 'ui.date']);

myModule.config(function (uiZeroclipConfigProvider) {
    'use strict';
    uiZeroclipConfigProvider.setZcConf({
        swfPath: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf'
    });
});
myModule.config(function ($stateProvider, $urlRouterProvider) {
    'use strict';

    $urlRouterProvider.otherwise('main');

    // 登录
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginController'
    });

    // 主页
    $stateProvider.state('main', {
        url: '/main',
        templateUrl: 'views/main.html',
        controller: 'MainController'
    }).state('demo', {
        url: '/demo',
        templateUrl: 'views/demo.html',
        controller: 'DemoController'
    });

    // 配置
    $stateProvider.state('config_business', {
        url: '/config/business',
        templateUrl: 'views/config.business.html',
        controller: 'ConfigBusinessController'
    }).state('config_business_add', {
        url: '/config/business.add',
        templateUrl: 'views/config.business.add.html',
        controller: 'ConfigBusinessAddController'
    });

});