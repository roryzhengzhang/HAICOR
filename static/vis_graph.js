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
    should_modify = false,
    delete_node = false,
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
        //console.log("change the target node to: "+d.name);
        selected_target_node = d;
    }

    var result = "<strong>Node:</strong> <span style='color:red'>"+d.name+"</span> <br>"
    link_data.forEach(function (edge) {
        //console.log("edge source: "+edge.source+"; edge target: "+edge.target+"; node.id: "+d.id)
        if($('#link'+edge.id).is(':visible'))
        {
            if(edge.source.id == d.id)
            {
                //console.log("edge.source meaning: "+edge.source_meaning)
                result = result.concat("<span>Word meaning in "+edge.type+": </span> <span> "+edge.source_meaning+"</span> <br>")
            }
            else if(edge.target.id == d.id)
            {
                //console.log("edge.target meaning: "+edge.target_meaning)
                result = result.concat("<span>Word meaning in "+edge.type+": </span> <span> "+edge.target_meaning+"</span> <br>")
            }
        }
        
    })
    //return "<strong>Node:</strong> <span style='color:red'>" + d.name + "</span>";
    return result;
  })
svg.call(tool_tip);

//create the tooltip
var tool_tip_edge = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    console.log("edge tool tip invoked")
    return "<strong>Edge:</strong> <span style='color:red'>" + d.type + "</span> <br>"+
    "<strong>Edge source:</strong> <span> "+d.come_from+"</span> <br>"+
    "<strong>Edge weight:</strong> <span>"+d.weight+"</span>";
  })
svg.call(tool_tip_edge);

d3.select(window)
    .on("keydown", keydown)
    .on("keyup", keyup)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup)


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

    // link = g.selectAll(".links")
    //     .data(links, d => d.id)
    //     .enter()
    //     .append("line")
    //     .attr("class", "links")
    //     .attr("stroke-width", 2)
    //     .attr('num_index', function (d) {return d.num_path})
    //     .attr("stroke", function (d,i) {return select_edge_color(d)})
    //     .attr('marker-end','url(#end)')

    link = g.selectAll(".links")
        .data(links);

    link_g = link.enter().append("line")
        .attr("class", "links")
        .attr("stroke-width", 2)
        .attr("id", function (d, i) {return "link" + i;})
        .attr('num_index', function (d) {return d.num_path})
        .attr("stroke", function (d,i) {return select_edge_color(d)})
        .attr('marker-end','url(#end)')

    link = link.merge(link_g)

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
        .data(links)

    var edgelabels_g = edgelabels
        .enter()
        .append('text')
        .style("pointer-events", "auto") //we need to enable pointer-event so that the mosue event can be received
        .attr('class', 'edgelabel')
        .attr('id', function(d,i) {return 'edgelabel'+i})
        .attr('num_index', function (d) {return d.num_path})
        .attr('font-size', 12)
        .on("mouseover", tool_tip_edge.show)
        .on("mouseout", tool_tip_edge.hide)
        .on("mousedown", ModifyEdge)
        .attr('fill', function(d,i) {return select_edge_color(d)})

    //https://developer.mozilla.org/en-US/docs/Web/SVG/Element/textPath
               
    edgelabels_g.append('textPath')
        .attr('xlink:href',function(d,i) {return '#edgepath'+i})
        .attr("startOffset", "50%")
        .style("text-anchor", "middle")
        .text(function (d) {return d.type})

    //edgelabels_g.append('circle')
     //   .attr("r", 20)

        

    edgelabels = edgelabels.merge(edgelabels_g);

    edgepaths.exit().remove();
    edgelabels.exit().remove();

    node = g.selectAll('.nodes')
        .data(nodes);

    var node_g = node
        .enter().append("g")
        .attr("class", "nodes")
        .attr("id", function (d, i) {return "node" + i;})
        .attr('num_index', function (d) {return d.num_path})
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                //stop the node moving
                .on("end", dragended))
        // );

    node_g.append("circle")
    //node.append("circle")
        .attr("r", 6)
        .attr("fill", function (d,i) {return select_edge_color(d)})
        .on("mousedown", node_mousedown)
        //.on("mousedown", ModifyNode)
        .on("mouseover", node_mouseover)
        .on("mouseover", tool_tip.show)
        .on("mouseout", tool_tip.hide);
    
    node_g.append("text")
    //node.append("text")
        .text(function(d) {
            return d.name;
        })
        .attr('dx', 8)
        .attr("class", "node-text")
        .attr('dy', -3)
        .attr("data-toggle", "modal")
        .attr("data-target", "#exampleModal")
        .attr("data-whatever", function (d) {
            return d.id;
        });

    node = node.merge(node_g);

    node.exit().remove();

    // var found = false;
    // for(var i = 0; i < nodes.length; i++) {
    //     if (nodes[i].id == 112) {
    //         found = true;
    //         break;
    //     }
    // }

    simulation
        .nodes(nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(links);

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
}

// // select node / start drag
function node_mousedown(d) {
    //d3.event.stopPropagation();
    if(drawing_line || delete_node)
    {
        d3.event.stopPropagation();
        console.log("node_mousedown")
        selected_node = d;
    }

    if(should_modify)
    {
        console.log("modify the node");
        $('#node-name-input').attr("value", d.name)
        $('#NodeModal').modal('toggle');
        $('#Node-Save-Button').unbind('click').click(function (ev){
            ev.stopPropagation();
            var node_name = $('#node-name-input').val();
            console.log("save button action")
            var selected_node_index = node_data.indexOf(d)
            node_data[selected_node_index].name = node_name
    
            // simulation.stop();
            // update(link_data, node_data);
            // simulation.restart();
            g.selectAll(".node-text").text(function (d)
            {
                return d.name;
            })

            //hide the modal
            $('#NodeModal').modal('hide'); 
            $('#node-name-input').attr("value", "")
            //selected_node = null;
        })
        // $('#Node-Save-Button').unbind('click').click(function (cv){
        //     ev.stopPropagation();
        //     selected_node = null;
        // })
    }
}

