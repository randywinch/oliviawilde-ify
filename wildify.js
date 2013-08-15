Wildify = {
	query: "olivia wilde",
    photos: [],

    flickrSearch: function(q, n) {
        return 'https://secure.flickr.com/services/rest/?' +
        'method=flickr.photos.search&' +
        'api_key=YOUR_APIKEY_HERE&' +
        'text=' + encodeURIComponent(q) + '&' +
        'safe_search=1&' +
        'media=photos&' + 
        'content_type=1&' +
        'sort=relevance&' +
        'extras=url_s&' +
        'per_page='+n;
    },

    findOlivia: function() {
        var req = new XMLHttpRequest();

        //Get Request
        req.open("GET", this.flickrSearch(this.query,500), true);
        req.onload = this.onFlickrComplete.bind(this);
        req.send(null);

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  chrome.tabs.sendMessage(tabs[0].id, {status: "loading"});
		});
    },  

    onFlickrComplete: function (e) {
        var _this = this;
        var photos = e.target.response;
        
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		  chrome.tabs.sendMessage(tabs[0].id, {status: "complete", photos: photos});
		});
    }
}

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(tabs[0].id, {file: "content.js"}, function() {
    	Wildify.findOlivia();
    });
  });
});