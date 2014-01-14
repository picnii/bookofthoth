var data_service = angular.module('dataServices', ['ngResource']).
  factory('User', function($resource){
  return $resource('/admin/index.php?r=user/:service', {}, {
    login: {method:'POST', params:{service:'authenticate'} },
    register:{method:'POST', params:{service:'register'} },
    query:{method:'GET', params:{service:'list'}, isArray:true},
    update:{method:'POST', params:{service:'edit'}}
  });
}).
  factory('Class', function($resource){
  return $resource('/admin/index.php?r=classRoom/:service', {}, {
    query: {method:'GET', params:{service:'listJson'}, isArray:true }
  });
}).
  factory('ClassInfo', function($resource){
  return $resource('classes/:name/config.json', {}, {
    get: {method:'GET', params:{}}
  });
}).
  factory('App', function($resource){
  /*return $resource('apps/:name/config.json', {}, {
    get: {method:'GET', params:{}}
  });*/
  return $resource('/admin/index.php?r=appConfig/get&name=:name', {}, {
    get: {method:'GET', params:{}}
  });
}).
  factory('Avartar', function($resource){
  return $resource('images/avartar/list.json', {}, {
    query: {method:'GET', params:{}, isArray:true}
  });
})


