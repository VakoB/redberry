import SendRequest from "./SendRequest.js";
import FilterClass from "./FilterClass.js";

async function fetchAllRealEstates() {
  try {
    const estates = new SendRequest("real-estates");

    let result = await estates.getRequest();

    const container = document.getElementById("real-estate-container");
    let counter = 1;

    const savedFilters = JSON.parse(localStorage.getItem("realEstateFilters"));
    if (savedFilters) {
      const filterClass = new FilterClass();
      filterClass.setFilterCriteria(savedFilters);
      updateRealEstateData(savedFilters);
      addFilterResultText(savedFilters);
    } else {
      result.forEach((element) => {
        const a = document.createElement("a");
        a.setAttribute("href", "#");
        const card = document.createElement("div");
        card.classList.add("real-estate-element", `r-${counter}`);
        let isRentalText = element["is_rental"] == 0 ? "იყიდება" : "ქირავდება";
        card.innerHTML = `
              <div class="is-rental">${isRentalText}</div>
              <img src="${element["image"]}" alt="real estate picture" />
              <div class="real-estate-text">
                <h2>${parseFloat(element["price"])} ₾</h2>
                <div class="real-estate-location">
                  <img
                    src="/assets/icons/location-icon.svg"
                    alt="location icon"
                  />
                  <p>${element["city"]["name"]}, ${element["address"]}</p>
                </div>
                <div class="real-estate-details">
                  <div class="re-rooms">
                    <img src="/assets/icons/bed-icon.svg" alt="bed icon" />
                    <p>${element["bedrooms"]}</p>
                  </div>
                  <div class="re-area">
                    <img src="/assets/icons/area-icon.svg" alt="area icon" />
                    <p>${parseFloat(element["area"])} მ <span>2</span></p>
                  </div>
                  <div class="re-zipcode">
                    <img
                      src="/assets/icons/zipcode-icon.svg"
                      alt="zipcode icon"
                    />
                    <p>${element["zip_code"]}</p>
                  </div>
                </div>
              </div>
              `;
        container.appendChild(card);
        counter += 1;
      });
    }
  } catch (error) {
    console.error("Error fetching real estates:", error);
  }
}

async function fetchRegions() {
  try {
    const regions = new SendRequest("regions");

    let result = await regions.getRequest();
    const dropdownRegions = document.querySelector(".drop-regions");
    const savedCheckedRegions =
      JSON.parse(localStorage.getItem("checkedRegions")) || [];
    result.forEach((element) => {
      let dropElement = document.createElement("div");
      dropElement.innerHTML = `
                  <div class="drop-element">
                    <input
                      class="region-dropdown-check"
                      id="region-checkbox-${element["id"]}"
                      title="region-checkbox-${element["id"]}"
                      type="checkbox"
                    />
                    <label for="region-checkbox-${element["id"]}">${element["name"]}</label>
                  </div>`;

      dropdownRegions.append(dropElement);

      // const checkbox = dropElement.querySelector(
      //   `#region-checkbox-${element["id"]}`
      // );
      // if (savedCheckedRegions.includes(element["id"])) {
      //   checkbox.checked = true;
      // } else {
      //   checkbox.checked = false;
      // }
    });
  } catch (error) {
    console.error("Error fetching real estates:", error);
  }
}

function makeDropdownVisible() {
  const dropdownActivators = document.querySelectorAll(".dropdown-activator");

  dropdownActivators.forEach((dropdownActivator) => {
    const dropdown = dropdownActivator.querySelector(".filters-dropdown");
    if (!dropdown) return;

    let hideOtherDropdowns = () => {
      const allDropdowns = document.querySelectorAll(".filters-dropdown");
      allDropdowns.forEach((dropDown) => {
        if (dropDown !== dropdown) {
          dropDown.style.display = "none";
        }
      });
    };

    let toggleDropdown = () => {
      hideOtherDropdowns();
      dropdown.style.display =
        dropdown.style.display == "none" ? "block" : "none";
    };

    dropdownActivator.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDropdown();
    });

    dropdown.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", (event) => {
      dropdown.style.display = "none";
    });
  });
}

let filterClass = new FilterClass();

function saveFilterState() {
  localStorage.setItem(
    "realEstateFilters",
    JSON.stringify(filterClass.getFilterCriteria())
  );
}

// function saveCheckedRegionState() {
//   localStorage.setItem(
//     "checkedRegions",
//     JSON.stringify(filterClass.getFilterCriteria().regions)
//   );
// }

