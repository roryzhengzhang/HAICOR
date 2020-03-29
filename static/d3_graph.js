var colors = d3.scaleOrdinal(d3.schemeCategory10);
var svg = d3.select("#canvas svg"),
    width = 960,
    height = 500,
    node,
    node_data,
    link_data,
    link,
    selected_node,
    selected_link;

var g = svg.append("g")
.attr("class", "everything");

var linkg = g.append("g"), nodeg = g.append("g");

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

d3.select(window)
.on("keydown", keydown)

//create the tooltip
var tool_tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "<strong>Node:</strong> <span style='color:red'>" + d.name + "</span>";
  })
svg.call(tool_tip);
// create the simulation var, each 'force' methods add a type of force performed on the svg
var simulation = d3.forceSimulation()
.force("link", d3.forceLink().id(function (d) {return d.id;}).distance(200).strength(1))
.force("center", d3.forceCenter(width/2, height/2))
.force("charge", d3.forceManyBody());
//if the json file is successfully loaded, then execute the callback
d3.json("../static/small_sample_graph.json", function (error, graph) {
    if (error) throw error;
    node_data = graph.nodes;
    link_data = graph.links;
    update(graph.links, graph.nodes); 
})

function restart()
{

    var new_node = nodeg.selectAll(".node").data(node_data).enter()
    .append("g")
    .attr("num_index", function (d) {return d.num_path})
    .attr("class", "node")
    .call(d3.drag() //the bahavior when dragging the node
        .on("start", dragstarted)
        .on("drag", dragged)
        //.on("end", dragended)
    )
    
    new_node.append("circle")
    .attr("r",6) //radius
    .style("fill", function (d, i) {return colors(i);}) //fill the color
    .on("mousedown", node_mousedown)
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide)

    // node.append("title")
    // .text(function (d) {return d.id;});

    new_node.append("text")
    .attr("dy", -3) //the shift along the y-axis, shift 3 along the negative y-axis
    .text(function (d) {return d.name});

    new_node.exit().remove();

    var new_link = linkg.selectAll(".link")
    .data(link_data)
    .enter()
    .append("line") //add them as line DOM element 
    .attr("class", "link")
    .attr("num_index", function (d) {return d.num_path} )
    .attr("marker-end", 'url(#arrowhead)')
    .on("mousedown", link_mousedown)

    // edgepaths = svg.selectAll(".edgepath")
    // .data(link_data)
    // .enter()
    // .append('path')
    // .attrs({
    //     'class': 'edgepath',
    //     'stroke-width': 0.8,
    //     'stroke': function (d,i) {return select_edge_color(d)},
    //     'num_index': function (d) {return d.num_path},
    //     //'fill-opacity': 0,
    //     //'stroke-opacity': 0,
    //     'id': function (d, i) {return 'edgepath' + i}
    // })
    // .style("pointer-events", "none");

    // edgelabels = svg.selectAll(".edgelabel")
    // .data(link_data)
    // .enter()
    // .append('text')
    // .style("pointer-events", "none")
    // .attrs({
    //     'class': 'edgelabel',
    //     'id': function (d, i) {return 'edgelabel' + i},
    //     'num_index': function (d) {return d.num_path},
    //     'font-size': 10,
    //     'fill': function (d,i) {return select_edge_color(d)}
    // });

    // edgelabels.append('textPath')
    // .attr('xlink:href', function (d, i) {return '#edgepath' + i})
    // .style("text-anchor", "middle")
    // .style("pointer-events", "none")
    // .attr("startOffset", "50%")
    // .attr("num_index", function (d) {return d.num_path})
    // .text(function (d) {return d.type});

    new_link.exit().remove()

    simulation.nodes(node_data).on("tick", ticked);
    simulation.force("link").links(link_data);
}

