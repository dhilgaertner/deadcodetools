/**
 * Created by DHilgaertner on 4/21/15.
 */

var dctApp = angular.module('dctApp', []);

dctApp.controller('main', ['$scope', 'talk', function ($scope, talk) {
    $scope.playerNotesFlag = true;
    $scope.autoEndTurnFlag = false;
    $scope.kakkuManFlag = GM_getValue("dct-options-kakkutheme");
    $scope.isTimerOn = false;
    $scope.isInit = false;
    $scope.betaFeaturesFlag = GM_getValue("dct-options-beta-toggle") != null;
    $scope.tableChatFlag = false;
    $scope.heartbeatCount = 0;
    $scope.tableName = null;

    function heartbeat() {
        if ($scope.isTimerOn) {

            updatePlayers();
            AutoEndTurnCheck();
            processChat();
            processMessages();

            if (!$scope.isInit) {
                var elArr = $('.iogc-LoginPanel-nameHeading');
                if (elArr.length > 0) {
                    var n = $(elArr[0]).html();

                    chrome.runtime.sendMessage({'action' : 'setUser', 'user' : n}, function(){
                        //console.log("sent: " + n);
                    });

                    $scope.isInit = true;
                }
            }

            // Every 5 heartbeat counts
            if ($scope.heartbeatCount % 5 == 0) {
                talk.getRooms();
            }

            var currentTableName = window.location.hash;
            var userName = $('div.iogc-LoginPanel-nameHeading').html();

            if ($scope.tableName != currentTableName) {

                if (!talk.isDisconnected()) {
                    talk.disconnect();
                    talk.connect(currentTableName, userName);
                }

                $scope.tableName = currentTableName;
            }

            $scope.heartbeatCount++;
            $scope.timer = setTimeout(heartbeat, 3000);
        }
    }

    $scope.kakkuManFlagOnChange = function() {
        if (!$scope.kakkuManFlag) {
            GM_deleteValue("dct-options-kakkutheme");
            alert('Refresh page for changes to take effect.')
            track("Kakku Man Theme", "Unchecked");
        } else {
            GM_setValue("dct-options-kakkutheme", "true");
            dctools.kakkuTheme();
            track("Kakku Man Theme", "Checked");
        }
    }

    $scope.betaFeaturesFlagOnChange = function() {
        if (!$scope.betaFeaturesFlag) {
            GM_deleteValue("dct-options-beta-toggle");
            track("Beta Features", "Off");
        } else {
            GM_setValue("dct-options-beta-toggle", "true");
            track("Beta Features", "On");
        }
    }

    $scope.tableChatFlagOnChange = function() {
        if (!$scope.tableChatFlag) {
            track("Table Chat", "Off");
        } else {
            track("Table Chat", "On");
        }
    }

    function processChat() {
        var newMessages = $('.iogc-ChatPanel-messages tr:not(.dct-processed)');
        if (newMessages.length > 0) {
            newMessages.addClass("dct-processed");
        }
    }

    function processMessages() {
        var newMessages = $('.iogc-MessagePanel-messages tr:not(.dct-processed)');
        if (newMessages.length > 0) {
            newMessages.addClass("dct-processed");
        }
    }

    function AutoEndTurnCheck() {
        if ($scope.autoEndTurnFlag) {
            if ($('.iogc-GameWindow-status').html().indexOf("waiting") != -1) {
                $scope.autoEndTurnFlag = false;
            }

            var isRound1 = ($('.iogc-GameWindow-status').html().length - $('.iogc-GameWindow-status').html().indexOf("running round 1")) == 15;

            if (isRound1) {
                $scope.autoEndTurnFlag = false;
            }
        }

        if ($scope.autoEndTurnFlag) {
            $('.iogc-Controls button:visible').each(function() {
                if ($(this).html() == "End Turn") {
                    this.click();
                    track("Auto End Turn", "Turn Ended");
                }
            });
        }
    }

    function updatePlayers() {
        $('.dct-infolink').remove();

        var players = [];
        $('.iogc-PlayerPanel*').each(function(){

            var infoLink = $('<div class="dct-infolink" style="position: absolute; top: 0px; left 0px; background-color: Green; height: 10px; width: 10px;"></div>');
            var nameEl = $(this).find('.iogc-PlayerPanel-name a');

            if (GM_getValue("dct-" + nameEl.html(), null) != null) {
                infoLink.attr("style", "position: absolute; top: 0px; left 0px; background-color: Yellow; height: 10px; width: 10px;")
            }

            if (nameEl.length != 0) {
                var pictureEl = $(this).find('.iogc-PlayerPanel-avatar');

                $(infoLink).click(function() {

                    var cur_player_panel = $(this).parents('.iogc-PlayerPanel*')[0];
                    var cur_name_el = $(cur_player_panel).find('.iogc-PlayerPanel-name a').clone();

                    var cur_username = cur_name_el.html();
                    var cur_avatar_url = $(cur_player_panel).find('img.iogc-PlayerPanel-avatar').attr('src');
                    var cur_profile_id = cur_name_el.attr('href').replace('/profile/','');

                    dctools.openInfoBox(cur_username, cur_profile_id, cur_avatar_url);
                    track("Player Notes", "Viewed");
                    $scope.$apply();
                });

                $(pictureEl).after(infoLink);
                players.push(nameEl.html());
            }
        });
    }

    $('.iogc-GameWindow-sitDownButton').click(function() {
        AutoEndTurnCheck();
        $scope.$apply();
    })

    $scope.isTimerOn = true;
    setTimeout(heartbeat, 500);
    track("Deadcode Tools", "Initialized");
}]);

