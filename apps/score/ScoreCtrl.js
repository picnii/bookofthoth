var scoreConfig = {
	server:"192.168.1.80",
	port:"8081"
}

var SCORE_MODE_CREATE = 1, SCORE_MODE_UPDATE = 2

scoreConfig.loadScript = function()
{
	var scriptUrl = "http://"+ this.server + ":" + this.port + "/socket.io/socket.io.js";
	var script_html = "<script src=\"" + scriptUrl+ "\"></script>";
	$('#score-script').append(script_html);
}

scoreConfig.convertStudentDB = function (info){
	var students = []
	for(var i =0; i < info.length; i++)
	{
		var student = {}
		for(var j in info[i].user)
			student[j] = info[i].user[j];
		student.score = Number(info[i].score);
		students.push(student)
	}
	
	return students;
}

function ScoreListCtrl($scope, ScoreList, $timeout, $rootScope, ScorerService)
{
	$scope.isCreateNew = false;
	$rootScope.app_score = {};

	scoreConfig.loadScript();

	$scope.goPageAdmin = function()
	{
		$scope.goAppPage('score', 'admin');
	}


	$scope.onScreenIssue = function(issue)
	{
		//var send_data = {task:issue.name, students:$scope.selectedUsers, max_score:$scope.max_score};		
		//get student list
		$scope.students = [];
		ScorerService.list({email:$scope.user.email, token:$scope.user.token, issue_id:issue.id}, function(info){
			$scope.students = scoreConfig.convertStudentDB(info)
			var send_data = {task:issue.name, students:$scope.students, max_score:issue.max_score, task_id:issue.id};		
			$scope.socket.emit('initScore', send_data);
			$scope.goAppPage('score', 'screen');
		})
	}

	$scope.loadIssue = function(issue)
	{
	
		$rootScope.app_score.issue = issue;
		$rootScope.app_score.issue_mode = SCORE_MODE_UPDATE
		$scope.goPageAdmin();
	}

	$scope.createIssue = function()
	{
		$rootScope.app_score.issue_mode = SCORE_MODE_CREATE
		$scope.goPageAdmin();
	}

	$scope.offIssue = function(issue)
	{
		$rootScope.app_score = {};
		$scope.goPageAdmin();
	}

	$scope.afterLoadIO = function()
	{
		$scope.socket = io.connect('http://' + scoreConfig.server + ':' + scoreConfig.port);
		$scope.socket.on('initApp', function(io_data){
			$scope.$apply(function(){
				console.log('initApp')
				$rootScope.app_score.task_id = io_data.task_id;
				console.log($rootScope.app_score.task_id)
				$scope.issues = ScoreList.query({class_id: $scope.classRoom.id}, function(data){
					console.log('load issues')
					console.log(data)
					for(var i =0; i < data.length; i++)
					{
						data[i].isLive = false;
						if(data[i].id == $rootScope.app_score.task_id)
							data[i].isLive =true;
					}
						
				});
			})
		});
	}

	$scope.checkIO = function()
	{
		if(typeof(io) != 'undefined')
			$scope.afterLoadIO();
		else
			$timeout($scope.checkIO, 100);
	}

	$scope.checkIO();
}


