//move selected object to front of parent's layout
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
      this.parentNode.appendChild(this);
    });
  };
  
function setDotColor(cf,fl,c,year) {
    if(cf.indexOf(year) != -1) {
        return "#b87333"
    }
    else if(fl.indexOf(year) != -1) {
        return "#c0c0c0"
    }
    else if(c.indexOf(year) != -1) {
        return "#daa530"
    }
    else {
        return "white"; //"#555555";
    }
}

//zoom or un-zoom informational circle
function zoomDot(circGroup) {
    circ= circGroup.select("circle");
    txt= circGroup.select("svg.text");
    
    //clicked to zoom circle
    if (circ.attr("r") != zoomRad) {
        //allCircs= svg.selectAll("g.orbit")
        
        //zoom out all zoomed circles 
        svg.selectAll("circle.year")
            .transition().delay(0).duration(500).attr("r", rad);
            
        //hide all visible circle text
        svg.selectAll("svg.text").selectAll("text")
            .transition().delay(200).duration(500).attr("visibility","hidden");
        
        //move this group's circle and text to front
        //d3.select(circGroup.node().parentNode).moveToFront()
        circGroup.moveToFront()
        
        //zoom in circle (i.e. increaase radius) and make its text visible
        circ.transition().delay(0).duration(500).attr("r", zoomRad)
                                                .attr("stroke","#2B6689");
        txt.selectAll("text").transition().delay(200).duration(500).attr("visibility","visible");
        txt.moveToFront()
    }
    
    //clicked to un-zoom circle
    else {
        //un-zoom circle (i.e. set radius to original length) and re-hide circle's text
        circ.transition().delay(0).duration(500).attr("r", rad)
                                                .attr("stroke","none");
        txt.selectAll("text").transition().delay(200).duration(500).attr("visibility","hidden");
    }
}