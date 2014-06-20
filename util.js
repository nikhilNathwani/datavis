//move selected object to front of parent's layout
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
  
//returns max and min neighbor distance from central circle 
function getDistBounds(arr) {
    max= -Number.MAX_VALUE;
    min= Number.MAX_VALUE;
    for (i = 0; i < arr.length; i++) {
        if(arr[i].dist>max) {
            max= arr[i].dist;
        }
        if(arr[i].dist<min) {
            min= arr[i].dist;
        }
    }
    return [max,min];
}

//return text to display on circle when clicked
function teamText(d) {
    return d.name + " " + d.year + "\n: "+ d.wins + " series won"
}

//zoom or un-zoom informational circle
function resize(group) {
    //grab group's circle and text
    circ= group.select("circle");
    txt= group.select("text")
    
    //clicked to zoom circle
    if (circ.attr("r") != zoomRad) {
        gs= svg.selectAll("g")
        
        //zoom out all zoomed circles 
        gs.selectAll("circle")
            .transition().delay(0).duration(500).attr("r", function(d) {
                    return d.wins*10+10;
                });
            
        //hide all visible circle text
        gs.selectAll("text")
            .transition().delay(0).duration(500).attr("visibility","hidden");
        
        //move this group's circle and text to fronr
        group.moveToFront()
        
        //zoom in circle (i.e. increaase radius) and make its text visible
        circ.transition().delay(0).duration(500).attr("r", zoomRad);
        txt.transition().delay(200).duration(500).attr("visibility","visible");
    }
    
    //clicked to un-zoom circle
    else {
        //un-zoom circle (i.e. set radius to original length) and re-hide circle's text
        circ.transition().delay(0).duration(500).attr("r", function(d) {
            return d.wins*10+10;
        });
        txt.transition().delay(200).duration(500).attr("visibility","hidden");
    }
}