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

  var nodes = SWAll.nodes;
  console.log(nodes.length);

  var simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-5))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", ticked);

  function ticked() {
    d3.select("svg")
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
      });
  }
}

simulateNodeSystem();
