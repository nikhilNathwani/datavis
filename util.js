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
    //console.log([d.name + " " + d.year, d.wins + " series won","Similarities:", d.attrs]);
    return [d.name + " " + d.year, d.wins + " series won","Similarities:", d.attrs];
}

//zoom or un-zoom informational circle
function resize(group) {
    //grab group's circle and text
    circ= group.select("circle.orbit");
    txt= group.select("svg.text")
        
    //clicked to zoom circle
    if (circ.attr("r") != zoomRad) {
        gs= svg.selectAll("g.orbit")
        
        //zoom out all zoomed circles 
        gs.selectAll("circle.orbit")
            .transition().delay(0).duration(500).attr("r", function(d) {
                    return d.wins*10+10;
                });
            
        //hide all visible circle text
        gs.selectAll("svg.text").selectAll("text")
            .transition().delay(200).duration(500).attr("visibility","hidden");
        
        //move this group's circle and text to front
        group.moveToFront()
        
        //zoom in circle (i.e. increaase radius) and make its text visible
        circ.transition().delay(0).duration(500).attr("r", zoomRad);
        txt.selectAll("text").transition().delay(200).duration(500).attr("visibility","visible");
        txt.moveToFront()
    }
    
    //clicked to un-zoom circle
    else {
        //un-zoom circle (i.e. set radius to original length) and re-hide circle's text
        circ.transition().delay(0).duration(500).attr("r", function(d) {
            return d.wins*10+10;
        });
        txt.selectAll("text").transition().delay(200).duration(500).attr("visibility","hidden");
    }
}

function toggleOrbit(dat) {
    var name= dat.team;
    var neighbors= dat.neighbors;
    
    var circs= svg.select("g.toggle").selectAll("circle");
    circs.attr("stroke-width",function(d){
            return d.team==name ? 5 : 0;
        })
    
    x= getDistBounds(neighbors);
    max= x[0];
    min= x[1];
    diff= max-min; //used when rescaling neighbor distance
    
    //draw concentric axes
    /*svg.append("g")
        .attr("class", "axes")
        .selectAll("ellipse")
        .data(x)
        .enter()
        .append("ellipse")
        .attr("class","axes")
        .attr("cx",w/2)
        .attr("cy",h/2)
        .attr("r", function(d) {
                    return offset + mainR + ((d-min)/(max-min))*distScale;
                })
        .attr("r", function(d) {
                    return offset + mainR + ((d-min)/(max-min))*distScale;
                })
        .attr("fill","blue")
        //.attr("fill-opacity",0.0)
        .attr("stroke","#777777")
        .attr("stroke-width",4);*/
    
    //set properties and event handlers of each circle in orbit
    orbit= svg.selectAll("g.orbit")
            .data(neighbors)
        
    orbit.select("circle")
        .attr("class","orbit")
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
        
    
    //add text to each group, set properties and event handler
    texts= orbit.select("svg")
                .attr("class","text")
                .attr("x", function(d,i) {
                        return -(d.wins*10+10) + w/2 + (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.cos(2*i*Math.PI/neighbors.length);
                    })
                .attr("y", function(d,i) {
                        return -(d.wins*10+10) + h/2 - (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.sin(2*i*Math.PI/neighbors.length);
                    })
                .attr("width", function(d) {
                        return 200;
                    })
				.attr("height", function(d) {
                        return 200;
                    });       
    texts.selectAll("text")
        .data(function(d){
                return teamText(d);
            })
        .enter()
        .append("text")
        .attr("x", 0)
        .attr("y", function(d,i){
                return 15*i;
            })
        .attr("dominant-baseline","hanging")
        .attr("fill", "white")
        .attr("visibility","hidden")
        .moveToFront()
        .text(function(d){return d;})
        
    //set event handlers for neighbor orbit groups
    orbit.on("mouseover",function() {
                color= d3.select(this).select("circle.orbit").attr("fill");
                d3.select(this).select("circle.orbit").attr("stroke",d3.rgb(color).darker(1));
                d3.select(this).select("circle.orbit").attr("stroke-width","5");
            })
        .on("mouseout",function() {
                d3.select(this).select("circle.orbit").attr("stroke-width","0");
            })
        .on("click", function() {
                resize(d3.select(this));
            });
}