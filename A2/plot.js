document.addEventListener("DOMContentLoaded", function () {
  let canvasScaler = 0.4;
  let csvData;
  let dictionary = [];
  var canvas = document.getElementById("scatterPlotCanvas");
  let minX;
  let minY;
  let maxX;
  let maxY;
  let padding;
  let scaleX;
  let scaleY;
  let clickedForHiglight = [];

  // Toggle button event listener
  var toggleButton = document.getElementById("toggleButton");
  toggleButton.addEventListener("click", function () {
    // Toggle between data sources
    currentDataSource =
      currentDataSource === "data1.csv" ? "data2.csv" : "data1.csv";

    // Load the new CSV file
    readCSV(currentDataSource, function (csvContent) {
      var ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      clickedForHiglight = [];
      dictionary = [];
      csvData = parseCSV(csvContent);
      drawScatterPlot(csvData);
    });
  });

  // Dictionary to store colors and shapes for each unique class

  // Function to read the CSV file
  function readCSV(file, callback) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(xhr.responseText);
      }
    };
    xhr.open("GET", file, true);
    xhr.send();
  }

  // Function to parse CSV data
  function parseCSV(csvData) {
    let rows = csvData.split("\n");
    let data = [];
    let dataPoint;

    for (let i = 0; i < rows.length; i++) {
      let columns = rows[i].split(",");
      if (columns.length === 3) {
        data.push({
          x: parseFloat(columns[0]),
          y: -parseFloat(columns[1]),
          className: columns[2].trim(),
          closestPoints: null,
        });
      }
    }
    return data;
  }

  function getClass(className) {
    let existingClass;

    dictionary.forEach(function (element) {
      if (element.name == className) {
        existingClass = element;
      }
    });
    if (existingClass) {
      return existingClass;
    }
    let newClass = {
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      name: className,
    };
    dictionary.push(newClass);

    return newClass;
  }

  function drawScatterPlot(data) {
    // Set up the canvas element
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, legendCanvas.width, legendCanvas.height);

    // set canvas size to window size
    canvas.width = window.innerWidth * canvasScaler;
    canvas.height = window.innerWidth * canvasScaler;

    // Set up min and max values
    minX =
      data
        .map((point) => point.x)
        .reduce((min, currentX) => Math.min(min, currentX), Infinity) - 10;

    minY =
      data
        .map((point) => point.y)
        .reduce((min, currentY) => Math.min(min, currentY), Infinity) - 10;

    maxX =
      data
        .map((point) => point.x)
        .reduce((max, currentX) => Math.max(max, currentX), -Infinity) + 10;

    maxY =
      data
        .map((point) => point.y)
        .reduce((max, currentY) => Math.max(max, currentY), -Infinity) + 10;

    // Calculate scale and offset for the plot
    padding = 20;
    scaleX = (canvas.width - 2 * padding) / (maxX - minX); // What a pixel is in terms of a x-value
    scaleY = (canvas.height - 2 * padding) / (maxY - minY); // What a pixel is in terms of a y-value

    const plotOrigin = {
      x: padding + (0 - minX) * scaleX,
      y: canvas.height - (padding + (0 - minY)) * scaleY,
    };

    // Draw x-axis
    ctx.beginPath();
    ctx.moveTo(0 + padding, 0 + padding);
    ctx.lineTo(0 + padding, canvas.height - 2 * padding);
    ctx.fillStyle = "black";
    ctx.stroke();

    for (
      let x = Math.min(Math.ceil(minX / 5) * 5, 0);
      x < Math.floor(maxX / 5) * 5;
      x += 5
    ) {
      const xPos = x;
      const yPos = 0;
      const tickSize = 6;
      if (5 < xPos - minX) {
        ctx.beginPath();
        ctx.moveTo(
          (xPos - minX) * scaleX,
          canvas.height - 2 * padding - tickSize
        );
        ctx.lineTo(
          (xPos - minX) * scaleX,
          canvas.height - 2 * padding + tickSize
        );
        ctx.fillStyle = "black";
        ctx.stroke();

        ctx.font = scaleX.toString() + "px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
          xPos.toString(),
          (xPos - minX) * scaleX,
          canvas.height - 2 * padding - 20
        );
      }
    }

    // Draw y-axis
    ctx.beginPath();
    ctx.moveTo(0 + padding, canvas.width - 2 * padding);
    ctx.lineTo(canvas.width - 2 * padding, canvas.height - 2 * padding);
    ctx.strokeStyle = "black";
    ctx.stroke();

    for (
      let y = Math.min(Math.ceil(minY / 5) * 5, 0);
      y < Math.floor(maxY / 5) * 5;
      y += 5
    ) {
      const xPos = 0;
      const yPos = y;
      let tickSize = 6;

      ctx.beginPath();
      ctx.moveTo(0 + padding - tickSize, (yPos - minY) * scaleY);
      ctx.lineTo(0 + padding + tickSize, (yPos - minY) * scaleY);
      ctx.fillStyle = "black";
      ctx.stroke();

      ctx.font = scaleX.toString() + "px Arial";
      ctx.textAlign = "center";
      ctx.fillText((-y).toString(), 0 + padding + 20, (yPos - minY) * scaleY);
    }

    // Draw x = 0
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.strokeStyle = "#555555a8";
    ctx.moveTo((0 - minX) * scaleX, 0 + padding);
    ctx.lineTo((0 - minX) * scaleX, canvas.height - 2 * padding);
    ctx.stroke();
    // Reset line dash to default (solid line)
    ctx.setLineDash([]);

    // Draw y = 0
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(0 + padding, (0 - minY) * scaleY);
    ctx.lineTo(canvas.width - padding, (0 - minY) * scaleY);
    ctx.stroke();
    // Reset line dash to default (solid line)
    ctx.setLineDash([]);

    // Draw data points
    drawPoints(data, ctx);

    // Draw legend
    drawLegend();
  }

  function drawPoints(data, ctx) {
    data.forEach((point) => {
      ctx.beginPath();
      ctx.fillStyle = getClass(point.className).color;

      if (dictionary[0].name == point.className) {
        ctx.rect(
          (point.x - minX) * scaleX - 3,
          (point.y - minY) * scaleY - 3,
          12, // x-width
          12 // y-height
        );
      } else if (dictionary[1].name == point.className) {
        const size = 1;
        ctx.moveTo((point.x - minX) * scaleX, (point.y - minY - size) * scaleY);
        ctx.lineTo(
          (point.x - minX + size) * scaleX,
          (point.y - minY + size) * scaleY
        );
        ctx.lineTo(
          (point.x - minX - size) * scaleX,
          (point.y - minY + size) * scaleY
        );
      } else {
        ctx.arc(
          (point.x - minX) * scaleX,
          (point.y - minY) * scaleY,
          6, // radius
          0, // Start ang
          2 * Math.PI // end ang
        );
      }
      ctx.fill();
      ctx.stroke();
    });
  }

  function highlightPoints(data, ctx) {
    data.forEach((point) => {
      ctx.beginPath();
      ctx.strokeStyle = "blue";
      ctx.fillStyle = "none";

      ctx.lineWidth = 6;

      if (dictionary[0].name == point.className) {
        ctx.rect(
          (point.x - minX) * scaleX - 3,
          (point.y - minY) * scaleY - 3,
          12, // x-width
          12 // y-height
        );
      } else if (dictionary[1].name == point.className) {
        const size = 1;
        ctx.moveTo((point.x - minX) * scaleX, (point.y - minY - size) * scaleY);
        ctx.lineTo(
          (point.x - minX + size) * scaleX,
          (point.y - minY + size) * scaleY
        );
        ctx.lineTo(
          (point.x - minX - size) * scaleX,
          (point.y - minY + size) * scaleY
        );
      } else {
        ctx.arc(
          (point.x - minX) * scaleX,
          (point.y - minY) * scaleY,
          6, // radius
          0, // Start ang
          2 * Math.PI // end ang
        );
      }
      ctx.fill();
      ctx.stroke();
    });
  }

  function drawClosestPoints(data, ctx) {
    data.forEach((point) => {
      ctx.beginPath();
      ctx.strokeStyle = "red";
      ctx.fillStyle = "none";

      ctx.lineWidth = 2;

      if (dictionary[0].name == point.className) {
        ctx.rect(
          (point.x - minX) * scaleX - 3,
          (point.y - minY) * scaleY - 3,
          12, // x-width
          12 // y-height
        );
      } else if (dictionary[1].name == point.className) {
        const size = 1;
        ctx.moveTo((point.x - minX) * scaleX, (point.y - minY - size) * scaleY);
        ctx.lineTo(
          (point.x - minX + size) * scaleX,
          (point.y - minY + size) * scaleY
        );
        ctx.lineTo(
          (point.x - minX - size) * scaleX,
          (point.y - minY + size) * scaleY
        );
      } else {
        ctx.arc(
          (point.x - minX) * scaleX,
          (point.y - minY) * scaleY,
          6, // radius
          0, // Start ang
          2 * Math.PI // end ang
        );
      }
      ctx.fill();
      ctx.stroke();
    });
  }

  function drawLegend() {
    var legendCanvas = document.getElementById("legendCanvas");
    var legendCtx = legendCanvas.getContext("2d");
    legendCtx.clearRect(0, 0, legendCanvas.width, legendCanvas.height);

    const legendSpacing = 30;

    let legendX = 30;
    let legendY = legendSpacing;
    const size = 24;

    dictionary.forEach((item) => {
      legendCtx.beginPath();
      legendCtx.fillStyle = item.color;

      if (item.name === dictionary[0].name) {
        legendCtx.rect(legendX - size / 2, legendY - size / 2, size, size);
      } else if (item.name === dictionary[1].name) {
        legendCtx.moveTo(legendX, legendY - size / 2);
        legendCtx.lineTo(legendX + size / 2, legendY + size / 2);
        legendCtx.lineTo(legendX - size / 2, legendY + size / 2);
      } else {
        legendCtx.arc(legendX, legendY, size / 2, 0, 2 * Math.PI);
      }
      legendCtx.fill();
      legendCtx.stroke();

      legendCtx.fillStyle = "black";

      legendCtx.font = size + "px Arial";
      legendCtx.textAlign = "left";
      legendCtx.fillText(item.name, legendX + 20, legendY + 5);
      legendY += legendSpacing;
    });
  }

  function calculateDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function handleRightClick(event) {
    const rect = canvas.getBoundingClientRect();
    const pixelX = event.clientX - rect.left;
    const pixelY = event.clientY - rect.top;

    // Translate pixel coordinates to plot coordinates
    const plotX = pixelX / scaleX + minX;
    const plotY = pixelY / scaleY + minY;

    // Find the closest point in the data to where you clicked
    let closestPoint;
    let minDistance = Infinity;
    let threshold = 6;

    csvData.forEach((point) => {
      const distance = calculateDistance({ x: plotX, y: plotY }, point);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });
    if (minDistance < threshold) {
      console.log(closestPoint);
      if (closestPoint.closestPoints == null) {
        const closestPoints = findClosestPoints(closestPoint, csvData, 5);
        closestPoint.closestPoints = closestPoints;
        clickedForHiglight.push(closestPoint);
      } else {
        closestPoint.closestPoints = null;
        // Remove closestPoint from clickedForHighlight array
        clickedForHiglight = clickedForHiglight.filter(
          (point) => point !== closestPoint
        );
      }
      var ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawScatterPlot(csvData);
      highlightPoints(clickedForHiglight, ctx);
      clickedForHiglight.forEach((point) => {
        drawClosestPoints(point.closestPoints, ctx);
      });
    }
  }

  function handleLeftClick(event) {
    const rect = canvas.getBoundingClientRect();
    const pixelX = event.clientX - rect.left;
    const pixelY = event.clientY - rect.top;

    // Translate pixel coordinates to plot coordinates
    const plotX = pixelX / scaleX + minX;
    const plotY = pixelY / scaleY + minY;

    // ...

    console.log("Left-clicked at plot coordinates:", plotX, plotY);
  }

  function findClosestPoints(targetPoint, allPoints, k) {
    // Calculate distances and store them with their corresponding points
    const distances = allPoints.map((point) => ({
      point,
      distance: calculateDistance(targetPoint, point),
    }));

    // Sort distances in ascending order
    distances.sort((a, b) => a.distance - b.distance);

    // Get the k closest points
    const closestPoints = distances.slice(1, k + 1).map((item) => item.point);

    return closestPoints;
  }

  var canvas = document.getElementById("scatterPlotCanvas");
  canvas.addEventListener("contextmenu", function (event) {
    event.preventDefault(); // Prevent the default context menu
    handleRightClick(event);
  });

  canvas.addEventListener("click", function (event) {
    handleLeftClick(event);
  });

  // Load CSV file on document load
  var currentDataSource = "data1.csv";
  readCSV(currentDataSource, function (csvContent) {
    csvData = parseCSV(csvContent);
    drawScatterPlot(csvData);
  });
});
