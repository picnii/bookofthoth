var webmatchConfig = {
	max:100,
	ftp_server:"192.168.1.30",
	default_pwd:"picnii.me",
	prefix:"student_"
}

/*
* Warning
* There are some replicate code
* Need some comments
*/

var convertToWebUrl = function(name)
{
	var _url = "http://"+ webmatchConfig.ftp_server+"/"+ name
	return _url
}

var createWebs = function()
{
	var webs = []
	for(var i = 1; i <= webmatchConfig.max ;i++)
	{
		if( i < 10)
			var _name = webmatchConfig.prefix + '0' + i;
		else
			var _name = webmatchConfig.prefix + i;
		var _url = convertToWebUrl(_name);
		webs.push({name:_name, url:_url, isActivate:false, isSelected:false});

	}
	console.log('created webs');
	return webs;
}


function WebMatchCtrl($scope, $rootScope, User, WebMatchView)
{
	//view current user config
	console.log($rootScope)
	$scope.ftp_server = $rootScope.webmatchConfig.ftp_server;
	$scope.webmatch = WebMatchView.view({user_id:$rootScope.user.id}, function(){
		$scope.db_user_name = $scope.webmatch.web_url;
		$scope.ftp_username = $scope.webmatch.web_url;
		$scope.db_name = $scope.webmatch.web_url;
		$scope.db_password = $rootScope.webmatchConfig.default_pwd;
		$scope.ftp_password = $rootScope.webmatchConfig.default_pwd;
	});
	
}

function WebMatchListCtrl($scope, User, WebMatch)
{
	//init state that user dont have wordpress
	$scope.user_url = "";
	$scope.wp_ready = false;

	$scope.webs = createWebs();
	console.log($scope.webs)
	$scope.users = User.query(function(loadUsers){
		$scope.web_users = [];
		$scope.webmatchs = WebMatch.query(function(data){
			for(var i = 0; i < data.length;i++)
				{
					var wm = data[i];
					var user_index = loadUsers.findIndex('id', wm.user_id);
					//console.log('user id => ' + wm.user_id + ' user_index ' + user_index)
					if(user_index != -1)
					{
						var index =  $scope.webs.findIndex('name',wm.web_url)
					//	console.log('web_url  => ' + wm.web_url + ' index ' + index)	
						if(index >= 0)
						{
							$scope.web_users.push({name:loadUsers[user_index].name,url:convertToWebUrl(wm.web_url) })
							//check if user_index == current user then user_url = this url
							if($scope.user.id == loadUsers[user_index].id)
							{
								$scope.user_url = convertToWebUrl(wm.web_url);
								$scope.wp_ready = true;
							}
						}
					


					}


						
				}
		});
	});
	
}

