function controlFromSlider(fromSlider, toSlider) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, "#C6C6C6", "#25daa5", toSlider);
  if (from > to) {
    fromSlider.value = to;
  }
}

function controlToSlider(fromSlider, toSlider) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, "#C6C6C6", "#25daa5", toSlider);
  if (from <= to) {
    toSlider.value = to;
  } else {
    toSlider.value = from;
  }
}

function getParsed(currentFrom, currentTo) {
  const from = parseInt(currentFrom.value, 10);
  const to = parseInt(currentTo.value, 10);
  return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
  const rangeDistance = to.max - to.min;
  const fromPosition = from.value - to.min;
  const toPosition = to.value - to.min;
  controlSlider.style.background = `linear-gradient(
      to right,
      ${sliderColor} 0%,
      ${sliderColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(fromPosition / rangeDistance) * 100}%,
      ${rangeColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} ${(toPosition / rangeDistance) * 100}%, 
      ${sliderColor} 100%)`;
}

export function initSliders(ids, range) {
  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    let min = range[i][0];
    let max = range[i][1];

    creatSlider(id, min, max);

    runSlider(id);
  }
}

export function runSlider(id) {
  const fromSlider = document.querySelector(id + "-fromSlider");
  const toSlider = document.querySelector(id + "-toSlider");
  fillSlider(fromSlider, toSlider, "#C6C6C6", "#25daa5", toSlider);

  fromSlider.oninput = () => {
    controlFromSlider(fromSlider, toSlider);
    updateSliderValues(fromSlider, toSlider);
  };
  toSlider.oninput = () => {
    controlToSlider(fromSlider, toSlider);
    updateSliderValues(fromSlider, toSlider);
  };
}

function updateSliderValues(fromSlider, toSlider) {
  const valueDiv = fromSlider.parentElement.nextElementSibling;
  const [from, to] = getParsed(fromSlider, toSlider);
  const beforeFromSlider = valueDiv.children[0];
  const afterFromSlider = valueDiv.children[1];
  beforeFromSlider.textContent = from;
  afterFromSlider.textContent = to;
}

function creatSlider(id, min, max) {
  id = id.replace("#", "");

  // Create the range container div
  const rangeContainer = document.createElement("div");
  rangeContainer.classList.add("rangeContainer");

  const rangeHeader = document.createElement("div");
  rangeHeader.textContent = "Number of conversations";
  rangeContainer.classList.add("rangeHeader");

  const content = document.createElement("div");
  content.style.paddingTop = "1rem";

  // Create the sliders control div
  const slidersControl = document.createElement("div");
  slidersControl.classList.add("sliderscontrol");

  // Create the fromSlider input
  const fromSlider = document.createElement("input");
  fromSlider.setAttribute("type", "range");
  fromSlider.setAttribute("id", id + "-fromSlider");
  fromSlider.setAttribute("min", min);
  fromSlider.setAttribute("max", max);
  fromSlider.setAttribute("value", min);

  // Create the toSlider input
  const toSlider = document.createElement("input");
  toSlider.setAttribute("type", "range");
  toSlider.setAttribute("id", id + "-toSlider");
  toSlider.setAttribute("min", min);
  toSlider.setAttribute("max", max);
  toSlider.setAttribute("value", max);

  // Append the sliders to the sliders control div
  slidersControl.appendChild(fromSlider);
  slidersControl.appendChild(toSlider);

  // Create the valueDiv container
  const valueDiv = document.createElement("div");
  valueDiv.style.display = "flex";
  valueDiv.style.width = "100%"; // Ensure it takes full width
  valueDiv.style.justifyContent = "space-between"; // Distribute items evenly

  // Create the <p> elements for before and after the fromSlider
  const beforeFromSlider = document.createElement("p");
  beforeFromSlider.textContent = min;

  const afterFromSlider = document.createElement("p");
  afterFromSlider.textContent = max;

  // Append the <p> elements to the valueDiv
  valueDiv.appendChild(beforeFromSlider);
  valueDiv.appendChild(afterFromSlider);

  // Append the sliders control div to the range container div
  content.appendChild(slidersControl);

  // Append the valueDiv to the range container div
  content.appendChild(valueDiv);

  rangeContainer.appendChild(rangeHeader);
  rangeContainer.appendChild(content);

  // Get the ranges div and append the range container div
  const rangesDiv = document.querySelector(".ranges");
  rangesDiv.appendChild(rangeContainer);
}
