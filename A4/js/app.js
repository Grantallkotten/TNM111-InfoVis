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

let backgroundColors = ["#bcd1eb", "#f0dadc"];

let zoom = d3.zoom().on("zoom", handleZoom);

function handleZoom(e) {
  d3.select("svg g").attr("transform", e.transform);
}

function initZoom(id) {
  d3.select(id).call(zoom);
}
function initSimulateNodeSystem(ids, backgroundColors) {
  const contentDiv = document.getElementById("content");
  let i = 0;

  const width = contentDiv.clientWidth;
  const height = contentDiv.clientHeight;

  ids.forEach((id) => {
    id = id.replace("#", "");
    d3.select("#content")
      .insert("svg")
      .attr("id", id)
      .attr("width", width / 2)
      .attr("height", height)
      .style("background-color", backgroundColors[i])
      .append("g");
    //.call(initZoom, `#${id}`); // Add zoom behavior to each SVG
    i++;
  });
}

let selectedNode;

async function simulateNodeSystem(id, index, nodeColor) {
  console.log(id);
  let EPISODES = await loadEp();

  const contentDiv = document.getElementById("content");
  // contentDiv.innerHTML = "";

  const width = contentDiv.clientWidth;
  const height = contentDiv.clientHeight;

  const NODERADIUS = 12;
  let force = 0;
  if (index > 0) {
    force = -300;
  } else {
    force = -100;
  }
  let data = EPISODES[index];

  let nodes = data.nodes;
  let links = data.links;

  d3.select(id).selectAll("*").remove();

  let simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(force))
    .force("center", d3.forceCenter(width / 4, height / 2).strength(0.8))
    .force("link", d3.forceLink().links(links))
    .on("tick", function () {
      ticked(id, links, nodes, nodeColor);
    })
    .force(
      "collision",
      d3.forceCollide().radius(function (d) {
        return Math.max((NODERADIUS * d.value) / 80, NODERADIUS);
      })
    )
    .on("tick", function () {
      // Adjust nodes to stay within bounding box
      nodes.forEach(function (d) {
        d.x = Math.max(NODERADIUS, Math.min(width / 2 - NODERADIUS, d.x)); // Ensure x is within left and right bounds
        d.y = Math.max(NODERADIUS, Math.min(height - 3 * NODERADIUS, d.y)); // Ensure y is within top and bottom bounds
      });

      // Call ticked function
      ticked(id, links, nodes, nodeColor);
    });

  async function ticked(id, theLinks, theNodes, nodeColor) {
    updateLinks(id, theLinks);
    updateNodes(id, theNodes, nodeColor);
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

  async function updateNodes(id, theNodes, nodeColor) {
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
        return nodeColor;
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
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function (d) {
        return d.name;
      })
      .style("fill", function (d) {
        return d.colour;
      })
      .attr("font-size", function (d) {
        return Math.max((fontSize * d.value) / 60, fontSize);
      })
      .on("click", function (_event, d) {
        d3.select(selectedNode).style("fill", function (d) {
          return d.colour;
        });
        selectedNode = this;
        d3.select(this).style("fill", function (d) {
          return "#FFF";
        });
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

  console.log(form);
  switch (form) {
    case 1:
      episodeForm1.selectAll("input").each(function () {
        let checkedBox = d3.select(this);
        if (checkedBox.property("checked")) {
          checkedEpisodes1.push(parseInt(checkedBox.property("value")));
        }
      });
      simulateNodeSystem("#svg1", checkedEpisodes1[0], backgroundColors[0]);
      break;
    case 2:
      episodeForm2.selectAll("input").each(function () {
        let checkedBox = d3.select(this);
        if (checkedBox.property("checked")) {
          checkedEpisodes2.push(parseInt(checkedBox.property("value")));
        }
      });
      simulateNodeSystem("#svg2", checkedEpisodes2[0], backgroundColors[1]);
      break;
    default:
  }
}

initSimulateNodeSystem(["#svg1", "#svg2"], backgroundColors);
simulateNodeSystem("#svg1", [0], backgroundColors[0]);
simulateNodeSystem("#svg2", [1], backgroundColors[1]);
