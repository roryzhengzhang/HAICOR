var colors = d3.scaleOrdinal(d3.schemeCategory10);
var svg = d3.select("svg"),
    width = $("#svg_for_vis").width(),
    height = $("#svg_for_vis").height(),
    node,
    edgepaths,
    edgelabels,
    link,
    selected_node, selected_target_node,
    selected_source_node,
    selected_link, new_line,
    should_create = false,
    selected_tick,
    selected_link,
    drawing_line = false;

g = svg.append("g").attr("class", "everything")

svg.on("mousedown", CreateNode);

//create the tooltip
var tool_tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    if (drawing_line && d !== selected_node) {
        // highlight and select target node
        console.log("change the target node to: "+d.name);
        selected_target_node = d;
    }
    return "<strong>Node:</strong> <span style='color:red'>" + d.name + "</span>";
  })
svg.call(tool_tip);

d3.select(window)
    .on("keydown", keydown)
    .on("keyup", keyup)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)

// d3.select("#content").on("mousemove", mousemove)
//     .on("mouseup", mouseup)

// svg.append("rect")
//     .attr("width", width)
//     .attr("height", height)
//     .on("mousedown", mousedown);

// build the arrow.
svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 17)
    .attr("refY", 0)
    .attr("markerWidth", 4)
    .attr("markerHeight",4)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr('fill', '#999');

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));

var node_data = [],
    link_data = [];

d3.json("/static/sample_graph.json", function(error, graph) {
    if (error) throw error;
    node_data = graph.nodes;
    link_data = graph.links;
    //selected_tick = ticked;
    update(link_data, node_data);
});

let zoomTrans = {"x": 0, "y": 0, "scale": 1};

// add zoom on svg
//restrict the scale range
d3.select("svg")
    .call(d3.zoom().scaleExtent([0.25, 3]).on("zoom", function () {
        g.attr("transform", d3.event.transform);
        //transform.x - the translation amount tx along the x-axis.
        //transform.y - the translation amount ty along the y-axis.
        //transform.k - the scale factor k.
        zoomTrans.x = d3.event.transform.x;
        zoomTrans.y = d3.event.transform.y;
        zoomTrans.scale = d3.event.transform.k;
    }))
    .on("dblclick.zoom", null);


function update(links, nodes){
    console.log("call update")

    link = g.selectAll(".links")
        .data(links);
    link = link.enter().append("line")
        .attr("class", "links")
        .attr("stroke-width", 2)
        .attr('num_index', function (d) {return d.num_path})
        .attr("stroke", function (d,i) {return select_edge_color(d)})
        .attr('marker-end','url(#end)')
        .merge(link);

    link.exit().remove();

    edgepaths = g.selectAll(".edgepath")
        .data(links);
    edgepaths = edgepaths.enter()
        .append('path')
        .attr('class', 'edgepath')
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .attr('num_index', function (d) {return d.num_path})
        .attr('id', function (d, i) {return 'edgepath' + i})
        .style("pointer-events", "none").merge(edgepaths);

    edgelabels = g.selectAll(".edgelabel")
        .data(links);

    var edgelabels_g = edgelabels
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attr('class', 'edgelabel')
        .attr('id', function(d,i) {return 'edgelabel'+i})
        .attr('num_index', function (d) {return d.num_path})
        .attr('font-size', 15)
        .attr('fill', function(d,i) {return select_edge_color(d)})

    //https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath
               
    edgelabels_g.append('textPath')
        .attr('xlink:href',function(d,i) {return '#edgepath'+i})
        .attr("startOffset", "50%")
        .style("pointer-events", "none")
        .style("text-anchor", "middle")
        .text(function (d) {return d.type});

    edgelabels = edgelabels.merge(edgelabels_g);

    edgepaths.exit().remove();
    edgelabels.exit().remove();

    node = g.selectAll('.nodes')
        .data(nodes);
    
    var node_g = node
        .enter().append("g")
        .attr("class", "nodes")
        .attr('num_index', function (d) {return d.num_path})
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                //stop the node moving
                .on("end", dragended))
        // );

    node_g.append("circle")
        .attr("r", 6)
        .attr("fill", function (d,i) {return select_edge_color(d)})
        .on("mousedown", node_mousedown)
        .on("mouseover", node_mouseover)
        .on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide)
        .on("mouseout", node_mouseout);

    node_g.append("text")
        .text(function(d) {
            return d.name;
        })
        .attr('dx', 8)
        .attr('dy', -3)
        .attr("data-toggle", "modal")
        .attr("data-target", "#exampleModal")
        .attr("data-whatever", function (d) {
            return d.id;
        });

    node = node.merge(node_g);

    node.exit().remove();
    // node_g.attr("transform", function(d) {
    //     console.log(d.index);
    //     return "translate(" + d.x + "," + d.y + ")";
    // });
    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

    //simulation.alpha(0.3).restart();
    //simulation.alpha(0.3).restart();

    // set positions for nodes
    // node.each(function(d) {
    //     d.fx = width / 2;
    //     d.fy = height;
    // });

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.4).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
    }

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
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    edgepaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                            //console.log(d)
                            return path});       

    // edgelabels.attr('transform',function(d,i){
    //     if (d.target.x<d.source.x){
    //         bbox = this.getBBox();
    //         rx = bbox.x+bbox.width/2;
    //         ry = bbox.y+bbox.height/2;
    //         return 'rotate(180 '+rx+' '+ry+')';
    //         }
    //     else {
    //         return 'rotate(0)';
    //         }
    // });

}

