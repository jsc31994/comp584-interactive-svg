var margin = { top: 60, right: 20, bottom: 30, left: 50 },
   width = 700 - margin.left - margin.right,
   height = 365 - margin.top - margin.bottom;

var margin2 = { top: 380, right: 20, bottom: 10, left: 50 },
   width = 700 - margin.left - margin.right,
   height2 = 365 - margin2.top - margin2.bottom;

// Adjust parsing of data to properly show tooltip
var parseDate = d3.timeParse("%b %Y"),
   bisectDate = d3.bisector(function(d) {
      return d.date;
   }).left,
   formatValue = d3.format(".2"),
   formatCurrency = function(d) {
      return formatValue(d) + "%";
   };

var x = d3.scaleTime().range([0, width]);
var x2 = d3.scaleTime().range([0, width]);

var y = d3.scaleTime().range([height, 0]);
var y2 = d3.scaleTime().range([height, 0]);

var xAxis = d3.axisBottom(x); //.scale(x);
var xAxis2 = d3.axisBottom(x2);

var yAxis = d3.axisLeft(y); //.scale(y);

var line = d3
   .line()
   .x(function(d) {
      return x(d.date);
   })
   .y(function(d) {
      return y(d.rate);
   });

//this adds an svg tag to the body as well
//as well as a g tag which will contain the x,y values
var svg = d3
   .select("body")
   .append("svg")
   .attr("width", width + margin.left + margin.right)
   .attr("height", height + margin.top + margin.bottom)
   .append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//calling the data
d3.csv("./unemployment_2005_2015.csv", function(error, data) {
   if (error) throw error;
   console.log(data);

   //for each data entry, we
   //will plot it on the graph
   data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.rate = +d.rate;
   });

   //X and Y axes of the graph
   x.domain(
      d3.extent(data, function(d) {
         return d.date;
      })
   );
   y.domain(
      d3.extent(data, function(d) {
         return d.rate;
      })
   );

   //appending our containers
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
      .text("Unemployment Rate (%)");

   // Start Animation on Click
   d3.select("#start").on("click", function() {
      var path = svg
         .append("path")
         .datum(data)
         .attr("class", "line")
         .attr("d", line);

      var totalLength = path.node().getTotalLength();

      //our stroke dash array
      path
         .attr("stroke-dasharray", totalLength + " " + totalLength)
         .attr("stroke-dashoffset", totalLength)
         .transition() // Call Transition Method
         .duration(1000) // Set Duration timing (ms)
         .ease(d3.easeLinear) // Set Easing option
         .attr("stroke-dashoffset", 0); // Set final value of dash-offset for transition

      // Create SVG for Tooltip and Circle on Mouseover
      var focus = svg
         .append("g")
         .attr("class", "focus")
         .style("display", "none");

      // Append a circle to show on Mouseover
      focus.append("circle").attr("r", 4.5);

      // Append text to show on Mouseover
      focus
         .append("text")
         .attr("x", 9)
         .attr("dy", ".35em");

      // Append overlay rectangle as container for Circle and Tooltips
      // that allows user to hover anywhere on graphic
      svg.append("rect")
         .attr("class", "overlay")
         .attr("width", width)
         .attr("height", height)
         .on("mouseover", function() {
            focus.style("display", null);
         })
         .on("mouseout", function() {
            focus.style("display", "none");
         })
         .on("mousemove", mousemove);

      // Mousemove function that sets location and changes properties of Focus SVG
      function mousemove() {
         var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
         focus.attr(
            "transform",
            "translate(" + x(d.date) + "," + y(d.rate) + ")"
         );
         focus.select("text").text(formatCurrency(d.rate));
      }
   });

   // removing the line
   d3.select("#reset").on("click", function() {
      d3.select(".line").remove();
   });
});
