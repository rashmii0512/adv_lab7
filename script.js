// Parse the Data
// d3.csv("Finance_data.csv").then(function(data) {
//     // Log the raw data to the console
//     console.log(data);

//     // Optionally, you can also log specific properties
//     data.forEach(d => {
//         console.log(`Objective: ${d['What are your savings objectives?']}, Count: ${d.count}`);
//     });

//     // Process data for the bar plot (count occurrences of each objective)
//     const objectivesCount = d3.rollup(data, v => v.length, d => d['What are your savings objectives?']);

//     // Convert the rolled-up data back to an array for plotting
//     const chartData = Array.from(objectivesCount, ([objective, count]) => ({ objective, count }));

//     // Log processed chartData
//     console.log(chartData);

//     // Proceed to create your chart...
// });





d3.csv("Finance_data.csv").then(data => {
    // Convert numeric fields from strings to numbers
    data.forEach(d => {
        d.age = +d.age;
        d.Gold = +d.Gold;
        d.Mutual_Funds = +d.Mutual_Funds;
        d.Fixed_Deposits = +d.Fixed_Deposits;
        d.PPF = +d.PPF;
    });

    // 1. Pie Chart for Investment Avenues
    createPieChart(data);

    createPieChart2(data);

    // 2. Histogram of Age, Split by Investment Avenue
    createHistogram(data);

    // 3. Box Plot for Gold
    createBoxPlot(data);

    createBarChart(data);

    createSavingsObjectivesBarChart(data);


    const totalCount = 65; // Total number of entries
    const menCount = 50;   // Count of men
    const womenCount = 15; // Count of women

    createInfoCards(totalCount, menCount, womenCount);

    createViolinPlot(data, "expect");
});

// Function for Pie Chart
function createPieChart(data) {
    const width = 200, height = 200, radius = Math.min(width, height) / 2;
    const svg = d3.select("#pie-chart").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const investmentData = d3.rollup(data, v => v.length, d => d.Investment_Avenues);
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const color = d3.scaleOrdinal()
        .domain([0, 1])  
        .range(["lightcoral", "red"]); 
    
    const arcs = svg.selectAll(".arc")
        .data(pie(Array.from(investmentData)))
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => color(i));

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.data[1] / d3.sum(Array.from(investmentData), d => d[1])) * 100).toFixed(1);
            return `${percentage}%`;
        });

        
}

function createPieChart2(data) {
    const width = 200, height = 200, radius = Math.min(width, height) / 2;
    const svg = d3.select("#pie-chart2").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const stockData = d3.rollup(data, v => v.length, d => d.Stock_Marktet);
    const pie = d3.pie().value(d => d[1]);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const color = d3.scaleOrdinal()
        .domain([0, 1])  
        .range(["lightcoral", "red"]);
    
    const arcs = svg.selectAll(".arc")
        .data(pie(Array.from(stockData)))
        .enter().append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .style("fill", (d, i) => color(i));

    arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .text(d => {
            const percentage = ((d.data[1] / d3.sum(Array.from(stockData), d => d[1])) * 100).toFixed(1);
            return `${percentage}%`;
        });

        
}

function createBarChart(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#bar-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const factorData = d3.rollup(data, v => v.length, d => d.Factor);
    const factors = Array.from(factorData, ([key, value]) => ({ key, value }));

    const x = d3.scaleBand()
        .domain(factors.map(d => d.key))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(factors, d => d.value)])
        .nice()  // Ensures that the ticks are nice numbers
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(factors)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "lightcoral");

    svg.selectAll(".label")
        .data(factors)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => x(d.key) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5) // Offset the label above the bar
        .attr("text-anchor", "middle")
        .text(d => d.value);
}