function ModifyEdge(d)
{
    d3.event.stopPropagation();
    if(should_modify)
    {
        console.log("modify the edge");
        $('#edge-name-input').attr("value", d.type)
        $('#EdgeModal').modal('toggle');
        $('#Edge-Save-Button').unbind('click').click(function (ev){
            ev.stopPropagation();
            var edge_name = $('#edge-name-input').val();
            //console.log("save button action")
            var selected_edge_index = link_data.indexOf(d)
            link_data[selected_edge_index].type = edge_name
    
            // simulation.stop();
            // update(link_data, node_data);
            // simulation.restart();
            g.selectAll("textpath").text(function (d)
            {
                return d.type;
            })

            //hide the modal
            $('#EdgeModal').modal('hide'); 
            $('#edge-name-input').attr("value", "")
            //selected_node = null;
        })
        // $('#Node-Save-Button').unbind('click').click(function (cv){
        //     ev.stopPropagation();
        //     selected_node = null;
        // })
    }
}

function CreateNode()
{
    d3.event.stopPropagation();
    if(should_modify) //shift has been pushsed down
    {
        console.log("CreateNode: selected_node="+selected_node)
        $('#NodeModal').modal('toggle');
        var x = d3.event.pageX - document.getElementById("svg_for_vis").getBoundingClientRect().x,
            y = d3.event.pageY - document.getElementById("svg_for_vis").getBoundingClientRect().y;
            //get the coordinate relative to the zoomed canvas
            x = (x - zoomTrans.x)/zoomTrans.scale;
            y = (y - zoomTrans.y)/zoomTrans.scale;

        //we need to unbind the previous click event trigger upon this button, otherwise it will bind another same trigger each time we call 'CreateNode'
        $('#Node-Save-Button').unbind('click').click(function (ev){
            ev.stopPropagation();
            console.log("save button; x="+x+"; y="+y)
            var node_name = $('#node-name-input').val();
                //console.log("creating node")
                //calculate the relative coordinate in terms of the svg canvas
            console.log("save button action")
            node = {"x": x, "y": y, "id": node_data.length, "num_path": 1, "name": node_name},
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
        //console.log("mouse move: dx="+dx+", dy="+dy)
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
    //update(link_data, node_data);
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
                // console.log("selected target node is existed")
                selected_target_node.fixed = false;
                var new_node = selected_target_node;
    
                //add the new edge
                $('#EdgeModal').modal('toggle');

                $('#Edge-Save-Button').unbind('click').click(function (ev){
                    var edge_name = $('#edge-name-input').val();
                    selected_node.fixed = false;
                    //num_path is currently filled by placeholder
                    console.log("source id: "+selected_node.id+"; target id: "+new_node.id)
                    link_data.push({"source": selected_node.id, "target": new_node.id, "type": edge_name, "num_path": [1,2]})  
                    simulation.stop();
                    update(link_data, node_data);
                    simulation.restart();
                    $('#EdgeModal').modal('hide');
                    selected_node = selected_target_node = null;
                })
                
            }
        }
        //delete the yellow line
        setTimeout(function () {
            new_line.remove();
            new_line = null;
            simulation.restart();
        }, 30);
    }
    if(delete_node)
    {
        if (selected_node) { // deal with nodes
            //alternative solution: hide the selected node and edges related to it
            var node_index = node_data.indexOf(selected_node)
            $('#node'+node_index).hide();

            link_data.forEach(function (l){
                if(l.source.id == selected_node.id || l.target.id == selected_node.id) {
                    var edge_index = link_data.indexOf(l)
                    $('#link'+edge_index).hide()
                    $('#edgepath'+edge_index).hide()
                    $('#edgelabel'+edge_index).hide()
                }
            })
            selected_node = null;
            // var i = node_data.indexOf(selected_node);
            // node_data.splice(i, 1);
            // // find links to/from this node, and delete them too
            // var new_links = [];
            // link_data.forEach(function(l) {
            //     if (l.source.id !== selected_node.id && l.target.id !== selected_node.id) {
            //         new_links.push(l);
            //     }
            // });
            // link_data = new_links;
            // simulation.stop();
            // update(link_data, node_data);
            // simulation.restart();

            // selected_node = null;
        }
        // } else if (selected_link) { // deal with links
        //     var i = link_data.indexOf(selected_link);
        //     link_data.splice(i, 1);
        //     // selected_link = link_data.length ? links[i > 0 ? i - 1 : 0] : null;
        // }
        //update(link_data, node_data);
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function keyup() {
    switch (d3.event.keyCode) {
        case 16: { // shift
            should_modify = false;
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
           break;
        }
        case 46: {
            delete_node = false;
            break;
        }
    }
}

// select for dragging node with shift; delete node with backspace
function keydown() {
    switch (d3.event.keyCode) {
        case 8: // backspace
        {
            break;
        }
        case 46: { // delete
            delete_node = true;
            break;
        }
        case 16: { //shift
            should_modify = true;
            break;
        }
        case 17: { //control
            drawing_line = true;
        }

    }
}