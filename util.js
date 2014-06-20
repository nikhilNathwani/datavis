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
    circ= group.select("circle.orbit");
    txt= group.select("text.orbit")
    
    //clicked to zoom circle
    if (circ.attr("r") != zoomRad) {
        gs= svg.selectAll("g.orbit")
        
        //zoom out all zoomed circles 
        gs.selectAll("circle.orbit")
            .transition().delay(0).duration(500).attr("r", function(d) {
                    return d.wins*10+10;
                });
            
        //hide all visible circle text
        gs.selectAll("text.orbit")
            .transition().delay(0).duration(500).attr("visibility","hidden");
        
        //move this group's circle and text to fronr
        group.moveToFront()
        
        //zoom in circle (i.e. increaase radius) and make its text visible
        circ.transition().delay(0).duration(500).attr("r", zoomRad);
        txt.transition().delay(220).duration(500).attr("visibility","visible");
        txt.moveToFront()
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

function setTeamOrbit(dat) {
    var name= dat.team;
    var neighbors= dat.neighbors;
    
    x= getDistBounds(neighbors);
    max= x[0];
    min= x[1];
    diff= max-min; //used when rescaling neighbor distance
    

    //set properties and event handlers of each circle in orbit
    orbit= svg.selectAll("g.orbit")
            .data(neighbors)
        
    orbit.select("circle.orbit")
        .attr("cx", function(d,i) {
                return w/2 + (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.cos(2*i*Math.PI/neighbors.length);
            })
        .attr("cy", function(d,i) {
                return h/2 - (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.sin(2*i*Math.PI/neighbors.length);
            })
        .attr("r", function(d) {
                return d.wins*10+10;
            })
        .attr("fill", function(d,i) {
                return (d.name in colors) ? colors[d.name] : "#000000";
            })
        .moveToFront()
        .on("mouseover",function() {
                color= d3.select(this).attr("fill");
                d3.select(this).attr("stroke",d3.rgb(color).darker(1.5));
                d3.select(this).attr("stroke-width","5");
            })
        .on("mouseout",function() {
                d3.select(this).attr("stroke-width","0");
            })
        .on("click", function() {
                resize(d3.select(this.parentNode));
            });
        
    //add text to each group, set properties and event handler
    orbit.select("text.orbit")
        .attr("x", function(d,i) {
                return w/2 + (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.cos(2*i*Math.PI/neighbors.length);
            })
        .attr("y", function(d,i) {
                return h/2 - (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.sin(2*i*Math.PI/neighbors.length);
            })
        .attr("text-anchor", "middle")
        .attr("dominant-baseline","central")
        .attr("fill", "white")
        .attr("visibility","hidden")
        .text(function(d) { return teamText(d); })
        .on("click", function() {
                if(d3.select(this).attr("visibility")=="visible") {
                    resize(d3.select(this.parentNode));
                }
            });		
            
}