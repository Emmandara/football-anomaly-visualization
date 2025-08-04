/**
 * @license
 * Copyright 2019 Victor Dibia. https://github.com/victordibia
 * Anomagram - Anomagram: Anomaly Detection with Autoencoders in the Browser.
 * Licensed under the MIT License (the "License"); 
 * =============================================================================
 */

import React, { Component } from "react";
import "./histogram.css"
import * as d3 from "d3"

class HistogramChart extends Component {

    constructor(props) {
        super(props)

        this.state = {
            chart: this.props.data
        }
        this.minChartWidth = this.props.data.chartWidth
        this.minChartHeight = this.props.data.chartHeight

        this.numTicks = 40
        this.xTicks = 7
    }

    componentDidMount() {

        this.drawGraph(this.props.data.data)
        // console.log(this.props.data); 
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log(prevProps.data.epoch, this.props.data.epoch)
        if ((prevProps.data.epoch !== this.props.data.epoch) || (this.props.data.epoch + "" === "0" || this.props.data.threshold !== prevProps.data.threshold)) {
            // console.log("props updated");
            this.updateGraph(this.props.data.data)
        }

    }


    setupScalesAxes(data) {
        // console.log(this.minChartWidth);

        let self = this

        this.chartMargin = { top: 10, right: 5, bottom: 55, left: 45 }
        this.chartWidth = this.minChartWidth - this.chartMargin.left - this.chartMargin.right
        this.chartHeight = this.minChartHeight - this.chartMargin.top - this.chartMargin.bottom;



        this.xScale = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return d.mse })).nice()
            .range([this.chartMargin.left, this.chartWidth - this.chartMargin.right])

        // All Bins
        this.bins = d3.histogram()
            .value(function (d) { return d.mse })
            .domain(this.xScale.domain())
            .thresholds(this.xScale.ticks(self.numTicks))(data)

        // Normal Bins
        this.binNorm = d3.histogram()
            .value(function (d) {
                if (d.label + "" === "0") {
                    return d.mse
                };
            })
            .domain(this.xScale.domain())
            .thresholds(this.xScale.ticks(self.numTicks))(data)

        // Abnormal Bins
        this.binsAnorm = d3.histogram()
            .value(function (d) {
                if (d.label + "" === "1") {
                    return d.mse
                };
            })
            .domain(this.xScale.domain())
            .thresholds(this.xScale.ticks(self.numTicks))(data)

        // this.xScale = d3.scaleLinear()
        //     .domain([0, n - 1]) // input
        //     .range([0, this.chartWidth]); // output

        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(self.bins, d => d.length)]).nice()
            .range([this.chartHeight, 0])

        this.xAxis = d3.axisBottom(this.xScale).ticks(this.xTicks)
        this.yAxis = d3.axisRight(this.yScale)
            .tickSize(this.minChartWidth)



    }

    updateGraph(data) {
        let self = this
        // console.log(data[0]);




        this.setupScalesAxes(data)

        let svg = d3.select("div.histogramchart") //.transition();
        // console.log(svg);

        // // Abnormal Bins
        svg.select(".normcolor")
            .selectAll("rect")
            .data(self.binNorm)
            .join("rect")
            .attr("x", d => self.xScale(d.x0) + 1)
            .attr("width", d => Math.max(0, self.xScale(d.x1) - self.xScale(d.x0) - 1))
            .attr("y", d => self.yScale(d.length))
            .attr("height", d => self.yScale(0) - self.yScale(d.length))
        // .transition();

        svg.select(".anormcolor")
            .selectAll("rect")
            .data(self.binsAnorm)
            .join("rect")
            .attr("x", d => self.xScale(d.x0) + 1)
            .attr("width", d => Math.max(0, self.xScale(d.x1) - self.xScale(d.x0) - 1))
            .attr("y", d => self.yScale(d.length))
            .attr("height", d => self.yScale(0) - self.yScale(d.length))

        // Remove previous threshold line
        // d3.select(".thresholdline").transition().duration(5500).style("opacity", 0).remove()
        // let thresholdVal = this.getThreshold(data)
        svg.select(".thresholdline")
            .attr("x1", this.xScale(this.props.data.threshold))
            .attr("x2", this.xScale(this.props.data.threshold))

        svg.select(".thresholdtext")
            .attr("x", this.xScale(this.props.data.threshold))
            .text("Threshold - " + this.props.data.threshold.toFixed(3));

        function customYAxis(g) {
            g.call(self.yAxis);
            // g.select(".domain").remove();
            g.selectAll(".tick line").attr("stroke", "rgba(172, 172, 172, 0.74)").attr("stroke-dasharray", "2,2");
            g.selectAll(".tick text").attr("x", -20).attr("y", -.01)
        }

        function customXAxis(g) {
            g.call(self.xAxis);
            g.select(".domain").remove();
            g.selectAll(".tick line").attr("x", 100)
            g.selectAll(".tick text").attr("y", 15)
        }

        svg.select(".y.axis")
            .call(customYAxis);

        svg.select(".x.axis")
            .call(customXAxis);


    }

    getThreshold(data) {

        let meanNormal = d3.mean(data, function (d) {
            if (d.label + "" === "0") {
                return d.mse
            };
        })

        let meanAbnormal = d3.mean(data, function (d) {
            if (d.label + "" === "1") {
                return d.mse
            };
        })

        let midPoint = (meanNormal + meanAbnormal) / 2
        let walkBackPercentage = 0.2
        let thresholdVal = Math.min(meanNormal, meanAbnormal) + (midPoint - Math.min(meanNormal, meanAbnormal)) * walkBackPercentage


        return thresholdVal
    }

    drawGraph(data) {
        let self = this
        this.setupScalesAxes(data)
        // console.log(data[0]);

        const svg = d3.select("div.histogramchart").append("svg")
            .attr("width", this.chartWidth + this.chartMargin.left + this.chartMargin.right)
            .attr("height", this.chartHeight + this.chartMargin.top + this.chartMargin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.chartMargin.left + "," + this.chartMargin.top + ")");



        // normal histogram
        svg.append("g")
            .attr("class", "normcolor")
            .selectAll("rect")
            .data(self.binNorm)
            .join("rect")
            .attr("x", d => self.xScale(d.x0) + 1)
            .attr("width", d => Math.max(0, self.xScale(d.x1) - self.xScale(d.x0) - 1))
            .attr("y", d => self.yScale(d.length))
            .attr("height", d => self.yScale(0) - self.yScale(d.length));

        // Abnormal histogram
        svg.append("g")
            .attr("class", "anormcolor")
            .selectAll("rect")
            .data(self.binsAnorm)
            .join("rect")
            .attr("x", d => self.xScale(d.x0) + 1)
            .attr("width", d => Math.max(0, self.xScale(d.x1) - self.xScale(d.x0) - 1))
            .attr("y", d => self.yScale(d.length))
            .attr("height", d => self.yScale(0) - self.yScale(d.length));

        //add threshold line
        // let thresholdVal = this.getThreshold(data)

        // threshold line
        svg.append("line")
            .attr("class", "thresholdline")
            .attr("x1", this.xScale(this.props.data.threshold))  //<<== change your code here
            .attr("y1", this.yScale(0))
            .attr("x2", this.xScale(this.props.data.threshold))  //<<== and here
            .attr("y2", this.yScale(this.yScale.domain()[1]))
        // threshold label
        svg.append("text")
            .attr("class", "thresholdtext")
            .attr("x", this.xScale(this.props.data.threshold))
            .attr("y", this.yScale(this.yScale.domain()[1]))
            .attr("dy", ".95em")
            .attr("dx", ".35em")
            .text("Threshold - " + this.props.data.threshold.toFixed(3));

        function customYAxis(g) {
            g.call(self.yAxis);
            // g.select(".domain").remove();
            g.selectAll(".tick line").attr("stroke", "rgba(172, 172, 172, 0.74)").attr("stroke-dasharray", "2,2");
            g.selectAll(".tick text").attr("x", -20).attr("y", -.01)
        }

        function customXAxis(g) {
            g.call(self.xAxis);
            g.select(".domain").remove();
            g.selectAll(".tick line").attr("x", 100)
            g.selectAll(".tick text").attr("y", 15)
        }

        // text label for the x axis
        svg.append("text")
            .attr("transform",
                "translate(" + (this.chartWidth / 2) + " ," +
                (this.chartHeight + this.chartMargin.top + 43) + ")")
            .style("text-anchor", "middle")
            .attr("class", "axislabel x")
            .text("Mean Squared Error");


        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.chartMargin.left)
            .attr("x", 0 - (this.chartHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "axislabel y")
            .text("Frequency");

        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (self.chartHeight + 10) + ")")
            .call(customXAxis); // Create an axis component with d3.axisBottom

        // 4. Call the y axis in a group tag
        svg.append("g")
            .attr("class", "y axis")
            .call(customYAxis); // Create an axis component with d3.axisLeft

    }

    render() {
        return (
            <div className="positionrelative mainchartbox ">
                <div className="chartlegend legendtopleft p5 mediumdesc">
                    <div className="mb3"> <div className="legendcolorbox mr5  themeblue iblock"></div> Normal </div>
                    <div> <div className="legendcolorbox mr5 themeorange iblock"></div> Abnormal </div>
                </div>

                <div className="histogramchart chartsvg"></div>
            </div>
        );
    }
}

export default HistogramChart;