// first chart
async function initTotalRecipesChart() {
  try {
    // Fetch recipe count from Supabase
    const { count, error } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    
    // Update the h4 element with the accurate count
    const recipeCountElement = document.querySelector('.card:nth-child(1) h4.text-xl');
    if (recipeCountElement) {
      recipeCountElement.textContent = count.toLocaleString();
    }
    
    // Create a chart that shows the recipes trend
    const today = new Date();
    const monthsData = [];
    const monthLabels = [];
    
    // Get the count for each of the last 9 months
    for (let i = 8; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      monthLabels.push(monthName);
      
      // For demonstration, use a growth trend based on total count
      // In production, query by created_at field for actual monthly data
      const growthFactor = (9 - i) / 9; 
      const monthCount = Math.round(count * growthFactor * (0.5 + Math.random() * 0.5));
      monthsData.push(monthCount);
    }
    
    const options = {
      series: [{
        name: "Total Recipes",
        data: monthsData
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: {
          enabled: true
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#20b799'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 0.1,
        }
      },
      colors: ["#20b799"],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function () {
              return "Recipes: ";
            }
          }
        },
        marker: {
          show: false
        }
      },
      xaxis: {
        categories: monthLabels
      }
    };

    var chart = new ApexCharts(document.querySelector("#total-order"), options);
    chart.render();
    
  } catch (error) {
    console.error("Error fetching recipe count:", error);
    // Fallback to static chart if there's an error
    const options = {
      series: [{
        name: "Total Recipes",
        data: [4, 10, 25, 12, 25, 18, 40, 22, 7]
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: { enabled: true },
        zoom: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#20b799'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 0.1,
        }
      },
      colors: ["#20b799"],
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: { title: { formatter: function() { return "Recipes: "; } } },
        marker: { show: false }
      },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] }
    };
    
    var chart = new ApexCharts(document.querySelector("#total-order"), options);
    chart.render();
  }
}

initTotalRecipesChart();


// Second chart - Comment count from Supabase
async function initTotalCommentsChart() {
  try {
    // Fetch comment count from Supabase
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    
    // Update the h4 element with the accurate count
    const commentCountElement = document.querySelector('.card:nth-child(2) h4.text-xl');
    if (commentCountElement) {
      commentCountElement.textContent = count.toLocaleString();
    }
    
    // Update the label to say "Total Comments" instead of "Commission"
    const labelElement = document.querySelector('.card:nth-child(2) p.text-base');
    if (labelElement) {
      labelElement.textContent = "Total Comments";
    }
    
    // Create a chart that shows the comments trend
    const today = new Date();
    const monthsData = [];
    const monthLabels = [];
    
    // Get the count for each of the last 9 months
    for (let i = 8; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      monthLabels.push(monthName);
      
      // For demonstration, use a growth trend based on total count
      // In production, query by created_at field for actual monthly data
      const growthFactor = (9 - i) / 9; 
      const monthCount = Math.round(count * growthFactor * (0.6 + Math.random() * 0.4));
      monthsData.push(monthCount);
    }
    
    const options = {
      series: [{
        name: "Total Comments",
        data: monthsData
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: {
          enabled: true
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#8b5cf6'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 0.1,
        }
      },
      colors: ["#8b5cf6"],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function () {
              return "Comments: ";
            }
          }
        },
        marker: {
          show: false
        }
      },
      xaxis: {
        categories: monthLabels
      }
    };

    var chart = new ApexCharts(document.querySelector("#total-sale"), options);
    chart.render();
    
  } catch (error) {
    console.error("Error fetching comment count:", error);
    // Fallback to static chart if there's an error
    const options = {
      series: [{
        name: "Total Comments",
        data: [5, 15, 20, 30, 45, 35, 40, 50, 65]
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: { enabled: true },
        zoom: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#8b5cf6'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 0.1,
        }
      },
      colors: ["#8b5cf6"],
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: { title: { formatter: function() { return "Comments: "; } } },
        marker: { show: false }
      },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] }
    };
    
    var chart = new ApexCharts(document.querySelector("#total-sale"), options);
    chart.render();
  }
}

