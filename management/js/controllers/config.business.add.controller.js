myModule.controller('ConfigBusinessAddController', function ($scope, DataService, $state, $zl, $zlUploader, StorageService, $cookies) {
    'use strict';

    $scope.itemList = {};

    $scope.itemList.categroies = [];

    $scope.targetTypes = [{
        key: '0',
        value: '未知'
    }, {
        key: '1',
        value: '左邻商家'
    }, {
        key: '2',
        value: '第三方商家'
    }];

    DataService.getCategoriesList({
        parentId: 3
    }).then(function (data) {
        $scope.categoryList = data;
    });

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.selectCategory = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        }
        else {
            list.push(item);
        }
    };

    $zlUploader.imgUpload($('#uploadImg'), {
        uploadScript: 'https://' + StorageService.CONTENTSERVER.get().split(':')[0] + '/upload/image?token=' + $cookies.get('token'),
        onUploadComplete: function (file, data) {
            $scope.$apply(function () {
                data = angular.fromJson(data);
                if (data.errorCode === 0) {
                    $zl.tips('上传成功');
                    $scope.itemList.logoUri = data.response.uri;
                    $scope.itemList.logoUrl = data.response.url;
                } else {
                    $zl.tips(data.errDesc || '未知错误');
                }
            });
        },
        fileObjName: 'upload_file'
    });

    $scope.onSubmit = function () {
        DataService.createBusiness($scope.itemList).then(function () {
            $zl.tips('创建配置成功');
            $state.go('config_business');
        });
    };
});