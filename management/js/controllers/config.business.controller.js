myModule.controller('ConfigBusinessController', function ($scope, DataService, $state, $zl, DataCacheService, $mdDialog) {
    'use strict';

    $scope.gridData = {
        enableSelect: false,
        columns: [
            {field: 'id', name: 'ID'},
            {field: 'targetType', name: '商家类型'},
            {field: 'name', name: '名称'},
            {field: 'displayName', name: '显示名称'},
            {field: 'logoUrl', name: '公司logo', render: renderPicture},
            {field: 'contact', name: '联系人'},
            {field: 'phone', name: '联系电话'},
            {field: 'address', name: '地址'},
            {field: 'description', name: '描述'},
            {field: 'createTime', name: '创建时间', render: renderTime},
            {field: 'url', name: '网址'},
            {
                field: 'recommendStatus',
                name: '推荐开关',
                edit: true,
                editEver: true,
                editType: 'switch',
                afterEdit: afterEditFlag
            }
        ],
        actions: [{
            type: 'btn',
            html: '服务市场',
            action: onAddToItem,
        }, {
            type: 'btn',
            html: '删除',
            action: onDelete
        }],
        getData: function (next) {
            return DataService.getBusinessList({
                keyword: $scope.keyword,
                pageOffset: next
            }).then(function (data) {
                _.each(data.requests, function (value) {
                    value.recommendStatus = value.recommendStatus ? true : false;
                });

                return data;
            });
        }
    };

    $scope.addConfig = function () {
        $state.go('config_business_add');
    };

    $scope.onSearch = function () {
        $scope.gridData.watchReload = true;
    };

    function onDelete(value, datas) {
        $zl.confirm('确定删除该配置项吗？', '删除确认').then(function () {
            DataService.deleteBusiness({
                id: value.id
            }).then(function () {
                $zl.tips('删除成功');
                datas.splice(datas.indexOf(value), 1);
            });
        });
    }

    function renderTime() {
        return '<span>{{data[col.field] | date:"yyyy-MM-dd hh:mm:ss"}}</span>';
    }

    function renderPicture(value) {
        if (value) {
            return $zl.format('<a href="{value}" class="zl-grid-picture" target="_blank"><img ng-src="{value}" /></a>', {value: value});
        }
    }

    function afterEditFlag(changeData, col, newValue, oldValue) {
        if (newValue) {
            $mdDialog.show({
                controller: BusinessDialogController,
                templateUrl: 'views/config.business.dialog.html'
            }).then(function (data) {
                if (data !== 'cancel') {
                    var scopes = processData(data);

                    DataService.recommendBusiness({
                        id: changeData.id,
                        scopes: scopes,
                        recommendStatus: 1
                    }).then(function () {
                        $zl.tips('设置成功');
                    });
                }
            });
        } else {
            $zl.confirm($zl.format('确定取消推荐 {name} 吗？', arguments[0]), '取消推荐确认').then(function () {
                DataService.recommendBusiness({
                    id: changeData.id,
                    recommendStatus: '0'
                }).then(function () {
                    $zl.tips('取消成功');
                });
            });
        }
    }

    function processData(data) {
        _.each(data, function (_value, _key) {
            _.each(_value, function (__value, __key) {
                if (__key === '$$hashKey') {
                    delete data[_key][__key];
                }

                if (__key === 'city' || __key === 'community') {
                    if (data[_key][__key] !== null) {
                        data[_key].scopeId = __value.id;
                    }
                    delete data[_key][__key];
                }

                if (__key === 'scopeCode') {
                    if (data[_key][__key] === '0') {
                        data[_key].scopeId = '0';
                    }
                }
            });
        });

        return data;
    }

    function BusinessDialogController($scope, $mdDialog) {

        $scope.scopes = [{}];

        $scope.addScope = function () {
            $scope.scopes.push({});
        };

        $scope.removeScope = function () {
            $scope.scopes.pop();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (data) {
            $mdDialog.hide(data);
        };

        $scope.scopeCodes = [{
            key: '0',
            value: '全国'
        }, {
            key: '2',
            value: '城市'
        }, {
            key: '1',
            value: '小区'
        }];
    }

    function onAddToItem(value) {
        $mdDialog.show({
            controller: BusinessDialogController,
            templateUrl: 'views/config.business.dialog.html'
        }).then(function (data) {
            if (data !== 'cancel') {
                var scopes = processData(data);

                DataService.addToItem({
                    id: value.id,
                    itemScopes: scopes
                }).then(function () {
                    $zl.tips('设置成功');
                });
            }
        });
    }
});