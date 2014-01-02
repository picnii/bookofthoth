describe("Register Controller", function() {
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
  var correct_register, correct_register_respond;
//$scope, $rootScope, $location, User
  ;
  
    
    beforeEach(inject(function($injector) {
      localStorage['user'] = "";
      //$httpBackend = _$httpBackend_;
        $httpBackend = $injector.get('$httpBackend');
      correct_register = {
        name:"test user",
        lastname:"testlastname",
        email:"this_is_my_test@testmail.com",
        password:"12345",
        account_id:"49051220"
      }
      correct_register_respond = {"name":"testuser","lastname":"testlastname","id":"114","mobile":null,"account_id":"49051220","email":"test_email@gmail.com","tags":[],"token":"537b55bb82b56a611ec55d485d3e2fb9.3"}
      $httpBackend.when("POST", '/admin/index.php?r=user/register', correct_register).
          respond(correct_register_respond);
   
       // Get hold of a scope (i.e. the root scope)
     $rootScope = $injector.get('$rootScope');
     location = $injector.get('$location');
     browser =  $injector.get('$browser');
      scope = $rootScope.$new();
      rootScope = $rootScope;
      $controller = $injector.get('$controller');


      ctrl = $controller(RegisterCtrl, {$scope: scope, $rootScope:rootScope, $location:location});
    }));
 
  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });
  
  it("register() to be function", function () {
     expect(typeof(scope.register)).toEqual("function")
  });

  it("register() with wrong info ", function () {
   
    scope.name = correct_register.name;
    scope.lastname = correct_register.lastname;
    scope.email = "wrongwrongwrong";
    scope.password = correct_register.password;
    scope.repassword = scope.password
    scope.account_id = correct_register.account_idl
    
    data_user = {
      name:scope.name,
      lastname:scope.lastname,
      email:scope.email,
      password:scope.password,
      account_id:scope.account_id
    }

    scope.register();
    $httpBackend.expectPOST('/admin/index.php?r=user/register', data_user).respond(201);
    $httpBackend.flush();
    browser.poll();
    expect(scope.isLogin()).toEqual(false);    
    expect(location.path()).toEqual("");
  });

  it("register() with right info then get user token ", function () {
   
    scope.name = correct_register.name;
    scope.lastname = correct_register.lastname;
    scope.email =  correct_register.email;
    scope.password = correct_register.password;
    scope.repassword = scope.password
    scope.account_id = correct_register.account_idl

    data_user = {
      name:scope.name,
      lastname:scope.lastname,
      email:scope.email,
      password:scope.password,
      account_id:scope.account_id
    }

    //$httpBackend.flush();
    scope.register();
    $httpBackend.expectPOST('/admin/index.php?r=user/register', data_user).respond(201, correct_register_respond);
    $httpBackend.flush();
    browser.poll();
    expect(scope.isLogin()).toEqual(true);    
    expect(scope.user.token).toEqual(correct_register_respond.token)
    expect(location.path()).toEqual('/');
  });

  it("register() with right info but wrong repassword cant register  ", function () {
   
    scope.name = correct_register.name;
    scope.lastname = correct_register.lastname;
    scope.email =  correct_register.email;
    scope.password = correct_register.password;
    scope.repassword = scope.password + 999;
    scope.account_id = correct_register.account_idl

    data_user = {
      name:scope.name,
      lastname:scope.lastname,
      email:scope.email,
      password:scope.password,
      account_id:scope.account_id
    }

    //$httpBackend.flush();
     scope.register();
   
    browser.poll();
    expect(scope.isLogin()).toEqual(false);    
    expect(location.path()).toEqual("");
  });
 

});