function WebMatchAdminCtrl($scope, $rootScope, $filter, User, WebMatch, WebMatchMatch)
{
	//view all user  page to match and unmatch
	//$scope.user_id = 1;
	//$scope.web = "student_01";
	$scope.search = ""
	$scope.convertToWebUrl = convertToWebUrl;

	$scope.webs = createWebs();
	$scope.users = $scope.selectedUsers = [];
	$scope.test = function()
	{
		console.log($scope)
		console.log({user_id:$('input[name="user_id"]:checked').val(), token:$rootScope.user.token, admin_id:$rootScope.user.id, website:$('input[name="web"]:checked').val()})
	}


	$scope.match = function()
	{	
		var user = $scope.selectedUsers[0]	
		WebMatchMatch.match({user_id:user.id, token:$rootScope.user.token, admin_id:$rootScope.user.id, website:$('input[name="web"]:checked').val()},function(){
			$scope.refresh();
		})
	}

	$scope.unmatch = function()
	{
		var user = $scope.selectedUsers[0]
		WebMatchMatch.unmatch({user_id:user.id, token:$rootScope.user.token, admin_id:$rootScope.user.id}, function(){
			$scope.refresh();
		})
	}
		
	$scope.updateMatchedUser = function(loadUsers)
	{
		console.log('==update matched user==')
		for(var i =0; i < loadUsers.length;i++)
		{
			loadUsers[i].isActivate = false;
			loadUsers[i].order = i ;
			loadUsers[i].rowClass =""
			loadUsers[i].isSelected = false
			loadUsers[i].url = null;
		}
		$scope.webmatchs = WebMatch.query(function(data){
			for(var i = 0; i < data.length;i++)
			{
				
				var wm = data[i];
				
				var user_index = loadUsers.findIndex('id', wm.user_id);
				console.log("find: " + wm.user_id + " in ")
				console.log("found :" + (user_index != -1));
				console.log(loadUsers)
				if(user_index != -1)
				{

					var index =  $scope.webs.findIndex('name',wm.web_url)

					if(index >= 0)
					{
						console.log('update webs at ' + index);
						//console.log('user_index => ' + user_index +  'index=? ' + index)
						$scope.webs[index].isActivate = true;

						loadUsers[user_index].url = $scope.convertToWebUrl(wm.web_url);
						loadUsers[user_index].web_name = wm.web_url
						loadUsers[user_index].isActivate = true
						loadUsers[user_index].rowClass = "user-activate"
					}
						
				}
					
			}

		});	
		console.log('end matched')
	}

	$scope.refresh = function()
	{
		/*$scope.users = User.query(function(loadUsers){
			$scope.updateMatchedUser(loadUsers)
		});*/
		console.log("---refresh---")
		$scope.webs = createWebs();
		console.log("call create webs")
		$scope.updateMatchedUser($scope.users)
	}

	$scope.afterLoadUser = function(user_list_scope)
	{
		
		$scope.updateMatchedUser(user_list_scope.users)
	}

	$scope.multiUnMatch = function()
	{
		$scope.countAt = 0;
		console.log('unmatchs');
		console.log($scope.selectedUsers.length)
		for(var i =0;i < $scope.selectedUsers.length;i++)
		{

			var user = $scope.selectedUsers[i]
			WebMatchMatch.unmatch({user_id:user.id, token:$rootScope.user.token, admin_id:$rootScope.user.id},function(){
				$scope.countAt++;
				if($scope.countAt >= $scope.selectedUsers.length )
					$scope.refresh();
			})
		}
		/*$scope.countMax = $scope.from - $scope.to + 1;
		$scope.countAt = 0;
		var u_index = $scope.from
	

		while(u_index <= $scope.to )
		{
			var user = $scope.users[u_index];
			WebMatchMatch.unmatch({user_id:user.id, token:$rootScope.user.token, admin_id:$rootScope.user.id},function(){
				$scope.countAt++;
				if($scope.countAt >= $scope.countMax )
					$scope.refresh();
			})
			u_index++

		}*/
			
		
	}

	$scope.multiMatch = function()
	{
		if($scope.canMultiMatch())
		{
			$scope.countAt = 0;	
			var selected_webs = $filter('filter')($scope.webs, {isSelected:true});
			
			for(var i =0;i < $scope.selectedUsers.length;i++)
			{
				var selected_user = $scope.selectedUsers[i];
				var selected_web = selected_webs[i];
				console.log(selected_user);
				console.log(selected_web);
				WebMatchMatch.match({user_id:selected_user.id, token:$rootScope.user.token, admin_id:$rootScope.user.id, website:selected_web.name},function(){
					$scope.countAt++;
					if($scope.countAt >= $scope.selectedUsers.length )
						$scope.refresh();
				})
			}
			/*$scope.countMax = $scope.from - $scope.to + 1;
			$scope.countAt = 0;
			var u_index = $scope.from
			var web_number = $scope.web_from;

			while(u_index <= $scope.to && web_number <= $scope.web_to)
			{
				var user = $scope.users[u_index];
				if(web_number < 10)
					var web = webmatchConfig.prefix + '0' +web_number;
				else
					var web = webmatchConfig.prefix + web_number;

				console.log("("+user.id+","+web+")")
				WebMatchMatch.match({user_id:user.id, token:$rootScope.user.token, admin_id:$rootScope.user.id, website:web},function(){
					$scope.countAt++;
					if($scope.countAt >= $scope.countMax )
						$scope.refresh();
				})
				u_index++
				web_number++;
			}
			*/	
		}
	}

	$scope.canMultiMatch = function()
	{
		var user_count = $scope.selectedUsers.length;
		
		var web_count = $scope.web_to - $scope.web_from + 1;
		
		return user_count == web_count;
	}

	$scope.updateWebs = function()
	{
		var web_count = $scope.web_from - $scope.web_to + 1;
		
		if(isNaN(web_count) || web_count < 2 || ( $scope.web_to == null) || $scope.web_from ==null)
		{
			for(var i =1; i < $rootScope.webmatchConfig.max;i++)
			{
				var name = "student_" + i;
				if(i < 10)
					name = "student_0" + i;
				var item_webs_index = $scope.webs.findIndex('name', name);
				var item_webs = $scope.webs[item_webs_index];
				item_webs.isSelected = false;
			}
				
		}

		for(var i = $scope.web_from ; i <= $scope.web_to ;i++)
		{
			var name = "student_" + i;
			if(i < 10)
				name = "student_0" + i;
			var item_webs_index = $scope.webs.findIndex('name', name);
			var item_webs = $scope.webs[item_webs_index];
			if(typeof(item_webs) != 'undefined')
			{
				item_webs.isSelected = true;
			}

				

		}
	}

	$scope.canMultiUnMatch = function()
	{
		var user_count = $scope.from - $scope.to + 1;
		return !isNaN(user_count);		
	}

	$scope.checkMatchStatus = function()
	{
		var user_count = $scope.from - $scope.to + 1;
		var web_count = $scope.web_from - $scope.web_to + 1;
		if(user_count == web_count)
			return "ready"
		else
			return "not ready ("+ (user_count - web_count) +")";
	}

	$scope.refresh();
	
}

data_service.factory('WebMatch', function($resource){
  return $resource('/admin/index.php?r=webmatch/default/:service', {}, {
    query: {method:'GET', params:{service:'index'}, isArray:true },
  });
}).factory('WebMatchView', function($resource){
  return $resource('/admin/index.php?r=webmatch/default/view&user_id=:user_id', {}, {
    view: {method:'GET', params:{user_id:'*'}, }
  });
}).factory('WebMatchMatch', function($resource){
  return $resource('/admin/index.php?r=webmatch/default/:service&user_id=:user_id&token=:token&admin_id=:admin_id:option1:website', {}, {
    unmatch: {method:'GET', params:{service:"unmatch", user_id:'*',token:'*', option1:'', website:'', admin_id:'*'}, },
    match: {method:'GET', params:{service:"match", user_id:'*',token:'*', option1:'&website=', website:'*', admin_id:'*'}, }
  });
})

