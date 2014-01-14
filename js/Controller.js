//example of normal controller
function HomeCtrl($scope, $rootScope, $location, User)
{
	$scope.login = function()
	{
		//if($scope.email == "sompop@picnii.me" && $scope.password == "sompopcool")
		//{
			//$location.path('class');
		$rootScope.user =  User.login({email:$scope.email, password:$scope.password}, function(data){
			if(typeof(data.token) != "undefined")
			{
				localLogin(data)
				$location.path('class');
			}else
			{
				$scope.password = "";
			}
		})
		//}
	}

	if($scope.isLogin())
		$location.path('class');
}

function RegisterCtrl($scope, $rootScope, $location, User, Avartar)
{

	$scope.avartars = Avartar.query(function(data){
		$scope.chooseAvartar($scope.avartars[0])
	});

	$scope.resetChooseAvartar = function()
	{
		for(var i =0; i < $scope.avartars.length; i++)
			$scope.avartars[i].isSelected = false;
	}

	$scope.chooseAvartar = function(avartar)
	{
		$scope.resetChooseAvartar();
		//avartar.isSelected = false;
		$scope.avartars[avartar.id].isSelected = true;
		$scope.profile_picture = 'images/avartar/' + avartar.name;
	}

	$scope.register = function()
	{
		if($scope.password != $scope.repassword)
		{
			return false;
		}
		$data_user = {
			name:$scope.name,
			lastname:$scope.lastname,
			email:$scope.email,
			password:$scope.password,
			account_id:$scope.account_id,
			profile_picture:$scope.profile_picture
		}
		$result = User.register($data_user, function(data){
			if(typeof(data.token) != "undefined")
			{
				$rootScope.user = data;
				$location.path('/');
			}
				
		})
		
	}
}

function ClassCtrl($scope, Class, $location,App)
{
	
	$scope.classes = Class.query();
	
	if(!$scope.isLogin())
		$location.path('/')
	
}

function ClassUnitCtrl($scope, $location, $routeParams, ClassInfo, App, $rootScope)
{

	$scope.class_path = "classes/";
	$scope.app_path = "apps/";
	$scope.itemLocation = $scope.class_path + "root/index.html";
	$scope.class_name = $routeParams.name

	$scope.createListType = function(arr)
	{
		if(typeof(arr) == 'undefined')
			return [];

		var answer_list = [];
		for(var i =0; i < arr.length;i++)
		{
			var class_obj = arr[i];
			if(typeof(class_obj.isExternal) == "boolean" && class_obj.isExternal)
			{
				//do nothing cause it's external link
			}else
				class_obj.url = $scope.class_path + $scope.class_name + '/' + class_obj.url
			answer_list.push(class_obj);
		}
		return answer_list;
	}

	$scope.createClassMenus = function(menu_arr)
	{
		var answer_list = [];
		for(var i =0; i < menu_arr.length;i++)
		{
			var menu_item = menu_arr[i];
			menu_item.type = 'page'
			menu_item.active = false;
			answer_list.push(menu_item)
		}
		return answer_list;
	}

	$scope.createAppMenus = function(app_name ,app_menu_arr)
	{
		var answer_list = [];
		for(var i =0; i < app_menu_arr.length;i++)
		{
			var menu_item = app_menu_arr[i];
			menu_item.type = 'apps'
			menu_item.active = false;
			menu_item.app_name = app_name;
			if(typeof(menu_item.showIfAdmin) != "undefined" && menu_item.showIfAdmin && !$scope.isAdmin())
			{
				//menu item is for only admin and user is not admin so dont add menu items
			}else if(typeof(menu_item.hideIfAdmin) != "undefined" && menu_item.hideIfAdmin && $scope.isAdmin()){
				//menu item is for only user admin should not see it
			}else
				answer_list.push(menu_item);
		}
		return answer_list;
	}

	/*
	* init documents,videos,files,menus and app_configs[]
	*/
	$scope.documents = $scope.videos =  $scope.files = $scope.app_configs = [];

	$scope.classRoom = ClassInfo.get({name:$scope.class_name }, function(data){
		
		//create documents,videos,files
		$scope.documents = $scope.createListType(data.documents);
		$scope.videos = $scope.createListType(data.videos);
		$scope.files = $scope.createListType(data.files);
		if(data.permission < 3 && !$scope.isAdmin())
			$location.path('class')
		//load config each apps
		$scope.app_count = 0;
		$scope.app_count_max = data.apps.length;
		for(var i=0; i < data.apps.length;i++)
		{
			var app_name = data.apps[i]
			App.get({name:app_name}, function(app_data){
				var current_app_config = app_data.app_config;
				console.log(app_data.name)
				//console.log('update=>' + app_name + 'Config')
				//window[app_name + 'Config'] = current_app_config;
				for(var name in current_app_config)
				{
					console.log('update : ' + name + ' = ' + current_app_config[name])
					console.log(app_data.name + 'Config')
					window[app_data.name + 'Config'][name] = current_app_config[name]
				}
				console.log('update rootScope: ' + (app_data.name + 'Config'))
				$rootScope[app_data.name + 'Config'] = window[app_data.name + 'Config'];
				console.log($rootScope)
				$scope.app_configs.push(app_data);
				$scope.app_count++;
				if($scope.app_count >= $scope.app_count_max)
					$scope.after_load_apps();
			})

		}
		
	})

	$scope.after_load_apps = function()
	{
		//create menu after load all app_configs[]
		var def_class_menus = $scope.classRoom.menus;
		//create menu
		$scope.menus = $scope.createClassMenus(def_class_menus);
		//add each app_menus
		for(var i = 0 ; i < $scope.app_configs.length;i++)
		{
			var app_config = $scope.app_configs[i];
			var app_name = app_config.name;
			var app_menus = $scope.createAppMenus(app_name, app_config.menus)
			$scope.menus = $scope.menus.concat(app_menus)
			if($scope.classRoom.widget == app_name)
			{
				$scope.loadWidget(app_config);
			}
		}
		console.log($scope.menus)
	}


/*	if($scope.isAdmin())
		var list_item = {name:"ADMIN", url:"admin", type:"apps", active:false, app_name:"webmatch"}
	else
		var list_item = {name:"Web list", url:"admin", type:"apps", active:false, app_name:"webmatch"}

		,
		{name:"FTP", url:"profile", type:"apps", active:false, app_name:"webmatch"},
		list_item
*/
	$scope.menus = [
		{name:"เอกสาร", url:"document", type:"page", active:false},
		{name:"วิดีโอ", url:"videos", type:"page", active:false},
		{name:"ไฟล์", url:"files", type:"page", active:false}
	]




	$scope.clearMenu = function()
	{
		for(var i =0; i < $scope.menus.length; i++)
			$scope.menus[i].active = false;
	}


	$scope.getMenuClass = function(item)
	{
		if(item.active)
			return "active"
		else
			return "";
	}
	//test
	//$scope.widgetLocation = 'apps/countdown/widget.html';

	$scope.loadWidget = function(app_config)
	{
		$scope.widgetLocation = 'apps/' + app_config.name + '/' + app_config.widget.url + ".html";
	}

	$scope.goAppPage = function(app_name, url)
	{
		var screen_item_page = {app_name:app_name, type:"apps", url:url};
		$scope.loadPage(screen_item_page);
	}

	$scope.loadPage = function(item)
	{
		console.log('loadPage')
		console.log(item)
		if(item.type == 'page')
		{
			$scope.itemLocation = $scope.class_path + "root/" + item.url + ".html";
			$scope.clearMenu();
			item.active = true;
		}else if(item.type == 'apps')
		{

			$scope.itemLocation  = 'apps/' + item.app_name + '/' + item.url + ".html" ;
			console.log($scope.itemLocation)
			$scope.clearMenu();
			item.active = true;
		}
		
	}

	if(!$scope.isLogin())
		$location.path('/');
}

