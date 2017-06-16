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
function newAliens(arrayOfColorTriples, id) {
    
    var background = "planets.png", // The picture used as a background 
        arrows = "arrow.png";       // The picture of the arrow between each alien in a row

    var alienLeft = {left: 70, top: 0, width: 60, height:60},
        alienMiddle = {left:270, top: 0, width: 60, height:60},
        alienRight = {left: 470, top: 0, width: 60, height:60}; 
    
    var yoffset = 10; // The number of pixels separating each row
    
    if (typeof id != "string") id = "alien";     // Giving an ID to the picture
    
    // patches is the array of objects representing the different DIV in the click2uncover element
    var patches = [];
    for (triple in arrayOfColorTriples) {

        // patchAlienLeft, patchAlienMiddle and patchAlienRight are the objects corresponding to the DIVs currently processed
        var patchAlienLeft, patchAlienMiddle, patchAlienRight,
            arrowLeftMiddle, arrowMiddleRight;
        
        patchAlienLeft = $().extend({id: id+"AlienLeft"+triple, background: getUrlPic(arrayOfColorTriples[triple][0])}, alienLeft);
        patchAlienMiddle = $().extend({id: id+"AlienMiddle"+triple, background: getUrlPic(arrayOfColorTriples[triple][1])}, alienMiddle);
        patchAlienRight = $().extend({id: id+"AlienRight"+triple, background: getUrlPic(arrayOfColorTriples[triple][2])}, alienRight);
        
        // Adding an offset if several aliens
        patchAlienLeft.top += (alienLeft.height + yoffset) * pair;
        patchAlienMiddle.top += (alienMiddle.height + yoffset) * pair;
        patchAlienRight.top += (alienRight.height + yoffset) * pair;

        // Adjusting the size of the background picture to its frame
        patchAlienLeft["background-size"] = "cover";
        patchAlienMiddle["background-size"] = "cover";
        patchAlienRight["background-size"] = "cover";

        // Adding arrows between the aliens
        arrowLeftMiddle = {id: id+"ArrowLeftMiddle"+triple, background: getUrlPic(arrows), 
                           left: alienLeft.left+alienLeft.width, width:alienMiddle.left-(alienLeft.left+alienLeft.width),
                           top: alienLeft.top+(alienLeft.height/2), height: alienLeft.height/4};
        arrowMiddleRight = {id: id+"ArrowMiddleRight"+triple, background: getUrlPic(arrows), 
                           left: alienMiddle.left+alienMiddle.width, width:alienRight.left-(alienMiddle.left+alienMiddle.width),
                           top: alienMiddle.top+(alienMiddle.height/2), height: alienMiddle.height/4};
        
        // Adding each image to the c2p
        patches.push(patchBigAlien);
        patches.push(patchBubble);
        patches.push(patchMiniAlien);
        patches.push(arrowMiddleRight);
        patches.push(arrowLeftMiddle);
    }

    // Adding the background picture
    patches.push({id: id+"background", background: gerUrlPic(background), 
                  top: 0, left: 0, width: 600, height: arrayOfColorTriples.length*(alienLeft.height+yoffset)});

    // Returns the click2uncover element, containing the patches, and whose size is determined by bigAlien
    return c2u.newPicture(patches, {width: 600, height: arrayOfColorTriples.length*(alienLeft.height+yoffset)});
}
//
// ##################################################################