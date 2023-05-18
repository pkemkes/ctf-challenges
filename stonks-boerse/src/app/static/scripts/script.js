var data = JSON.parse(document.getElementById("values").innerHTML);

var plotA = document.getElementById("value-graph-a");
var plotB = document.getElementById("value-graph-b");
var plotC = document.getElementById("value-graph-c");


function plotGraph(plot, plotValues){
    Plotly.newPlot(
        plot, 
        [{ 
            x: [...Array(plotValues.length).keys()],
            y: plotValues.slice(-plotValues.length),
            mode: 'lines',
            marker: { color: "orange" }
        }], 
        {
            showlegend: false,
            margin: { t: 20, l: 60, b: 20, r: 20 }, 
            paper_bgcolor: "#00212e",
            plot_bgcolor: "#00212e",
            xaxis: { visible: false }, 
            yaxis: { 
                color: "white", 
                gridcolor: "grey", 
                tickformat: "d", 
                ticksuffix: " €" 
            }
        }, 
        { staticPlot: true } 
    );
}

plotGraph(plotA, data.values_a);
plotGraph(plotB, data.values_b);
plotGraph(plotC, data.values_c);

document.getElementById("close-button").addEventListener(
    "click", () => document.getElementById("msg-box").style.display = "none"
);