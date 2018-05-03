var shuffleSequence = seq("intro", randomize("training"));

// Setting a host for the pictures
PennController.AddHost("http://files.lab.florianschwarz.net/ibexfiles/Pictures/");

// Just a shorthand
var istr = PennController.instruction;

// Function to generate trials of the same format
function createTrial(sentence, image1, image2, image3, image4, image5, image6) {
  return PennController(
      // Show a sentence on the screen
      istr.text(sentence).id("txtSentence")
      ,
      // Wait for Space keypress
      istr.key(" ")
      ,
      // Remove the sentence from the screen
      istr("txtSentence").remove()                //  Delete these two lines to keep
      ,                                           //  the sentence above the images
      // Show the six images properly arranged
      istr.canvas(650, 350)
          .put( istr.image(image1, 174, 154).id(image1) ,   0,   0, 0 )
          .put( istr.image(image2, 174, 154).id(image2) , 240,   0, 1 )
          .put( istr.image(image3, 174, 154).id(image3) , 474,   0, 2 )
          .put( istr.image(image4, 174, 154).id(image4) ,   0, 200, 3 )
          .put( istr.image(image5, 174, 154).id(image5) , 240, 200, 4 )
          .put( istr.image(image6, 174, 154).id(image6) , 474, 200, 5 )
      ,
      // The participant selects one of the six images
      istr.selector(istr(image1), istr(image2), istr(image3),
                    istr(image4), istr(image5), istr(image6))
          .shuffle() // Shuffle; delete this line if answers shouldn't be shuffled
          .record()
          .wait()
  );
}


var items = [
  ["intro", "Message", {html: "<p>Your aunt is making collages for each member of your extended family."+
                              "<p>She will ask you to hand her cutouts, one by one."+
                              "You will first see her description of the cutout she wants. "+
                              "Press space once you've read the description. You will see a number of photos. Click on the one that matches her description.</p>",
                        transfer: "click",
                      consent: "true"},
            ],
  
  //training items (12)
  ["training", "PennController", 
      createTrial("I need the photo of the black dog.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the gray cat.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the white bird.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the pink flowers.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the green plant.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the pink car.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the red cap.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the brown bag.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the brown chair.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the red book.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the yellow fish.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ],

  ["training", "PennController", 
      createTrial("I need the photo of the purple lamp.", 
                "apple.png", "strawberry.png", "grapes.png",
                "banana.png", "watermelon.png", "orange.png")
  ]

/**
//critical items (12)
  [["critical",1],
    "Message", {html: "<p>I need the photo of the black dog.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  [["critical",1],
    "Message", {html: "<p>I need the photo of the black dog.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  [["critical",2],
    "Message", {html: "<p>I need the photo of the grey cat.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  [["critical",2],
    "Message", {html: "<p>I need the photo of the grey cat.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  [["critical",3],
    "Message", {html: "<p>I need the photo of the white bird.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  [["critical",3],
    "Message", {html: "<p>I need the photo of the white bird.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  [["critical",4],
    "Message", {html: "<p>I need the photo of the pink flowers.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  [["critical",4],
    "Message", {html: "<p>I need the photo of the pink flowers.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
//filler items (12)
  ["filler",
    "Message", {html: "<p>I need the photo of the red apple.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the white headphones.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the black sheep.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the green frog.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the blue backpack.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the yellow cupcake.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the orange stapler.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the blue bicycle.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the yellow pants.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the blue coat.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the white towel.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
  ["filler",
    "Message", {html: "<p>I need the photo of the black horse.</p>"},
    "Question", {html: "",
                        q: ""}
  ],
**/
];