function filterRealEstates() {
  const region = document.querySelector(".region");
  const price = document.querySelector(".price");
  const area = document.querySelector(".area");
  const rooms = document.querySelector(".rooms");

  const regionButton = region.querySelector("button");
  const priceButton = price.querySelector("button");
  const areaButton = area.querySelector("button");
  const roomsButton = rooms.querySelector("button");

  let regionsChecked = () => {
    const regionCheckboxes = region.querySelectorAll(".region-dropdown-check");
    let regionCheckedCheckboxes = Array.from(regionCheckboxes).filter(
      (checkbox) => checkbox.checked
    );
    let regionCheckedCheckboxesId = regionCheckedCheckboxes.map((element) =>
      parseInt(element.id.split("-")[2])
    );
    // saveCheckedRegionState();

    return regionCheckedCheckboxesId;
  };

  let priceRange = () => {
    let priceFrom = parseFloat(price.querySelector(".from").value);
    let priceTo = parseFloat(price.querySelector(".to").value);

    console.log(priceFrom, priceTo);

    if (!Number.isNaN(priceFrom) && Number.isNaN(priceTo)) {
      priceTo = Infinity;
    } else if (Number.isNaN(priceFrom) && !Number.isNaN(priceTo)) {
      priceFrom = 0;
    } else if (Number.isNaN(priceFrom) && Number.isNaN(priceTo)) {
      priceFrom = 0;
      priceTo = Infinity;
    } else if (priceFrom > priceTo) {
      return false;
    }
    console.log('let priceRange = () =>:', [priceFrom, priceTo]);
    return [priceFrom, priceTo];
  };

  let areaRange = () => {
    let areaFrom = parseFloat(area.querySelector(".from").value);
    let areaTo = parseFloat(area.querySelector(".to").value);

    if (!Number.isNaN(areaFrom) && Number.isNaN(areaTo)) {
      To = Infinity;
    } else if (Number.isNaN(areaFrom) && !Number.isNaN(areaTo)) {
      areaFrom = 0;
    } else if (Number.isNaN(areaFrom) && Number.isNaN(areaTo)) {
      areaFrom = 0;
      areaTo = Infinity;
    } else if (areaFrom > areaTo) {
      return false;
    }
    console.log('let areaRange = () =>:', [areaFrom, areaTo]);

    return [areaFrom, areaTo];
  };

  let roomsNumber = () => {
    const roomsNum = parseInt(rooms.querySelector(".drop-rooms input").value);
    return roomsNum;
  };

  let makeDropdownInvisible = (type) => {
    const dropdownActivator = document.querySelector(`.${type}`);
    const dropdown = dropdownActivator.querySelector(".filters-dropdown");
    dropdown.style.display = "none";
  };

  let clearRoomsInput = () => {
    let roomsInput = document.querySelector(".drop-rooms input");
    roomsInput.value = "";
  };

  regionButton.addEventListener("click", () => {
    filterClass.updateData("regions", regionsChecked());
    saveFilterState();
    addFilterResultText(filterClass.getFilterCriteria());
    updateRealEstateData(filterClass.getFilterCriteria());
    makeDropdownInvisible("region");
  });
  priceButton.addEventListener("click", () => {
    if (priceRange() === false) {
      inputRangeError(priceButton);
    } else {
      filterClass.updateData("price", priceRange());
      clearInputRangeError(priceButton);
      saveFilterState();
      addFilterResultText(filterClass.getFilterCriteria());
      updateRealEstateData(filterClass.getFilterCriteria());
      makeDropdownInvisible("price");
    }
  });
  areaButton.addEventListener("click", () => {
    if (areaRange() === false) {
      inputRangeError(areaButton);
    } else {
      filterClass.updateData("area", areaRange());
      clearInputRangeError(areaButton);
      saveFilterState();
      console.log(filterClass.getFilterCriteria());
      addFilterResultText(filterClass.getFilterCriteria());
      updateRealEstateData(filterClass.getFilterCriteria());
      makeDropdownInvisible("area");
    }
  });
  roomsButton.addEventListener("click", () => {
    filterClass.updateData("rooms", roomsNumber());
    saveFilterState();
    addFilterResultText(filterClass.getFilterCriteria());
    updateRealEstateData(filterClass.getFilterCriteria());
    clearRoomsInput();
    makeDropdownInvisible("rooms");
  });
}

