/**
 * @license
 * Copyright 2019 Victor Dibia. https://github.com/victordibia
 * Anomagram - Anomagram: Anomaly Detection with Autoencoders in the Browser.
 * Licensed under the MIT License (the "License"); 
 * =============================================================================
 */


import React, { Component } from "react";
import "./rocchart.css"
import * as d3 from "d3"


class ROCChart extends Component {

    constructor(props) {
        super(props)

        this.state = {
            chart: this.props.data
        }
        this.minChartWidth = this.props.data.chartWidth
        this.minChartHeight = this.props.data.chartHeight

        this.numTicks = 40
        this.dotRadius = 1
    }

    componentDidMount() {
        this.drawGraph(this.props.data.data)
    }

    componentDidUpdate(prevProps, prevState) {


        // if ((prevProps.data.isTraining !== this.props.data.isTraining)) {
        //     console.log("props updated");
        //     this.updateGraph(this.props.data.data)
        // }

        if ((prevProps.data.epoch !== this.props.data.epoch) || this.props.data.epoch + "" === "0") {
            this.updateGraph(this.props.data.data)
        }
    }

    updateGraph(data) {
        let self = this

        d3.select("div.ROCChart").selectAll(".rocnode > *").remove();

        this.setupScalesAxes(data)
        let svg = d3.select("div.ROCChart").transition();

        svg.select(".rocline")
            .duration(self.animationDuration)
            .attr("d", this.rocLine(data)); // 11. Calls the line generator 

        svg.select(".rocarea")
            .duration(self.animationDuration)
            .attr("d", this.rocArea(data)); // 11. Calls the line generator 

        d3.select("div.ROCChart")
            .select(".rocnode")
            .selectAll("rocdot")
            .data(data)
            .join("circle")
            .attr("cx", function (d) { return self.xScale(d.fpr); })
            .attr("cy", function (d) { return self.yScale(d.tpr); })
            .attr("r", this.dotRadius)
            .attr("class", "rocdot")




        // svg.select(".lossvalcolor")
        //     .duration(self.animationDuration)
        //     .attr("d", this.valLine); // 11. Calls the line generator  

        function customYAxis(g) {
            g.call(self.yAxis);
            // g.select(".domain").remove();
            g.selectAll(".tick line").attr("stroke", "rgba(172, 172, 172, 0.74)").attr("stroke-dasharray", "2,2");
            g.selectAll(".tick text").attr("x", -30).attr("y", -.01)
        }

        function customXAxis(g) {
            g.call(self.xAxis);
            // g.select(".domain").remove();
            g.selectAll(".tick line").attr("x", 100)
            g.selectAll(".tick text").attr("y", 15)
        }

        svg.select(".y.axis")
            .call(customYAxis);

        svg.select(".x.axis")
            .call(customXAxis);

    }
    setupScalesAxes(data) {
        // console.log(data);

        // let self = this 
        this.chartMargin = { top: 10, right: 10, bottom: 55, left: 55 }
        this.chartWidth = this.minChartWidth - this.chartMargin.left - this.chartMargin.right
        this.chartHeight = this.minChartHeight - this.chartMargin.top - this.chartMargin.bottom;


        // this.xScale = d3.scaleLinear()
        //     .domain([d3.min(data, function (d) { return d.fpr }),
        //     d3.max(data, function (d) { return d.fpr })]) // input 
        //     .range([0, this.chartWidth]); // output
        this.xScale = d3.scaleLinear()
            .domain([0, 1]) // input 
            .range([0, this.chartWidth]); // output


        // this.yScale = d3.scaleLinear()
        //     .domain([d3.min(data, function (d) { return d.tpr }),
        //     d3.max(data, function (d) { return d.tpr })]) // input 
        //     .range([this.chartHeight, 0])
        this.yScale = d3.scaleLinear()
            .domain([0, 1]) // input 
            .range([this.chartHeight, 0])

        this.xAxis = d3.axisBottom(this.xScale)
        this.yAxis = d3.axisRight(this.yScale)
            .tickSize(this.minChartWidth)
    }
    drawLines(svg, data) {
        let self = this

        svg.append("path")
            .datum(data) // 10. Binds data to the line 
            .attr("class", "rocline roccolor") // Assign a class for styling  
            .attr("d", this.rocLine); // 11. Calls the line generator 


        svg.append("path")
            .datum(data)
            .attr("class", "rocarea")
            .attr("d", this.rocArea);

        svg.append("line")
            .attr("x1", this.xScale(0))  //<<== change your code here
            .attr("y1", this.yScale(0))
            .attr("x2", this.chartWidth)  //<<== and here
            .attr("y2", this.yScale(this.yScale.domain()[1]))
            .attr("class", "diagonal")

        svg.append('g')
            .attr("class", "rocnode")
            .selectAll("rocdot")
            .data(data)
            .join("circle")
            .attr("cx", function (d, i) { return self.xScale(d.fpr) })
            .attr("cy", function (d) { return self.yScale(d.tpr) })
            .attr("r", this.dotRadius)


        // svg.selectAll(".rocdot")
        //     .data(data)
        //     .join("circle") // Uses the enter().append() method
        //     .attr("class", "rocdot") // Assign a class for styling
        //     .attr("cx", function (d, i) { return self.xScale(d.fpr) })
        //     .attr("cy", function (d) { return self.yScale(d.tpr) })
        //     .attr("r", 5)


    }

