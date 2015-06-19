var _gaq = _gaq || [];

// Standard Google Universal Analytics code
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga'); // Note: https protocol here

ga('create', 'UA-27488125-3', 'auto');
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');
ga('send', 'pageview', '/background.html');

function addReview(userId, cid, body, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(data) {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				callback(true);
			} else {
				callback(null);
			}
		}
	}
	
	// Note that any URL fetched here must be matched by a permission in
	// the manifest.json file!
	var url = 'http://kdice.com/profile/' +  userId + '/addReview';
	xhr.open('POST', url, true);
	
	var advert = " -- [This review was automatically posted using Deadcode Tools for KDice.  Download: http://kdice.com/profile/44773121]"
	var params = "prev=/profile/" + userId + "/reviews&cid=&body=" + body + advert;
	
	//Send the proper header information along with the request
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.setRequestHeader("Content-length", params.length);
	xhr.setRequestHeader("Connection", "keep-alive");
	
	xhr.send(params);
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.action == 'addReview') {
		addReview(request.userId, request.cid, request.review, sendResponse);
	} else if (request.action == "trackEvent") {
		ga('send', 'event', request.category, request.evnt);
        sendResponse();
	} else if (request.action == "setUser") {
        ga('set', '&uid', request.user);
        sendResponse();
    }
});