"use strict"

const externalDatasetURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const container = document.getElementById("container");

const width = 900;
const height = 500;
const padding = 100;
const dotRadius = 7;
const distanceFromOrigin = 20;
const tooltipOffset = 10;

let gatheredData;
let yLimits;
let xLimits;
let xScale;
let yScale;
let svg;
let yearDateList = [];
let timeDateList = [];
let tooltip;

function CreateSVG()
{
    svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height);
}


function FilterData(data)
{
    gatheredData = data;

    gatheredData.map(d => yearDateList.push(new Date(`01-01-${d.Year}`)));
    gatheredData.map(d => timeDateList.push(new Date(`01-01-2023 00:${d.Time}`)));

    xLimits = d3.extent(yearDateList);
    yLimits = d3.extent(timeDateList);
}


function DefineAxis()
{
    xScale = d3.scaleTime()
        .domain(xLimits)
        .range([0, width - (2 * padding)]);

    svg.append("g")
        .attr("transform", `translate(${padding + distanceFromOrigin}, ${height - padding})`)
        .attr("id", "x-axis")
        .attr("color", "white")
        .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

    yScale = d3.scaleTime()
        .domain(yLimits)
        .range([height - (2 * padding), 0]);

    svg.append("g")
        .attr("transform", `translate(${padding}, ${padding - distanceFromOrigin})`)
        .attr("id", "y-axis")
        .attr("color", "white")
        .call(d3.axisLeft(yScale).tickFormat(d3.timeFormat("%M:%S")) );
}


function MakeDots()
{
    svg.selectAll("circle")
        .data(gatheredData)
        .enter()
        .append("circle")
        .attr("data-id", (d, i) => i)
        .attr("r", dotRadius)
        .attr("cx", (d, i) => padding + distanceFromOrigin + xScale(yearDateList[i]))                
        .attr("cy", (d, i) => yScale(timeDateList[i]) + padding - distanceFromOrigin)
        .attr("fill", (d, i) => (gatheredData[i].Doping == "") ? "green" : "darkred")
        .attr("data-doping", (d, i) => gatheredData[i].Doping)
        .attr("data-xvalue", (d, i) => yearDateList[i].getFullYear())
        .attr("data-yvalue", (d, i) => timeDateList[i].toGMTString())
        .attr("class", "dot")
        .on("mouseover", (event) => MouseIn(event))
        .on("mouseout", (event) => MouseOut(event))
}


function GetTooltip()
{
    if(tooltip == null)
    {
        tooltip = document.getElementById("tooltip");
    }
}


function MouseIn(event)
{
    GetTooltip();
    
    tooltip.style.top = event.pageY + tooltipOffset + "px";
    tooltip.style.left = event.pageX + tooltipOffset + "px";

    tooltip.style.visibility = "visible";
    
    tooltip.dataset.time = event.target.dataset.yvalue;
    tooltip.dataset.year = event.target.dataset.xvalue;

    let newText = `
    Year: ${tooltip.dataset.year} 
    Time: ${gatheredData[Number(event.target.dataset.id)].Time}
    Doping: ${(event.target.dataset.doping == "") ? "No doping record" : event.target.dataset.doping}
    `;

    tooltip.textContent = newText;
}


function MouseOut(event)
{
    GetTooltip();

    tooltip.style.visibility = "hidden";
}


function DrawGraphic()
{
    container.append(svg.node());
}


function Main()
{
    CreateSVG();
    d3.json(externalDatasetURL)
        .then((data) => FilterData(data))
        .then(() => DefineAxis())
        .then(() => MakeDots())
        .then(() => DrawGraphic());
}


Main();