async function updateRealEstateData(filteredObject) {
  const estates = new SendRequest("real-estates");

  let result = await estates.getRequest();

  const container = document.getElementById("real-estate-container");
  container.innerHTML = "";

  let regionDefault =
    filteredObject["regions"].includes(-1) ||
    filteredObject["regions"].length == 0;
  let priceDefault =
    filteredObject["price"][0] === -1 && filteredObject["price"][1] === -1;
  let areaDefault =
    filteredObject["area"][0] === -1 && filteredObject["area"][1] === -1;
  let roomsDefault = filteredObject["rooms"] === -1;
  let AllDefault = regionDefault && priceDefault && areaDefault && roomsDefault;

  let counter = 1;
  for (let element of result) {
    let checkRegion =
      !regionDefault &&
      filteredObject["regions"].includes(element["city"]["region_id"]);

    let checkPrice =
      !priceDefault &&
      filteredObject["price"][0] <= element["price"] &&
      filteredObject["price"][1] >= element["price"];

    let checkArea =
      !areaDefault &&
      filteredObject["area"][0] <= element["area"] &&
      filteredObject["area"][1] >= element["area"];

    let checkRooms =
      !roomsDefault && filteredObject["rooms"] == element["bedrooms"];

    if (AllDefault || checkRegion || checkPrice || checkArea || checkRooms) {
      const a = document.createElement("a");
      a.setAttribute("href", "#");
      const card = document.createElement("div");
      card.classList.add("real-estate-element", `r-${counter}`);
      let isRentalText = element["is_rental"] == 0 ? "იყიდება" : "ქირავდება";
      card.innerHTML = `
            <div class="is-rental">${isRentalText}</div>
            <img src="${element["image"]}" alt="real estate picture" />
            <div class="real-estate-text">
              <h2>${parseFloat(element["price"])} ₾</h2>
              <div class="real-estate-location">
                <img
                  src="/assets/icons/location-icon.svg"
                  alt="location icon"
                />
                <p>${element["city"]["name"]}, ${element["address"]}</p>
              </div>
              <div class="real-estate-details">
                <div class="re-rooms">
                  <img src="/assets/icons/bed-icon.svg" alt="bed icon" />
                  <p>${element["bedrooms"]}</p>
                </div>
                <div class="re-area">
                  <img src="/assets/icons/area-icon.svg" alt="area icon" />
                  <p>${parseFloat(element["area"])} მ <span>2</span></p>
                </div>
                <div class="re-zipcode">
                  <img
                    src="/assets/icons/zipcode-icon.svg"
                    alt="zipcode icon"
                  />
                  <p>${element["zip_code"]}</p>
                </div>
              </div>
            </div>
            `;
      container.appendChild(card);
      counter += 1;
    } else {
      container.innerHTML = `
            <p class="no-content-shown">აღნიშნული მონაცემებით განცხადება არ იძებნება</p>
            `;
    }
  }
}

async function getRegionNameById(id) {
  const response = new SendRequest("regions");
  let regions = await response.getRequest();
  if (!response) {
    return "";
  }
  for (let region of regions) {
    if (region["id"] === id) {
      return region["name"];
    }
  }
}

async function addFilterResultText(filters) {
  const activeFiltersContainer = document.querySelector(".active-filters");

  activeFiltersContainer.innerHTML = "";

  console.log("addFilterResultText(): ", filters);

  if (!filters.regions.includes(-1) && filters.regions.length > 0) {
    let regionIds = filters.regions;
    for (let regionId of regionIds) {
      const regionName = await getRegionNameById(regionId);
      const content = document.createElement("div");
      content.classList.add("filtered-content");

      content.innerHTML = `
        <p class="filter-results region-filter-results">${regionName}</p>
        <img class="filter-remove regions" id="region-${regionId}" src="/assets/icons/x.svg" alt="x" />
      `;
      activeFiltersContainer.appendChild(content);
    }
  }
  if (
    filters.price &&
    filters["price"][0] !== -1 &&
    filters["price"][1] !== -1
  ) {
    const content = document.createElement("div");
    content.classList.add("filtered-content");
    let priceToText =
      filters.price[1] == Infinity || filters.price[1] == null
        ? "∞"
        : filters.price[1];
    const priceText = `${filters.price[0] || 0} ₾ - ${priceToText} ₾`;
    content.innerHTML = `
        <p class="filter-results area-filter-results">${priceText}</p>
        <img class="filter-remove price" src="/assets/icons/x.svg" alt="x" />
    `;

    activeFiltersContainer.appendChild(content);
  }
  if (filters.area && filters["area"][0] !== -1 && filters["area"][1] !== -1) {
    const content = document.createElement("div");
    content.classList.add("filtered-content");
    let areaToText =
      filters.area[1] == Infinity || filters.price[1] == null
        ? "∞"
        : filters.area[1];
    const areaText = `${filters.area[0] || 0} ₾ - ${areaToText} ₾`;
    content.innerHTML = `
        <p>${filters.area[0] || 0} მ<span>2</span></p>
        <p>- ${areaToText} მ<span>2</span></p>
        <img class="filter-remove area" src="/assets/icons/x.svg" alt="x" />
    `;
    activeFiltersContainer.appendChild(content);
  }
  if (filters.rooms && filters.rooms !== -1) {
    const content = document.createElement("div");
    content.classList.add("filtered-content");

    content.innerHTML = `
        <p>${filters["rooms"]}</p>
        <img class="filter-remove rooms" src="/assets/icons/x.svg" alt="x" />
    `;
    activeFiltersContainer.appendChild(content);
  }

  clearFiltersButtonAppearance();
}

