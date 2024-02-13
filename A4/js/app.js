const urls = [
  "../json/starwars-episode-1-interactions-allCharacters.json",
  "../json/starwars-episode-2-interactions-allCharacters.json",
  "../json/starwars-episode-3-interactions-allCharacters.json",
  "../json/starwars-episode-4-interactions-allCharacters.json",
  "../json/starwars-episode-5-interactions-allCharacters.json",
  "../json/starwars-episode-6-interactions-allCharacters.json",
  "../json/starwars-episode-7-interactions-allCharacters.json",
  "../json/starwars-full-interactions-allCharacters.json",
];

const SWEP1RAW = await d3.json(urls[0]).catch(function (error) {
    console.error("Error loading data:", error);
  }),
  SWEP2RAW = await d3.json(urls[1]).catch(function (error) {
    console.error("Error loading data:", error);
  }),
  SWEP3RAW = await d3.json(urls[2]).catch(function (error) {
    console.error("Error loading data:", error);
  }),
  SWEP4RAW = await d3.json(urls[3]).catch(function (error) {
    console.error("Error loading data:", error);
  }),
  SWEP5RAW = await d3.json(urls[4]).catch(function (error) {
    console.error("Error loading data:", error);
  }),
  SWEP6RAW = await d3.json(urls[5]).catch(function (error) {
    console.error("Error loading data:", error);
  }),
  SWEP7RAW = await d3.json(urls[6]).catch(function (error) {
    console.error("Error loading data:", error);
  }),
  SWALLRAW = await d3.json(urls[7]).catch(function (error) {
    console.error("Error loading data:", error);
  });

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

let SWEp1 = new SWdata("Episode 1", SWEP1RAW.nodes, SWEP1RAW.links),
  SWEp2 = new SWdata("Episode 2", SWEP2RAW.nodes, SWEP2RAW.links),
  SWEp3 = new SWdata("Episode 3", SWEP3RAW.nodes, SWEP3RAW.links),
  SWEp4 = new SWdata("Episode 4", SWEP4RAW.nodes, SWEP4RAW.links),
  SWEp5 = new SWdata("Episode 5", SWEP5RAW.nodes, SWEP5RAW.links),
  SWEp6 = new SWdata("Episode 6", SWEP6RAW.nodes, SWEP6RAW.links),
  SWEp7 = new SWdata("Episode 7", SWEP7RAW.nodes, SWEP7RAW.links),
  SWAll = new SWdata("All episodes", SWALLRAW.nodes, SWALLRAW.links);

const EPISODES = [SWAll, SWEp1, SWEp2, SWEp3, SWEp4, SWEp5, SWEp6, SWEp7];

let allLinks = SWEp1.links.concat(
  SWEp2.links,
  SWEp3.links,
  SWEp4.links,
  SWEp5.links,
  SWEp6.links,
  SWEp7.links
);

let allNodes = SWEp1.nodes.concat(
  SWEp2.nodes,
  SWEp3.nodes,
  SWEp4.nodes,
  SWEp5.nodes,
  SWEp6.nodes,
  SWEp7.nodes
);

async function simulateNodeSystem() {
  const contentDiv = document.getElementById("content");

  const width = contentDiv.clientWidth;
  const height = contentDiv.clientHeight;

  let nodes = SWEp1.nodes;
  let links = SWEp1.links;

  const NODERADIUS = 6;

  let svg1 = d3
    .select("#content")
    .append("svg")
    .attr("id", "svg1")
    .attr("width", width / 2)
    .attr("height", height)
    .style("background-color", "#bed7ed");

  let svg2 = d3
    .select("#content")
    .append("svg")
    .attr("id", "svg2")
    .attr("width", width / 2)
    .attr("height", height)
    .style("background-color", "#f0dadc");

  let simulation1 = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-10))
    .force("center", d3.forceCenter(width / 4, height / 2))
    .force("link", d3.forceLink().links(links))
    .on("tick", function () {
      ticked("#svg1");
    })
    .force(
      "collision",
      d3.forceCollide().radius(function (d) {
        return Math.max((NODERADIUS * d.value) / 80, NODERADIUS);
      })
    );

  let simulation2 = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-10))
    .force("center", d3.forceCenter(width / 4, height / 2))
    .force("link", d3.forceLink().links(links))
    .on("tick", function () {
      ticked("#svg2");
    })
    .force(
      "collision",
      d3.forceCollide().radius(function (d) {
        return Math.max((NODERADIUS * d.value) / 80, NODERADIUS);
      })
    );

  function ticked(id) {
    updateLinks(id);
    updateNodes(id);
  }

  function updateLinks(id) {
    d3.select(id)
      .selectAll("line")
      .data(links)
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

  function updateNodes(id) {
    d3.select(id)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 5)
      .style("fill", function (d) {
        return d.colour;
      })
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      })
      .attr("r", function (d) {
        return Math.max((NODERADIUS * d.value) / 80, NODERADIUS);
      });
  }
}

var episodeForm1 = d3.select("#form1");

episodeForm1.selectAll("input").on("change", (event) => {
  var checkedEpisodes = [];

  episodeForm1.selectAll("input").each(function () {
    var checkedBox = d3.select(this);
    if (checkedBox.property("checked")) {
      checkedEpisodes.push(parseInt(checkedBox.property("value")));
    }
  });
  // Do the thing
});

simulateNodeSystem();
