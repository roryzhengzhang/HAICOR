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
        $(this).addClass('.dropdown-active')
        var item = $(this).text();
        console.log($(this).text());
        $('#dropdownMenuButton-path-selection').text(item)
        //filter the graph based on the dropdown item
        if($(this).attr('id') == 'path-3')
        {
            //console.log("id == path-3");
            restoreVisibility();
            $('.node, .link, .edgelabel, .edgepath').each(function (){
                
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
            $('.node, .link, .edgelabel, .edgepath').each(function (){
                
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
            $('.node, .link, .edgelabel, .edgepath').each(function (){
                
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
    $('.node, .link, .edgelabel, .edgepath').each(function ()
    {
        $(this).show();
    })
}


