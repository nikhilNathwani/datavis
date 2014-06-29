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
    return [[d.name + " " + d.year,d.url], d.wins + " series won","Biggest Similarities:"].concat(d.attrs)
}

function hideOrbit() {
	//Hide all neighbor circles
	orbGroups= svg.selectAll("g.orbit")
	orbGroups.select("circle")
			.attr("r",0)
			
			
	//Hide sun
	sunGroup= svg.select("g.sun")
	sunGroup.select("ellipse")
			.attr("rx",0)
			.attr("ry",0);	
}

function hideHelp(dat){
	//unhide sun
	sunGroup= svg.select("g.sun")
	sunGroup.select("ellipse")
			.attr("rx",mainR)
			.attr("ry",mainR);
	sunGroup.select("image").attr("xlink:href", "pics/"+dat.team+".jpg");
}

function showHelp() {
	//initialize with help screen
	formatAxes([{"dist":0},{"dist":0.5},{"dist":1}]);
	hideOrbit();
}

function setOrbit(dat) {
	var name= dat.team;
    var neighbors= dat.neighbors;
	
	//set sun image
	sun.select("image").attr("xlink:href", "pics/"+name+".jpg");
	
	//show axes
	formatAxes(neighbors);
	
    //set properties and event handlers of each circle in orbit
    orbit= svg.selectAll("g.orbit")
            .data(neighbors);  	
    orbit.select("circle")
        .attr("class","orbit")
        .attr("cx", function(d,i) {
                return orbitCenterX + (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.cos(2*i*Math.PI/neighbors.length);
            })
        .attr("cy", function(d,i) {
                return h/2 - (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.sin(2*i*Math.PI/neighbors.length);
            })
        .attr("r", function(d) {
                return d.wins*winRadScale+minNeighRad;
            })
        .attr("fill", function(d,i) {
                return (d.name in colors) ? colors[d.name] : "#000000";
            })
	
	//set event handlers for neighbor orbit groups
    orbit.on("mouseover",function() {
                color= d3.select(this).select("circle.orbit").attr("fill");
                d3.select(this).select("circle.orbit").attr("stroke",d3.rgb(color).darker(1));
                d3.select(this).select("circle.orbit").attr("stroke-width","5")
            })
        .on("mouseout",function() {
                d3.select(this).select("circle.orbit").attr("stroke-width","0");
            })
        .on("click", function() {
                resize(d3.select(this));
            });
}

//Unselect all toggles (and help button) except that at index "except" (help is index 16)
function unSelectToggles(except) {
	var circs= svg.selectAll("g.toggle")
    circs.select("circle")
		.attr("stroke-width",function(d,i){
			toggleClicked[i]= 0;
            return except==i ? 5 : 0;
        })
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
                    return d.wins*winRadScale + minNeighRad;
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
            return d.wins*winRadScale+minNeighRad;
        });
        txt.selectAll("text").transition().delay(200).duration(500).attr("visibility","hidden");
    }
}

//format the axes
function formatAxes(dat) {
	//set radii of axes
	x= getDistBounds(dat);
    max= x[0];
    min= x[1];
	x.push((max+min)/2);
	
	//draw ellipses
    axes.selectAll("ellipse")
		.data(x)
        .attr("rx", function(d) {
                    return offset + mainR + ((d-min)/(max-min))*distScale;
                })
        .attr("ry", function(d) {
                    return offset + mainR + ((d-min)/(max-min))*distScale;
                })
        .attr("fill-opacity",0.0)
        .attr("stroke","#999999");
}

function setZoomText(dat) {
    var name= dat.team;
    var neighbors= dat.neighbors;

    //add text to each group, set properties and event handler
    texts= orbit.select("svg")
			.attr("class","text")
			.attr("x", function(d,i) {
					return orbitCenterX + (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.cos(2*i*Math.PI/neighbors.length) - zoomRad*(Math.sqrt(2)/2);
				})
			.attr("y", function(d,i) {
					return h/2 - (offset + mainR + ((d.dist-min)/(max-min))*distScale)*Math.sin(2*i*Math.PI/neighbors.length) - zoomRad*(Math.sqrt(2)/2);
				})
			.attr("width", function(d) {
					return 2*zoomRad;
				})
			.attr("height", function(d) {
					return 2*zoomRad;
				});
			 
	sizes= [zoomRad/6,zoomRad/8,zoomRad/8,zoomRad/12,zoomRad/12,zoomRad/12,zoomRad/12,zoomRad/12]           
    texts.selectAll("text")
        .data(function(d){
                return teamText(d);
            })
        .attr("x", zoomRad*Math.sqrt(2)/2)
        .attr("y", function(d,i){
				s= 0;
				for(k=0;k<=i;k++) {
					s += sizes[k];
				}
                return s+(i-1)*zoomRad/12;
            })
		.attr("id","text")
		.attr("font-size",function(d,i){return sizes[i];})
		.attr("text-anchor","middle")
		.attr("dominant-baseline","hanging")
        .attr("fill", "white")
        .attr("visibility","hidden")
        .moveToFront()
        .text(function(d,i){
				if(i==0) {
					d3.select(this.parentNode).attr("xlink:href", "http://www.basketball-reference.com"+d[1]);
					d3.select(this).style("text-decoration","underline")
									.on("click", function() {
										return;
									});
					return d[0];
				}
				else {
					return d;
				}
			})
}