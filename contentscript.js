dctools = {};
dctools.isTimerOn = false;
dctools.isInit = false;
dctools.browser = null;
dctools.wsCounter = 0;
dctools.talk = null;
dctools.tableName = null;

dctools.init = function() {
	if(dctools.currentSection() == "forum") {
		if (GM_getValue("dct-options-kakkutheme") != null) {
			$('input[name="dct-options-kakkutheme"]').prop('checked', true);
			dctools.kakkuTheme();
		}

        $('div.topic-item div.body').each(function() {
            var urls = $(this).find('a');

            $.each(urls, function(index, value) {
                var replace = dctools.processForumUrl2(value);

                if (replace != null) {
                    $(value).replaceWith(replace);
                }
            });
            //console.log(urls);
        });
    } else if(dctools.currentSection() == "profile") {
        var username = $('#profile table:nth-child(1) td:nth-child(2) h2.mainheader:nth-child(1)').text();

        if (username == 'Gurgi') {
            var skullUrl = chrome.runtime.getURL('skull.jpg');
            var section = $('#profile table:nth-child(1) td:nth-child(1) .section:nth-of-type(3)');
            section.after($('<div class="section" style="text-align: center"><div class="sideStats"><img align="center" width="80" src="' + skullUrl + '"></div><span>BAMF</span></div>'));
        }
    } else {
		var panel = $('<div style="margin-top: 10px;"></div>');
		var dctTitle = $('<div class="iogc-SidePanel-title">Deadcode Tools</div>').appendTo(panel);
		var sidepanel = $('<div class="iogc-SidePanel-inner"></div>').appendTo(panel);

        var dctNotes = $('<span><input type="checkbox" id="dct-notes" checked="true" disabled="true" /> <b>Player Notes</b>: ON (local) </span><br/>').appendTo(sidepanel);
		var aetTitle = $('<span><input type="checkbox" id="dct-aet" /> <b>Auto End Turn</b></span>').appendTo(sidepanel);
		var awaTitle = $('<span><input type="checkbox" id="dct-awa" /> <b>Attack Alert</b> </span>').appendTo(sidepanel);
		var flagHighlightGame = $('<br/><span><input type="checkbox" name="dct-options-hiflags-game" /> <b>Highlight Flags (Game)</b> </span>').appendTo(sidepanel);
		var flagHighlight = $('<br/><span><input type="checkbox" name="dct-options-hiflags" /> <b>Highlight Flags (Chat)</b> </span>').appendTo(sidepanel);
		var kakkuTheme = $('<br/><span><input type="checkbox" name="dct-options-kakkutheme" /> <b>Kakku Mans Theme</b> </span><br />').appendTo(sidepanel);

        var betaTitle = $('<br/><hr><br/><span><b>BETA Feature(s)</b> <input type="checkbox" name="dct-options-beta" /></span><br />').appendTo(sidepanel);
        var tableChat = $('<br/><span><input type="checkbox" name="dct-options-tablechat" /> <b>Connect To Voice Chat (table)</b> </span><br />').appendTo(sidepanel);
        var betaDesc = $('<br/><span>Thanks for using Deadcode Tools.  This feature allows for voice communication at the table level.  Checking the box will connect you to the room\'s voice chat.  You will hear and be able to speak to people within the room who also use Deadcode Tools and have this box checked. This is just a test version of the feature. Use for fun only. Enjoy! Please send me feedback and bugs on forum or at <a href="mailto:dustin@yax.io">dustin@yax.io</a>. - deadcode</span>').appendTo(sidepanel);

        tableChat.hide();
        betaDesc.hide();
        awaTitle.hide();
	
		dctools.infoBox = $('<div class="dct-infobox" style="z-index: 99; position: absolute; top:180px; left:150px; height:340px; width:500px; background-color: white; border: 2px solid Grey;"></div>')
	
		dctools.infoBox.append($('<div class="dct-status"><div class="dct-close" style="cursor: pointer; color: white; float: right; height:15px; width:15px; background-color: Red;">X</div></div>'));
		dctools.infoBox.append($('<div class="dct-header"></div>'));
		dctools.infoBox.append($('<div class="dct-edit"><div style="float: left; margin-left: 5px; margin-top: 16px; width: 170px; border: 1px solid black;">' + 
			'<input type="checkbox" name="stabbed-me" /> Stabbed me<br />' +
			'<input type="checkbox" name="trucer" /> Capable of trucing<br />' +
			'<input type="checkbox" name="pga" /> PGA<br />' +
			'<input type="checkbox" name="racist"  /> Racist<br />' +
			'<input type="checkbox" name="jerk"  /> Jerk<br />' +
			'<input type="checkbox" name="honorable"  /> Honorable<br />' +
			'<input type="checkbox" name="pro" /> Pro<br />' +
			'<input type="checkbox" name="intermediate" /> Intermediate<br />' +
			'<input type="checkbox" name="beginner" /> Beginner<br />' +
			'<input type="checkbox" name="farmer" /> Farmer<br />' +
			'<input type="checkbox" name="silent_truces" /> Silent Truces<br />' +
			'<input type="checkbox" name="spammer" /> Spammer<br />' +
			'</div><div style="float: right; width: 310; margin-rigth: 5px; margin-top: 0px;">' +
			'<span>Comments</span><br />' +
			'<textarea name="comments" style="width: 305px; height: 200px;"></textarea><br />' +
			'<button class="dct-kdice-review" style="float: left;" type="button">Post as KDice Review</button>' +
			'<button class="dct-save" style="float: right;" type="button">Save and Exit</button>' +
			'</div></div>'));

		$('#iogc-PlayerPanel').after(panel);
		
		if (GM_getValue("dct-options-hiflags-game") != null) {
			$('input[name="dct-options-hiflags-game"]').prop('checked', true);
		}
	
		$('input[name="dct-options-hiflags-game"]').change(function(){
			if ($('input[name="dct-options-hiflags-game"]:checked').length == 0) {
				GM_deleteValue("dct-options-hiflags-game");
				dctools.checkGameForFlags(true);
				track("Highlight Flags (Game)", "Unchecked");
			} else {
				GM_setValue("dct-options-hiflags-game", "true");
				dctools.checkGameForFlags(false);
				track("Highlight Flags (Game)", "Checked");
			}
		});
		
		if (GM_getValue("dct-options-hiflags") != null) {
			$('input[name="dct-options-hiflags"]').prop('checked', true);
		}
	
		$('input[name="dct-options-hiflags"]').change(function(){
			if ($('input[name="dct-options-hiflags"]:checked').length == 0) {
				GM_deleteValue("dct-options-hiflags");
				track("Highlight Flags", "Unchecked");
			} else {
				GM_setValue("dct-options-hiflags", "true");
				dctools.checkForChatKeyword($('.iogc-MessagePanel-inner td'));
				track("Highlight Flags", "Checked");
			}
		});
	
		if (GM_getValue("dct-options-kakkutheme") != null) {
			$('input[name="dct-options-kakkutheme"]').prop('checked', true);
			dctools.kakkuTheme();
		}
	
		$('input[name="dct-options-kakkutheme"]').change(function(){
			if ($('input[name="dct-options-kakkutheme"]:checked').length == 0) {
				GM_deleteValue("dct-options-kakkutheme");
				$('input[name="dct-options-kakkutheme"]').attr('disabled', true);
				alert('Refresh page for changes to take effect.')
				track("Kakku Man Theme", "Unchecked");
			} else {
				GM_setValue("dct-options-kakkutheme", "true");
				dctools.kakkuTheme();
				track("Kakku Man Theme", "Checked");
			}
		});

        if (GM_getValue("dct-options-beta") != null) {
            $('input[name="dct-options-beta"]').prop('checked', true);
            tableChat.show();
            betaDesc.show();
        }

        $('input[name="dct-options-beta"]').change(function(){
            if ($('input[name="dct-options-beta"]:checked').length == 0) {
                GM_deleteValue("dct-options-beta");
                tableChat.hide();
                betaDesc.hide();
                track("Beta Feature", "Off");
            } else {
                GM_setValue("dct-options-beta", "true");
                tableChat.show();
                betaDesc.show();
                track("Beta Feature", "On");
            }
        });

        $('input[name="dct-options-tablechat"]').change(function(){
            if ($('input[name="dct-options-tablechat"]:checked').length == 0) {
                GM_deleteValue("dct-options-tablechat");
                if (dctools.talk != null) {
                    dctools.talk.disconnect();
                    console.log("dctools.disconnect();");

                }
                track("Table Chat", "Off");
            } else {
                GM_setValue("dct-options-tablechat", "true");

                var roomName = window.location.hash;
                var userName = $('div.iogc-LoginPanel-nameHeading').html();

                if (dctools.talk == null) {
                    dctools.talk = new Talk("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", function() {
                        dctools.talk.connect(roomName, userName);
                        console.log("dctools.connect(" + roomName + ", " + userName + ");");
                    });
                } else {
                    dctools.talk.disconnect();
                    console.log("dctools.disconnect();");
                    dctools.talk.connect(roomName, userName);
                    console.log("dctools.connect(" + roomName + ", " + userName + ");");
                }

                track("Table Chat", "On");
            }
        });

		$('#iogc-regularMenu').clone().insertAfter('#hd');
	
		$('.iogc-GameWindow-sitDownButton').click(function() {
			dctools.AutoEndTurnCheck();
		})
	
		dctools.isTimerOn = true;
		dctools.heartbeat();
		track("Deadcode Tools", "Initialized");
	}
}