function createSavingsObjectivesBarChart(data) {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#savings-objectives-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const objectivesData = d3.rollup(data, v => v.length, d => d['What are your savings objectives?']);
    const objectives = Array.from(objectivesData, ([key, value]) => ({ key, value }));

    const x = d3.scaleBand()
        .domain(objectives.map(d => d.key))
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(objectives, d => d.value)])
        .nice()  // Ensures that the ticks are nice numbers
        .range([height, 0]);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(objectives)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", "lightcoral");

    svg.selectAll(".label")
        .data(objectives)
        .enter().append("text")
        .attr("class", "label")
        .attr("x", d => x(d.key) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 5) // Offset the label above the bar
        .attr("text-anchor", "middle")
        .text(d => d.value);
}



function createHistogram(data) {
    const svgWidth = 500;
    const svgHeight = 300;
    const margin = { top: 10, right: 30, bottom: 30, left: 40 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#histogram").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const histogram = d3.histogram()
        .value(d => d.age)  // Use age for the histogram
        .domain([0, d3.max(data, d => d.age)])  // Set the domain for the histogram
        .thresholds(d3.range(d3.min(data, d => d.age), d3.max(data, d => d.age),  (d3.max(data, d => d.age) - d3.min(data, d => d.age) )/5  ));  // Adjust bin size as needed

    const bins = histogram(data);  // Pass in the full dataset

    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d.age)-2, d3.max(data, d => d.age)+2])  // X domain from 0 to max age
        .range([0, width]);

    const y = d3.scaleLinear()
        .range([height, 0]);

    y.domain([0, d3.max(bins, d => d.length)]);  // Y domain is the max count of data points in any bin

    g.selectAll(".bar")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0))  // Positioning each bar
        .attr("y", d => y(d.length))  // Set height based on frequency
        .attr("width", d => x(d.x1) - x(d.x0) - 1)  // Width of each bar
        .attr("height", d => height - y(d.length))  // Bar height
        .style("fill", "lightcoral");

    g.append("g")
        .attr("transform", `translate(0, ${height})`)  // Positioning the x-axis at the bottom
        .call(d3.axisBottom(x).ticks(20));  // Add ticks

    g.append("g")
        .call(d3.axisLeft(y));  // Add the left y-axis

    
}


function createBoxPlot(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#box-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const goldData = data.map(d => +d.Gold).filter(d => !isNaN(d));

    const q1 = d3.quantile(goldData, 0.25);
    const median = d3.quantile(goldData, 0.5);
    const q3 = d3.quantile(goldData, 0.75);
    const iqr = q3 - q1;
    const min = d3.min(goldData);
    const max = d3.max(goldData);

    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);

    console.log("Q1:", q1, "Median:", median, "Q3:", q3, "IQR:", iqr, "Lower whisker:", lowerWhisker, "Upper whisker:", upperWhisker);

    const xScale = d3.scaleBand()
        .domain(["Gold"])
        .range([0, width])
        .padding(0.4);

    const yScale = d3.scaleLinear()
        .domain([d3.min(goldData), d3.max(goldData)])
        .nice()
        .range([height, 0]);

    svg.append("rect")
        .attr("x", xScale("Gold"))
        .attr("y", yScale(q3))
        .attr("width", xScale.bandwidth())
        .attr("height", Math.abs(yScale(q1) - yScale(q3)))  // Use Math.abs to ensure a positive height
        .attr("fill", "lightcoral");

    svg.append("line")
        .attr("x1", xScale("Gold"))
        .attr("x2", xScale("Gold") + xScale.bandwidth())
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    svg.append("line")
        .attr("x1", xScale("Gold") + xScale.bandwidth() / 2)
        .attr("x2", xScale("Gold") + xScale.bandwidth() / 2)
        .attr("y1", yScale(lowerWhisker))
        .attr("y2", yScale(q1))
        .attr("stroke", "black");

    svg.append("line")
        .attr("x1", xScale("Gold") + xScale.bandwidth() / 2)
        .attr("x2", xScale("Gold") + xScale.bandwidth() / 2)
        .attr("y1", yScale(q3))
        .attr("y2", yScale(upperWhisker))
        .attr("stroke", "black");

    goldData.forEach(d => {
        if (d < lowerWhisker || d > upperWhisker) {
            svg.append("circle")
                .attr("cx", xScale("Gold") + xScale.bandwidth() / 2)
                .attr("cy", yScale(d))
                .attr("r", 5)
                .attr("fill", "red");
        }
    });


    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale));
}


