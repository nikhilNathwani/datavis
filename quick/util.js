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
            .transition().delay(0).duration(500)
            .attr("r", rad)
            .attr("stroke","none");
            
        //hide all visible circle text
        svg.selectAll("svg.text")//.selectAll("text")
            .transition().delay(200).duration(500).attr("visibility","hidden");
        
        //move this group's circle and text to front
        //d3.select(circGroup.node().parentNode).moveToFront()
        circGroup.moveToFront()
        
        //zoom in circle (i.e. increaase radius) and make its text visible
        circ.transition().delay(0).duration(500).attr("r", zoomRad)
                                                .attr("stroke",function() {
                                                    return d3.select(this).attr("fill")=="white" ?
                                                        "#2B6689" : "none";
                                                });
        txt.transition().delay(250).duration(500).attr("visibility","visible");
        txt.moveToFront()
    }
    
    //clicked to un-zoom circle
    else {
        //un-zoom circle (i.e. set radius to original length) and re-hide circle's text
        circ.transition().delay(0).duration(500).attr("r", rad)
                                                .attr("stroke","none");
        txt.transition().delay(200).duration(500).attr("visibility","hidden");
    }
}

function threeDigits(x) {
    if(x>=100){
        return ""+x
    }
    else if(x>=10){
        return "0"+x;
    }
    else {
        return "00"+x;   
    }
}

function formatAsMoney(amt) {
    mil= Math.floor(amt/1000000)
    if(mil!=0) {
        return "$"+mil+","+threeDigits(Math.floor((amt%1000000)/1000))+","+threeDigits(amt%1000);
    }
    else {
        return "$"+Math.floor(amt/1000)+","+threeDigits(amt%1000);
    }
}

function setZoomText(dot,stats) {
    var name= stats.name;
    var year= stats.year;
    var season= stats.season;
    var winShares= stats.winShares;
    var winSharePct= Math.round(stats.winSharePct*100)/100;
    var allStats= [name,"Season: "+season,"Win Shares: "+winShares,"WS %: "+winSharePct]
    if('salary' in stats) {
        allStats.push("Salary: "+formatAsMoney(stats.salary))
        allStats.push("Salary %: "+Math.round(stats.salaryPct*100)/100)
    }
    
    //add text to each group, set properties and event handler
    texts= dot.select("svg")
            .attr("class","text")
            .attr("x", function() {
                    return d3.select(this.parentNode).select("circle").attr("cx") - (Math.sqrt(2)*zoomRad)/2;
                })
            .attr("y", function() {
                    return d3.select(this.parentNode).select("circle").attr("cy") - (Math.sqrt(2)*zoomRad)/2;
                })
            .attr("width", function(d) {
                    return 2*zoomRad;
                })
            .attr("height", function(d) {
                    return 2*zoomRad;
                });
             
    sizes= [zoomRad/6,zoomRad/8]           
    texts.selectAll("text")
        .attr("class","data")
        .data(allStats)
        .attr("x", (Math.sqrt(2)*zoomRad)/2)
        .attr("y", function(d,i){
            if(i==0) {
                return parseInt(d3.select(this.parentNode).attr("width"))/6;
            }
            else {
                start= parseInt(d3.select(this.parentNode).attr("width"))/6;
                y0= allStats.length==4 ? start : start + sizes[1];
                yFinal= Math.sqrt(2)*parseInt(d3.select(this.parentNode).attr("width")/2);
                return y0 + (i*(yFinal-y0))/(allStats.length-1)
            }
        })
        .attr("id","text")
        .attr("font-size",function(d,i){return i==0 ? Math.min(2.4*zoomRad/(d.length),sizes[0]) : sizes[1];})
        .attr("text-anchor","middle")
        .attr("dominant-baseline","bottom")
        .attr("fill", function() {
            color= d3.select(this.parentNode.parentNode).select("circle").attr("fill");
            if (color=="white") {
                return "#2B6689"  
            }
            else {
                return "white";
            }
        })
        .moveToFront()
        .text(function(d) {return d;})
        //.text(function(d,i){
        //        if(i==0) {
        //            d3.select(this.parentNode).attr("xlink:href", "http://www.basketball-reference.com"+d[1]);
        //            d3.select(this).style("text-decoration","underline")
        //                            .on("click", function() {
        //                                return;
        //                            });
        //            return d[0];
        //        }
        //        else {
        //            return d;
        //        }
        //    })
}