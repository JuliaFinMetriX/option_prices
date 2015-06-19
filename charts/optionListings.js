// define margins
var margin = {top: 0, right: 10, bottom: 30, left: 60};

// graphics size without axis
var width = 900 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// axes scales
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%Y-%m-%d"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

// parse dates and remove missing values
var parseDate = d3.time.format("%Y-%m-%d").parse;

var tsdata = d3.csv("../data/chart_data/listingData.csv", function (d) {
    
	 return {
		  Date: new Date(d.Date),
		  Expiry: new Date(d.Expiry),
		  Strike: +d.Strike,
		  IsCall: d.IsCall
	 };
}, function(error, tsdata) {
	 
	 var nestedData = d3.nest()
		  .key(function(d) { return [d.Expiry, d.Strike]; })
		  // .key(function(d) { return d.Strike; })
		  .entries(tsdata)
	 
	 
	 x.domain(d3.extent(tsdata, function(d) { return d.Date; }));
	 y.domain(d3.extent(tsdata, function(d) { return d.Strike; }));
	 
	 // get unique expiry / strike combinations
	 
	 svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);
	 
	 svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		  .append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("price");
	 
});

