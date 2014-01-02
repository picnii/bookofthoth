describe("Home Controller", function() {
  //angular.module('dataServices', ['ngResource'])
 // var app = angular.module('bot',['dataServices', 'ngRoute'])
  beforeEach(function(){
    this.addMatchers({
      toEqualData: function(expected) {
        return angular.equals(this.actual, expected);
      }
    });
  });
  beforeEach(module('ngRoute'));
  beforeEach(module('ngResource'));  
  beforeEach(module('dataServices'));  
 beforeEach(module('bot'));  
  
  var scope, rootScope, controller, user_mock, location, $httpBackend;;
  var test_alert, browser;
//$scope, $rootScope, $location, User
  ;
  
    
    beforeEach(inject(function($injector) {
      localStorage['user'] = "";
      //$httpBackend = _$httpBackend_;
        $httpBackend = $injector.get('$httpBackend');
           
      //$httpBackend.expectPOST('/admin/index.php?r=user/authenticate',{email:"sompop@picnii.me", password:"sompopcool"} ).
      $httpBackend.when("POST", '/admin/index.php?r=user/authenticate', {email:"sompop@picnii.me", password:"sompopcool"}).
          respond({"name":"Sompop","lastname":"Kulapalanont","id":"1","mobile":"0824523991","account_id":"1101401128740","isAdmin":true,"token":"ccfee9f0b4317680a3614854c99223e4.0"});
  
      $httpBackend.when("POST", '/admin/index.php?r=user/authenticate', {email:"sompop@picnii.me", password:"1234"}).
          respond(200, {"type":"error","message":"user not found"});
 

   
       // Get hold of a scope (i.e. the root scope)
     $rootScope = $injector.get('$rootScope');
     location = $injector.get('$location');
     browser =  $injector.get('$browser');
      scope = $rootScope.$new();
      rootScope = $rootScope;
      $controller = $injector.get('$controller');


      ctrl = $controller(HomeCtrl, {$scope: scope, $rootScope:rootScope, $location:location});
    }));
 
  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
  
  it("login(),isLogin() to be function", function () {
     expect(typeof(scope.login)).toEqual("function")
  });

  it("login() with wrong user should get error", function () {
    scope.email = "sompop@picnii.me";
    scope.password = "1234"
    //$httpBackend.flush();
    scope.login();
    $httpBackend.expectPOST('/admin/index.php?r=user/authenticate', {email:"sompop@picnii.me", password:"1234"}).respond(201, {"type":"error","message":"user not found"});
    $httpBackend.flush();
    expect(scope.password).toEqual('');
    browser.poll();
    expect(scope.isLogin()).toEqual(false);    
    expect(location.path()).toEqual("");
  });

  it("login() with correct user should get token", function () {
    scope.email = "sompop@picnii.me";
    scope.password = "1234"
    //$httpBackend.flush();
    scope.login();
    $httpBackend.expectPOST('/admin/index.php?r=user/authenticate', {email:"sompop@picnii.me", password:"1234"}).respond(201, {"name":"Sompop","lastname":"Kulapalanont","id":"1","mobile":"0824523991","account_id":"1101401128740","isAdmin":true,"token":"ccfee9f0b4317680a3614854c99223e4.0"});
    $httpBackend.flush();
    expect(rootScope.user.token).toEqual("ccfee9f0b4317680a3614854c99223e4.0");
    expect(scope.isLogin()).toEqual(true);
  });  

  it("when login complete should redirect to /class", function () {
    scope.email = "sompop@picnii.me";
    scope.password = "1234"
    //$httpBackend.flush();
    scope.login();
    $httpBackend.expectPOST('/admin/index.php?r=user/authenticate', {email:"sompop@picnii.me", password:"1234"}).respond(201, {"name":"Sompop","lastname":"Kulapalanont","id":"1","mobile":"0824523991","account_id":"1101401128740","isAdmin":true,"token":"ccfee9f0b4317680a3614854c99223e4.0"});
    $httpBackend.flush();
    expect(location.path()).toEqual("/class");
  });
 

});