// #################  HELPER TO BUILD ALIEN IMAGES #################
//
// Version 1.0 - 08.16.2016
//
// getUrlPic("file.png")
//   used for the 'background(-image)' CSS property. Need to have 'host' defined elsewhere.
function getUrlPic(picture) { return "url("+host+picture+")"; }

// newCalendar([
//               ["alien_blue.png", "alien_blue.png"],
//               ["alien_blue.png", "alien_green.png"],
//               ["alien_green.png", "alien_green.png"]
//             ]);
//   returns a clic2uncover complex picture showing 3 thinking aliens.
function newAliens(arrayOfColorPairs, id) {
    
    var bubblePicture = "bubble.png"; // The picture used for the bubble
    
    var bigAlien = {left: 0, top: 80, width: 80, height:80},     // The relative position and size of each bigAlien
        bubble = {left: 10, top: 0, width: 70, height: 79},      // The relative position and size of each bubble
        miniAlien = {left: 20, top: 5, width: 50, height: 50};  // The relative position and size of each miniAlien
    
    var xoffset = 0; // The number of pixels separating each bigAlien
    
    if (typeof id != "string") id = "alien";                            // Giving an ID to the picture
    
    // patches is the array of objects representing the different DIV in the click2uncover element
    var patches = [];
    for (pair in arrayOfColorPairs) {

        // patchBigAlien, patchBubble and patchMiniAlien are the objects corresponding to the DIVs currently processed
        var patchBigAlien, patchBubble, patchMiniAlien;
        
        patchBigAlien = $().extend({id: id+"bigAlien"+pair, background: getUrlPic(arrayOfColorPairs[pair][0])}, bigAlien);
        patchBubble = $().extend({id: id+"bubble"+pair, background: getUrlPic(bubblePicture)}, bubble);
        patchMiniAlien = $().extend({id: id+"miniAlien"+pair, background: getUrlPic(arrayOfColorPairs[pair][1])}, miniAlien);
        
        // Adding an offset if several aliens
        patchBigAlien.left += (bigAlien.width + xoffset) * pair;
        patchBubble.left += (bigAlien.width + xoffset) * pair;
        patchMiniAlien.left += (bigAlien.width + xoffset) * pair;
        
        // Adjusting the size of the background picture to its frame
        patchBigAlien["background-size"] = "cover";
        patchBubble["background-size"] = "cover";
        patchMiniAlien["background-size"] = "cover";
        
        // Adding each image to the c2p
        patches.push(patchBigAlien);
        patches.push(patchBubble);
        patches.push(patchMiniAlien);
    }

    // Returns the click2uncover element, containing the patches, and whose size is determined by bigAlien
    return c2u.newPicture("", patches, {width: (bigAlien.width + xoffset) * arrayOfColorPairs.length, height: bigAlien.height + bigAlien.top});
}
//
// ##################################################################