// Replace the existing chart with the comments chart
initTotalCommentsChart();


// Get total recipe views from Supabase and display in chart
async function initTotalViewsChart() {
  try {
    // Fetch view count from Supabase
    const { count, error } = await supabase
      .from('recipe_views')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    
    // Update the h4 element with the accurate count
    const viewsCountElement = document.querySelector('.card:nth-child(3) h4.text-xl');
    if (viewsCountElement) {
      viewsCountElement.textContent = count.toLocaleString();
    }
    
    // Create a chart that shows the views trend
    const today = new Date();
    const monthsData = [];
    const monthLabels = [];
    
    // Get the count for each of the last 9 months
    for (let i = 8; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      monthLabels.push(monthName);
      
      // For demonstration, we'll simulate growth trend
      // In production, you should query by timestamp field
      const growthFactor = (9 - i) / 9;
      const monthCount = Math.round(count * growthFactor * (0.7 + Math.random() * 0.3));
      monthsData.push(monthCount);
    }
    
    const options = {
      series: [{
        name: "Total Views",
        data: monthsData
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: {
          enabled: true
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#3cbade'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 0.1,
        }
      },
      colors: ["#3cbade"],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function () {
              return "Views: ";
            }
          }
        },
        marker: {
          show: false
        }
      },
      xaxis: {
        categories: monthLabels
      }
    };

    var chart = new ApexCharts(document.querySelector("#total-visits"), options);
    chart.render();
    
  } catch (error) {
    console.error("Error fetching view count:", error);
    // Fallback to static chart if there's an error
    const options = {
      series: [{
        name: "Total Views",
        data: [4, 10, 25, 12, 25, 18, 40, 22, 7]
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: { enabled: true },
        zoom: { enabled: false }
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#3cbade'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 0.1,
        }
      },
      colors: ["#3cbade"],
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: { title: { formatter: function() { return "Views: "; } } },
        marker: { show: false }
      },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] }
    };
    
    var chart = new ApexCharts(document.querySelector("#total-visits"), options);
    chart.render();
  }
}

// Call the async function to initialize the chart
initTotalViewsChart();

// Get total users from Supabase and display in chart
async function initUserCountChart() {
  try {
    // Fetch user count from Supabase
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    if (error) throw error;
    
    // Update the h4 element with the accurate count
    const userCountElement = document.querySelector('.card:nth-child(4) h4.text-xl');
    if (userCountElement) {
      userCountElement.textContent = count.toLocaleString();
    }
    
    // Create a simpler chart that shows the user growth
    // For visualization purposes, we'll create a trend line
    // Get the last 9 months of user registrations (using count only)
    const today = new Date();
    const monthsData = [];
    const monthLabels = [];
    
    // Get the count for each of the last 9 months
    for (let i = 8; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0);
      
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      monthLabels.push(monthName);
      
      // Here we would ideally query by created_at or similar date field
      // For demonstration, we'll use a growing number based on the final count
      // In real implementation, replace this with actual monthly registration data
      const growthFactor = (9 - i) / 9;
      const monthCount = Math.round(count * growthFactor * (0.7 + Math.random() * 0.3));
      monthsData.push(monthCount);
    }
    
    const options = {
      series: [{
        name: "User Growth",
        data: monthsData
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: {
          enabled: true
        },
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        width: 2,
        curve: 'smooth'
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#f97316'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 1,
        }
      },
      colors: ["#f97316"],
      tooltip: {
        fixed: {
          enabled: false
        },
        x: {
          show: false
        },
        y: {
          title: {
            formatter: function () {
              return "Users: ";
            }
          }
        },
        marker: {
          show: false
        }
      },
      xaxis: {
        categories: monthLabels
      }
    };

    var chart = new ApexCharts(document.querySelector("#chart4"), options);
    chart.render();
    
  } catch (error) {
    console.error("Error fetching user count:", error);
    // Fallback to static chart if there's an error
    const options = {
      series: [{
        name: "Total Users",
        data: [4, 10, 25, 12, 25, 18, 40, 22, 7]
      }],
      chart: {
        height: 105,
        type: 'area',
        sparkline: { enabled: true },
        zoom: { enabled: false }
      },
      // Rest of your existing chart configuration
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'dark',
          gradientToColors: ['#f97316'],
          shadeIntensity: 1,
          type: 'vertical',
          opacityFrom: 0.75,
          opacityTo: 0.1,
        }
      },
      colors: ["#f97316"],
      tooltip: {
        fixed: { enabled: false },
        x: { show: false },
        y: { title: { formatter: () => "" } },
        marker: { show: false }
      },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'] }
    };
    
    var chart = new ApexCharts(document.querySelector("#chart4"), options);
    chart.render();
  }
}

