

dctools = {};
dctools.browser = null;

dctools.newinit = function() {
    async.parallel({
            main: function(callback){
                $.get(chrome.extension.getURL('views/main.html'), function(data) {
                    callback(null, $(data));
                });
            },
            infobox: function(callback){
                $.get(chrome.extension.getURL('views/infobox.html'), function(data) {
                    callback(null, $(data));
                });
            }
        },
        function(err, results) {
            //Add the DCT Main panel
            $('#iogc-PlayerPanel').after(results.main);

            //Add the DCT Info Box
            $('#mainpage').append(results.infobox);

            //Duplicate the KDice menu to the top of the screen for convenience
            $('#iogc-regularMenu').clone().insertAfter('#hd');

            angular.bootstrap(document, ['dctApp']);
        });
}

dctools.init = function() {

	if(dctools.currentSection() == "forum") {
		if (GM_getValue("dct-options-kakkutheme") != null) {
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

						if (dctools.currentUser){
                            var Review = Parse.Object.extend("Review");
                            var review = new Review();

                            review.set("author", dctools.currentUser);
                            review.set("subject", cur_name_el.html());
                            review.set("comments", data.comments);

                            review.setACL(new Parse.ACL(dctools.currentUser));
                            review.save(null, {
                                success: function(review) {
                                    // Execute any logic that should take place after the object is saved.
                                    alert('New object created with objectId: ' + review.id);
                                },
                                error: function(review, error) {
                                    // Execute any logic that should take place if the save fails.
                                    // error is a Parse.Error with an error code and message.
                                    alert('Failed to create new object, with error code: ' + error.message);
                                }
                            });
                        } else {
                            GM_setValue("dct-" + cur_name_el.html(), dataString);
                        }
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

	if(window.location.href.indexOf("#")!= 18  && window.location.href.indexOf("#")!= 22 ) {
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

		if(window.location.href.indexOf("profile")!= 18  && window.location.href.indexOf("profile")!= 22 ){		$("h2.mainheader").hide();	}

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
    var bases = ["kdice.com",
        "www.kdice.com",
        "http://kdice.com",
        "http://www.kdice.com",
        "https://kdice.com",
        "https://www.kdice.com"
    ]
	
	var div = "/";
	var isPrefix = function(s) {
        var result = false;

        $.each(bases, function(i, base){
            if (window.location.href.indexOf(base + s) == 0){
                result = true;
                return false;
            };
        });

        return result;
	}
	
	if (isPrefix(div + "#")) return "game";
    var isGame = false;
    $.each(bases, function(i, base){
        if (window.location.href == base + div) {
            isGame = true;
            return false;
        }
    });
    if (isGame) return "game";

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

if (window.location.protocol != "https:"){
    window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
}

angular.element(document).ready(function() {
    if (window.top != window.self)  //-- Don't run on frames or iframes
        return;

    dctools.chromeSupport();

    if(dctools.currentSection() == "game") {
        window.setTimeout(dctools.newinit, 1500);
    } else {
        dctools.init();
    }
});