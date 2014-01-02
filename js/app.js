var app = angular.module('bot',['dataServices', 'ngRoute'])

//Routing
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/', {templateUrl: 'pages/home.html',   controller: HomeCtrl}).
		when('/register', {templateUrl: 'pages/register.html',   controller: RegisterCtrl}).
		when('/users', {templateUrl: 'pages/users.html',   controller: UsersCtrl}).
        when('/class', {templateUrl: 'pages/class.html',   controller: ClassCtrl}).
        when('/class/:name', {templateUrl: 'pages/class-unit.html',   controller: ClassUnitCtrl}).
        when('/profile', {templateUrl: 'pages/profile.html',   controller: ProfileCtrl}).
		otherwise({redirectTo: '/'});
}]);

//Filter
/*app.filter('greeting', function(){
	return function(input){
		return "Hello " + input;	
	}
})
*/

app.directive('userList', function($resource, User, $filter) {
    return {
    	restrict: 'E',
	    scope: {
	      ngModel: '=',
	      showTag: '@',
	      onLoaded: '=',
	      users:'='
	    },
        templateUrl:'pages/user-list-mod/index.html',
         link: function(scope, iElement, iAttrs) {
	      // get weather details

	      scope.users = User.query(function(loadUsers){

			for(var i =0;i < loadUsers.length;i++)
			{
				loadUsers[i].isEditMode = false
				loadUsers[i].tags_form = scope.tags_to_str(loadUsers[i].tags)
				loadUsers[i].str_tags = scope.make_str_tags(loadUsers[i].tags)
				loadUsers[i].isSelected = false;
				loadUsers[i].rowClass = '';
			}
			if(typeof(scope.onLoaded) != "undefined" )
			{
				console.log('found onLoaded')
				scope.onLoaded(scope);
			}
				
			});
	      scope.tags_to_str  = function(tags)
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

			scope.make_str_tags = function(tags)
			{
				var strs = [];
				for(var i =0; i < tags.length;i++)
				{
					strs.push(tags[i].name)
				}
				return strs;
			}

			scope.doSelect = function(item)
			{
				item.isSelected = !item.isSelected
				var selectedUsers = $filter('filter')(scope.users, {isSelected: true});
				scope.ngModel = selectedUsers;
			}

			scope.updateAllSelected = function()
			{
				//filter:search:strict
				var selectedUsers = $filter('filter')(scope.users, scope.search);
				
				for(var i =0 ; i < selectedUsers.length;i++)
				{
					var each_user = selectedUsers[i];
					each_user.isSelected = scope.isSelectAll
				}
				var selectedUsers = $filter('filter')(scope.users, {isSelected: true});
				scope.ngModel = selectedUsers;
			}

			scope.search = {$:'', tags_form:''}
			

			if(typeof(scope.showTag) != "undefined")
				scope.search.tags_form = scope.showTag
			

	    }//link
    }//return obj
  });