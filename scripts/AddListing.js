import SendRequest from "./SendRequest.js";

function setupCustomSelect() {
  const customSelects = document.querySelectorAll(".custom-select");

  customSelects.forEach((customSelect) => {
    const selected = customSelect.querySelector(".select-selected");
    const items = customSelect.querySelector(".select-items");
    const selectId = items.id;

    const savedSelection = localStorage.getItem(`selected-${selectId}`);
    if (savedSelection) {
      selected.textContent = savedSelection;
    } else if (selectId === "region-select-items") {
      selected.textContent = "აირჩიე";
    } else {
      const firstOption = items.querySelector("div:first-child");
      if (firstOption) {
        selected.textContent = firstOption.textContent;
      }
    }

    selected.addEventListener("click", function () {
      items.style.display = items.style.display === "block" ? "none" : "block";
      customSelect.classList.toggle(
        "select-activated",
        items.style.display === "block"
      );
    });

    items.querySelectorAll("div").forEach((item) => {
      item.addEventListener("click", async function () {
        selected.textContent = this.textContent;
        items.style.display = "none";
        customSelect.classList.remove("select-activated");

        localStorage.setItem(`selected-${selectId}`, this.textContent);

        if (selectId === "region-select-items") {
          const regionId = await getRegionIdByName(this.textContent);
          await fillDropdownWithCities(regionId);
          citiesDropdownState();
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!customSelect.contains(event.target)) {
        items.style.display = "none";
        customSelect.classList.remove("select-activated");
      }
    });
  });
}

// get requests

async function getAgents() {
  let instance = new SendRequest("agents");
  let result = await instance.getRequest();
  return result;
}

async function getRegions() {
  let instance = new SendRequest("regions");
  let result = await instance.getRequest();
  return result;
}

async function getCities() {
  let instance = new SendRequest("cities");
  let result = await instance.getRequest();
  return result;
}

async function fillDropdownWithAgents() {
  let agents = await getAgents();
  const selectItemsContainer = document.getElementById("agent-select-items");

  for (let agent of agents) {
    let option = document.createElement("div");
    option.textContent = agent["name"];
    selectItemsContainer.appendChild(option);
  }
}

async function fillDropdownWithRegions() {
  let regions = await getRegions();
  const selectItemsContainer = document.getElementById("region-select-items");

  for (let region of regions) {
    let option = document.createElement("div");
    option.textContent = region["name"];
    selectItemsContainer.appendChild(option);
  }
}

async function fillDropdownWithCities(regionId) {
  let cities = await getCities();
  const selectItemsContainer = document.getElementById("city-select-items");
  selectItemsContainer.innerHTML = "";

  const regionSelect = document.getElementById("region-custom-select");
  const regionSelected = regionSelect.querySelector(".select-selected");
  localStorage.setItem(
    "selected-region-select-items",
    regionSelected.textContent
  );

  for (let city of cities) {
    if (city["region_id"] === regionId) {
      let option = document.createElement("div");
      option.textContent = city["name"];
      selectItemsContainer.appendChild(option);
    }
  }

  const firstCity = selectItemsContainer.querySelector("div:first-child");
  if (firstCity) {
    const citySelected = document.querySelector(
      "#city-custom-select .select-selected"
    );
    citySelected.textContent = firstCity.textContent;
    localStorage.setItem("selected-city-select-items", firstCity.textContent);
  }

  setupCustomSelect();
}

async function getRegionIdByName(name) {
  let regions = await getRegions();
  for (let region of regions) {
    if (region["name"] === name) {
      return region["id"];
    }
  }
}

async function citiesDropdownState() {
  const regionSelected = localStorage.getItem("selected-region-select-items");
  if (regionSelected && regionSelected !== "აირჩიე") {
    const regionId = await getRegionIdByName(regionSelected);
    await fillDropdownWithCities(regionId);
    const cityCustomSelect = document.getElementById("city-custom-select");
    cityCustomSelect.style.visibility = "visible";
  } else {
    const cityCustomSelect = document.getElementById("city-custom-select");
    cityCustomSelect.style.visibility = "hidden";
  }
}

async function updateSelectedCity() {
  const savedRegion = localStorage.getItem("selected-region-select-items");
  if (savedRegion) {
    const regionSelect = document
      .getElementById("region-custom-select")
      .querySelector(".select-selected");
    regionSelect.textContent = savedRegion;

    const regionId = await getRegionIdByName(savedRegion);
    await fillDropdownWithCities(regionId);
  }
}

// file handling

function fileHandling() {
  const fileInput = document.getElementById("al-upload");
  const dropZone = document.getElementById("drop-zone");
  const previewContainer = document.getElementById("preview-container");
  const trashIcon = document.getElementById("trash-icon");

  const savedImage = localStorage.getItem("uploadedImage");
  if (savedImage) {
    console.log("allalala")
    previewContainer.style.backgroundImage = `url(${savedImage})`;
    previewContainer.style.display = "block";
    trashIcon.style.display = "block";
  }

  ["dragover", "dragleave", "drop"].forEach((eventType) => {
    dropZone.addEventListener(eventType, (event) => {
      event.preventDefault();
      event.stopPropagation();
    });
  });

  // dropZone.addEventListener("dragover", () => {
  //   dropZone.classList.add("active");
  // });

  // dropZone.addEventListener("dragleave", () => {
  //   dropZone.classList.remove("active");
  // });

  dropZone.addEventListener("drop", (event) => {
    console.log("im hereee drop");

    const files = event.dataTransfer.files;
    handleFile(files);
    dropZone.classList.remove("active");
  });

  dropZone.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  });

  function handleFile(file) {
    if (file.type.startsWith("image/") && file.size <= 1048576) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;

        previewContainer.style.backgroundImage = `url(${e.target.result})`;
        localStorage.setItem("uploadedImage", imageData);
      };
      previewContainer.style.display = "block";
      trashIcon.style.display = "block";
      reader.readAsDataURL(file);

      trashIcon.addEventListener("click", () => {
        previewContainer.style.backgroundImage = "";
        previewContainer.style.display = "none";
        trashIcon.style.display = "none";
        fileInput.value = "";

        localStorage.removeItem("uploadedImage");
      });
    } else {
      console.error("use image type, < 1mb");
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await fillDropdownWithRegions();
  await fillDropdownWithAgents();

  await updateSelectedCity();

  await citiesDropdownState();
  setupCustomSelect();

  fileHandling();
});
