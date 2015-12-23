myModule.controller('AppController', function ($scope, $mdSidenav, $location, $state) {
    'use strict';

    $scope.menu = {};

    $scope.menu.toggle = function () {
        $mdSidenav('left').toggle();
    };

    $scope.menu.sections = [{
        name: '首页',
        children: [{
            name: 'welcome',
            url: '/main'
        }]
    }, {
        name: '配置',
        children: [{
            name: '服务商家配置',
            url: '/config/business'
        }]
    }];

    _.each($scope.menu.sections, function (value) {
        value.isClose = true;
    });

    $scope.$on('$stateChangeSuccess', function (event, toState) {
        _.each($scope.menu.sections, function (value) {
            _.each(value.children, function (val) {
                if (val.url === toState.url) {
                    $scope.menu.section = [value, val];
                    value.isClose = false;
                    $mdSidenav('left').toggle();
                }
            });
        });
    });

    $scope.menu.section = [$scope.menu.sections[0], $scope.menu.sections[0].children[0]];

    $scope.menu.onHead = function (section) {
        section.isClose = !section.isClose;
    };
    $scope.menu.onChildren = function () {
        $mdSidenav('left').toggle();
        $state.reload();
    };

    $scope.search = {};
    $scope.search.searchText = null;
    $scope.search.selectedItem = null;
    $scope.search.querySearch = function (searchText) {
        var result = [];
        _.each($scope.menu.sections, function (value) {
            _.each(value.children, function (val) {
                if (val.name.indexOf(searchText) > -1) {
                    result.push(val);
                }
            });
        });
        return result;
    };
    $scope.search.onSelect = function (item) {
        if (item && item.url) {
            $location.url(item.url);
        }
    };
});

myModule.controller('AppUserController', function ($scope, DataService, $state, $zl, $rootScope, ConfigService) {
    'use strict';


    function getUser() {
        DataService.getUser().then(function (data) {
            $scope.user = data;
            $zl.userInfo.set(data);
        }, function () {
            $state.go('login');
        });
    }

    getUser();

    $scope.$on(ConfigService.eventKey.USER_LOGIN, function (e) {
        getUser();
    });

    $scope.$on(ConfigService.eventKey.USER_LOGOFF, function (e) {
        $scope.user = null;
    });

    $scope.onLogin = function () {
        $state.go('login');
    };

    $scope.onLogoff = function () {
        DataService.logoffUser().then(function () {
            $rootScope.$broadcast(ConfigService.eventKey.USER_LOGOFF);
            $state.go('login');
        });
    };
});