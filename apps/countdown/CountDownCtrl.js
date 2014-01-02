var CountDown = {
	server:"192.168.1.30",
	port:"8080"
};

CountDown.scriptUrl = "http://"+ CountDown.server + ":" + CountDown.port + "/socket.io/socket.io.js";

CountDown.convertTimeToStr = function(time)
{
	if(time < 10)
		return "0"+time;
	else
		return time+"";
}

CountDown.getCountDown = function(limit)
{
	var hours = Math.floor(limit / (60 * 60) );
	var left_limit = limit - (hours * 60 * 60);
	var mins = Math.floor(left_limit / 60);
	left_limit = left_limit - (mins * 60);
	var secs = left_limit;


	return {hours:CountDown.convertTimeToStr(hours), mins:CountDown.convertTimeToStr(mins), secs:CountDown.convertTimeToStr(secs)};
}

CountDown.loadScript = function()
{
	var script_html = "<script src=\"" + CountDown.scriptUrl + "\"></script>";
	$('#countdown-app').append(script_html);
}

function CountDownCtrl($scope, $rootScope , $timeout)
{

	$scope.countdown = {hours:0, mins:0, secs:0}
	$scope.canSave = false;
	$scope.scriptUrl = CountDown.scriptUrl;

	//jquery path
	CountDown.loadScript();

	$scope.convertTimeToLimit = function()
	{
		var limit = 0;
		limit += $scope.countdown.hours * 60  * 60;
		limit += $scope.countdown.mins * 60
		limit += $scope.countdown.secs;
		return limit;
	}

	$scope.startCountDown = function()
	{
		$rootScope.task = $scope.task;
		$rootScope.init_limit = $scope.convertTimeToLimit();
		var screen_item_page = {app_name:"countdown", type:"apps", url:"screen"};
		$scope.socket.emit('saveCountDown', { limit: $rootScope.init_limit, task:$rootScope.task });
		$scope.loadPage(screen_item_page)
	}

	$scope.afterLoadIO = function()
	{
		$scope.socket = io.connect('http://' + CountDown.server + ':' + CountDown.port);
	  	$scope.canSave = true;
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

var COUNTDOWN_PAUSE_STATE  = 0, COUNTDOWN_PLAY_STATE = 1;

function CountDownScreenCtrl($scope, $timeout)
{
	$//scope.init_limit = 1.5*60*60;
	$scope.limit = $scope.init_limit;
	//$scope.task = "สร้างโพสต์จำนวน 1 โพสต์ ต้องมี bullet, ตัวหนา, ตัวเอียง, สีด้วยนะ";
	$scope.control = {};
	$scope.control.pause = {name:"pause", state:COUNTDOWN_PLAY_STATE};
	$scope.control.edit = {name:"admin"};

	$scope.convertTimeToStr = CountDown.convertTimeToStr


	var ctx = document.getElementById("myChart").getContext("2d");
	

	$scope.canCountDown = function()
	{
		return ($scope.limit >= 0 );
	}

	$scope.getCountDown = CountDown.getCountDown;

	$scope.doCountDown = function()
	{
		//do some thing;
		$scope.countdown = $scope.getCountDown($scope.limit);
		$scope.limit--;
		var data = [
			{
				value: $scope.limit/$scope.init_limit * 100,
				color:"#F7464A"
			},
			{
				value : ($scope.init_limit - $scope.limit)/ $scope.init_limit * 100,
				color : "#E2EAE9"
			}	
		];
		var chart = new Chart(ctx).Doughnut(data, {animation : false});

		if($scope.canCountDown() && $scope.control.pause.state == COUNTDOWN_PLAY_STATE)
			$timeout($scope.doCountDown, 1000)			

	}

	$scope.togglePause = function()
	{
		if($scope.control.pause.state == COUNTDOWN_PAUSE_STATE)
		{
			$scope.control.pause.state = COUNTDOWN_PLAY_STATE
			$scope.control.pause.name ="pause"
			$timeout($scope.doCountDown, 1000)
			$scope.socket.emit('play');
		}else if($scope.control.pause.state == COUNTDOWN_PLAY_STATE)
		{
			$scope.control.pause.state = COUNTDOWN_PAUSE_STATE;
			$scope.control.pause.name ="play"
			$scope.socket.emit('pause');
		}

		
	}

	$timeout($scope.doCountDown, 1000);

	CountDown.loadScript();

	$scope.afterLoadIO = function()
	{
		console.log("after load socket.io")
		$scope.socket = io.connect('http://' + CountDown.server + ':' + CountDown.port);
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

function CountDownWidgetCtrl($scope, $timeout)
{
	CountDown.loadScript();
	$scope.canShow = false;
	$scope.countdown = {};
	$scope.afterLoadIO = function()
	{
		console.log("after load socket.io")
		$scope.socket = io.connect('http://' + CountDown.server + ':' + CountDown.port);
		$scope.socket.emit('getCountDown');
		$scope.socket.on("onCountDown", function(data){
			$scope.$apply(function(){
				var task = data.task;
				var limit = data.limit;
				$scope.countdown = CountDown.getCountDown(limit);
				$scope.task = task;
				if(typeof(data.limit) == 'number' && data.limit >= 0)
					$scope.canShow = true;
				console.log('canShow : ' + $scope.canShow)

			})
			
		})
 		$scope.socket.on('countDownComplete', function(data) {
 			alert("หมดเวลา : " + $scope.task);
 			$scope.$apply(function(){
 				$scope.canShow = false;
 			});
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