function update(links, nodes){
    console.log("links are: "+links)
    link = svg.append("g")
    .attr("class", "links")
    .data(links) //map the join array 'links' to the selected DOM elements
    .enter() //identify any DOM element need to be added when the join array is longer than the selection
    .append("line") //add them as line DOM element 
    //.attr("class", "links")
    .attr("num_index", function (d) {return d.num_path} )
    .attr("marker-end", 'url(#arrowhead)')
    .attr("stroke-width", 2)
    .attr("stroke", function (d,i) {return select_edge_color(d)})
    .on("mousedown", link_mousedown)

    link.append("title")
    .text(function (d) {
        return d.type; //label the edge with as 'type' property
    })

    // //edgepaths = svg.selectAll(".edgepath")
    // link
    // // .data(links)
    // // .enter()
    // .append('path')
    // .attrs({
    //     'class': 'edgepath',
    //     'stroke-width': 0.8,
    //     'stroke': function (d,i) {return select_edge_color(d)},
    //     'num_index': function (d) {return d.num_path},
    //     //'fill-opacity': 0,
    //     //'stroke-opacity': 0,
    //     'id': function (d, i) {return 'edgepath' + i}
    // })
    // .style("pointer-events", "none");

    // edgepaths = svg.selectAll(".edgepath")

    // //edgelabels = svg.selectAll(".edgelabel")
    // // .data(links)
    // // .enter()
    // link
    // .append('text')
    // .style("pointer-events", "none")
    // .attrs({
    //     'class': 'edgelabel',
    //     'id': function (d, i) {return 'edgelabel' + i},
    //     'num_index': function (d) {return d.num_path},
    //     'font-size': 10,
    //     'fill': function (d,i) {return select_edge_color(d)}
    // });

    // svg.selectAll(".edgelabel")
    // //edgelabels
    // .append('textPath')
    // .attr('xlink:href', function (d, i) {return '#edgepath' + i})
    // .style("text-anchor", "middle")
    // .style("pointer-events", "none")
    // .attr("startOffset", "50%")
    // .attr("num_index", function (d) {return d.num_path})
    // .text(function (d) {return d.type});

    // edgelabels = svg.selectAll(".edgelabel")

    node = svg.append("g").selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("num_index", function (d) {return d.num_path})
    .attr("class", "node")
    .call(d3.drag() //the bahavior when dragging the node
        .on("start", dragstarted)
        .on("drag", dragged)
        //.on("end", dragended)
    )
    
    node.append("circle")
    .attr("r",6) //radius
    .style("fill", function (d, i) {return colors(i);}) //fill the color
    .on("mousedown", node_mousedown)
    .on("mouseover", tool_tip.show)
    .on("mouseout", tool_tip.hide)

    // node.append("title")
    // .text(function (d) {return d.id;});

    node.append("text")
    .attr("dy", -3) //the shift along the y-axis, shift 3 along the negative y-axis
    .text(function (d) {return d.name});
        
    //node.exit().remove();

    simulation.nodes(nodes).on("tick", ticked);

    simulation.force("link").links(links);

   // simulation.alpha(0.3).restart();

}

function select_edge_color(d)
{
    var array_num_index = JSON.parse("["+d.num_path+"]");
    if(array_num_index.length == 1)
            {
                console.log("unique path: "+array_num_index[0]);
                console.log("color: "+array_num_index[0]);
                
                return colors(array_num_index[0]);
            }
            else{
                return '#aaa';
            }
}

function ticked() {
link
    .attr("x1", function (d) {return d.source.x;})
    .attr("y1", function (d) {return d.source.y;})
    .attr("x2", function (d) {return d.target.x;})
    .attr("y2", function (d) {return d.target.y;});

node
    .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

// edgepaths.attr('d', function (d) {
//     return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
// });

// edgelabels.attr('transform', function (d) {
//     if (d.target.x < d.source.x) {
//         var bbox = this.getBBox();

//         rx = bbox.x + bbox.width / 2;
//         ry = bbox.y + bbox.height / 2;
//         return 'rotate(180 ' + rx + ' ' + ry + ')';
//     }
//     else {
//         return 'rotate(0)';
//     }
// });
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

function node_mouseover(d, i)
{
    //d3.select(this).transition().duration(200).attr("r", 16)
    d3.select(this).attr({
        fill: "orange",
        r: 16
      });
    console.log("mouseover action");
    
}

function node_mouseout(d, i)
{
    d3.select(this).transition().duration(100).attr("r", 6)
}

function keydown()
{
    switch(d3.event.keyCode)
    {
        case 8:
        case 46: {
            console.log("deletion action; "+"selected node is: "+selected_node)
            //if what we selected is node
            if(selected_node) 
            {
                //get the index of selected node
                //console.log(node_data)
                var node_id = node_data.indexOf(selected_node)
                if(node_id == -1)
                {
                    return
                }
                console.log("node index is :"+node_id)
                // and delete it from the node list, splice(i,j) ==> delete j elements at position i
                node_data.splice(node_id, 1)
                //delete the connected links
                var new_links = []
                link_data.forEach(function(l)
                {
                    if(l.source.id != node_id && l.target.id != node_id)
                    {
                        new_links.push(l)
                    }
                })
                link_data = new_links
            }
            //if what we selected is link
            if(selected_link)
            {
                var link_id = link_data.indexOf(selected_link)
                if(link_id == -1)
                {
                    return
                }
                link_data.splice(link_id, 1)
            }

            //simulation.stop();
            restart()
            //simulation.restart();
        }
    }
}

//mousedown --> mouseup --> click, so if we stop propagation here, the node click event won't be called
function node_mousedown(d)
{
    //d3.event.stopPropagation();
    selected_node = d;
    console.log("node: mouse down")
    //simulation.stop()
    //update(link_data, node_data)
    restart()
    //simulation.restart()
}

function link_mousedown(d)
{
    selected_link = d;
}