var Wildify = {
    images: [],
    photos: [],


    loadOlivia: function(data) {
        var img_tags = document.querySelectorAll('img');
        var _this = this;
        var ratio;
        var parser = new DOMParser();
        var photos = parser.parseFromString(data,'text/xml').querySelectorAll('photo');
        var i = 0;
        var p = 0;
        var parent;
        var span = document.createElement( 'span' );
        var currSpan;

        //loop through photos
        for(p=0; p < photos.length; p++){
            ratio = Math.round(Number(photos[p].getAttribute('height_s')) / Number(photos[p].getAttribute('width_s')) * 10);

            _this.photos[ratio] = this.photos[ratio] || [];
            _this.photos[ratio].push(photos[p]);
        }        

        //loop through images
        for (var i=0; i < img_tags.length; i++){
            if( /\.jpg/i.test(img_tags[i].src) ){
                img_tags[i].classList.add('olivia-swap');
                _this.images.push(img_tags[i]);
            }
        }

        //loop through image tags
        i = _this.images.length;
        while( i-- ) {
            ratio = Math.round(Number(_this.images[ i ].height) / Number(_this.images[ i ].width) * 10);
            currSpan = span.cloneNode( false );
            currSpan.style.cssText = document.defaultView.getComputedStyle(_this.images[i], "").cssText;
            currSpan.style.display = 'inline-block';
            currSpan.style.width = _this.images[ i ].width + "px";
            currSpan.style.height = _this.images[ i ].height + "px";
            currSpan.style.overflow = 'hidden';
            currSpan.style.background = this.buildBackground(_this.images[ i ].height, _this.images[ i ].width, ratio); //this.images[i], photos[i]);
            currSpan.style.webkitBackgroundSize = 'cover';
            currSpan.style.backgroundSize = 'cover';
            parent = _this.images[ i ].parentNode;
            parent.insertBefore( currSpan, _this.images[ i ] );
            parent.removeChild( _this.images[ i ] );
        }
        
    },

    /*
    
    s   small square 75x75
    q   large square 150x150
    t   thumbnail, 100 on longest side
    m   small, 240 on longest side
    n   small, 320 on longest side
    -   medium, 500 on longest side
    z   medium 640, 640 on longest side
    c   medium 800, 800 on longest side†
    b   large, 1024 on longest side*
    o   original image, either a jpg, gif or png, depending on source format

     */
    buildBackground: function (h, w, r) {
        var style = "";
        var image_url = '';// this.flickrUrl(photo,'n');
        var max_size = Math.max(h,w);
        var photo_size;
        var photo;
        var currRatio;

        if (r == 10 && max_size < 125) {
            photo_size = 'q';
        } else if(max_size < 320 ) {
            photo_size = 'z';
        } else {
            photo_size = 'b';
        }

        //photo ratio exists
        if(this.photos[r]){
            currRatio = r;
        } else {
            for(var i=0; i < this.photos.length; i++){
                //There are valid photos to pick from
                if(this.photos[i]){
                    currRatio = i;

                    if(r > i){

                    } else {
                        break;
                    }
                }
            }

        }

        
        if(image_url == ''){
            image_url = this.flickrUrl(this.pickRandomPhoto(currRatio), photo_size );  
        }


        style += "url('" + image_url + "') no-repeat center center";


        return style;
    },

    pickRandomPhoto: function(r) {
        var item = this.photos[r][Math.floor(Math.random()*this.photos[r].length)];

        return item;
    },

    flickrUrl: function (photo,size) {
        return "http://farm" + photo.getAttribute("farm") +
        ".staticflickr.com/" + photo.getAttribute("server") +
        "/" + photo.getAttribute("id") +
        "_" + photo.getAttribute("secret") +
        "_" + size + ".jpg";
    },


    showLoader: function() {
        var body = document.getElementsByTagName('body')[0];
        var lb = document.createElement( 'div' );
        lb.id = "WildifyLoader";
        lb.style.background = "rgba(0,0,0,.5) url(" + chrome.extension.getURL('/loader.gif') + ") no-repeat center center";
        lb.style.position = "fixed";
        lb.style.left = "0px";
        lb.style.right = "0px";
        lb.style.top = "0px";
        lb.style.bottom = "0px;";
        lb.style.zIndex = "15000";
        lb.style.width = "100%";
        lb.style.height = "100%";
        body.appendChild(lb);
    },

    hideLoader: function() {
        var lb = document.getElementById('WildifyLoader'); 
        
        if(lb){
            lb.remove();
        }
    }
}

chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
    if(msg.status){
        switch(msg.status){
            case "loading":
                //console.log("loading...");
                Wildify.showLoader();
                break;
            case "complete":
                //console.log("converting...");
                Wildify.loadOlivia(msg.photos);
                Wildify.hideLoader();
                break;
        }
    }
});