dctools.heartbeat = function() {
	if (dctools.isTimerOn) {
		
		dctools.updatePlayers();
		dctools.AutoEndTurnCheck();
		dctools.processChat();
		dctools.processMessages();
		
		if (!dctools.isInit) {
			var elArr = $('.iogc-LoginPanel-nameHeading');
			if (elArr.length > 0) {
				var n = $(elArr[0]).html();

                chrome.runtime.sendMessage({'action' : 'setUser', 'user' : n}, function(){
                    //console.log("sent: " + n);
                });

				dctools.isInit = true;
			}
		}

        var currentTableName = window.location.hash;

        if (dctools.tableName != currentTableName) {
            if ($('input[name="dct-options-tablechat"]:checked').length != 0) {
                GM_setValue("dct-options-tablechat", "true");

                var roomName = window.location.hash;
                var userName = $('div.iogc-LoginPanel-nameHeading').html();

                if (dctools.talk == null) {
                    dctools.talk = new Talk("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08", function() {
                        dctools.talk.connect(roomName, userName);
                        console.log("dctools.connect(" + roomName + ", " + userName + ");");
                    });
                } else {
                    dctools.talk.disconnect();
                    console.log("dctools.disconnect();");
                    dctools.talk.connect(roomName, userName);
                    console.log("dctools.connect(" + roomName + ", " + userName + ");");
                }

                track("Table Chat", "On");
            }

            dctools.tableName = currentTableName;
        }

		dctools.timer = setTimeout(dctools.heartbeat, 3000);
	}
}

