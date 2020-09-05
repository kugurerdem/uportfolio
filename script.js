var chart; // this chart is for general types of assets (like stock, bond, crypto etc.)
var sub_chart; // this chart is for assets of certain type -that is choosen data in the main chart-

window.onload = function () {

    chart = new CanvasJS.Chart("A", {
        exportEnabled: false,
        animationEnabled: false,
        
        title:{
            text: "General Portfolio"
        },
        legend:{
            cursor: "pointer",
        },
        data: [{
            type: "pie",
            explodeOnClick: false,
            click: onClick,
            showInLegend: true,
            toolTipContent: "{name}: <strong>{y} TRY</strong>",
            indexLabel: "{name} #percent%",
            totalValue: 0,
            dataPoints: [

            ]
        }]
    });

    sub_chart = new CanvasJS.Chart("C", {
        exportEnabled: false,
        animationEnabled: false,
        title:{
            text: ""
        },
        legend:{
            cursor: "pointer",
        },
        data: [{
            type: "pie",
            explodeOnClick: false,
            click: onClick,
            showInLegend: true,
            toolTipContent: "{name}: <strong>{y} TRY</strong>",
            indexLabel: "{name} #percent%",
            totalValue: 0,
            dataPoints: [

            ]
        }]
    });

    // lets not forget to render
    chart.render();
    sub_chart.render();
}

function onClick(e){
    var ch = e.chart;
    
    if( e.dataPoint.exploded){
        e.dataPoint.exploded = false;
        
        // if this item is a chart item, then update the sub_chart
        if( ch == chart){
            sub_chart.options.title.text = "";
            sub_chart.options.data[0].dataPoints = [];
        }
    } else{
        // set all of the other datas exploded to false
        var data_points = ch.options.data[0].dataPoints;
        for(var i = 0; i < data_points.length; i++){
            data_points[i].exploded = false;
        }
        e.dataPoint.exploded = true;

        // if this item is a chart item, then update the sub_chart
        if( ch == chart){
            if( e.dataPoint.assets.length >= 1){
                sub_chart.options.title.text = e.dataPoint.name + " portfolio";
                sub_chart.options.data[0].dataPoints = e.dataPoint.assets;
            }
        }
    }

    chart.render();
    sub_chart.render();
    // updateCharts();
}


// method that adds a new asset to the portfolio
function onAdd(){
    // get the inputs
    var input_name = document.getElementById("nameInput").value;
    var type = document.getElementById("typeInput").value;
    var quant = parseFloat( document.getElementById("quantityInput").value );
    var price = parseFloat( document.getElementById("priceInput").value );

    // if type is not entered then we will consider input_name as itself a type!
    if( type == ""){
        type = input_name;
    }

    // 
    var isFound = false;
    var data_points = chart.options.data[0].dataPoints;
    for(var i = 0; i < data_points.length; i++){
        if( data_points[i].name == type){
            var assets = data_points[i].assets;
            var assetFound = false;
            for(var j = 0; j < assets.length; j++){
                if( assets[j].name == input_name){
                    alert("This asset is already present!");
                    assetFound = true;
                } 
            }

            if( !assetFound){
                assets.push( { 
                    y: price * quant, 
                    name: input_name, 
                    price: price, 
                    quantity: quant, 
                    exploded: false
                } );

                data_points[i].y += price * quant;
            }
            isFound = true;
        }
    }

    // if the type of currency is not present add it
    if( !isFound){
        // lets add the item to out chart
        data_points.push( {   
                            y: price * quant, 
                            name: type, 
                            assets: [], 
                            exploded: false
                        } );
        
        // lets not forget to update sub_chart
        var assets = data_points[data_points.length - 1].assets;
        assets.push({ 
                        y: price * quant, 
                        name: input_name, 
                        price: price, 
                        quantity: quant, 
                        exploded: false
                    } );
    }
    
    // render
    chart.render();
    sub_chart.render();
}

// method that deletes the exploded (clicked) data from the chart 
function onRemove(){
    
    var data_points = chart.options.data[0].dataPoints;
    var isRemoved = false;
    for(var i = 0; i < data_points.length; i++){
        var assets = data_points[i].assets;
        if( data_points[i].exploded ){
            for( var j = 0; j < assets.length; j++){
                if( assets[j].exploded ){
                    // remove the asset
                    data_points[i].y -= assets[j].y;
                    assets.splice(j, 1);
                    isRemoved = true;
                    // break the loop
                    break;
                }
            }

            // we should check whether or not an asset is removed, if not, we should delete the all type
            // we also should check whether data_points[i].length > 0, if not, we should delete that type as well
            if( !isRemoved || assets.length == 0){
                data_points.splice(i, 1);
                // update the subchart
                sub_chart.options.title.text = "";
                sub_chart.options.data[0].dataPoints = [];

                isRemoved =  true;
            }

            // break the loop
            break;
        }
    }

    // if no element is removed
    if( !isRemoved){
        alert( "You need to choose an asset in order to delete it!");
    }

    // render
    chart.render();
    sub_chart.render();
}

// this method updates the given asset
function onUpdate(){
    // get the inputs
    var input_name = document.getElementById("nameInput").value;
    var type = document.getElementById("typeInput").value;
    var quant = parseFloat( document.getElementById("quantityInput").value );
    var price = parseFloat( document.getElementById("priceInput").value );

    // update the info
    var data_points = chart.options.data[0].dataPoints;
    var assetFound = false;
    for(var i = 0; i < data_points.length; i++){
        var data_point = data_points[i];
        if(data_point.name == type){
            var assets = data_point.assets;
            for(var j = 0; j < assets.length; j++){
                if( assets[j].name == input_name){
                    // correct the weight of the data point (Type)
                    data_points[i].y += (quant * price - assets[j].y);
                    
                    // update the asset info
                    assets[j].y = quant * price;
                    assets[j].price = price;
                    assets[j].quantity = quant;

                    assetFound = true;
                    break;
                }
            }
        }

        if( assetFound){
            break;
        }
    }

    // alert if asset is not found
    if( !assetFound){
        alert( "asset with the given info is not found!");
    }

    // render
    chart.render();
    sub_chart.render();
}

// method that changes the input text to the current json info
function onSave(){
    document.getElementById("jsonINPUT").value = createJSONString();
}

// method that will load the charts from the given json input
function onLoad(){
    // clear the chart and sub_chart
    chart.options.data[0].dataPoints = [];
    sub_chart.options.title.text = "";
    sub_chart.options.data[0].dataPoints = [];

    // load the thing
    var jsonString = document.getElementById("jsonINPUT").value;
    var jsonObject = JSON.parse( jsonString);
    for(var key in jsonObject){
        chart.options.data[0].dataPoints.push( jsonObject[key]);
    }

    // lets not forget to render after the update
    chart.render();
    sub_chart.render();
}

// function that creates the JSON for the information in the chart
function createJSON(){
   var jsonObject = {};

    var data_points = chart.data[0].dataPoints;

    for(var i = 0; i < data_points.length; i++){
        var data_point = data_points[i];
        jsonObject[data_point.name] = data_point;
    }

    return jsonObject;
}

function createJSONString(){
    return JSON.stringify( createJSON() );
}