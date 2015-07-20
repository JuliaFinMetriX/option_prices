// define margins
var margin = {top: 10, right: 10, bottom: 30, left: 60};

// graphics size without axis
var width = 1600 - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var liquMeasure = "Vol";

var nColors = 4;
var colors = colorbrewer.YlOrRd[nColors]
var quantize = d3.scale.quantile().range(d3.range(nColors));

// init index of current date 
var dateInd = 0;

// var heatmapColor = d3.scale.linear()
	 // .domain(d3.range(0, 1, 1.0 / (colors.length - 1)))
	 // .range(colors);

// axes scales
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%Y-%m"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

// function for the x grid lines
function make_x_axis() {
    return d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)
}

// function for the y grid lines
function make_y_axis() {
    return d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5)
}

var DAXline = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.values[0].Date); })
    .y(function(d) { return y(d.values[0].DAX); });

// parse dates and remove missing values
var parseDate = d3.time.format("%Y-%m-%d").parse,
bisectDate = d3.bisector(function(d) { return d.values[0].Date; }).left; 

var tsdata = d3.csv("../data/chart_data/putLiquidityData.csv", function (d) {
    
	 return {
		  Date: new Date(d.Date),
		  Expiry: new Date(d.Expiry),
		  Strike: +d.Strike,
		  DAX: +d.DAX,
		  Ask: +d.Ask,
		  Bid: +d.Bid,
		  OI: +d.Open_Interest,
		  OIRanks: +d.OiRanks,
		  Vol: +d.Volume,
		  VolRanks: +d.VolRanks,
		  DeltaOI: +d.DeltaOI
	 };
}, function(error, tsdata) {
	 
	 var dateExtend = d3.extent(tsdata, function(d) { return d.Date; });
	 var expExtend = d3.extent(tsdata, function(d) { return d.Strike; });
	 
	 x.domain([dateExtend[0], d3.max([dateExtend[1],
												 d3.extent(tsdata, function(d) { return d.Expiry; })[1]])]);
	 y.domain([0, expExtend[1]]);

	 quantize.domain( tsdata.map(function(d) { return d[liquMeasure]; } ));

	 d3.select("select").on("change", function() {
		  liquMeasure = this.value;
		  quantize.domain( tsdata.map(function(d) { return d[liquMeasure]; } ));
	 });

	 var uniqueDates = d3.nest()
		  .key(function(d) { return [d.Date]; })
		  .entries(tsdata);

	 // get unique expiry / strike combinations
	 var nestedData = d3.nest()
		  .key(function(d) { return [d.Expiry, d.Strike]; })
	 // .key(function(d) { return d.Strike; })
		  .entries(tsdata);
	 
	 // append axis
	 svg.append("g")
		  .attr("class", "x axis")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

	 // append background
	 svg.append("g")
        .attr("class", "background")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)

	 // Draw the x Grid lines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + height + ")")
        .call(make_x_axis()
              .tickSize(-height, 0, 0)
              .tickFormat("")
             )
    
    // Draw the y Grid lines
    svg.append("g")            
        .attr("class", "grid")
        .call(make_y_axis()
              .tickSize(-width, 0, 0)
              .tickFormat("")
             )
	 
	 var yAxisWithoutTitle = svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis);

	 // group tsdata by Date
	 var uniqueDates = d3.nest()
		  .key(function(d) { return d.Date; })
		  .entries(tsdata);

	 // append DAX line
	 svg.append("path")
        .datum(uniqueDates)
        .attr("class", "line")
        .attr("d", DAXline);

	 var circles = svg.selectAll(".optionDot")
		  .data(nestedData)
		  .enter()
		  .append("g")
		  .append("circle")
		  // .attr("class", "optionDot")
		  .attr("transform", function(d) { d.circleRef = this;
				return "translate(" + x(d.values[0].Expiry) + "," + y(d.values[0].Strike) + ")"; 
		  })
		  .attr("fill", "none")
		  .attr("r", 2);

	 // cycle through each observation in nestedData and append circle to object
	 nestedData.forEach(function(d) {
		  d.values.forEach(function(k) {
				k.circleRef = d.circleRef;
		  });
	 });

	 
	 svg.append("rect")                                     // **********
        .attr("width", width)                              // **********
        .attr("height", height)                            // **********
        .style("fill", "none")                             // **********
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

	 d3.select(window)
	 	  .on("keydown", keydown);

	 	 yAxisWithoutTitle.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("price");

	 var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");
    
    focus.append("circle")
        .attr("r", 4.5);
    
    focus.append("text")
        .attr("x", -40)
	     .attr("y", -15)
        .attr("dy", ".35em");

	 svg.append("line")
	 	  // .attr("x1", x.range()[0])
		  // .attr("y1", y.range()[0]/2)
		  // .attr("x2", x.range()[1])
		  // .attr("y2", y.range()[0]/2)
	 	  .attr("class", "horzLine");

	 redraw();
	 
    function mousemove() {                                 // **********
        var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(uniqueDates, x0);

		  dateInd = [];
		  if (i >= uniqueDates.length) {
				dateInd = i-1;
		  } else {
				d0 = uniqueDates[i - 1],                              // **********
				d1 = uniqueDates[i],                                  // **********
				dateInd = x(x0) - x(d0.values[0].Date) > x(d1.values[0].Date) - x(x0) ? i : (i-1);
		  }
		  redraw();
	 }

	 function keydown() {
		  console.log("keydown event!!")
		  if (!dateInd) return;
		  switch (d3.event.keyCode) {
		  case 49: {
				dateInd = dateInd - 1;
				redraw();
				break;
		  }// backspace
		  case 50: { // delete
				dateInd = dateInd + 1;
				redraw();
				break;
		  }
  }
	 };
	 
	 function redraw() {

		  // DAX tooltip
		  focus.attr("transform", "translate(" + x(uniqueDates[dateInd].values[0].Date) + "," + y(uniqueDates[dateInd].values[0].DAX) + ")");
        focus.select("text").text(uniqueDates[dateInd].values[0].DAX);

		  svg.select(".horzLine")
				.attr("x1", x(uniqueDates[dateInd].values[0].Date))
				.attr("y1", y(uniqueDates[dateInd].values[0].DAX))
		  		.attr("x2", x.range()[1])
				.attr("y2", y(uniqueDates[dateInd].values[0].DAX));

		  // make all points class invis
		  circles.attr("fill", "none");
		  // circles.classed("vis", false)

		  // make circles referenced by current date of class vis
		  allSelCircles = [];
		  currentCircleColors = [];
		  uniqueDates[dateInd].values.forEach(function(d, i) { allSelCircles[i] = d.circleRef;
																				 if (d[liquMeasure] == 0) {
																					  currentCircleColors[i] = 'green';
																				 } else if (d[liquMeasure] < 0) {
																					  currentCircleColors[i] = 'black';
																				 }
																				 else {
																					  currentCircleColors[i] = colors[quantize(d[liquMeasure])];
																				 }
																			  });
																				 
		  currSelCircles = d3.selectAll(allSelCircles);
		  // currSelCircles.classed("vis", true);
		  currSelCircles.attr("fill", function(d, i) { return currentCircleColors[i]; });

	 }
	 
});