    drawGraph(data) {
        let self = this

        // data = [
        //     { "acc": 0.7, "threshold": 1.2428572177886963, "tp": 3, "tn": 4, "fp": 3, "fn": 0, "ton": 7, "top": 3, "tpr": 1, "fpr": 0.42857142857142855, "fnr": 0, "tnr": 0.5714285714285714 },
        //     { "acc": 0.5, "threshold": 1.2, "tp": 3, "tn": 2, "fp": 5, "fn": 0, "ton": 7, "top": 3, "tpr": 1, "fpr": 0.7142857142857143, "fnr": 0, "tnr": 0.2857142857142857 },
        //     { "acc": 1, "threshold": 1.3, "tp": 3, "tn": 7, "fp": 0, "fn": 0, "ton": 7, "top": 3, "tpr": 1, "fpr": 0, "fnr": 0, "tnr": 1 },
        //     { "acc": 0.7, "threshold": 1.9, "tp": 0, "tn": 7, "fp": 0, "fn": 3, "ton": 7, "top": 3, "tpr": 0, "fpr": 0, "fnr": 1, "tnr": 1 },
        //     { "acc": 0.8, "threshold": 1.25, "tp": 3, "tn": 5, "fp": 2, "fn": 0, "ton": 7, "top": 3, "tpr": 1, "fpr": 0.2857142857142857, "fnr": 0, "tnr": 0.7142857142857143 },
        //     { "acc": 0.8, "threshold": 1.8, "tp": 1, "tn": 7, "fp": 0, "fn": 2, "ton": 7, "top": 3, "tpr": 0.3333333333333333, "fpr": 0, "fnr": 0.6666666666666666, "tnr": 1 },
        //     { "acc": 0.9, "threshold": 1.75, "tp": 2, "tn": 7, "fp": 0, "fn": 1, "ton": 7, "top": 3, "tpr": 0.6666666666666666, "fpr": 0, "fnr": 0.3333333333333333, "tnr": 1 },
        //     { "acc": 0.6, "threshold": 1.2428570985794067, "tp": 3, "tn": 3, "fp": 4, "fn": 0, "ton": 7, "top": 3, "tpr": 1, "fpr": 0.5714285714285714, "fnr": 0, "tnr": 0.42857142857142855 }]


        this.setupScalesAxes(data)

        this.rocLine = d3.line()
            .x(function (d, i) { return self.xScale(d.fpr); }) // set the x values for the line generator
            .y(function (d) { return self.yScale(d.tpr); }) // set the y values for the line generator 
        // .curve(d3.curveMonotoneX) // apply smoothing to the line

        this.rocArea = d3.area()
            .x(function (d) { return self.xScale(d.fpr); })
            .y0(this.chartHeight)
            .y1(function (d) { return self.yScale(d.tpr); });




        const svg = d3.select("div.ROCChart").append("svg")
            .attr("width", this.chartWidth + this.chartMargin.left + this.chartMargin.right)
            .attr("height", this.chartHeight + this.chartMargin.top + this.chartMargin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.chartMargin.left + "," + this.chartMargin.top + ")");

        this.drawLines(svg, data)

        function customYAxis(g) {
            g.call(self.yAxis);
            // g.select(".domain").remove();
            g.selectAll(".tick line").attr("stroke", "rgba(172, 172, 172, 0.74)").attr("stroke-dasharray", "2,2");
            g.selectAll(".tick text").attr("x", -20).attr("y", -.01)
        }

        function customXAxis(g) {
            g.call(self.xAxis);
            // g.select(".domain").remove();
            g.selectAll(".tick line").attr("x", 100)
            g.selectAll(".tick text").attr("y", 15)
        }
        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (self.chartHeight + 10) + ")")
            .call(customXAxis);
        // Create an axis component with d3.axisBottom

        // text label for the x axis
        svg.append("text")
            .attr("transform",
                "translate(" + (this.chartWidth / 2) + " ," +
                (this.chartHeight + this.chartMargin.top + 43) + ")")
            .style("text-anchor", "middle")
            .attr("class", "axislabel x")
            .text("False Positive Rate");


        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - this.chartMargin.left)
            .attr("x", 0 - (this.chartHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("class", "axislabel y")
            .text("True Positive Rate");



        // 4. Call the y axis in a group tag
        svg.append("g")
            .attr("class", "y axis")
            .call(customYAxis); // Create an axis component with d3.axisLeft

    }
    render() {
        // console.log(this.props.data.data[his.props.data.data].loss.toFixed(2));

        return (
            <div className="positionrelative mainchartbox ">
                <div className="chartlegend legendtopright p5 mediumdesc ">
                    <div className="mb3 ">
                        <div className="legendcolorbox mr5  themeblue iblock"></div>
                        <div ref="trainlabel" className="iblock boldtext mr5"> Area : {this.props.data.auc.toFixed(2)}  </div>
                        <div className="iblock "> </div>
                    </div>
                    <div>
                        <div className="legendcolorbox mr5 redchance iblock"></div>
                        <div ref="validationlabel" className="iblock boldtext mr5"> Chance</div>
                        <div className="iblock "></div>
                    </div>
                </div>


                <div className="ROCChart chartsvg"> </div>
            </div>

        );
    }
}

export default ROCChart;    