dctools.processChat = function() {
	var newMessages = $('.iogc-ChatPanel-messages tr:not(.dct-processed)');
	
	if (newMessages.length > 0) {
		
		dctools.checkForChatKeyword(newMessages);
		
		newMessages.addClass("dct-processed");
	}
}

dctools.processMessages = function() {
	var newMessages = $('.iogc-MessagePanel-messages tr:not(.dct-processed)');
	
	if (newMessages.length > 0) {
		
		newMessages.addClass("dct-processed");
	}
}

dctools.processForumUrl = function(url) {
    var imageTest = /\.(jpe?g|png|gif)$/gi;

    if (imageTest.test(url)) {
        return '<img src="' + url + '" style="max-width: 700px;"><br>Source: <a href="' + url + '" target="_blank">' + url + '</a>';
        console.log('image found: ' + url);
    } else {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    }
}

dctools.processForumUrl2 = function(urlEl) {
    var imageTest = /\.(jpe?g|png|gif)$/gi;
    var url = $(urlEl).attr('href');

    if (imageTest.test(url)) {
        return $('<img src="' + url + '" style="max-width: 700px;"><br>Source: <a href="' + url + '" target="_blank">' + url + '</a>');
        console.log('image found: ' + url);
    } else {
        return null;
    }
}

