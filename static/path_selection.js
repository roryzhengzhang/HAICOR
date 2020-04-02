$(document).ready(function() { 

    //color the path
    // $('.edgepath').each(
    //     function() {
    //         console.log("shared path: "+array_num_index);
    //         var array_num_index = JSON.parse("["+$(this).attr('num_index')+"]");
    //         var colors = d3.scaleOrdinal(d3.schemeCategory10);
            
    //     }
    // )

    $('.dropdown-item').click(function (){
        // selected_tick = small_ticked;
        // update(link_data, node_data);
        $(this).addClass('.dropdown-active')
        var item = $(this).text();
        console.log($(this).text());
        $('#dropdownMenuButton-path-selection').text(item)
        //filter the graph based on the dropdown item
        if($(this).attr('id') == 'path-3')
        {
            //console.log("id == path-3");
            restoreVisibility();
            $('.nodes, .links, .edgelabel, .edgepath').each(function (){
                
                var array_num_index = JSON.parse("["+$(this).attr('num_index')+"]");

                if(!(array_num_index.includes(0) || array_num_index.includes(1) || array_num_index.includes(2) || array_num_index.includes(200) || array_num_index.includes(201)))
                {
                    //console.log($(this).attr('num_index')+"comply with the condition");
                    //hide the nodes not meeting the condition
                    $(this).hide();
                }
            })

        }
        else if($(this).attr('id') == 'path-5')
        {
            restoreVisibility();
            $('.nodes, .links, .edgelabel, .edgepath').each(function (){
                
                var array_num_index = JSON.parse("["+$(this).attr('num_index')+"]")

                if(!(array_num_index.includes(0) || array_num_index.includes(1) || array_num_index.includes(2) || array_num_index.includes(3) || array_num_index.includes(4) || array_num_index.includes(200) || array_num_index.includes(201)))
                {
                    //console.log($(this).attr('num_index')+"comply with the condition");
                    //hide the nodes not meeting the condition
                    $(this).hide();
                }
            })
        }
        else if($(this).attr('id') == 'path-10')
        {
            restoreVisibility();
            $('.nodes, .links, .edgelabel, .edgepath').each(function (){
                
                var array_num_index = JSON.parse("["+$(this).attr('num_index')+"]")

                if(!(array_num_index.includes(0) || array_num_index.includes(1) || array_num_index.includes(2) || array_num_index.includes(3) || array_num_index.includes(4)
                || array_num_index.includes(5) || array_num_index.includes(6) || array_num_index.includes(7) || array_num_index.includes(8) || array_num_index.includes(9) || array_num_index.includes(200) || array_num_index.includes(201)))
                {
                    //console.log($(this).attr('num_index')+"comply with the condition");
                    //hide the nodes not meeting the condition
                    $(this).hide();
                }
            })
        }


    })
})

function restoreVisibility()
{
    $('.nodes, .links, .edgelabel, .edgepath').each(function ()
    {
        $(this).show();
    })
}

function small_ticked() {
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

    edgelabels.attr('transform',function(d,i){
        if (d.target.x<d.source.x){
            bbox = this.getBBox();
            rx = bbox.x+bbox.width/2;
            ry = bbox.y+bbox
            .height/2;
            return 'rotate(180 '+rx+' '+ry+')';
            }
        else {
            return 'rotate(0)';
            }
    });

}


