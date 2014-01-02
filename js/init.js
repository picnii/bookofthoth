//uncomment to do initial and set $rootScope
app.run(function($rootScope, $location) {
	
	$rootScope.app = {
		name:"Book Of Thoth"

	}
	$rootScope.mainMenuLocation = "pages/main-menu.html";

	$rootScope.user = {};
	$rootScope.isLogin = function()
	{
		if(typeof($rootScope.user) != "undefined" && typeof($rootScope.user.token) != "undefined")
		{
			return true
		}else if(localIsLogin())
		{
			$rootScope.user = localLoadUser();
			return true;
		}
		return false;
	}

	$rootScope.isAdmin = function()
	{
		if(typeof($rootScope.user) != "undefined"  && typeof($rootScope.user.isAdmin) != "undefined")
			return $rootScope.user.isAdmin;
		return false;
	}

	$rootScope.logout = function()
	{
		
		$rootScope.user = {};
		localLogout();
		$location.path('/');
	}
});

function localLogin($user)
{
	
	localStorage['user'] = JSON.stringify($user);
}

function localLogout()
{
	localStorage['user'] = "";
}

function localIsLogin()
{
	if(typeof(localStorage['user'] ) == "undefined" || localStorage['user']  == "")
		return false;
	else
		return true;
}

function localLoadUser()
{
	return JSON.parse(localStorage['user'])
}

Array.prototype.findById = function(id)
{
	for(var i =0; i < this.length; i++)
		if(this[i].id == id)
			return this[i]
	return null;
}

Array.prototype.find = function(attr, value)
{
	for(var i =0; i < this.length; i++)
		if(this[i][attr] == value)
			return this[i]
	return null;
}

Array.prototype.findIndex = function(attr, value)
{
	for(var i =0; i < this.length; i++)
		if(this[i][attr] == value)
			return i;
	return -1;
}