function createScatterPlot(data) {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#scatter-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const ppfData = data.map(d => ({
        age: +d.age,  // Convert age to number
        ppf: +d.PPF   // Convert PPF to number
    })).filter(d => !isNaN(d.age) && !isNaN(d.ppf)); // Filter out any NaN values

    const xScale = d3.scaleLinear()
        .domain(d3.extent(ppfData, d => d.age))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(ppfData, d => d.ppf)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(10));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.selectAll("circle")
        .data(ppfData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.age))
        .attr("cy", d => yScale(d.ppf))
        .attr("r", 5)
        .attr("fill", "lightcoral");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("");

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .attr("text-anchor", "middle")
        .text("Age");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", 0 - height / 2)
        .attr("text-anchor", "middle")
        .text("PPF");
}

d3.csv("Finance_data.csv").then(data => {
    createScatterPlot(data);
}).catch(error => {
    console.error("Error loading the CSV data: ", error);
});




function createRegressionPlot(data) {
    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#regression-plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const regressionData = data.map(d => ({
        mutualFunds: +d.Mutual_Funds,  // Convert Mutual Funds to number
        fixedDeposits: +d.Fixed_Deposits // Convert Fixed Deposits to number
    })).filter(d => !isNaN(d.mutualFunds) && !isNaN(d.fixedDeposits)); // Filter out any NaN values

    const xScale = d3.scaleLinear()
        .domain(d3.extent(regressionData, d => d.mutualFunds))
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(regressionData, d => d.fixedDeposits)])
        .nice()
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(10));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    svg.selectAll("circle")
        .data(regressionData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.mutualFunds))
        .attr("cy", d => yScale(d.fixedDeposits))
        .attr("r", 5)
        .attr("fill", "lightcoral");

    const regression = calculateRegression(regressionData);

    svg.append("line")
        .attr("x1", xScale(regression.x1))
        .attr("y1", yScale(regression.y1))
        .attr("x2", xScale(regression.x2))
        .attr("y2", yScale(regression.y2))
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("");

    svg.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .attr("text-anchor", "middle")
        .text("Mutual Funds");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", 0 - height / 2)
        .attr("text-anchor", "middle")
        .text("Fixed Deposits");
}

function calculateRegression(data) {
    const n = data.length;
    const sumX = d3.sum(data, d => d.mutualFunds);
    const sumY = d3.sum(data, d => d.fixedDeposits);
    const sumXY = d3.sum(data, d => d.mutualFunds * d.fixedDeposits);
    const sumX2 = d3.sum(data, d => d.mutualFunds * d.mutualFunds);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const x1 = d3.min(data, d => d.mutualFunds);
    const x2 = d3.max(data, d => d.mutualFunds);
    const y1 = slope * x1 + intercept;
    const y2 = slope * x2 + intercept;

    return { x1, y1, x2, y2 };
}

d3.csv("Finance_data.csv").then(data => {
    createRegressionPlot(data);
}).catch(error => {
    console.error("Error loading the CSV data: ", error);
});



function createInfoCards(totalCount, menCount, womenCount) {
    const cardContainer = d3.select("#info-cards").selectAll(".card")
        .data([
            { label: "Total", count: totalCount },
            { label: "Male", count: menCount },
            { label: "Female", count: womenCount }
        ])
        .enter()
        .append("div")
        .attr("class", d => `card ${d.label.toLowerCase()}`)
        .html(d => `<h3>${d.label}</h3><p>${d.count}</p>`);
}


