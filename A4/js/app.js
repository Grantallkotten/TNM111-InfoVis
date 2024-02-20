const urls = [
  "./json/starwars-full-interactions-allCharacters.json",
  "./json/starwars-episode-1-interactions-allCharacters.json",
  "./json/starwars-episode-2-interactions-allCharacters.json",
  "./json/starwars-episode-3-interactions-allCharacters.json",
  "./json/starwars-episode-4-interactions-allCharacters.json",
  "./json/starwars-episode-5-interactions-allCharacters.json",
  "./json/starwars-episode-6-interactions-allCharacters.json",
  "./json/starwars-episode-7-interactions-allCharacters.json",
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
  constructor(name, value, colour, image) {
    this.name = name;
    this.value = value;
    this.colour = colour;
    this.image = image;
  }
}

class link {
  constructor(source, target, value) {
    this.source = source;
    this.target = target;
    this.value = value;
  }
}

let backgroundColors = ["#fff", "#fff"];

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
    i++;
  });
  unSelectAllInForm("#form1", "radio");
  selectButtonInForm("#form1", "#option2");

  unSelectAllInForm("#form2", "radio");
  selectButtonInForm("#form2", "#option3");

  simulateNodeSystem("#svg1", [1], backgroundColors[0]);
  simulateNodeSystem("#svg2", [2], backgroundColors[1]);
}

let selectedNode1;
let selectedNode2;

async function simulateNodeSystem(id, index, nodeColor) {
  console.log(id);
  let EPISODES = await loadEp();

  const contentDiv = document.getElementById("content");

  const width = contentDiv.clientWidth;
  const height = contentDiv.clientHeight;

  const NODERADIUS = 30;

  let data = EPISODES[index];

  let nodes = data.nodes;
  let links = data.links;

  let force = 0;
  if (nodes.length > 100) {
    force = -100;
  } else {
    force = -400;
  }

  resetHiglight();
  d3.select(id).selectAll("*").remove();

  let simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(force))
    .force("center", d3.forceCenter(width / 4, height / 2).strength(1))
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
    updateClipPaths(id, theNodes); // Add this line to update clip path positions
  }

  async function updateClipPaths(id, theNodes) {
    let svg = d3.select(id);

    // Update clip path positions based on node positions
    svg.selectAll(".node-group")
      .data(theNodes)
      .select("clipPath")
      .select("circle")
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
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

    // Update group elements
    let nodeGroups = svg.selectAll(".node-group")
      .data(theNodes)
      .join("g")
      .attr("class", "node-group")
      .on("click", onClick)
      .raise();

    // Create a clipPath for each node
    nodeGroups.append("clipPath")
      .attr("id", d => "clip-" + d.name)
      .append("circle")
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      })
      .attr("r", function (d) {
        return NODERADIUS;
      });

    // Update image elements within the group
    nodeGroups.selectAll("image")
      .data(d => [d])
      .join("image")
      .attr("x", function (d) {
        return d.x - NODERADIUS;
      })
      .attr("y", function (d) {
        return d.y - NODERADIUS;
      })
      .attr("width", 2 * NODERADIUS)
      .attr("height", 2 * NODERADIUS)
      .attr("xlink:href", d => d.image)
      .attr("clip-path", d => "url(#clip-" + d.name + ")"); // Apply clip-path

    // Create circular clip path for each node
    nodeGroups.selectAll("clipPath")
      .data(d => [d])
      .join("clipPath")
      .attr("id", d => "clip-" + d.name)
      .append("circle")
      .attr("r", function (d) {
        return NODERADIUS;
      });

    // Update clip path positions based on node positions
    nodeGroups.selectAll("clipPath")
      .select("circle")
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });

    // Update text elements within the group
    nodeGroups.selectAll("text")
      .data(d => [d])
      .join("text")
      .attr("text-name", function (d) {
        return d.name;
      })
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y + 30;
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
      .raise();
  }

  function resetHiglight() {
    d3.selectAll("text")
      .style("text-shadow", "0 0 0px rgba(255, 0, 0, 0)")

      .style("fill", function (d) {
        return d.colour;
      });
  }

  function onClick() {
    d3.select(selectedNode1)
      .style("text-shadow", "0 0 0px rgba(255, 0, 0, 0)")

      .style("fill", function (d) {
        return d.colour;
      });

    let svg = d3.select(id);
    svg
      .select(selectedNode2)
      .style("text-shadow", "0 0 0px rgba(255, 0, 0, 0)")

      .style("fill", function (d) {
        return d.colour;
      });

    selectedNode1 = this;
    d3.select(this)
      .style("text-shadow", "0 0 20px rgba(255, 0, 0, 1)")

      .style("fill", function (d) {
        return "red";
      });
    const name = d3.select(this).attr("text-name");
    let id2 = "#svg2";

    if (id == "#svg2") {
      id2 = "#svg1";
    }

    selectAll(name, id2);
  }

  function selectAll(name, id) {
    let svg = d3.select(id);

    const matching = svg.select(`text[text-name="${name}"]`);

    svg
      .select(selectedNode2)
      .style("text-shadow", "0 0 0px rgba(255, 0, 0, 0)")

      .style("fill", function (d) {
        return d.colour;
      });

    matching
      .style("text-shadow", "0 0 20px rgba(255, 0, 0, 1)")
      .style("fill", function (d) {
        return "red";
      });
    selectedNode2 = `text[text-name="${name}"]`;
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

function unSelectAllInForm(id, type) {
  id = id.replace("#", "");
  const form = document.getElementById(id);

  // Get all radio buttons inside the form
  const buttons = form.querySelectorAll('input[type="radio"]');

  // Loop through each radio button and uncheck it
  buttons.forEach(function (button) {
    button.checked = false;
  });
}

function selectButtonInForm(formId, id) {
  formId = formId.replace("#", "");
  const form = document.getElementById(formId);
  const button = form.querySelector(id);
  button.checked = true;
}

initSimulateNodeSystem(["#svg1", "#svg2"], backgroundColors);
