// Build the metadata panel

function buildMetadata(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {
    console.log(data);
    console.log( typeof data);
    console.log(Object.keys(data));

    // get the metadata field
    let metadata = data.metadata;
    
    // Filter the metadata for the object with the desired sample number
    let sample_metadata = metadata.filter(row => row.id === parseInt(sample))[0];
    console.log(sample_metadata);
    
    // Use d3 to select the panel with id of `#sample-metadata`
    let panel = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    panel.html("");

    // Inside a loop, you will need to use d3 to append new
    // tags for each key-value in the filtered metadata.

    let metadata_keys = Object.keys(sample_metadata);

    for (let i=0; i < metadata_keys.length; i++){
      // get key/value pair
      let key = metadata_keys[i].toUpperCase();
      let value = sample_metadata[metadata_keys[i]];
      console.log(key, value); 
      //add to html
      panel.append("p").text(`${key}: ${value}`)
    }
  });
}



// function to build both charts
function buildCharts(sample) {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {

    // Get the samples field
    let samples = data.samples;
    console.log(samples);

    // Filter the samples for the object with the desired sample number
    let sample_data= samples.filter(row => row.id == sample)[0];
    console.log(sample_data); 

    // Get the otu_ids, otu_labels, and sample_values
    let otu_ids = sample_data.otu_ids;
    let otu_labels = sample_data.otu_labels;
    let sample_values = sample_data.sample_values;

    // Build a Bubble Chart
    let trace = {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        color:otu_ids, 
        size: sample_values,
        colorscale: 'Earth'
      }
    };
    
    let traces = [trace];
    
    let layout = {
      title: {
        text: 'Bacteria Cultures Per Sample'
      },
      yaxis: {
        title: {
          text: 'Number of Bacteria'
        }
      },
      xaxis: {
        title: {
          text: 'OTU ID'
        }
      },
      height: 600
  
    };

    // Render the Bubble Chart
    Plotly.newPlot('bubble', traces, layout);

    // For the Bar Chart, map the otu_ids to a list of strings for your yticks
    let bar_ticks = otu_ids.map(x =>`OTU ${x} `);

    // Build a Bar Chart
    // Don't forget to slice and reverse the input data appropriately


    // Render the Bar Chart
    let bar_trace = {
      y: bar_ticks.slice(0, 10).reverse(),
      x: sample_values.slice(0, 10).reverse(),
      type: 'bar',
      hovertext: otu_labels.slice(0, 10).reverse(),
      marker: {
        color: 'sky blue'
    },
    orientation: 'h'
  }

  // Data trace array
  let bar_traces = [bar_trace];

  // Apply a title to the layout
  let bar_layout = {
    title: {
      text: `Top 10 Bacteria Cultures Found`
    },
    xaxis: {
      title: {
        text: 'Number of Bacteria'
      }
    },
    height: 550
  }

  // Render the plot to the div tag with id "bar"
  Plotly.newPlot('bar', bar_traces, bar_layout);

  });
}

// Function to run on page load
function init() {
  d3.json("https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json").then((data) => {

    // Get the names field
    let names = data.names;
    console.log(names)
    // Use d3 to select the dropdown with id of `#selDataset`
    let dropdownMenu = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    // Hint: Inside a loop, you will need to use d3 to append a new
    // option for each sample name.
    for (let i=0; i<= names.length; i++){
      let name = names[i];

    //Create option
      dropdownMenu.append("option").text(name).property("value", name);
    }

    // Get the first sample from the list
    let firstSample = names[0];

    // Build charts and metadata panel with the first sample
    buildMetadata(firstSample);
    buildCharts(firstSample);
  });
}


// Function for event listener
function optionChanged(newSample) {
  // Build charts and metadata panel each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Initialize the dashboard
init();