function ScoreAdminCtrl ($scope, $timeout, ScoreService, ScorerService) {

	$scope.init_score = 0;
	$scope.max_score = 10;
	$scope.selectedUsers = [];
	scoreConfig.loadScript();

	$scope.canSave = false;
	$scope.issue_mode;
	
	$scope.goPageList = function()
	{
		$scope.goAppPage('score', 'list');
	}

	$scope.getScoreData = function()
	{
		for(var i =0; i < $scope.selectedUsers.length ;i++)
			$scope.selectedUsers[i].score = $scope.init_score;
		return {task:$scope.task, students:$scope.selectedUsers, max_score:$scope.max_score};
	}

	$scope.save = function()
	{
		//if not select any user cant save a new issue
		if($scope.selectedUsers.length > 0)
		{
			/* Save Issue in db
			*	case Create( task_id = -1) use create new issue
			* 	case Update ( task_id > 0) use update issue
			*/
			var isCreateNewIssue = !($scope.task_id > 0)
			if(isCreateNewIssue)
			{
				ScoreService.create({email:$scope.user.email, token:$scope.user.token, class_id: $scope.classRoom.id, name:$scope.task, init_score:$scope.init_score, max_score:$scope.max_score , class_id:$scope.classRoom.id}, function(data)
				{
					console.log('created issue')
					console.log(data)
					$scope.setScoreCount =0;
					for(var i=0; i < $scope.selectedUsers.length; i++)
					{
						var user = $scope.selectedUsers[i];
						ScorerService.setScore({email:$scope.user.email, token:$scope.user.token, id:data.id, score:user.score, user_id:user.id}, function(setScoreData) {
							$scope.setScoreCount++;
							console.log('count score : ' + $scope.setScoreCount)
							console.log('selected user : ' + $scope.selectedUsers.length)
							if($scope.setScoreCount >= $scope.selectedUsers.length)
								$scope.afterSave();
						})
					}
					
					
				})
			}else
			{
				ScoreService.update({email:$scope.user.email, token:$scope.user.token, class_id: $scope.classRoom.id, name:$scope.task, init_score:$scope.init_score, max_score:$scope.max_score , class_id:$scope.classRoom.id, id:$scope.app_score.task_id}, function(data)
				{
					console.log('updated')
					console.log(data)
					$scope.afterSave();
				})
			}
			
		}
		
	}

	$scope.afterSave = function()
	{
		//create new issue on screen
		console.log('emit initScore')
		$scope.isUpdateMode = true;
		$scope.socket.emit('initScore', $scope.getScoreData());
	}

	$scope.saveScore = function(student)
	{
		var index;
		for(var i=0; i < $scope.students.length; i++)
		{
			if($scope.students[i] == student.id)
			{
				index = i;
				break;
			}
		}

		$scope.students[index] = student;
		//console.log($scope.students);
		/*
		* Save Student Score in Database and then Send to screen if it's Live Mode
		*/
		ScorerService.setScore({email:$scope.user.email, token:$scope.user.token, id:$scope.task_id, score:student.score, user_id:student.id}, function(setScoreData) {
			if($scope.isLiveMode)
				$scope.socket.emit('updateScore', student);
		})

		
	}

	$scope.goPageScreen = function()
	{
		$scope.goAppPage('score', 'screen');
	
	}



	/*
	* When Someone update 1 score
	* get new task, students
	*/
	$scope.onUpdateScore = function(new_io_data)
	{
		//$scope.isUpdateMode = true;
		console.log('onUpdateScore')
		console.log(new_io_data)
	}

	/*
	* Occur after cload io to get current io_data
	* Occur after load controller and controller send request to
	*/
	$scope.onCheckUpdate = function(data)
	{
		$scope.isLiveMode = false;
		//get live issue and students from io
		$scope.task_id = data.task_id
  		$scope.task = data.task;
  		$scope.students = data.students;
  		$scope.max_score = data.max_score;
  		if(typeof($scope.task) == 'string')
  		{


  			$scope.isGameOn = true;
			ScoreService.get({id:data.task_id}, function(db_data)
  			{
  				$scope.issue_status = 	db_data.status;

  			})  			
  			
  		}
  			
  		
  		/*check if got load Issue ( data.task_id != issue.id)
		* In case that no task score (not live mode) and got issue data from $rootScope(aka scope) load data
		*/
  		//if(typeof($scope.app_score) != "undefined" && typeof($scope.app_score.issue) != "undefined" && $scope.app_score.issue.id  > 0 && data.task_id != $scope.app_score.issue.id)
  		if(typeof($scope.app_score) != "undefined" && typeof($scope.app_score.issue_mode) != "undefined"  && $scope.app_score.issue_mode == SCORE_MODE_UPDATE)
  		{
  			console.log('load score from rootScope');
  			console.log($scope.app_score);
  			$scope.task_id = $scope.app_score.issue.id
  			$scope.isUpdateMode = true;
  			$scope.task = $scope.app_score.issue.name;
  			$scope.max_score = Number($scope.app_score.issue.max_score);
  			$scope.students = [];
			ScorerService.list({email:$scope.user.email, token:$scope.user.token, issue_id:$scope.app_score.issue.id}, function(info){
				$scope.students = scoreConfig.convertStudentDB(info)
			
			})

			/*
		  	* Check IF Live Mode is same as this issue or not if it's the same then it's live Mode
		  	*/

		  	if($scope.isGameOn && data.task_id == $scope.app_score.issue.id)
		  		$scope.isLiveMode = true;

  		}else
	  	{
	  		$scope.isUpdateMode = false;
	  		console.log("not update mode");
	  		console.log($scope.app_score)
	  	}
  		
	  

  		
	}

	$scope.afterLoadIO = function()
	{
		$scope.socket = io.connect('http://' + scoreConfig.server + ':' + scoreConfig.port);
	  	$scope.canSave = true;
	  	$scope.socket.on('updateScore', function(data){
	  		$scope.$apply(function(){
	  			$scope.onUpdateScore(data);
	  			//$scope.goPageScreen();
	  		})
	  		
	  	})
	  	$scope.socket.emit('checkUpdate', {email:$scope.user.email, token:$scope.user.token});
	  	$scope.socket.on('onCheckUpdate', function(data){
	  		$scope.$apply(function(){
	  			$scope.onCheckUpdate(data);
	  		})
	  		
	  	})

	  	console.log('canSave')
	}

	$scope.checkIO = function()
	{
		if(typeof(io) != 'undefined')
			$scope.afterLoadIO();
		else
			$timeout($scope.checkIO, 100);
	}

	$scope.checkIO();
	
}

