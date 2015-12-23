myModule.factory('DataService', function ($q, ConfigService, $log, $zl, $state) {
    'use strict';

    var baseUrl = '/evh';
    var baseAdminUrl = '/admin/';

    function prepend(prefix, name, separator) {
        if (prefix) {
            if (separator) {
                return prefix + "." + name;
            }
            return prefix + name;
        }
        return name;
    }

    function flatten(prefix, obj, map) {
        if (obj) {
            if ($.isArray(obj)) {
                for (var i = 0; i < obj.length; i++) {
                    var item = obj[i];
                    flatten(prepend(prefix, "[" + i + "]", false), item, map);
                }
            } else if ($.isPlainObject(obj)) {
                if (obj['__type__'] === 'map') {
                    $.each(obj, function (propertyName, propertyObject) {
                        if (propertyName !== '__type__') {
                            flatten(prepend(prefix, "[" + propertyName + "]", false), propertyObject, map);
                        }
                    });
                } else {
                    $.each(obj, function (propertyName, propertyObject) {
                        flatten(prepend(prefix, propertyName, true), propertyObject, map);
                    });
                }
            }
            else {
                map[prefix] = obj;
            }
        }
    }

    function toFlattenMap(obj) {
        var map = {};

        flatten(null, obj, map);
        return map;
    }

    function post(url, params) {
        var def = $q.defer();
        $.ajax({
            url: url[0] === '/' ? (baseUrl + url) : (baseUrl + baseAdminUrl + url),
            type: 'post',
            data: toFlattenMap(params),
            dataType: 'json',
            success: function (data, status, jqXHR) {
                if (data.errorCode === 401) {
                    $state.go('login');
                    $zl.tips('用户未登录');
                    return false;
                } else {
                    data = fixBigNum(data, jqXHR);
                    def.resolve(data);
                }
            },
            error: function () {
                def.reject('服务器错误');
            }
        });
        return processPromise(def.promise, url);
    }

    function fixBigNum(data, jqXHR) {
        if (hasBigNumForJSONStr(jqXHR.responseText)) {
            data = fixBigNum2JSON(jqXHR.responseText);
        }
        return data;
    }

    function fixBigNum2JSON(str) {
        if (!str) {
            return '';
        }
        return str2json(str);
    }

    function hasBigNumForJSONStr(str) {
        if (str) {
            return !!str.match(/([^\\])":(\d{15,})/g);
        }
        return false;
    }

    function str2json(str) {
        if (!str) {
            return {};
        }
        // bignum = Math.pow(2, 53)    length:16
        str = str.replace(/([^\\])":(\d{15,})/g, '$1":"$2"');
        return $.parseJSON(str);
    }


    function processPromise(promise, url) {
        // 开始进度条
        $zl.progress.start();

        // 处理http
        return promise.then(function (data) {
            if (data.errorCode === 0 || data.errorCode === 200) {
                return data.response || {}; // 兼容
            } else {
                return $q.reject((data.errorDescription || '未知错误') + '  errorCode:' + data.errorCode + '  version:' + data.version);
            }
        }, function (reason) {
            return $q.reject(reason);
        }).then(function (data) {
            //结束进度条
            $zl.progress.done();
            return data;
        }, function (reason) {
            //结束进度条
            $zl.progress.done();
            // 错误提示
            $zl.tips(reason);

            return $q.reject(reason);
        });
    }

    var dataService = {};

    // 用户 登陆相关 个人版的接口
    dataService.getUser = function (params) {
        return post('/user/getUserInfo', params);
    };
    dataService.logonUser = function (params) {
        return post('/user/adminLogon', params);
    };
    dataService.logoffUser = function (params) {
        return post('/user/logoff', params);
    };


    // 在封装一层，打印交出去的数据
    // 同时把params复制一份，避免干扰之前的数据

    var packDataService = {};
    _.each(dataService, function (value, key) {
        packDataService[key] = function (params) {
            return value.apply(this, [angular.copy(params)]).then(function (data) {
                $log.info('data.service info: ' + key);
                $log.info(data);
                return angular.copy(data);
            });
        };
    });

    return packDataService;
});