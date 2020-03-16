var colors = d3.scaleOrdinal(d3.schemeCategory10);
var svg = d3.select("#canvas svg"),
    width = 960,
    height = 500,
    node,
    link;

svg.append('defs').append('marker').attrs(
    {
        'id': 'arrowhead',
        'viewBox': '-0 -5 10 10',
        'refX': 13,
        'refY': 0,
        'orient': 'auto',
        'markerWidth': 13,
        'markerHeight': 13,
        'xoverflow': 'visible'
    }
).append('svg:path')
.attr('d', 'M 0,-5 L 10 ,0 L 0,5')
.attr('fill', '#999')
.style('stroke','none');

// create the simulation var, each 'force' methods add a type of force performed on the svg
var simulation = d3.forceSimulation()
.force("link", d3.forceLink().id(function (d) {return d.id;}).distance(200).strength(1))
.force("center", d3.forceCenter(width/2, height/2))
.force("charge", d3.forceManyBody());
//if the json file is successfully loaded, then execute the callback
d3.json("../static/small_sample_graph.json", function (error, graph) {
    if (error) throw error;
    update(graph.links, graph.nodes); 
})

function update(links, nodes){
    link = svg.selectAll(".link")
    .data(links) //map the join array 'links' to the selected DOM elements
    .enter() //identify any DOM element need to be added when the join array is longer than the selection
    .append("line") //add them as line DOM element 
    .attr("class", "link")
    .attr("marker-end", 'url(#arrowhead)')

    link.append("title")
    .text(function (d) {
        return d.type; //label the edge with as 'type' property
    })

    edgepaths = svg.selectAll(".edgepath")
    .data(links)
    .enter()
    .append('path')
    .attrs({
        'class': 'edgepath',
        'fill-opacity': 0,
        'stroke-opacity': 0,
        'id': function (d, i) {return 'edgepath' + i}
    })
    .style("pointer-events", "none");

    edgelabels = svg.selectAll(".edgelabel")
    .data(links)
    .enter()
    .append('text')
    .style("pointer-events", "none")
    .attrs({
        'class': 'edgelabel',
        'id': function (d, i) {return 'edgelabel' + i},
        'font-size': 10,
        'fill': '#aaa'
    });

    edgelabels.append('textPath')
    .attr('xlink:href', function (d, i) {return '#edgepath' + i})
    .style("text-anchor", "middle")
    .style("pointer-events", "none")
    .attr("startOffset", "50%")
    .text(function (d) {return d.type});

    node = svg.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag() //the bahavior when dragging the ndoe
        .on("start", dragstarted)
        .on("drag", dragged)
        //.on("end", dragended)
    );

    node.append("circle")
    .attr("r",5) //radius
    .style("fill", function (d, i) {return colors(i);}); //fill the color

    node.append("title")
    .text(function (d) {return d.id;});

    node.append("text")
    .attr("dy", -3) //the shift along the y-axis, shift 3 along the negative y-axis
    .text(function (d) {return d.name+":"+d.label;});

    simulation.nodes(nodes).on("tick", ticked);

    simulation.force("link").links(links);

}

function ticked() {
link
    .attr("x1", function (d) {return d.source.x;})
    .attr("y1", function (d) {return d.source.y;})
    .attr("x2", function (d) {return d.target.x;})
    .attr("y2", function (d) {return d.target.y;});

node
    .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

edgepaths.attr('d', function (d) {
    return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
});

edgelabels.attr('transform', function (d) {
    if (d.target.x < d.source.x) {
        var bbox = this.getBBox();

        rx = bbox.x + bbox.width / 2;
        ry = bbox.y + bbox.height / 2;
        return 'rotate(180 ' + rx + ' ' + ry + ')';
    }
    else {
        return 'rotate(0)';
    }
});
}

function dragstarted(d) {
if (!d3.event.active) simulation.alphaTarget(0.3).restart()
d.fx = d.x; 
d.fy = d.y;
}

function dragged(d) { //d.fx and d.fy are set to the mouse position, so that during dragging the nodes stick with the mouse
d.fx = d3.event.x; 
d.fy = d3.event.y;
}