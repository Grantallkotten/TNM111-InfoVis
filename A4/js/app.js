const urls = [
  "../json/starwars-full-interactions-allCharacters.json",
  "../json/starwars-episode-1-interactions-allCharacters.json",
  "../json/starwars-episode-2-interactions-allCharacters.json",
  "../json/starwars-episode-3-interactions-allCharacters.json",
  "../json/starwars-episode-4-interactions-allCharacters.json",
  "../json/starwars-episode-5-interactions-allCharacters.json",
  "../json/starwars-episode-6-interactions-allCharacters.json",
  "../json/starwars-episode-7-interactions-allCharacters.json",
];

async function loadEp() {
  let SWEpRaw = [];

  for (let url of urls) {
    try {
      let RawEp = await d3.json(url).catch(function (error) {
        console.error("Error loading data:", error);
      });
      SWEpRaw.push(RawEp);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  let EPISODES = [];
  let index = 0;
  for (let ep of SWEpRaw) {
    if (index == 0) {
      let SWep = new SWdata("All episodes", ep.nodes, ep.links);
      EPISODES.push(SWep);
    } else {
      let SWep = new SWdata("Episode " + index, ep.nodes, ep.links);
      EPISODES.push(SWep);
    }
    index++;
  }
  return EPISODES;
}

class SWdata {
  constructor(episodeName, nodes, links) {
    this.episode = episodeName;
    this.nodes = nodes;
    this.links = links;
  }
}

class node {
  constructor(name, value, colour) {
    this.name = name;
    this.value = value;
    this.colour = colour;
  }
}

class link {
  constructor(source, target, value) {
    this.source = source;
    this.target = target;
    this.value = value;
  }
}

async function simulateNodeSystem(index1, index2, graph) {
  let EPISODES = await loadEp();

  const contentDiv = document.getElementById("content");
  // contentDiv.innerHTML = "";

  const width = contentDiv.clientWidth * 0.9;
  const height = contentDiv.clientHeight * 0.9;

  const NODERADIUS = 12;

  switch (graph) {
    case 1:
    case 0:
      let data1 = EPISODES[index1];

      let nodes1 = data1.nodes;
      let links1 = data1.links;
      let backgroundColor1 = "#bcd1eb";

      let svgDummy = d3
        .select("#content")
        .append("svg")
        .attr("id", "svgDummy")
        .attr("width", width / 2)
        .attr("height", height)
        .style("background-color", backgroundColor1);

      d3.select("#svg1").remove();

      let svg1 = d3
        .select("#content")
        .insert("svg", ":first-child") // Insert SVG before the first child element
        .attr("id", "svg1")
        .attr("width", width / 2)
        .attr("height", height)
        .style("background-color", "#bcd1eb");

      d3.select("#svgDummy").remove();

      let simulation1 = d3
        .forceSimulation(nodes1)
        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 4, height / 2).strength(0.6))
        .force("link", d3.forceLink().links(links1))
        .on("tick", function () {
          ticked("#svg1", links1, nodes1, backgroundColor1);
        })
        .force(
          "collision",
          d3.forceCollide().radius(function (d) {
            return Math.max((NODERADIUS * d.value) / 80, NODERADIUS);
          })
        )
        .on("tick", function () {
          // Adjust nodes to stay within bounding box
          nodes1.forEach(function (d) {
            d.x = Math.max(NODERADIUS, Math.min(width / 2 - NODERADIUS, d.x)); // Ensure x is within left and right bounds
            d.y = Math.max(3 * NODERADIUS, Math.min(height - NODERADIUS, d.y)); // Ensure y is within top and bottom bounds
          });

          // Call ticked function
          ticked("#svg1", links1, nodes1, backgroundColor1);
        });
      if (graph != 0) {
        break;
      }
    case 2:
    case 0:
      let data2 = EPISODES[index2];

      let nodes2 = data2.nodes;
      let links2 = data2.links;

      let backgroundColor2 = "#f0dadc";

      d3.select("#svg2").remove();

      let svg2 = d3
        .select("#content")
        .append("svg")
        .attr("id", "svg2")
        .attr("width", width / 2)
        .attr("height", height)
        .style("background-color", backgroundColor2);

      let simulation2 = d3
        .forceSimulation(nodes2)

        .force("charge", d3.forceManyBody().strength(-50))
        .force("center", d3.forceCenter(width / 4, height / 2).strength(0.6))
        .force("link", d3.forceLink().links(links2))
        .force(
          "collision",
          d3.forceCollide().radius(function (d) {
            return Math.max((NODERADIUS * d.value) / 80, NODERADIUS);
          })
        )
        .on("tick", function () {
          // Adjust nodes to stay within bounding box
          nodes2.forEach(function (d) {
            d.x = Math.max(NODERADIUS, Math.min(width / 2 - NODERADIUS, d.x)); // Ensure x is within left and right bounds
            d.y = Math.max(3 * NODERADIUS, Math.min(height - NODERADIUS, d.y)); // Ensure y is within top and bottom bounds
          });

          // Call ticked function
          ticked("#svg2", links2, nodes2, backgroundColor2);
        });

      break;
  }
  async function ticked(id, theLinks, theNodes, backgroundColor) {
    updateLinks(id, theLinks);
    updateNodes(id, theNodes, backgroundColor);
  }

  async function updateLinks(id, theLinks) {
    let svg = d3.select(id);

    svg
      .selectAll("line")
      .data(theLinks)
      .join("line")
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
  }
  async function updateNodes(id, theNodes, backgroundColor) {
    let fontSize = 12;

    let svg = d3.select(id);

    // Update circle elements
    svg
      .selectAll("circle")
      .data(theNodes)
      .join("circle")
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      })
      .attr("r", function (d) {
        return Math.max((NODERADIUS * d.value) / 120, NODERADIUS); // Default radius if not provided
      })
      .style("fill", function (d) {
        return backgroundColor;
      })
      .raise();

    // Update text elements
    svg
      .selectAll("text")
      .data(theNodes)
      .join("text")
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      })
      .attr("dy", "0.35em") // Adjust vertical alignment
      .attr("text-anchor", "middle") // Center text horizontally
      .text(function (d) {
        return d.name;
      })
      .style("fill", function (d) {
        return d.colour;
      })
      .attr("font-size", function (d) {
        return Math.max((fontSize * d.value) / 60, fontSize);
      })
      .raise();
  }
}

let episodeForm1 = d3.select("#form1");
let episodeForm2 = d3.select("#form2");

episodeForm1.selectAll("input").on("change", (event) => {
  changeEpisode(1);
});

episodeForm2.selectAll("input").on("change", (event) => {
  changeEpisode(2);
});

function changeEpisode(form) {
  let checkedEpisodes1 = [];
  let checkedEpisodes2 = [];

  switch (form) {
    case 1:
      episodeForm1.selectAll("input").each(function () {
        let checkedBox = d3.select(this);
        if (checkedBox.property("checked")) {
          checkedEpisodes1.push(parseInt(checkedBox.property("value")));
        }
      });
    case 2:
      episodeForm2.selectAll("input").each(function () {
        let checkedBox = d3.select(this);
        if (checkedBox.property("checked")) {
          checkedEpisodes2.push(parseInt(checkedBox.property("value")));
        }
      });
    default:
  }
  simulateNodeSystem(checkedEpisodes1, checkedEpisodes2, form);
}

simulateNodeSystem([0], [0], 0);
