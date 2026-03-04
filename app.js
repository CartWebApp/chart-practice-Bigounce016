// Import dataset
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM ---
const yearSelect = document.getElementById("yearSelect");
const genreSelect = document.getElementById("genreSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate Dropdowns ---
const years = [...new Set(chartData.map(r => r.year))];
const genres = [...new Set(chartData.map(r => r.genre))];

years.forEach(y => yearSelect.add(new Option(y, y)));
genres.forEach(g => genreSelect.add(new Option(g, g)));

yearSelect.value = years[0];
genreSelect.value = genres[0];

// Preview first rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Render Button ---
renderBtn.addEventListener("click", () => {
  const type = chartTypeSelect.value;
  const year = parseInt(yearSelect.value);
  const genre = genreSelect.value;

  if (currentChart) currentChart.destroy();

  let config;

  if (type === "bar") config = barSalesByPlatform(year);
  else if (type === "line") config = lineSalesOverYears(genre);
  else if (type === "doughnut") config = doughnutRegionShare(year);
  else if (type === "scatter") config = scatterReviewVsSales(year);
  else if (type === "radar") config = radarPublisherComparison(year);
  else config = barSalesByPlatform(year);

  currentChart = new Chart(canvas, config);
});


// bar chart showing sales by platform for a given year
function barSalesByPlatform(year) {
  const rows = chartData.filter(r => r.year === year);
  const grouped = {};

  rows.forEach(r => {
    grouped[r.platform] = (grouped[r.platform] || 0) + r.unitsM;
  });

  return {
    type: "bar",
    data: {
      labels: Object.keys(grouped),
      datasets: [{
        label: `Sales (Millions) in ${year}`,
        data: Object.values(grouped)
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Sales by Platform (${year})` }
      }
    }
  };
}


// line chart showing sales trends over time for a given genre
function lineSalesOverYears(genre) {
  const rows = chartData.filter(r => r.genre === genre);
  const grouped = {};

  rows.forEach(r => {
    grouped[r.year] = (grouped[r.year] || 0) + r.unitsM;
  });

  return {
    type: "line",
    data: {
      labels: Object.keys(grouped),
      datasets: [{
        label: `${genre} Sales Trend`,
        data: Object.values(grouped)
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Sales Over Time (${genre})` }
      }
    }
  };
}


//doughnut chart showing regional market share for a given year
function doughnutRegionShare(year) {
  const rows = chartData.filter(r => r.year === year);
  const grouped = {};

  rows.forEach(r => {
    grouped[r.region] = (grouped[r.region] || 0) + r.unitsM;
  });

  return {
    type: "doughnut",
    data: {
      labels: Object.keys(grouped),
      datasets: [{
        label: "Regional Share (Millions)",
        data: Object.values(grouped)
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Regional Market Share (${year})` }
      }
    }
  };
}


//scatter plot of review score vs sales for a given year
function scatterReviewVsSales(year) {
  const rows = chartData.filter(r => r.year === year);

  const points = rows.map(r => ({
    x: r.reviewScore,
    y: r.unitsM
  }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `Review Score vs Sales (${year})`,
        data: points
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Review Score" } },
        y: { title: { display: true, text: "Sales (Millions)" } }
      }
    }
  };
}


// radar chart comparing publishers on multiple metrics for a given year
function radarPublisherComparison(year) {
  const rows = chartData.filter(r => r.year === year);
  const publishers = [...new Set(rows.map(r => r.publisher))];

  const datasets = publishers.map(pub => {
    const pubRows = rows.filter(r => r.publisher === pub);

    const totalUnits = pubRows.reduce((sum, r) => sum + r.unitsM, 0);
    const totalRevenue = pubRows.reduce((sum, r) => sum + r.revenueUSD, 0);
    const avgScore =
      pubRows.reduce((sum, r) => sum + r.reviewScore, 0) / pubRows.length;
    const esportsCount =
      pubRows.reduce((sum, r) => sum + r.esports, 0);

    return {
      label: pub,
      data: [totalUnits, totalRevenue, avgScore, esportsCount]
    };
  });

  return {
    type: "radar",
    data: {
      labels: ["Units Sold", "Revenue", "Avg Review", "Esports Titles"],
      datasets
    },
    options: {
      plugins: {
        title: { display: true, text: `Publisher Comparison (${year})` }
      }
    }
  };
}