function ScoreScreenCtrl($scope, $timeout)
{
	$scope.back = function()
	{
		var admin_item_page = {app_name:"score", type:"apps", url:"admin"};
		$scope.loadPage(admin_item_page)
	}

	$scope._isCallScriptLoaded = false;
	$scope.afterLoadIO = function()
	{
		$scope.socket = io.connect('http://' + scoreConfig.server + ':' + scoreConfig.port);
	  	$scope.canSave = true;
	  	$scope.socket.emit('getScore', {user:$scope.user});
	  	$scope.socket.on('getScore', function(data){
	  		$scope.$apply(function(){
	  			console.log('get score');
	  			console.log(data)
	  			$scope.isGameOn = true;
	  			$scope.students = data.students;
	  			$scope.task = data.task;
	  			$scope.max_score = data.max_score;
	  		})
	  		
	  	})
	  	$scope.socket.on('updateScore', function(data){
	  		$scope.$apply(function(){
	  			$scope.students = data.students;
	  			$scope.task = data.task;
	  			$scope.max_score = data.max_score;
	  			//$scope.goPageScreen();
	  		})
	  		
	  	})
	  	console.log('canSave')
	}

	$scope.checkIO = function()
	{
		if(typeof(io) != 'undefined')
		{
			if(!$scope._isCallScriptLoaded)
			{
				scoreConfig.loadScript();
				$scope._isCallScriptLoaded = true;
			}
			$scope.afterLoadIO();
		}			
		else
			$timeout($scope.checkIO, 100);
	}

	$scope.checkIO();
}

data_service.factory('ScoreList', function($resource){
  return $resource('/admin/index.php?r=score/default/list&class_id=:class_id', {}, {
    query: {method:'GET', params:{}, isArray:true },
  });
});
data_service.factory('ScoreService', function($resource){
	return $resource('/admin/index.php?r=score/default/:service&email=:email&token=:token&name=:name&init_score=:init_score&max_score=:max_score&class_id=:class_id&id=:id', {}, {
		create:{method:'GET', params:{service:'create', id:'-1'} },
		update:{method:'GET', params:{service:'update' }},
		get:{method:'GET', params:{service:'get', email:"none", token:"none", name:"none", init_score:"none", max_score:'none', class_id:'none'} }
	})

});

data_service.factory('ScorerService', function($resource){
  return $resource('/admin/index.php?r=score/default/:service&email=:email&token=:token&issue_id=:issue_id&score=:score&id=:id&user_id=:user_id', {}, {
    list: {method:'GET', params:{service:'listScorer', score:0, id:-1, user_id:-1}, isArray:true },
    setScore:{method:'GET', params:{service:'setScore', issue_id:-1} }
  });
})
//SetScore($email, $token, $user_id, $id, $score)

app.filter('scoreIssueStatus', function(){
	return function(input)
	{
		input = Number(input)
		if(input == 1 )
			return "active";
		else
			return "not-active";
	}
} );

/**/