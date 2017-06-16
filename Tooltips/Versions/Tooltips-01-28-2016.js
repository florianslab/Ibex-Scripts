function getPosition(element) {
    var xPosition = 0, yPosition = 0;
  
    while(element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
}

function popinMessage(x, y, text, delay) {
    if (typeof text === "undefined") return;
    if (typeof delay === "undefined") delay = text.replace(/ /g,'').length*100; // 100 milliseconds per character
    if (typeof delay === "number" && delay < 3000) delay = 2000;
    var pop = $("<div>");
    pop.html(text);
    pop.css({padding: "10 10 10 10", position: "absolute", left: x, top: y, "max-width": 300, opacity: 0.95,
             background: "#CCCC99", "border-radius": "5px", "font-weight": "bold"});
    $("body").append(pop);
    if (typeof delay === "number") {
        pop.hover(function() { pop.css("opacity", 0.25); }, function() { pop.css("opacity", 0.95); });
        pop.bind("click", function() { pop.remove(); });
        setTimeout(function() { pop.remove(); }, delay);
    }
    else if (typeof delay == "string") {
        var ok = $("<span>").html(delay);
        ok.hover(function(){$(this).css({border:"solid 1px white", color: "white", cursor: "default"});},
                 function(){$(this).css({border:"solid 1px black", color: "inherit", cursor: "auto"});});
        ok.css({border: "solid 1px black", float: "right", padding:"0px 2px", "margin-left":"2px", "border-radius": "2px"});
        ok.bind("click", function() { pop.remove(); });
        pop.append(ok);
    }
    return pop;
}


$.fn.tooltip = function(params) {
    var pos = getPosition($(this)[0]);
    var pop = popinMessage(pos.x, pos.y, params.content, params.delay);
    switch (params.valign) {
        case "top":
            break;
        case "middle":
            pos.y += $(this)[0].offsetHeight/2;
            break;
        case "bottom":
            pos.y += $(this)[0].offsetHeight;
            break;
    }
    switch (params.halign) {
        case "left":
            break;
        case "middle":
            pos.x += $(this)[0].offsetWidth/2;
            break;
        case "right":
            pos.x += $(this)[0].offsetWidth;
            break;
    }
    if (typeof params.xoffset != "undefined") {
      var xoffset = (params.xoffset+"").match(/^(-?\d+)\s*%$|^(-?\d+(\.\d+)?)$/);
      if (xoffset.length > 1) {
        if (typeof xoffset[1] != "undefined") pos.x += pop[0].offsetWidth * xoffset[1]/100;
        else if (typeof xoffset[2] != "undefined") pos.x += pop[0].offsetWidth * xoffset[2];
      }
    }
    if (typeof params.yoffset != "undefined") {
      var yoffset = (params.yoffset+"").match(/^(-?\d+)\s*%$|^(-?\d+(\.\d+)?)$/);
      if (yoffset.length > 1) {
        if (typeof yoffset[1] != "undefined") pos.y += pop[0].offsetHeight * yoffset[1]/100;
        else if (typeof yoffset[2] != "undefined") pos.y += pop[0].offsetHeight * yoffset[2];
      }
    }
    pop.css({left: pos.x, top: pos.y});
    return pop;
}
