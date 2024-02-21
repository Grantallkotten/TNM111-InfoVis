import { initSliders } from "./rangeSlider.js";

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
    this.name = name.toLowerCase();
    this.value = value.toLowerCase();
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

const BACKGROUNDCOLORS = ["#fff", "#fff"];
const HIGHLIGHTCOLOR = "#FF1200";
const HIGHLIGHTSHADOW = "0 0 10px rgba(255, 18, 43, 1)";
const CONTEXTHEADER = "<p class='contex-header'>Context table</p>";
const LINKSIZE = 2;

function initSimulateNodeSystem(ids) {
  const contentDiv = document.getElementById("content");

  const width = contentDiv.clientWidth;
  const height = contentDiv.clientHeight;

  let i = 0;
  ids.forEach((id) => {
    id = id.replace("#", "");
    d3.select("#content")
      .insert("svg")
      .attr("id", id)
      .attr("width", width / 2)
      .attr("height", height)
      .style("background-color", BACKGROUNDCOLORS[i])
      .append("g");

    d3.select("#content-headers")
      .append("div")
      .attr("id", id + "-header");

    i++;
  });
  unSelectAllInForm("#form1", "radio");
  selectButtonInForm("#form1", "#option2");

  unSelectAllInForm("#form2", "radio");
  selectButtonInForm("#form2", "#option3");

  simulateNodeSystem("#svg1", [1], BACKGROUNDCOLORS[0], -Infinity, Infinity);
  simulateNodeSystem("#svg2", [2], BACKGROUNDCOLORS[1], -Infinity, Infinity);
}

let selectedNode1;
let selectedNode2;