dctools.checkForChatKeyword = function(elements) {
	if (GM_getValue("dct-options-hiflags") != null) {
        try {
            $(elements).highlight("flag")
                .highlight('flg')
                .highlight('falg')
                .highlight('lagf');
        }
        catch(err) {
            console.log("Highlight Chat Flags Failed.")
        }
	}
}

dctools.AutoEndTurnCheck = function() {
	if ($('#dct-aet').is(':checked')) {
		if ($('.iogc-GameWindow-status').html().indexOf("waiting") != -1) {
			$('#dct-aet').prop('checked', false);
		}
		
		var isRound1 = ($('.iogc-GameWindow-status').html().length - $('.iogc-GameWindow-status').html().indexOf("running round 1")) == 15;
		
		if (isRound1) {
			$('#dct-aet').prop('checked', false);
		}
	}
	
	if ($('#dct-aet').is(':checked')) {
		$('.iogc-Controls button:visible').each(function() {
			if ($(this).html() == "End Turn") {
				this.click();
				track("Auto End Turn", "Turn Ended");
			}
		});
	}
}

dctools.chromeSupport = function() {
	if (typeof GM_deleteValue == 'undefined') {
		
		dctools.browser = "chrome";
		
	    GM_addStyle = function(css) {
	        var style = document.createElement('style');
	        style.textContent = css;
	        document.getElementsByTagName('head')[0].appendChild(style);
	    }

	    GM_deleteValue = function(name) {
	        localStorage.removeItem(name);
	    }

	    GM_getValue = function(name, defaultValue) {
	        var value = localStorage.getItem(name);
	        if (!value)
	            return defaultValue;
	        var type = value[0];
	        value = value.substring(1);
	        switch (type) {
	            case 'b':
	                return value == 'true';
	            case 'n':
	                return Number(value);
	            default:
	                return value;
	        }
	    }

	    GM_log = function(message) {
	        console.log(message);
	    }

	    GM_openInTab = function(url) {
	        return window.open(url, "_blank");
	    }

	     GM_registerMenuCommand = function(name, funk) {
	    //todo
	    }

	    GM_setValue = function(name, value) {
	        value = (typeof value)[0] + value;
	        localStorage.setItem(name, value);
	    }
	} else {
		dctools.browser = "firefox";
	}
}

dctools.checkGameForFlags = function(shouldClear) {
	if (GM_getValue("dct-options-hiflags-game") != null) {
		$('.iogc-PlayerPanel*').each(function(){
			var isFlagged = $(this).find('.iogc-StatPanel table:first > tbody > tr > td').length > 1;
	
			if (isFlagged) {
				$(this).css('border', 'double black');
			} else {
				$(this).css('border', 'none');
			}
		});
	} else {
		if (shouldClear) {
			$('.iogc-PlayerPanel*').css('border', 'none');
		}
	}
}

