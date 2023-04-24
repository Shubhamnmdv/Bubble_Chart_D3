import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import './App.css';
import DATA from "./population.csv";

function App() {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("1960");
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showToolTip, setShowToolTip] = useState(false);
  const svgRef = useRef();

  useEffect(() => {
    fetch(DATA, {
      headers: {
        "content-type": "text/csv;charset=UTF-8",
      },
    })
      .then((response) => response.text())
      .then((text) => {
        const rows = text.split("\n").slice(1);
        const newData = rows.map((row) => {
          const columns = row.split(",");
          const index = columns[1].length === 4 ? 1 : 2;
          return {
            country: columns[0],
            year: columns[index],
            population: columns[index + 1],
            density: columns[index + 2],
            growthRate: columns[index + 3],
          };
        });
        setData(newData);
      });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      drawScatterplot(data, selectedYear, svgRef);
      // drawLineChart(data, svgRef);
    }
  }, [data, selectedYear]);

  const drawScatterplot = (data, selectedYear) => {
    const colors = ["#9172FF", "#F9CB4C", "#4BB2FF", "#FFC852", "#7BFF9E", "#"];
    const margin = { top: 20, right: 20, bottom: 70, left: 70 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
  
    d3.select(svgRef.current).select("#scatterplot").remove();
  
    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("id", "scatterplot")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    const xScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          data.filter((d) => d.year === selectedYear),
          (d) => +d.density
        ),
      ])
      .range([0, width]);
  
    const yScale = d3.scaleLinear().domain([0, 3]).range([height, 0]);
  
    const rScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          data.filter((d) => d.year === selectedYear),
          (d) => +d.population
        ),
      ])
      .range([3, 20]);
  
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale).ticks(5);
  
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .append("text")
      .attr("x", width / 2)
      .attr("y", 40)
      .attr("fill", "#000")
      .style("text-anchor", "middle")
      .style("font-family", "Arial")
      .style("font-size", "14px")
      .style("fill", "black")
      .style("font-weight", "bold")
      .style("padding", "25px")
      .text("Population Density");
    svg
      .append("g")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("fill", "#000")
      .style("text-anchor", "middle")
      .style("font-family", "Arial")
      .style("font-size", "14px")
      .style("fill", "black")
      .style("font-weight", "bold")
      .style("padding", "25px")
      .text("Population Growth (%)");
      
  
    const tooltip = d3
      .select(svgRef.current)
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      // .style("font-size", "14px")
      // .style("font-weight", "bold")
      // .style("color", "white")
      // .style("background-color", "black")
      // .style("padding", "10px");
      // .attr("class", "tooltip")
      // .style("background-color", "white")
      // .style("border", "solid")
      // .style("border-width", "2px")
      // .style("border-radius", "5px")
      // .style("padding", "5px")
  
    svg
      .selectAll("circle")
      .data(data.filter((d) => d.year === selectedYear))
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(+d.density))
      .attr("cy", (d) => yScale(+d.growthRate))
      .attr("r", (d) => rScale(+d.population))
      .attr("fill", (d, i) => colors[i % colors.length])
      .on("mouseover", (e, d) => {
        setShowToolTip(true);
        setTooltipContent(`${d.country}: ${d.population}`);
        setTooltipPosition({ x: e.pageX, y: e.pageY });
        tooltip.transition().duration(200).style("opacity", 0.9);
      })
      .on("mousemove", function (e, d) {
        const [x, y] = d3.pointer(e, this);
        tooltip.style("left", `${x + 10}px`).style("top", `${y + 10}px`);
      })
      .on("mouseleave", () => {
        setShowToolTip(false);
        tooltip.style("opacity", 0);
      });
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  return (
    <>
      <div className="App">
        <header
          style={{
            margin: "auto",
            background: "lightblue",
            textAlign: "center",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            padding: "36px",
          }}
        >
          <p
            style={{
              color: "#d52b1e",
              fontSize: "20px",
            }}
          >
            Shubham
          </p>
          <p>LiLLy Assesment</p>
        </header>
        <div class="container">
        <h2>Population Growth vs Density Correlation</h2>
        <div class="selectYear">
          <label htmlFor="year-select">Select Year:</label>
          <select id="year-select" onChange={handleYearChange}>
            {data.length > 0 &&
              Array.from(new Set(data.map((d) => d.year))).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
          </select>
        </div>
        <svg ref={svgRef} width="600" height="400"></svg>
        {tooltipContent && showToolTip && (
          <div
            id="tooltip-content"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              position: "absolute",
            }}
          >
            {tooltipContent}
          </div>
        )}
        </div>
      </div>
    </>
  );
}

export default App;