dctApp.controller('infobox', ['$scope', function ($scope) {
    $scope.isVisible = false;
    $scope.username = null;
    $scope.profileId = null;
    $scope.avatarUrl = null;
    $scope.comments = "";

    $scope.openInfoBox = function(username, profileId, avatarUrl){
        $scope.isVisible = true;
        $scope.username = username;
        $scope.profileId = profileId;
        $scope.avatarUrl = avatarUrl;

        $scope.comments = GM_getValue("dct-" + $scope.username, "");

        $('.flash').css('visibility', 'hidden');
    }

    $scope.closeInfoBox = function(){
        $scope.isVisible = false;
        $scope.username = null;
        $scope.profileId = null;
        $scope.avatarUrl = null;
        $scope.comments = "";

        $('.flash').css('visibility', 'visible');
    }

    $scope.addKdiceReview = function() {
        if ($scope.comments != "") {
            dctools.addReview($scope.profileId, $scope.comments, function(data) {
                alert(data);
                $('<span>Done!</span>').insertAfter(button);
                track("Player Notes", "KDice Review Created");
            });
        }
    }

    $scope.saveAndExit = function() {
        if ($scope.comments != "") {
            GM_setValue("dct-" + $scope.username, $scope.comments);

            track("Player Notes", "Note Created");
        } else {
            GM_deleteValue("dct-" + $scope.username);
        }

        $scope.closeInfoBox();
    }

    dctools.openInfoBox = function(username, profileId, avatarUrl){
        $scope.openInfoBox(username, profileId, avatarUrl);
    }

    dctools.closeInfoBox = function(){
        $scope.closeInfoBox();
    }
}]);

dctApp.controller('voiceChat', ['$scope', 'talk', '$http', function ($scope, talk, $http) {
    $scope.voiceChatRooms = [];

    $scope.talkState = function() {
        return talk.state;
    }

    $scope.voiceChatRooms = function() {
        return talk.rooms;
    }

    $scope.isDisconnected = function() {
        return talk.isDisconnected();
    }

    $scope.connectVoiceChat = function(){
        var userName = $('div.iogc-LoginPanel-nameHeading').html();
        var roomName = window.location.hash;

        talk.connect(roomName, userName);
    }

    $scope.disconnectVoiceChat = function(){
        talk.disconnect();
    }

    $scope.muteVoiceChat = function(){
        talk.mute();
    }

    $scope.unmuteVoiceChat = function(){
        talk.unmute();
    }

}]);

dctApp.factory('talk', ['$window', '$http', '$rootScope', function(win, $http, $rootScope) {
    var service = {};

    service.state = "DISCONNECTED";
    service.rooms = [];

    var initTalk = function() {

    }

    var talkStateChange = function (state) {
        service.state = state;
        $rootScope.$apply();
        console.log("talk state change: " + state);
    }

    var talk = new Talk("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", initTalk, talkStateChange);

    service.connect = function(roomName, userName) {
        talk.connect(roomName, userName);
        console.log("talk.connect(" + roomName + ", " + userName + ");");
    }

    service.mute = function() {
        talk.mute();
        console.log("talk.mute();");
    }

    service.unmute = function() {
        talk.unmute();
        console.log("talk.unmute();");
    }

    service.disconnect = function() {
        talk.disconnect();
        console.log("talk.disconnect();");
    }

    service.getRooms = function() {
        $http({
            method: 'GET',
            url: 'https://api.yax.io/v1/talk/participants/active'
        }).then(function successCallback(response) {
                console.dir(response);
                service.rooms = response.data;
            }, function errorCallback(response) {
                console.dir(response);
            });
    }

    service.isDisconnected = function() {
        return service.state == "DISCONNECTED" || service.state == "READY";
    }

    return service;
}]);