dctools.updatePlayers = function() {
	$('.dct-infolink').remove();
    $('.dct-dc-logo').remove();

	dctools.checkGameForFlags(false);
	
	var players = [];
	$('.iogc-PlayerPanel*').each(function(){
		var infoLink = $('<div class="dct-infolink" style="position: absolute; top: 0px; left 0px; background-color: Green; height: 10px; width: 10px;"></div>');
		var nameEl = $(this).find('.iogc-PlayerPanel-name a');

        if (GM_getValue("dct-" + nameEl.html(), null) != null) {
			infoLink.attr("style", "position: absolute; top: 0px; left 0px; background-color: Yellow; height: 10px; width: 10px;")
		}
			
		if (nameEl.length != 0) {
			var pictureEl = $(this).find('.iogc-PlayerPanel-avatar');

            $(pictureEl).before(infoLink);
			
			infoLink.click(function() {
				$('.dct-infobox').remove();
				
				var clone = dctools.infoBox.clone();
				
				var cur_player_panel = $(this).parents('.iogc-PlayerPanel*')[0];
				
				var cur_name_el = $(cur_player_panel).find('.iogc-PlayerPanel-name a').clone();
				
				clone.find('.dct-header').append($(cur_player_panel).find('.iogc-PlayerPanel-avatar').clone())
										 .append(cur_name_el);
				
				clone.find('.dct-kdice-review').click(function() {
					var button = $(this);
					var el = clone.find('.dct-header a')[0];
					var profileId = $(el).attr('href').replace('/profile/', '');
					var review = clone.find('textarea[name="comments"]').val();
					
					if (review != "") {
						dctools.addReview(profileId, review, function(data) {
							alert(data);
							$('<span>Done!</span>').insertAfter(button);
							track("Player Notes", "KDice Review Created");
						});
					}
				});
				
				clone.find('.dct-save').click(function() {
					var data = {};
					
					data.stabbed = clone.find('input[name="stabbed-me"]').is(':checked');
					data.trucer = clone.find('input[name="trucer"]').is(':checked');
					data.pga = clone.find('input[name="pga"]').is(':checked');
					data.racist = clone.find('input[name="racist"]').is(':checked');
					data.jerk = clone.find('input[name="jerk"]').is(':checked');
					data.honorable = clone.find('input[name="honorable"]').is(':checked');
					data.pro = clone.find('input[name="pro"]').is(':checked');
					data.intermediate = clone.find('input[name="intermediate"]').is(':checked');
					data.beginner = clone.find('input[name="beginner"]').is(':checked');
					data.farmer = clone.find('input[name="farmer"]').is(':checked');
					data.spammer = clone.find('input[name="spammer"]').is(':checked');
					data.silent_truces = clone.find('input[name="silent_truces"]').is(':checked');
					data.comments = clone.find('textarea[name="comments"]').val();
					
					var isData = data.stabbed || 
								data.trucer || 
								data.pga || 
								data.racist || 
								data.jerk || 
								data.honorable || 
								data.pro || 
								data.intermediate || 
								data.beginner || 
								data.spammer || 
								data.farmer || 
								data.silent_truces || 
								(data.comments != "");
			
					if (isData) {
						var dataString = $.toJSON(data);

						//alert(dataString);

						GM_setValue("dct-" + cur_name_el.html(), dataString);
						track("Player Notes", "Note Created");
					} else {
						GM_deleteValue("dct-" + cur_name_el.html());
					}
					
					$('.dct-infobox').remove();
					$('.flash').css('visibility', 'visible');
				});
				
				GM_log(cur_name_el.html());
				
				var json = GM_getValue("dct-" + cur_name_el.html(), null);
				
				GM_log(json);
				
				if (json != null) {
					var data = $.evalJSON(json);
					
					clone.find('input[name="stabbed-me"]').attr("checked", data.stabbed); 
					clone.find('input[name="trucer"]').attr("checked", data.trucer); 
					clone.find('input[name="pga"]').attr("checked", data.pga); 
					clone.find('input[name="racist"]').attr("checked", data.racist); 
					clone.find('input[name="jerk"]').attr("checked", data.jerk); 
					clone.find('input[name="honorable"]').attr("checked", data.honorable); 
					clone.find('input[name="pro"]').attr("checked", data.pro); 
					clone.find('input[name="intermediate"]').attr("checked", data.intermediate); 
					clone.find('input[name="beginner"]').attr("checked", data.beginner); 
					clone.find('input[name="farmer"]').attr("checked", data.farmer); 
					clone.find('input[name="spammer"]').attr("checked", data.spammer); 
					clone.find('input[name="silent_truces"]').attr("checked", data.silent_truces); 
					clone.find('textarea[name="comments"]').val(data.comments);
				}
				
				$('#mainpage').append(clone);
				$('.flash').css('visibility', 'hidden');
				
				$('.dct-close').click(function() {
					$('.dct-infobox').remove();
					$('.flash').css('visibility', 'visible');
				});
				
				track("Player Notes", "Viewed");
			});
			
			players.push(nameEl.html());
		}
	});
}

