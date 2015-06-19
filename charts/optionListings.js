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
    .tickFormat(d3.time.format("%Y-%m"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

// parse dates and remove missing values
var parseDate = d3.time.format("%Y-%m-%d").parse,
bisectDate = d3.bisector(function(d) { return d.values[0].Date; }).left; 

var tsdata = d3.csv("../data/chart_data/listingData_short.csv", function (d) {
    
	 return {
		  Date: new Date(d.Date),
		  Expiry: new Date(d.Expiry),
		  Strike: +d.Strike,
		  IsCall: d.IsCall
	 };
}, function(error, tsdata) {
	 
	 var dateExtend = d3.extent(tsdata, function(d) { return d.Date; });
	 var expExtend = d3.extent(tsdata, function(d) { return d.Strike; });
	 
	 x.domain([dateExtend[0], d3.max([dateExtend[1],
												 d3.extent(tsdata, function(d) { return d.Expiry; })[1]])]);
	 y.domain([0, expExtend[1]]);

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
	 
	 var yAxisWithoutTitle = svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis);
	 
	 var circles = svg.selectAll(".optionDot")
		  .data(nestedData)
		  .enter()
		  .append("g")
		  .append("circle")
		  .attr("class", "optionDot")
		  .attr("transform", function(d) { d.circleRef = this;
				return "translate(" + x(d.values[0].Expiry) + "," + y(d.values[0].Strike) + ")"; 
		  })
		  .attr("r", 2);

	 // cycle through each observation in nestedData and append circle to object
	 nestedData.forEach(function(d) {
		  d.values.forEach(function(k) {
				k.circleRef = d.circleRef;
		  });
	 });

	 // group tsdata by Date
	 var uniqueDates = d3.nest()
		  .key(function(d) { return d.Date; })
		  .entries(tsdata);
	 
	 svg.append("rect")                                     // **********
        .attr("width", width)                              // **********
        .attr("height", height)                            // **********
        .style("fill", "none")                             // **********
        .style("pointer-events", "all")                    // **********
        .on("mousemove", mousemove);                       // **********

	 	 yAxisWithoutTitle.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("price");

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

		  // make all points class invis
		  circles.classed("vis", false)

		  // make circles referenced by current date of class vis
		  // uniqueDates[dateInd].values.forEach(function(d) { (d.circleRef).classed("vis", true) });
		  allSelCircles = [];
		  uniqueDates[dateInd].values.forEach(function(d, i) { allSelCircles[i] = d.circleRef; });

		  currSelCircles = d3.selectAll(allSelCircles)
		  // currSelCircles = d3.select(uniqueDates[dateInd].values[0].circleRef)
		  currSelCircles.classed("vis", true)
	 }
	 
});

