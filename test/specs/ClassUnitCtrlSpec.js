describe("Class Unit Controller", function() {
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
  var  class_config = {
    "name":"Wordpress",
    "code_name":"wordpress",
    "documents":[
      {
        "name":"คู่มือการใช้งาน", "url":"document/index.html"
      },
      {
        "name":"คู่มือการใช้งาน(Live)", "url":"https://docs.google.com/document/d/1foX5BcsrOdvlzmLZFnUON267ol7w_zuQZ7O2mWlvIqI/" , "isExternal":true
      }
    ],
    "videos":[
      {
        "name":"การติดตั้ง", "url":"videos/install.mp4"
      },
      {
        "name":"การสร้าง Page", "url":"videos/page.mp4"
      },
      {
        "name":"การสร้าง Post 1", "url":"videos/post.mp4"
      },
      {
        "name":"การสร้าง Post 2", "url":"videos/post2.mp4"
      },
      {
        "name":"การตั้ง Password ให้ Post", "url":"videos/password.mp4"
      },
      {
        "name":"การสร้าง Categories และ Tag", "url":"videos/TagCategories.mp4"
      },
      {
        "name":"การจัดการ Media", "url":"videos/uploadPic.mp4"
      },
      {
        "name":"การใช้ Theme", "url":"videos/Theme.mp4"
      },
      {
        "name":"การใช้ Theme 2", "url":"videos/widget.mp4"
      },
      {
        "name":"การใช้ Plugin", "url":"videos/plugin.mp4"
      },
      {
        "name":"การใช้ Setting", "url":"videos/setting.mp4"
      }
    ],
    "files":[
      {
        "name":"Filezilla", "url":"files/filezilla.exe"
      },
      {
        "name":"Wordpress", "url":"files/wordpress.zip"
      }
    ],
    "apps":[
      "webmatch"
    ],
    "menus":[
      {"name":"เอกสาร", "url":"document" },
      {"name":"วิดีโอ", "url":"videos" },
      {"name":"ไฟล์", "url":"files" } 
    ]

  }
  ;

  var web_match_config = {
    "name":"webmatch",
    "menus":[
      {
        "name":"FTP", "url":"profile"
      },
      {
        "name":"Web list", "url":"admin","hideIfAdmin":true
      }
      ,
      {
        "name":"ADMIN", "url":"admin", "showIfAdmin":true
      }
    ]

  }
  
    
    beforeEach(inject(function($injector) {
      
      //$httpBackend = _$httpBackend_;
        $httpBackend = $injector.get('$httpBackend');
      correct_user_login_response = {"name":"Sompop","lastname":"Kulapalanont","id":"1","mobile":"0824523991","account_id":"1101401128740","isAdmin":true,"token":"ccfee9f0b4317680a3614854c99223e4.0"};

       $httpBackend.when("GET", 'classes/wordpress/config.json').
          respond(class_config);
      $httpBackend.when("GET", 'apps/webmatch/config.json').
          respond(web_match_config);

      //web_match_config
        
       // Get hold of a scope (i.e. the root scope)
     $rootScope = $injector.get('$rootScope');
     location = $injector.get('$location');
     browser =  $injector.get('$browser');
     routeParams = {name:'wordpress'}
      scope = $rootScope.$new();
      rootScope = $rootScope;
      $controller = $injector.get('$controller');

      localLogin(correct_user_login_response);
      ctrl = $controller(ClassUnitCtrl, {$scope: scope, $rootScope:rootScope, $location:location, $routeParams:routeParams});

       expect(scope.isLogin()).toEqual(true);

    }));
 
  afterEach(function() {
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });

  function correctRequestFlush()
  {
    $httpBackend.expectGET('classes/wordpress/config.json').respond( class_config);
    $httpBackend.expectGET('apps/webmatch/config.json').respond( web_match_config);
    $httpBackend.flush();
    browser.poll();
  }

  it("if not login() redirect to / ", function () {
   correctRequestFlush();
    scope.logout();
    expect(scope.isLogin()).toEqual(false);
    expect(location.path()).toEqual('/');
  });

  it("class_path, app_path, itemLocation, class_name should be define", function () {
    correctRequestFlush();

    expect(scope.class_path).toEqual('classes/');
    expect(scope.app_path).toEqual('apps/');
    expect(scope.itemLocation).toEqual(scope.class_path + "root/index.html");
    expect(scope.class_name).toEqual(class_config.code_name)

  });

  it("createListType() should be able to add scope.class_path/class_name if not externalUrl", function () {
   correctRequestFlush();
      var menu_arr = [ {
        "name":"somemenu", "url":"document/index.html"
      },
      {
        "name":"somemenu2", "url":"https://docs.google.com/document/d/1foX5BcsrOdvlzmLZFnUON267ol7w_zuQZ7O2mWlvIqI/" , "isExternal":true
      }]
      var menu_expected_arr = [ {
        "name":"somemenu", "url":(scope.class_path + scope.class_name + "/document/index.html")
      },
      {
        "name":"somemenu2", "url":"https://docs.google.com/document/d/1foX5BcsrOdvlzmLZFnUON267ol7w_zuQZ7O2mWlvIqI/" , "isExternal":true
      }]
    var menu_create_arr = scope.createListType(menu_arr);
    expect(menu_create_arr).toEqual(menu_expected_arr);
  });

    it("should create documents, videos, files with createListType()  for menu after request", function () {
   correctRequestFlush();
    var expect_documents = scope.createListType(class_config.documents);
    var expect_videos = scope.createListType(class_config.videos);
    var expect_files = scope.createListType(class_config.files);
      
    expect(scope.documents).toEqual(expect_documents);
    expect(scope.videos).toEqual(expect_videos);
    expect(scope.files).toEqual(expect_files);

  });  

    //createClassMenus
  it("createClassMenus() should add type:'page' and active:false for each menu", function () {
   correctRequestFlush();
    var menu_arr = [ {
        "name":"somemenu", "url":(scope.class_path + scope.class_name + "/document/index.html")
      },
      {
        "name":"somemenu2", "url":"https://docs.google.com/document/d/1foX5BcsrOdvlzmLZFnUON267ol7w_zuQZ7O2mWlvIqI/" , "isExternal":true
      }] 

     var menu_expected_arr = [ {
        "name":"somemenu", "url":(scope.class_path + scope.class_name + "/document/index.html"), type:'page', active:false
      },
      {
        "name":"somemenu2", "url":"https://docs.google.com/document/d/1foX5BcsrOdvlzmLZFnUON267ol7w_zuQZ7O2mWlvIqI/" , "isExternal":true, type:'page', active:false
      }] 
    var menu_created = scope.createClassMenus(menu_arr);
    expect(menu_created).toEqual(menu_expected_arr);
  }); 

  it("createAppMenus() should add type:'apps' , active:false, app_name:{app_name} for each menu", function () {
   correctRequestFlush();
   var test_app_name = 'test_app';
    var menu_arr = [ {
        "name":"somemenu", "url":(scope.class_path + scope.class_name + "/document/index.html")
      },
      {
        "name":"somemenu2", "url":"https://docs.google.com/document/d/1foX5BcsrOdvlzmLZFnUON267ol7w_zuQZ7O2mWlvIqI/" , "isExternal":true
      }] 

     var menu_expected_arr = [ {
        "name":"somemenu", "url":(scope.class_path + scope.class_name + "/document/index.html"), type:'apps', active:false, app_name:test_app_name
      },
      {
        "name":"somemenu2", "url":"https://docs.google.com/document/d/1foX5BcsrOdvlzmLZFnUON267ol7w_zuQZ7O2mWlvIqI/" , "isExternal":true, type:'apps', active:false, app_name:test_app_name
      }] 
    var menu_created = scope.createAppMenus(test_app_name, menu_arr);
    expect(menu_created).toEqual(menu_expected_arr);
  }); 

  it('menu should include class menu and app_menu ', function(){
      correctRequestFlush();
      var expect_class_menus = scope.createClassMenus(class_config.menus);
      var expect_app_menus = [];
      //for(var i =0; i < class_config.apps.length ;i++)
      //{
        var app_name = "webmatch"
        var app_menu = scope.createAppMenus(app_name, web_match_config.menus);
        expect_app_menus  = expect_app_menus.concat(app_menu);
      //}
     
      var expect_menu = expect_class_menus.concat(expect_app_menus);
      expect(scope.menus).toEqual(expect_menu);

  })

  it('clearMenu() should make all menu item active:false ', function(){
      correctRequestFlush();
      scope.menus[0].active =true;
      expect(scope.menus[0].active).toBe(true);
      scope.clearMenu();
      for(var i =0; i < scope.menus.length; i++)
      {
        expect(scope.menus[i].active).toEqual(false);
      }

  })

  it('loadPage() should be able to load page type page ', function(){
    correctRequestFlush();
      var test_class_path = "classes/";
      scope.test_item = {url:'test', active:false, type:'page'};
      scope.loadPage(scope.test_item);
      //classes/root/test.html
      expect(scope.itemLocation).toEqual("classes/root/test.html")
      expect(scope.itemLocation).toEqual(test_class_path + "root/" + scope.test_item.url + ".html");
      expect(scope.test_item.active).toEqual(true);

      for(var i =0;i < scope.menus.length;i++)
      {
        var item =scope.menus[i];
        if(item.type == 'page')
        {
          scope.loadPage(item);
          expect(scope.itemLocation).toEqual(test_class_path + "root/" + item.url + ".html");
          expect(item.active).toEqual(true);
          for(var j=0; j < scope.menus.length;j++)
          {
            if(j != i)
              expect(scope.menus[j].active).toEqual(false);
          }
        }
      }
  })

  it('loadPage() should be able to load page type apps ', function(){
    correctRequestFlush();
      var type_app_path = "apps/";
      scope.test_item = {url:'test', active:false, type:'apps', app_name:"testdo"};
      scope.loadPage(scope.test_item);
      //classes/root/test.html
      expect(scope.itemLocation).toEqual("apps/testdo/test.html")
      expect(scope.itemLocation).toEqual(type_app_path + scope.test_item.app_name + "/" + scope.test_item.url + ".html");
      expect(scope.test_item.active).toEqual(true);

      for(var i =0;i < scope.menus.length;i++)
      {
        var item =scope.menus[i];
        if(item.type == 'apps')
        {
          scope.loadPage(item);
          expect(scope.itemLocation).toEqual(type_app_path + item.app_name + "/" + item.url + ".html");
          expect(item.active).toEqual(true);
          for(var j=0; j < scope.menus.length;j++)
          {
            if(j != i)
              expect(scope.menus[j].active).toEqual(false);
          }
        }
      }
  })

  /*it("menu should create from class's menu and app's menu ", function () {
   correctRequestFlush();
    var menu_expected_arr = 
    expect(scope.menu).toEqual(menu_expected_arr);
  });*/

   /*it("should view all class that got ", function () {
    //make local login correct
      $httpBackend.expectGET('/admin/index.php?r=classRoom/listJson').respond( class_room_list);
      $httpBackend.flush();
      browser.poll();
      expect(scope.classes.length).toEqual(class_room_list.length)
      for(var i = 0; i < scope.classes.length ;i ++)
        for(var key in ['id', 'name', 'description' ,'permission', 'code'])
          expect(scope.classes[i][key]).toEqual(class_room_list[i][key])        
        
  });*/


});