function ProfileCtrl($scope)
{

}


function UsersCtrl($scope, $location, User, $filter)
{
	if($scope.isLogin())
	{
		if(!$scope.isAdmin())
			$location.path('/');
	}else
		$location.path('/');
		
	$scope.tags_to_str  = function(tags)
	{
		var str = ""
		for(var i =0;i < tags.length; i++)
		{
			if(i > 0)
				str+= ", ";
			str += tags[i].name

		}
		return str;
	}

	$scope.make_str_tags = function(tags)
	{
		var strs = [];
		for(var i =0; i < tags.length;i++)
		{
			strs.push(tags[i].name)
		}
		return strs;
	}

	$scope.refresh = function(){
		$scope.users = User.query(function(loadUsers){
			for(var i =0;i < loadUsers.length;i++)
			{
				loadUsers[i].isEditMode = false
				loadUsers[i].tags_form = $scope.tags_to_str(loadUsers[i].tags)
				loadUsers[i].str_tags = $scope.make_str_tags(loadUsers[i].tags)
				loadUsers[i].isSelected = false;
			}

		});

	}
	

	$scope.edit = function(item)
	{
		item.isEditMode = true;
		setTimeout(function(){
			$('#item-' + item.id).focus();
		},100)
		
		console.log('#item-' + item.id);
	}

	$scope.updateTags = function(item)
	{
		// $scope.str_to_tags(item.tags_form)
		//assume that we validate form
		item.new_tags = item.tags_form.replace(/\s/g, '');;
		User.update({user:item, admin_email:$scope.user.email ,token:$scope.user.token }, function(result){
			
			item.str_tags = item.new_tags.split(',')
			item.isEditMode = false;
			//$scope.refresh();
		})
		
	}

	$scope.updateAllSelected = function()
	{
		//filter:search:strict
		var selectedUsers = $filter('filter')($scope.users, $scope.search, $scope.strict);
		console.log(selectedUsers)
		for(var i =0 ; i < selectedUsers.length;i++)
		{
			var each_user = selectedUsers[i];
			each_user.isSelected = $scope.isSelectAll
		}
	}

	$scope.updateAllTags = function()
	{
		var selectedUsers = $filter('filter')($scope.users, {isSelected: true});
		

		for(var i =0 ;i < selectedUsers.length;i++)
		{
			var each_selected_user = selectedUsers[i];
			if($scope.isAddTagOnly)
			{
				if(each_selected_user.tags_form.length != 0 && each_selected_user.tags.length > 0)
				{
					each_selected_user.tags_form = each_selected_user.tags_form + ", " + $scope.all_tags_form;
				}else
					each_selected_user.tags_form = $scope.all_tags_form;
			}else
				each_selected_user.tags_form = $scope.all_tags_form;
			$scope.updateTags(each_selected_user);

		}

		$scope.isUpdateAllTagsMode = false;

	}

	$scope.updateSearchFilter = function(model, target){
		if(model){
			$scope.search[target] = $scope.search.$
		}else{
			$scope.search[target] =''
		}
	}

	$scope.searchTag = function(tag)
	{
		$scope.search.$ = tag;
		$scope.search.tags_form = tag;
		$scope.isSearchTagOnly=true
	}
	$scope.search = {$:'', tags_form:'', name:''};
	$scope.refresh();

}
//controller that get data from $http
/*function TestCtrl($scope, $location, $http)
{

}*/



//controller that use $routeParams and can navigate
/*function TestUnitCtrl($scope, $rootScope, $location, $routeParams)
{

}*/