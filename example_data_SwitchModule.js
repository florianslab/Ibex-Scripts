var shuffleSequence = seq("test");
var showProgressBar = false;

var defaults = [
    "DynamicQuestion", {
        clickablePictures: false,
        enabled:false,
        continueMessage: "Click here to continue."
    }
];

// Returns an <img> tag
function img(picture) {
    return "<img src='http://files.lab.florianschwarz.net/ibexfiles/OrAgainCB/Pictures/"+picture+"' />";
}

// Switch Module
function SwitchModule(t) {
    
    // Can't use this module with 'randomOrder'
    if (Array.isArray(t.randomOrder)) throw "Can't use randomOrder with a Switch design";
    
    // Add key press catcher
    t.safeBind($(document),"keydown", function(e) {
    
      // Press spacebar when at least one pic has been shown before
      if ((e.keyCode == 32) && (t.answersSeq.length > 0)) {
        // Save the sequence of answers and the time of validation
        var answerTime = new Date().getTime();
        t.finishedCallback([[["Information", t.question ? csv_url_encode(t.question) : "NULL"],
                             ["Sequence of answers", t.answersSeq.join("+")], ["No correct answer", "NULL"],
                             ["Validation Time", answerTime - t.creationTime]]]);
      }
      else {
        // Going through the answers and checking the key associated with it
        for (i in t.orderedAnswers) {
          var answer = t.orderedAnswers[i];
          // The pressed key matches that of one answer
          if (e.keyCode == t.answers[answer][0].toUpperCase().charCodeAt(0)) {
            // Reveal the picture only if it is still hidden
            if ($("td#"+answer+" img").css("visibility") == "hidden") {
                
              console.log("Show "+answer);
              // If no answers yet, make sure to reveal the first answer specified
              if (t.answersSeq.length == 0) {
                // Associate the key just pressed with the first answer
                var key1 = t.answers[t.orderedAnswers[0]][0];
                t.answers[t.orderedAnswers[0]][0] = t.answers[answer][0];
                t.answers[answer][0] = key1;
                // Switch the html contents of the answers
                var contentFirst = $("#"+t.orderedAnswers[0]).html();
                $("#"+t.orderedAnswers[0]).html($("#"+answer).html());
                $("#"+answer).html(contentFirst);
                // And now switch the IDs of the answers
                $("#"+answer).attr('id', t.orderedAnswers[0]+"_tmp");
                $("#"+t.orderedAnswers[0]).attr('id', answer);
                $("#"+t.orderedAnswers[0]+"_tmp").attr('id', t.orderedAnswers[0]);
                // Now swith 'answer' itself
                answer = t.orderedAnswers[0];
              }
              // Add a new key pressing
              t.answersSeq.push(new Date().getTime() - t.creationTime + ":" + answer);
              // Hide all the pictures
              $(".DynamicQuestion-scale-box img").css("visibility", "collapse");
              // Show the picture after a delay (to avoid rapid switching from the user)
              (function (a) { setTimeout(function(){
                  $(".DynamicQuestion-scale-box img").css({"visibility": "hidden", "display": "block"});
                  $("td#"+a+" img").css("visibility", "visible");
              }, 50); }(answer));
                
            } // End 'if hidden'
          } // End 'if keycode'
        } // End 'for'
      } // End 'else'
  }); // End safeBind

}


var items = [

    ["test", "DynamicQuestion", {
        question: "test",
        answers: {
            Target: ["F", img("pic1_i73_g1.png")],
            Competitor: ["J", img("pic2_i73_g1.png")],
            Distractor: ["K", img("pic2_i68_g1.png")]
        },
        elements: [
            {func: function(t){ t.answersSeq = []; }},
            {pause: 300},
            "Context sentence",
            //{pause: "key "},
            //{func: function(t){ t.answersSeq.push(new Date().getTime() - t.creationTime + ":TestSentence"); }},
            "Test sentence",
            //{pause: "key "},
            //{func: function(t){ t.answersSeq.push(new Date().getTime() - t.creationTime + ":Pictures"); }},
            {this: "choice"},
            {func: SwitchModule}
        ]
    }]
    
];