// select target node for new node connection
function node_mouseover(d) {
    d3.select(this).transition()
        .duration(150)
        .attr("r", 10);
    //update the target node
    if (drawing_line && d !== selected_node) {
        // highlight and select target node
        selected_target_node = d;
    }
}

function node_mouseout(d) {
    d3.select(this).transition()
        .duration(150)
        .attr("r", 6);
    // console.log("node mouseout")
    // if (drawing_line) {
    //     selected_target_node = null;
    // }
}

// // select node / start drag
function node_mousedown(d) {
    //d3.event.stopPropagation();
    if(drawing_line)
    {
        d3.event.stopPropagation();
        selected_node = d;
        console.log("node_mousedown")
    }
    
    //selected_link = null;

    // if (!should_drag) {
    //     d3.event.stopPropagation();
    //     drawing_line = true;
    // }
    // // d.fixed = true;
    // simulation.stop();
    // update(link_data, node_data);
    // simulation.restart();
}

function CreateNode()
{
    d3.event.stopPropagation();
    if(should_create)
    {
        
        $('#NodeModal').modal('toggle');
        var x = d3.event.pageX - document.getElementById("svg_for_vis").getBoundingClientRect().x,
            y = d3.event.pageY - document.getElementById("svg_for_vis").getBoundingClientRect().y;
            //get the coordinate relative to the zoomed canvas
            x = (x - zoomTrans.x)/zoomTrans.scale;
            y = (y - zoomTrans.y)/zoomTrans.scale;

        //we need to unbind the previous click event trigger upon this button, otherwise it will bind another same trigger each time we call 'CreateNode'
        $('#Modal-Save-Button').unbind('click').click(function (ev){
            ev.stopPropagation();
            console.log("save button; x="+x+"; y="+y)
            var node_name = $('#node-name-input').val();
             //console.log("creating node")
             //calculate the relative coordinate in terms of the svg canvas
            console.log("save button action")
            node = {"x": x, "y": y, "id": node_data.length, "num_path": 10, "name": node_name},
            node_data.push(node);

            simulation.stop();
            update(link_data, node_data);
            simulation.restart();
            //hide the modal
            $('#NodeModal').modal('hide'); 
        })
    }
}

//draw yellow "new connector" line
function mousemove() {
    if (drawing_line && selected_node) {
        var m = d3.mouse(d3.select("svg").node());
        m = d3.zoomTransform(d3.select("svg").node()).invert(m);
        var x = Math.max(0, Math.min(width, m[0]));
        var y = Math.max(0, Math.min(height, m[1]));
        // debounce - only start drawing line if it gets a bit big
        var dx = selected_node.x - x;
        var dy = selected_node.y - y;
        console.log("mouse move: dx="+dx+", dy="+dy)
        if (Math.sqrt(dx * dx + dy * dy) > 10) {
            
            // draw a line
            if (!new_line) {
                new_line = g.append("line").attr("class", "new_line");
            }
            new_line.attr("x1", function(d) { return selected_node.x; })
                .attr("y1", function(d) { return selected_node.y; })
                .attr("x2", function(d) { return x; })
                .attr("y2", function(d) { return y; });
        }
    }
    update(link_data, node_data);
}

// end node select / add new connected node
function mouseup() {
    //d3.event.preventDefault();
    drawing_line = false;
    console.log("mouse up")
    if (new_line) {
        if (selected_target_node) {
            if(selected_target_node != selected_node)
            {
                console.log("selected target node is existed")
                selected_target_node.fixed = false;
                var new_node = selected_target_node;
    
                //add the new edge
                selected_node.fixed = false;
                link_data.push({"source": selected_node.id, "target": new_node.id, "type": "New_Relation", "num_path": [1,2]})
                selected_node = selected_target_node = null;
                update(link_data, node_data);
            }
           
        }
        //delete the yellow line
        setTimeout(function () {
            new_line.remove();
            new_line = null;
            simulation.restart();
        }, 30);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function keyup() {
    switch (d3.event.keyCode) {
        case 16: { // shift
            should_create = false;
            break;
            // update(link_data, node_data);
            // simulation.restart();
        }
        case 17: {
            console.log("control released")
            drawing_line = false; //the line drawing should be halted if the 'control' key is up
            if(new_line)
            {
                setTimeout(function () {
                    new_line.remove();
                    new_line = null;
                    simulation.restart();
                }, 30);
            }
           
        }
    }
}

// select for dragging node with shift; delete node with backspace
function keydown() {
    switch (d3.event.keyCode) {
        case 8: // backspace
        case 46: { // delete
            if (selected_node) { // deal with nodes
                var i = node_data.indexOf(selected_node);
                node_data.splice(i, 1);
                // find links to/from this node, and delete them too
                var new_links = [];
                link_data.forEach(function(l) {
                    // console.log(l);
                    // console.log(selected_node);
                    if (l.source.id !== selected_node.id && l.target.id !== selected_node.id) {
                        new_links.push(l);
                    }
                });
                link_data = new_links;
                // selected_node = node_data.length ? nodes[i > 0 ? i - 1 : 0] : null;
            } else if (selected_link) { // deal with links
                var i = link_data.indexOf(selected_link);
                link_data.splice(i, 1);
                // selected_link = link_data.length ? links[i > 0 ? i - 1 : 0] : null;
            }
            //update(link_data, node_data);
            break;
        }
        case 16: { //shift
            should_create = true;
            break;
        }
        case 17: { //control
            drawing_line = true;
        }

    }
}