// Your JavaScript code goes here
// Use D3.js to create the network visualization

// Load data from the JSON file
d3.json("starwars-full-interactions-allCharacters.json")
  .then(function (data) {
    // Process data and create the network visualization
    // ...
    // Add event listeners for brushing and linking
    // ...
    // Create control panel and sliders
    // ...
    // Display tooltips on hover
    // ...
    // Implement filtering based on edge weights (Option 1) or episodes (Option 2)
    // ...
  })
  .catch(function (error) {
    console.error("Error loading data:", error);
  });