function removeFilterResultText(xButton) {
  if (Array.from(xButton.classList).includes("regions")) {
    xButton.parentElement.remove();
    const regionId = parseInt(xButton.id.split("-")[1]);
    filterClass.removeFilter("regions", regionId);
  } else {
    xButton.parentElement.remove();
    filterClass.removeFilter(xButton.classList[1]);
  }
}

function removeFilterResults() {
  document
    .querySelector(".active-filters")
    .addEventListener("click", (event) => {
      if (event.target.classList.contains("filter-remove")) {
        removeFilterResultText(event.target);
        updateRealEstateData(filterClass.getFilterCriteria());
        clearFiltersButtonAppearance();
        // saveCheckedRegionState();
      }
    });
}

function removeEveryFilter() {
  document
    .querySelector(".delete-filtered-content")
    .addEventListener("click", () => {
      document.querySelector(".active-filters").innerHTML = "";
      filterClass.resetToDefault();
      updateRealEstateData(filterClass.getFilterCriteria());
      clearFiltersButtonAppearance();
      // saveCheckedRegionState();
    });
}

function clearFiltersButtonAppearance() {
  if (document.querySelector(".active-filters").innerHTML.trim() == "") {
    document.querySelector(".delete-filtered-content").style.display = "none";
  } else {
    document.querySelector(".delete-filtered-content").style.display = "block";
  }
}

function loadFilterState() {
  const savedFilters = localStorage.getItem("realEstateFilters");
  if (savedFilters) {
    filterClass.setFilterCriteria(JSON.parse(savedFilters));
  } else {
    filterClass.resetToDefault();
  }
}

function rangeValueClickState() {
  // price / area ranges
  const fromRangeLists = document.querySelectorAll(".min > div > p");
  const toRangeLists = document.querySelectorAll(".max > div > p");

  fromRangeLists.forEach((fromRangeElement) => {
    handleRangeClick("from", fromRangeElement);
  });

  toRangeLists.forEach((toRangeElement) => {
    handleRangeClick("to", toRangeElement);
  });

  function handleRangeClick(fromTo, element) {
    element.addEventListener("click", function () {
      const input = element
        .closest(".filters-dropdown")
        .querySelector(`input.${fromTo}`);
      if (input) {
        input.value = extractNumber(element.textContent);
      }
    });
  }

  function extractNumber(text) {
    const match = text.match(/[\d,.]+/);
    return match ? match[0].replace(/,/g, "") : null;
  }
}

function inputRangeError(button) {
  const errorMessage = button
    .closest(".filters-dropdown")
    .querySelector(".error-message");
  errorMessage.style.display = "block";

  const inputFrom =
    button.parentElement.parentElement.querySelector(".from").parentElement;
  const inputTo =
    button.parentElement.parentElement.querySelector(".to").parentElement;

  inputFrom.classList.add("border-red");
  inputTo.classList.add("border-red");
}

function clearInputRangeError(button) {
  const errorMessage = button
    .closest(".filters-dropdown")
    .querySelector(".error-message");
  errorMessage.style.display = "none";

  const inputFrom = button.parentElement.parentElement.querySelector(".from");
  const inputTo = button.parentElement.parentElement.querySelector(".to");

  inputFrom.value = "";
  inputTo.value = "";
  inputFrom.parentElement.classList.remove("border-red");
  inputTo.parentElement.classList.remove("border-red");
}

// function addListing() {

// }

fetchRegions();
fetchAllRealEstates();
makeDropdownVisible();
filterRealEstates();
removeFilterResults();
loadFilterState();
removeEveryFilter();
rangeValueClickState();
