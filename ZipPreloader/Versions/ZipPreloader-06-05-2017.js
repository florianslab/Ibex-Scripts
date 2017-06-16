var __resourcesUnzipped__ = false;

$(document).ready(function() {

    assert(typeof zipFile == "string", "zipFile variable is either undefined or ill-defined");

    assert(zipFile.match(/^https?:\/\/.+\.zip$/) != null, "Bad format for the URL provided as zipFile ("+zipFile+")");


    // Compatibility for Safari and others
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    // This object will contain the list of audio files to preload
    var resourcesRepository = {};
    var zip = new JSZip();
    var errors = "";

    JSZipUtils.getBinaryContent(zipFile, function(error, data) {
        if(error) {
            errors += error;
            throw error;
        }
        // Loading the zip object with the data stream
        zip.loadAsync(data).then(function() {
          console.log("Download complete");
            var totalLength = Object.keys(zip.files).length;
            var currentLength = 0;
            // Going through each zip file
            zip.forEach(function(path, file){
                // Unzipping the file, and counting how far we got
                file.async('arraybuffer').then(function(content){
                    currentLength++;
                    if (currentLength >= totalLength) __resourcesUnzipped__ = true;
                    var blob;
                    if (path.match(/\.wav$/)) 
                      blob = new Blob([content], {'type': 'audio/wav'});
                    else if (path.match(/\.mp3$/))
                      blob = new Blob([content], {'type': 'audio/mpeg'});
                    else if (path.match(/\.ogg$/))
                      blob = new Blob([content], {'type': 'audio/ogg'});
                    else if (path.match(/\.png$/))
                      blob = new Blob([content], {'type': 'image/png'});
                    else if (path.match(/\.jpe?g$/))
                      blob = new Blob([content], {'type': 'image/jpeg'});
                    else if (path.match(/\.gif$/))
                      blob = new Blob([content], {'type': 'image/gif'});
                    else return;
                    var src = URL.createObjectURL(blob);
                    resourcesRepository[path] = src;    
                });
            });
        });
    });


    // Using a 7ms delay should be enough, 
    // seem to remember that Alex said there was a 14ms refresh rate in Ibex (or something like that)
    (function(){
      var ivl = setInterval(function() { 
                        // Replacing all audios and images with a blob URL
                        $("audio").each(function() {
                          var t = this;
                          var replaced = false;
                          $(t).find("source").each(function(){
                            var src = $(this).attr("src");
                            if (typeof resourcesRepository[src] != "undefined") {
                              var source = $("<source>");
                              source.attr({type: $(this).attr("type"), src: resourcesRepository[src]});
                              $(this).replaceWith(source);
                              replaced = true;
                            }
                            if (replaced) t.load();
                          });
                        });

                        $("img").each(function() {
                          var src = $(this).attr("src");
                          if (typeof resourcesRepository[src] != "undefined")
                            $(this).attr("src", resourcesRepository[src]);
                        });
      }, 7);
    }) ();
});



define_ibex_controller({
  name: "ZipPreloader",

  jqueryWidget: {    
    _init: function () {

        var humanTime = function(milliseconds) {
          var date = new Date(milliseconds);
          var str = '';
          if (date.getUTCDate() > 1) str += date.getUTCDate()-1 + " days, ";
          if (date.getUTCHours() > 0) str += date.getUTCHours() + " hours, ";
          if (date.getUTCMinutes() > 0) str += date.getUTCMinutes() + " minutes, ";
          if (date.getUTCSeconds() > 0) str += date.getUTCSeconds() + " seconds, ";
          if (date.getUTCMilliseconds() > 0) str += date.getUTCMilliseconds() + " milliseconds";
          str = str.replace(/, $/,"");
          str = str.replace(/(^|[^1-9])([01]) (day|hour|minute|second|millisecond)s/,"$1$2 $3");
          return str;
        }

        this.cssPrefix = this.options._cssPrefix;
        this.utils = this.options._utils;
        this.finishedCallback = this.options._finishedCallback;
        
        // How long do we have to wait before giving up loading?
        this.timeout = dget(this.options, "timeout", 60000);
        // if (this.alternateHost) this.timeout = this.timeout / 2; // If we were to implement another loading with the alternate host
        // Whether failure to load should be reported in the results file
        this.report = dget(this.options, "report", true);

        this.errorMessage = dget(this.options, "errorMessage", "<p>Sorry, we were unable to load the resources.</p>"+
                                                               "<p>If the problem persists, try to contact the experimenters."+
                                                               " Thank you.</p>");

        this.html = dget(this.options, "html", "<p>Please wait, resources are loading.</p>"+
                                               "<p>This process might take up to "+humanTime(this.timeout)+".</p>");

        this.element.addClass(this.cssPrefix + "preloader");
        this.element.append($("<div id='content'>").append(htmlCodeToDOM(this.html)));
       
        var t = this;
       
        // Clearing any prior timeout and interval
        clearInterval(t.timer);
        clearInterval(t.checkLoaded);
        
        // Launching the interval to check for all files being loaded
        t.checkLoaded = setInterval(function() {
            if (__resourcesUnzipped__) {
                // If all files have been loaded, stop the interval
                clearInterval(t.checkLoaded);
                // If there was a timeout, also clear it
                if (typeof t.timeout == "number") clearTimeout(t.timer);
                // Pass to the next element in the thread
                t.finishedCallback(null);
            }}, 10);
        
        // If a timeout has been passed
        if (typeof t.timeout == "number")
          // Launch the timeout
          t.timer = setTimeout(function () {
                // We won't try to load anymore
                clearInterval(t.checkLoaded);
                $("#content").html("<div id='errorSorryMessage'>"+t.errorMessage+"</div>"+
                                   "<div id='errorMessages'>"+errors+"</div>");
            }, t.timeout);
    }
  },

  properties: {
    obligatory: null,
    countsForProgressBar: false,
    htmlDescription: function (opts) {
        return truncateHTML(htmlCodeToDOM(opts.html), 100);
    }
  }
});