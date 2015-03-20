// define margins
var margin = {top: 0, right: 10, bottom: 30, left: 60};

// graphics size without axis
var width = 650 - margin.left - margin.right;
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
    .tickFormat(d3.time.format("%m-%d"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(5);

// parse dates and remove missing values
var parseDate = d3.time.format("%Y-%m-%d").parse;

var line = d3.svg.line()
    .defined(function(d) { return !isNaN(d.price); })
    .interpolate("basis")
    .x(function(d) { return x(d.Date); })
    .y(function(d) { return y(d.price); });

var tsdata = d3.csv("../data/chart_data/singleCohortWide.csv", function (data) {
    
    var optionNames = d3.keys(data[0]).filter(function(key) { return key !== "Date"; });
    
    data.forEach(function(d) {
        d.Date = parseDate(d.Date);
    });
    
    var tseries = optionNames.map(function(name) {
        
        optionData = data.map(function(d) {
            if (name[0] == "p") {
                return {Date: d.Date, price: -d[name], option: name};
            } else {
                return {Date: d.Date, price: +d[name], option: name};
            }
        })
        
        return {name: name,
                type: name[0],
                values: optionData
               };
    });
    
    x.domain(d3.extent(data, function(d) { return d.Date; }));
    
    y.domain([
        d3.min(tseries, function(c) { return d3.min(c.values, function(v) { return v.price; }); }),
        d3.max(tseries, function(c) { return d3.max(c.values, function(v) { return v.price; }); })
    ]);
    
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
    
    var price = svg.selectAll(".price")
        .data(tseries)
        .enter()
        .append("g")
        .attr("class", "price")
        .append("path")
        .attr("class", function(d) { return d.type;} )
        .attr("d", function(d) { d.line = this; return line(d.values); });
    
    // voronoi
    var voronoi = d3.geom.voronoi()
        .x(function(d) { return x(d.Date); })
        .y(function(d) { return y(d.price); })
        .clipExtent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);
    
    var voronoiGroup = svg.append("g")
        .attr("class", "voronoi");
    
    voronoiGroup.selectAll("path")
        .data(voronoi(d3.nest()
                      .key(function(d) { return x(d.Date) + "," + y(d.price); })
                      .rollup(function(v) { return v[0]; })
                      .entries(d3.merge(tseries.map(function(d) { return d.values; })))
                      .map(function(d) { return d.values; })
                      .filter(function(d) { return !isNaN(d.price) })))
        .enter().append("path")
        .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
        .datum(function(d) { return d.point; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);
    
    function mouseover(d) {
        svg.selectAll("path").filter(function(c) { return c.name == d.option})
            .attr("class", function(d) {
                if (d.name[0] == "c") {
                    return "line--hover-c";
                } else if (d.name[0] == "p") {
                    return "line--hover-p";
                } else {
                    return "line--hover-d";
                }
            })
        d3.selectAll("h2").text(d.option)
    }
    
    function mouseout(d) {
        svg.selectAll("path").filter(function(c) { return c.name == d.option})
            .attr("class", function(d) { return d.type;} )
    }
    
    
});