async function simulateNodeSystem(id, index, nodeColor, valMin, valMax) {
  let EPISODES = await loadEp();

  const contentDiv = document.getElementById("content");
  const contentHeaders = d3.select("#content-headers");

  const width = contentDiv.clientWidth;
  const height = contentDiv.clientHeight;

  const NODERADIUS = 30;
  const MINNODERADIUS = 20;
  const MAXNODERADIUS = 40;

  const PADDING = 30;

  let data = EPISODES[index];

  contentHeaders
    .select(id + "-header")
    .selectAll("*")
    .remove();

  let strEp = "Episode " + index;
  if (index == 0) {
    strEp = "All Episodes";
  }
  contentHeaders.select(id + "-header").text(strEp);

  let nodes = data.nodes;
  let links = data.links;

  let force = 0;
  let scale = 1;
  if (nodes.length > 100) {
    force = -100;
    scale = 0.6;
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
        return Math.min(Math.max(20, d.value), 40) * 2 * scale;
      })
    )
    .on("tick", function () {
      nodes.forEach(function (d) {
        d.x = Math.max(
          NODERADIUS - PADDING,
          Math.min(width / 2 - NODERADIUS - PADDING, d.x)
        ); // Ensure x is within left and right bounds
        d.y = Math.max(
          NODERADIUS - PADDING,
          Math.min(height - NODERADIUS - PADDING, d.y)
        ); // Ensure y is within top and bottom bounds
      });

      // Call ticked function
      ticked(id, links, nodes, nodeColor);
    });

  async function ticked(id, theLinks, theNodes, nodeColor) {
    updateLinks(id, theNodes, theLinks);
    updateNodes(id, theNodes, nodeColor);
    updateClipPaths(id, theNodes); // Add this line to update clip path positions
  }

  async function updateClipPaths(id, theNodes) {
    let svg = d3.select(id);

    // Update clip path positions based on node positions
    svg
      .selectAll(".node-group")
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

  async function updateLinks(id, theNodes, theLinks) {
    let svg = d3.select(id);

    svg
      .selectAll("line")
      .data(
        theLinks.filter(function (d) {
          const nodeTarget = theNodes.find((n) => n.name === d.target.name);
          const nodeSource = theNodes.find((n) => n.name === d.source.name);
          return (
            nodeTarget.value >= valMin &&
            nodeTarget.value <= valMax &&
            nodeSource.value >= valMin &&
            nodeSource.value <= valMax
          );
        })
      )
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
      })
      .attr("source", function (d) {
        return d.source.name;
      })
      .attr("target", function (d) {
        return d.target.name;
      })
      .attr("value", function (d) {
        return d.value;
      })
      .style("stroke-width", Math.max(LINKSIZE * scale, 1) + "px")
      .style("stroke", "")

      .on("click", onClickLink);
  }

  async function updateNodes(id, theNodes, nodeColor) {
    let fontSize = 12;

    let svg = d3.select(id);

    // Update circle elements
    svg
      .selectAll("circle")
      .data(
        theNodes.filter(function (d) {
          return d.value >= valMin && d.value <= valMax;
        })
      )
      .join("circle")
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      })
      .attr("r", function (d) {
        return Math.min(Math.max(MINNODERADIUS, d.value), 40); // Default radius if not provided
      })
      .style("fill", function (d) {
        return nodeColor;
      });

    // Update image elements
    svg
      .selectAll("image")
      .data(
        theNodes.filter(function (d) {
          return d.value >= valMin && d.value <= valMax;
        })
      )
      .join("image")
      .attr("text-name", function (d) {
        return d.name;
      })
      .attr("conversations", function (d) {
        return d.value;
      })
      .attr("xlink:href", function (d) {
        return d.image; // Provide the image URL from your data
      })
      .attr("width", function (d) {
        return Math.min(
          Math.max(MINNODERADIUS * 2, d.value * 2),
          MAXNODERADIUS * 2
        );
      })
      .attr("height", function (d) {
        return Math.min(
          Math.max(MINNODERADIUS * 2, d.value * 2),
          MAXNODERADIUS * 2
        );
      })
      .attr("x", function (d) {
        return (
          d.x -
          Math.min(
            Math.max(MINNODERADIUS * 2, d.value * 2),
            MAXNODERADIUS * 2
          ) /
            2
        );
      })
      .attr("y", function (d) {
        return (
          d.y -
          Math.min(
            Math.max(MINNODERADIUS * 2, d.value * 2),
            MAXNODERADIUS * 2
          ) /
            2
        );
      })
      .raise();

    // Update text elements
    svg
      .selectAll("text")
      .data(
        theNodes.filter(function (d) {
          return d.value >= valMin && d.value <= valMax;
        })
      )
      .join("text")
      .attr("text-name", function (d) {
        return d.name;
      })
      .attr("conversations", function (d) {
        return d.value;
      })
      .attr("img-href", function (d) {
        return d.image; // Provide the image URL from your data
      })
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return (
          d.y + 5 + Math.min(Math.max(MINNODERADIUS, d.value), MAXNODERADIUS)
        );
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function (d) {
        return d.name.toLowerCase(); // Starwars font dont work for upper (defect in .ttf)
      })
      .style("fill", function (d) {
        return d.colour;
      })
      .attr("font-size", function (d) {
        return Math.max(((fontSize * d.value) / 60) * scale, fontSize * scale);
      })
      .on("click", onClickNode)
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("font-size", function (d) {
            return Math.max(
              ((fontSize * d.value) / 30) * scale,
              fontSize * scale * 1.5
            );
          });
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(100)
          .attr("font-size", function (d) {
            return Math.max(
              ((fontSize * d.value) / 60) * scale,
              fontSize * scale
            );
          });
      })
      .raise();
  }

  function resetHiglight() {
    let content = d3.select("#content");

    content.selectAll("line").style("stroke", "").style("filter", "");

    content
      .selectAll("text")
      .style("text-shadow", "0 0 0px rgba(255, 0, 0, 0)")

      .style("fill", function (d) {
        return d.colour;
      });

    d3.selectAll(".context").html(CONTEXTHEADER);
  }

  function onClickLink() {
    resetHiglight();

    d3.select(this)
      .style("stroke", HIGHLIGHTCOLOR)
      .style("filter", "opacity(60%)");

    const source = d3.select(this).attr("source");
    const target = d3.select(this).attr("target");
    const value = d3.select(this).attr("value");

    let svg = d3.select(id);

    const sourceNode = svg.select(`text[text-name="${source}"]`);
    sourceNode
      .style("text-shadow", HIGHLIGHTSHADOW)
      .style("fill", function (d) {
        return HIGHLIGHTCOLOR;
      });

    const targetNode = svg.select(`text[text-name="${target}"]`);
    targetNode
      .style("text-shadow", HIGHLIGHTSHADOW)
      .style("fill", function (d) {
        return HIGHLIGHTCOLOR;
      });

    const imgHrefSource = sourceNode.attr("img-href");
    const imgHrefTarget = targetNode.attr("img-href");

    const context = d3.select(id + "-context");

    context.html(
      CONTEXTHEADER +
        "<table border='0' style=''> <tr> <td class='left-align'>Names:    </td> <td>" +
        source +
        " and " +
        target +
        "</td> </tr> <tr> <td class='left-align'>Conversations:    </td> <td>" +
        value +
        "</td></tr> </table>" +
        "<div style='margin-top: 3vh; display: flex; width: 100%; red; justify-content: center; align-items: center; height: fit-content;'><img src='" +
        imgHrefSource +
        "' class='context-href'>" +
        " <img src='" +
        imgHrefTarget +
        "' class='context-href'></div>"
    );
  }

  function onClickNode() {
    resetHiglight();

    selectedNode1 = this;

    d3.select(this)
      .style("text-shadow", HIGHLIGHTSHADOW)

      .style("fill", function (d) {
        return HIGHLIGHTCOLOR;
      });
    const name = d3.select(this).attr("text-name");
    const conversations = d3.select(this).attr("conversations");
    const imgHref = d3.select(this).attr("img-href");

    let id2 = "#svg2";

    if (id == "#svg2") {
      id2 = "#svg1";
    }
    selectAll(name, id2);

    const context = d3.select(id + "-context");
    context.html("");

    context.html(
      CONTEXTHEADER +
        "<table border='0' style=''> <tr> <td class='left-align'>Name:    </td> <td>" +
        name +
        "</td> </tr> <tr> <td class='left-align'>Conversations:    </td> <td>" +
        conversations +
        "</td></tr> </table>" +
        "<div style='margin-top: 3vh; display: flex; width: 100%; red; justify-content: center; align-items: center; height: fit-content;'><img src='" +
        imgHref +
        "' class='context-href'>"
    );
  }

  function selectAll(name, id) {
    let svg = d3.select(id);

    const matching = svg.select(`text[text-name="${name}"]`);

    d3.select(selectedNode2)
      .style("text-shadow", "0 0 0px rgba(255, 0, 0, 0)")
      .style("fill", function (d) {
        return d.colour;
      });

    matching.style("text-shadow", HIGHLIGHTSHADOW).style("fill", function (d) {
      return HIGHLIGHTCOLOR;
    });
    selectedNode2 = matching.node();

    // @TODO
    const context = d3.select(id + "-context");
    context.html("");

    if (matching.node()) {
      const conversations = d3.select(matching.node()).attr("conversations");
      const imgHref = d3.select(matching.node()).attr("img-href");

      context.html(
        CONTEXTHEADER +
          "<table border='0' style=''> <tr> <td class='left-align'>Name:    </td> <td>" +
          name +
          "</td> </tr> <tr> <td class='left-align'>Conversations:    </td> <td>" +
          conversations +
          "</td></tr> </table>" +
          "<div style='margin-top: 3vh; display: flex; width: 100%; red; justify-content: center; align-items: center; height: fit-content;'><img src='" +
          imgHref +
          "' class='context-href'>"
      );
    }
  }

  function InitNodeRange(id) {
    const sliderInputMin = document.querySelector(id + "-fromSlider");
    const sliderInputMax = document.querySelector(id + "-toSlider");

    let timer;

    sliderInputMin.addEventListener("input", function () {
      clearTimeout(timer); // Clear the previous timer

      timer = setTimeout(function () {
        simulateNodeSystem(
          id,
          index,
          nodeColor,
          sliderInputMin.value,
          sliderInputMax.value
        );
      }, 500); // 500 milliseconds
    });

    sliderInputMax.addEventListener("input", function () {
      clearTimeout(timer); // Clear the previous timer

      timer = setTimeout(function () {
        simulateNodeSystem(
          id,
          index,
          nodeColor,
          sliderInputMin.value,
          sliderInputMax.value
        );
      }, 500); // 500 milliseconds
    });
  }

  InitNodeRange(id);
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
      simulateNodeSystem(
        "#svg1",
        checkedEpisodes1[0],
        BACKGROUNDCOLORS[0],
        -Infinity,
        Infinity
      );
      break;
    case 2:
      episodeForm2.selectAll("input").each(function () {
        let checkedBox = d3.select(this);
        if (checkedBox.property("checked")) {
          checkedEpisodes2.push(parseInt(checkedBox.property("value")));
        }
      });
      simulateNodeSystem(
        "#svg2",
        checkedEpisodes2[0],
        BACKGROUNDCOLORS[1],
        -Infinity,
        Infinity
      );
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

initSliders(
  ["#svg1", "#svg2"],
  [
    [0, 500],
    [0, 500],
  ]
);
initSimulateNodeSystem(["#svg1", "#svg2"], BACKGROUNDCOLORS);
