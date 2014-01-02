describe("Class Controller", function() {
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
  var test_alert, browser, route;
  var class_room_list, correct_user_login, correct_user_login_response;
//$scope, $rootScope, $location, User
  ;
  
    
    beforeEach(inject(function($injector) {
      localStorage['user'] = "";
      //$httpBackend = _$httpBackend_;
        $httpBackend = $injector.get('$httpBackend');
      
      class_room_list = [{"id":"1","name":"Wordpress","description":"asdsd","permission":"3","code":"wordpress"}];      
      $httpBackend.when("GET", '/admin/index.php?r=classRoom/listJson').
          respond(class_room_list);
      correct_user_login = {email:"sompop@picnii.me", password:"sompopcool"}
      correct_user_login_response = {"name":"Sompop","lastname":"Kulapalanont","id":"1","mobile":"0824523991","account_id":"1101401128740","isAdmin":true,"token":"ccfee9f0b4317680a3614854c99223e4.0"};
       $httpBackend.when("POST", '/admin/index.php?r=user/authenticate', correct_user_login).
          respond(correct_user_login_response);
  
       // Get hold of a scope (i.e. the root scope)
     $rootScope = $injector.get('$rootScope');
     location = $injector.get('$location');
     browser =  $injector.get('$browser');

      scope = $rootScope.$new();
      rootScope = $rootScope;
      $controller = $injector.get('$controller');

      localLogin(correct_user_login_response);
      ctrl = $controller(ClassCtrl, {$scope: scope, $rootScope:rootScope, $location:location});
       expect(scope.isLogin()).toEqual(true);

    }));
 
  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  it("if not login() redirect to / ", function () {
   
   

       $httpBackend.flush();
       browser.poll();
        scope.logout();
     expect(scope.isLogin()).toEqual(false);
     expect(location.path()).toEqual('/');
  });

   it("if login() not redirect ", function () {
    //make local login correct

      $httpBackend.flush();
      browser.poll();
      expect(scope.isLogin()).toEqual(true); 
      expect(location.path()).toEqual('');
    
  });

   it("should view all class that got ", function () {
    //make local login correct
      $httpBackend.expectGET('/admin/index.php?r=classRoom/listJson').respond( class_room_list);
      $httpBackend.flush();
      browser.poll();
      expect(scope.classes.length).toEqual(class_room_list.length)
      for(var i = 0; i < scope.classes.length ;i ++)
        for(var key in ['id', 'name', 'description' ,'permission', 'code'])
          expect(scope.classes[i][key]).toEqual(class_room_list[i][key])        
        
  });


});