dctools.kakkuTheme = function() {
	//remove red shit:
	$('.menu2 style').remove();	

	//header:
	$('#logo a').appendTo("#hd")
	$('#hd div:first-child').hide();
	$('#hd').css("padding","5px 0 5px").css("text-align","left").css("width","auto");
	$('#hd img').css("height","45px");

	if(window.location.href.indexOf("#")!= 17  && window.location.href.indexOf("#")!= 21 ) {
		//menu
		$('#iogc-regularMenu').clone().insertAfter('#hd');
		//cleaning			
		$("h2.mainheader a").css("font-size","26px").css("color","#555555").css("float","right").css("font-weight","bold").css("padding","18px 20px 0");
		$("h2.mainheader a").insertAfter("#hd img");
		$('.hmenu').css("margin"," 0px");
		$('#forum table').css("width","");
		$('#forum td').css("padding","");
		$('#forum h3').hide();
		$('#menu-out').hide();
		$('#forum div').css("padding-bottom","");
		$('.all-item').css("margin-bottom","");

		if(window.location.href.indexOf("profile")!= 17  && window.location.href.indexOf("profile")!= 21 ){		$("h2.mainheader").hide();	}

	}else{
		//gamewindow:
		$(".iogc-Controls").css("background-color"," #f0f0f4");//.css("border-bottom"," 1px solid #8899AA");
		$('.iogc-GameWindow tr:last').hide();
		$('.iogc-GameWindow tr:first-child > tr:first-child').css("background-color","green"); //todo
		$("#outside > div:last").hide();
		$('#menu div:last').hide();
		$('#mainpage').css("padding","0");
		$('.iogc-GameWindow-layout').removeClass();
		//chat bigger
		$('.iogc-MessagePanel').css("margin"," 0px");
		$('.iogc-ChatPanel-messages').css("height","200px").css("width","auto");
		$('.iogc-MessagePanel-messages').css("height","225px");
		$('.iogc-MessagePanel-inner .gwt-HTML').css("padding-left"," 0px").css("padding-right"," 0px");
		$('.rdews-RoundedCompositeInside').css("padding-left"," 0px").css("padding-right"," 0px");
		//chatbox
		$('.iogc-MessagePanel-inner tr:first-child').hide();
		$('table.iogc-MessagePanel-inner tr:last').hide();
		$('.rdews-RoundedCompositeInside').removeClass();
		$('.rdews-RoundedCompositeOutside').removeClass();
		$('.iogc-ChatPanel').css("margin","0 0 0 5px");
		//buttons	
		$(".iogc-NewButton").addClass("gwt-Button");
		$(".iogc-NewButton .gwt-Button").removeClass('iogc-NewButton');
		$(".gwt-Button").css("padding","2px");

		//late stuff
		//window.setTimeout(function(){
		//$('#outside #iogc-regularMenu').hide();

		if( $('#iogc-regularMenu').length == 1){
			GM_log("dctools OFF: "+$('#iogc-regularMenu').length+" >> "+$('.dct-infobox').length+" > "+$('.dct-aet').length);		
			//$('#iogc-regularMenu').insertAfter('#hd');
		}else if( $('#iogc-regularMenu').length == 2){
			GM_log("dctools ON: "+$('#iogc-regularMenu').length+" >> "+$('.dct-infobox').length+" > "+$('.dct-aet').length);		
		}else{
			GM_log("dctools ON?: "+$('#iogc-regularMenu').length+" >> "+$('.dct-infobox').length+" > "+$('.dct-aet').length);	///WTF?! :S	 i really dont get this
		}
		
		//infobox cleanup
		$('.iogc-SidePanel > .iogc-SidePanel-inner .iogc-LoginPanel-playerRow:nth-child(4)').hide();
		$('.iogc-SidePanel > .iogc-SidePanel-inner .iogc-LoginPanel-playerRow:nth-child(3)').hide();
			//}
		$('.iogc-SidePanel > .iogc-SidePanel-inner .iogc-LoginPanel-playerRow:nth-child(2)').hide();
		//}, 5500);
	}
}