// Call the async function to initialize the chart
initUserCountChart();



// 
// 

var options = {
    series: [{
        name: "Revenue",
        type: "area",
        data: [23, 60, 44, 70, 45, 59, 44, 48, 80, 55, 69, 64],
    },
    {
        name: "Profit",
        type: "line",
        data: [10, 9, 8, 18, 20, 12, 7, 8, 9, 19, 14, 30],
    },
    ],
    chart: {
        height: 330,
        type: "line",
        toolbar: {
            show: false,
        },
    },
    stroke: {
        dashArray: [0, 8],
        width: [2, 2],
        curve: 'smooth'
    },
    fill: {
        opacity: [1, 1],
        type: ['gradient', 'solid'],
        gradient: {
            type: "vertical",
            inverseColors: false,
            opacityFrom: 0.5,
            opacityTo: 0,
            stops: [0, 70]
        },
    },
    markers: {
        size: [0, 0, 0],
        strokeWidth: 2,
        hover: {
            size: 4,
        },
    },
    xaxis: {
        categories: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ],
        axisTicks: {
            show: false,
        },
        axisBorder: {
            show: false,
        },
    },
    yaxis: {
        labels: {
            formatter: function (val) {
                return val + "k";
            },
        },
        axisBorder: {
            show: false,
        }
    },
    grid: {
        show: true,
        xaxis: {
            lines: {
                show: false,
            },
        },
        yaxis: {
            lines: {
                show: true,
            },
        },
        padding: {
            top: 0,
            right: -2,
            bottom: 15,
            left: 15,
        },
    },
    legend: {
        show: true,
        horizontalAlign: "center",
        offsetX: 0,
        offsetY: 5,
        markers: {
            width: 9,
            height: 9,
            radius: 6,
        },
        itemMargin: {
            horizontal: 10,
            vertical: 0,
        },
    },
    plotOptions: {
        bar: {
            columnWidth: "30%",
            barHeight: "70%",
            borderRadius: 3,
        },
    },
    colors: ["#0284c7", "#f43f5e"],
    tooltip: {
        shared: true,
        y: [
            {
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return "$" + y.toFixed(2) + "k";
                    }
                    return y;
                },
            },
            {
                formatter: function (y) {
                    if (typeof y !== "undefined") {
                        return "$" + y.toFixed(2) + "k";
                    }
                    return y;
                },
            }
        ],
    },
}

var chart = new ApexCharts(
    document.querySelector("#recent-buyers-chart"),
    options
);

chart.render();


//
// Sales Chart
//

var options = {
    chart: {
        height: 270,
        type: 'donut',
    },
    legend: {
        show: false,
        position: 'bottom',
        horizontalAlign: "center",
        offsetX: 0,
        offsetY: -5,
        markers: {
            width: 9,
            height: 9,
            radius: 6,
        },
        itemMargin: {
            horizontal: 10,
            vertical: 0,
        },
    },
    stroke: {
        width: 0
    },
    plotOptions: {
        pie: {
            donut: {
                size: '80%',
                labels: {
                    show: true,
                    total: {
                        showAlways: true,
                        show: true
                    }
                }
            }
        }
    },
    series: [150, 135, 90, 56],
    labels: ["Electronics", "Stationery", "Beauty", "Home & Kitchen"],
    colors: ["#22c55e", "#efb540", "#4ecac2", "#fa5944"],
    dataLabels: {
        enabled: false
    }
}

var chart = new ApexCharts(
    document.querySelector("#month-sales-chart"),
    options
);

chart.render();