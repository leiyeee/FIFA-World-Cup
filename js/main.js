$(function () {
    $("#slider-range").slider({
        range: true,
        min: 1930,
        max: 2019,
        values: [1930, 2019],
        slide: function (event, ui) {
            $("#range").val(ui.values[0] + " - " + ui.values[1]);
            start = ui.values[0];
            end = ui.values[1];
            loadData(start, end);
        }
    });
    $("#range").val($("#slider-range").slider("values", 0) +
        " - " + $("#slider-range").slider("values", 1));
});

// SVG drawing area

let margin = {
    top: 40,
    right: 40,
    bottom: 60,
    left: 60
}
padding = 20;


let width = 600 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

let svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




// Date parser
let formatDate = d3.timeFormat("%Y");
let parseDate = d3.timeParse("%Y");

// Scales
let x = d3.scaleTime()
    .range([0, width]);


let y = d3.scaleLinear()
    .range([height, 0])

let xAxis = d3.axisBottom()
    .scale(x)
let yAxis = d3.axisLeft()
    .scale(y)

var xAxisGroup = svg.append("g")
    .attr("class", "x-axis axis");

var yAxisGroup = svg.append("g")
    .attr("class", "y-axis axis");


// Initialize data
loadData(1930, 2010);

// FIFA world cup
let data;

d3.select("#ranking-type").on("change", function () {
    updateVisualization()
});

// Load CSV file
function loadData(s, e) {
    d3.csv("data/fifa-world-cup.csv").then(function (csv) {

        csv.forEach(function (d) {
            // Convert string to 'date object'
            d.YEAR = parseDate(d.YEAR);

            // Convert numeric values to 'numbers'
            d.TEAMS = +d.TEAMS;
            d.MATCHES = +d.MATCHES;
            d.GOALS = +d.GOALS;
            d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
            d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
        });

        // Store csv data in global variable
        data = csv;

        var csv2;
        csv2 = csv.filter(function (d) {
            return (formatDate(d.YEAR) >= s && formatDate(d.YEAR) <= e);
        })
        //console.log(csv2)
        // Store csv data in global variable
        data = csv2;


        // Draw the visualization for the first time
        updateVisualization();
    });
}

// Render visualization
function updateVisualization() {

    console.log(data);
    //get option value from readers
    var opt = d3.select("#ranking-type").property("value");

    //sort data
    data.sort(function (a, b) {
        return a[data.YEAR] - b[data.YEAR];
    });

    x.domain(d3.extent(data, d => d.YEAR))
    y.domain([0, d3.max(data, d => d[opt])]);

    var path = svg.selectAll(".path")
        .remove()
        .exit()
        .data(data)


    path.enter().append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "#ff6666")
        .attr("stroke-width", 1)
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .curve(d3.curveLinear)
            .x(d => x(d.YEAR))
            .y(d => y(d[opt]))
        )
        .attr("class", "path")

    // create a tooltip
    var tooltip = d3.select("#chart-area")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "#80b3ff")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("border-color", "#cceeff")
        .style("padding", "5px")

    //two functions for mouse move
    var mouseover = function (event, d) {
        tooltip
            .style("opacity", 0.8)
            .html(d.EDITION + "<br>" + d[opt] + " " + opt)
            .style("left", (d3.pointer(event)[0]) + "px")
            .style("top", (d3.pointer(event)[1]) + "px");
    }

    var mouseleave = function (event, d) {
        tooltip.style("opacity", 0)
    }

    var dot = svg.selectAll(".tooltip-circle")
        .remove()
        .exit()
        .data(data)

    dot.enter()
        .append("circle")
        .data(data)
        .attr("cx", d => x(d.YEAR))
        .attr("cy", d => y(d[opt]))
        .attr("r", 4)
        .style("fill", "#ff6666")
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
        .on("click", function (event, d) {
            showEdition(d);
        })
        .attr("class", "tooltip-circle")


    xAxisGroup = svg.select(".x-axis")
        .attr("transform", "translate(0," + (height) + ")")
        .transition()
        .duration(1000)
        .call(xAxis);

    yAxisGroup = svg.select(".y-axis")
        .attr("transform", "translate(" + (padding - 21) + ",0)")
        .transition()
        .duration(500)
        .call(yAxis);
}


// Show details for a specific FIFA World Cup
function showEdition(d) {
    var info1 = d.EDITION + "<br>" +
        "Winner: " + d.WINNER + "<br>" +
        "Number of Matches: " + d.MATCHES + " by " + d.TEAMS + " teams<br>" +
        "Winner Goals: " + d.GOALS + "<br>" +
        "Average Goals: " + d.AVERAGE_GOALS + "<br>" +
        "Average Attendance: " + d.AVERAGE_ATTENDANCE + " people";
    console.log(info1);
    document.getElementById("info").innerHTML = info1;
}