dctools.addReview = function(userId, review, callback) {
	if (dctools.browser == "chrome") {
		chrome.runtime.sendMessage({'action' : 'addReview', 'userId' : userId, 'cid' : '', 'review' : review }, callback);
	} else if (dctools.browser == "firefox") {
		
		var advert = " -- [This review was automatically posted using Deadcode Tools for KDice.  Download: http://kdice.com/profile/44773121]"
		var params = "prev=/profile/" + userId + "/reviews&cid=&body=" + review + advert;
		
		GM_xmlhttpRequest({
			method: "POST",
		  	url: "http://kdice.com/profile/" +  userId + "/addReview",
			data: params,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Content-length": params.length,
				"Connection": "keep-alive"
			},
		  	onload: function(response) {
		    	callback(true);
		  	}
		});
	}
}

dctools.currentSection = function() {
	var base = "kdice.com";
	var basehttp = "http://kdice.com";
	var basewww = "www.kdice.com";
	var basehttpwww = "http://www.kdice.com";
	
	var div = "/";
	var isPrefix = function(s) {
		if (window.location.href.indexOf(base + s) == 0) return true;
		if (window.location.href.indexOf(basewww + s) == 0) return true;
		if (window.location.href.indexOf(basehttp + s) == 0) return true;
		if (window.location.href.indexOf(basehttpwww + s) == 0) return true;
	}
	
	if (isPrefix(div + "#")) return "game";
    if (window.location.href == base + div) return "game";
	if (window.location.href == basehttp + div) return "game";
	if (window.location.href == basewww + div) return "game";
	if (window.location.href == basehttpwww + div) return "game";

    if (isPrefix(div + "profile")) return "profile";

    return "forum";
}

function track(category, evnt) {
	if (dctools.browser == "chrome") {
		chrome.runtime.sendMessage({'action' : 'trackEvent', 'category' : category , 'evnt' : evnt}, function() {});
	} 
}

function findUrls(text) {
    var source = (text || '').toString();
    var urlArray = [];
    var url;
    var matchArray;

    // Regular expression to find FTP, HTTP(S) and email URLs.
    var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;

    // Iterate through any URLs in the text.
    while( (matchArray = regexToken.exec( source )) !== null )
    {
        var token = matchArray[0];
        urlArray.push( token );
    }

    return urlArray;
}

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

function replaceAll(string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

$(document).ready(function() {
	if (window.top != window.self)  //-- Don't run on frames or iframes
	    return;

	dctools.chromeSupport();
	
	if(dctools.currentSection() == "game") {
        window.setTimeout(dctools.init, 1500);
	} else {
        dctools.init();
	}
});
