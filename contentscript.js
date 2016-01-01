

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
    if (isPrefix(div + "?canvas=1#")) return "game";

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