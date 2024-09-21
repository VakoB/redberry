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
    } else if (selectId === "agent-select-items") {
      const secondOption = items.querySelector("div:nth-child(2)");
      if (secondOption) {
        console.log('mamamaama', secondOption.textContent)
        selected.textContent = secondOption.textContent;
      }
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
        if (this == document.getElementById("add-agent-option")) {
          displayModal();

        } else {
          selected.textContent = this.textContent;
          localStorage.setItem(`selected-${selectId}`, this.textContent);
        }
        items.style.display = "none";
        customSelect.classList.remove("select-activated");


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
    const cityCustomSelect = document.querySelector(".al-city");
    cityCustomSelect.style.visibility = "visible";
  } else {
    const cityCustomSelect = document.querySelector(".al-city");
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

function tradeTypeRadioButtonCheck() {
  const sellRadio = document.getElementById("rb-sell");
  const rentRadio = document.getElementById("rb-rent");

  const savedTradeType = localStorage.getItem("selectedTradeType");

  if (savedTradeType === "sell") {
    sellRadio.checked = true;
  } else if (savedTradeType === "rent") {
    rentRadio.checked = true;
  }

  sellRadio.addEventListener("change", () => {
    if (sellRadio.checked) {
      localStorage.setItem("selectedTradeType", "sell");
    }
  });

  rentRadio.addEventListener("change", () => {
    if (rentRadio.checked) {
      localStorage.setItem("selectedTradeType", "rent");
    }
  });
}

// file handling

function fileHandling() {
  const fileInput = document.getElementById("al-upload");
  const dropZone = document.getElementById("drop-zone");
  const previewContainer = document.getElementById("preview-container");
  const trashIcon = document.getElementById("trash-icon");

  const savedImage = localStorage.getItem("uploadedImage");
  if (savedImage) {
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

  dropZone.addEventListener("drop", (event) => {
    console.log("im hereee drop");

    const files = event.dataTransfer.files;
    handleFile(files);
  });

  dropZone.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFile(file);
    }
  });

  function handleFile(file) {
    if (file.type.startsWith("image/") && file.size <= 1048576) {
      document.getElementById("al-file-messages").style.display = "none";
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
      document.getElementById("al-file-messages").style.display = "block";
    }
  }
}

function ifClickedDeletePreviewImage() {
  const fileInput = document.getElementById("al-upload");
  const previewContainer = document.getElementById("preview-container");
  const trashIcon = document.getElementById("trash-icon");

  trashIcon.addEventListener("click", () => {
    previewContainer.style.backgroundImage = "";
    previewContainer.style.display = "none";
    trashIcon.style.display = "none";
    fileInput.value = "";
    document.getElementById("al-file-messages").style.display = "block";

    localStorage.removeItem("uploadedImage");
  });
}

// validation

function liveValidation() {
  const addressInput = document.getElementById("al-address-input");
  const postalIndexInput = document.getElementById("al-postal-index-input");
  const priceInput = document.getElementById("al-price-input");
  const areaInput = document.getElementById("al-area-input");
  const roomsInput = document.getElementById("al-rooms-input");
  const descriptionInput = document.getElementById("al-text-area");

  addressInput.value = localStorage.getItem("address") || "";
  postalIndexInput.value = localStorage.getItem("postalIndex") || "";
  priceInput.value = localStorage.getItem("price") || "";
  areaInput.value = localStorage.getItem("area") || "";
  roomsInput.value = localStorage.getItem("rooms") || "";
  descriptionInput.value = localStorage.getItem("description") || "";

  validateInput(
    addressInput,
    postalIndexInput,
    priceInput,
    areaInput,
    roomsInput,
    descriptionInput
  );

  addressInput.addEventListener("input", () => {
    const value = addressInput.value;
    localStorage.setItem("address", value);
    validateInput(
      addressInput,
      postalIndexInput,
      priceInput,
      areaInput,
      roomsInput,
      descriptionInput
    );
  });

  postalIndexInput.addEventListener("input", () => {
    const value = postalIndexInput.value;
    localStorage.setItem("postalIndex", value);
    validateInput(
      addressInput,
      postalIndexInput,
      priceInput,
      areaInput,
      roomsInput,
      descriptionInput
    );
  });

  priceInput.addEventListener("input", () => {
    const value = priceInput.value;
    localStorage.setItem("price", value);
    validateInput(
      addressInput,
      postalIndexInput,
      priceInput,
      areaInput,
      roomsInput,
      descriptionInput
    );
  });

  areaInput.addEventListener("input", () => {
    const value = areaInput.value;
    localStorage.setItem("area", value);
    validateInput(
      addressInput,
      postalIndexInput,
      priceInput,
      areaInput,
      roomsInput,
      descriptionInput
    );
  });

  roomsInput.addEventListener("input", () => {
    const value = roomsInput.value;
    localStorage.setItem("rooms", value);
    validateInput(
      addressInput,
      postalIndexInput,
      priceInput,
      areaInput,
      roomsInput,
      descriptionInput
    );
  });

  descriptionInput.addEventListener("input", () => {
    const value = descriptionInput.value;
    localStorage.setItem("description", value);
    validateInput(
      addressInput,
      postalIndexInput,
      priceInput,
      areaInput,
      roomsInput,
      descriptionInput
    );
  });
}

function validationVisualization(container, input, error = false, message) {
  container.innerHTML = "";
  const messageContainer = document.createElement("div");
  const messageElement = document.createElement("p");
  const img = document.createElement("img");
  messageContainer.classList.add("al-validation-message");

  img.alt = "tick icon";

  if (!error) {
    img.src = "/assets/icons/tick-green-icon.svg";
    input.style.borderColor = "#808a93";
    messageElement.style.color = "green";
  } else {
    img.src = "/assets/icons/tick-red-icon.svg";
    input.style.borderColor = "red";
    messageElement.style.color = "red";
  }

  messageElement.textContent = message;

  messageContainer.appendChild(img);
  messageContainer.appendChild(messageElement);

  container.appendChild(messageContainer);
}

function validateInput(
  addressInput,
  postalIndexInput,
  priceInput,
  areaInput,
  roomsInput,
  descriptionInput
) {
  // address
  let allValid = true;
  const addressValue = addressInput.value;
  const addressContainer = document.getElementById("al-address-messages");
  if (addressValue.length == 0) {
    allValid = false;
  } else if (addressValue.length >= 2) {
    addressContainer.innerHTML = "";
    validationVisualization(
      addressContainer,
      addressInput,
      false,
      "მინიმუმ ორი სიმბოლო"
    );
    
  } else {
    allValid = false;
    validationVisualization(
      addressContainer,
      addressInput,
      true,
      "მინიმუმ ორი სიმბოლო"
    );
  }

  const postalIndexValue = postalIndexInput.value;
  const postalIndexContainer = document.getElementById(
    "al-postal-index-messages"
  );
  if (postalIndexValue.length == 0) {
    allValid = false;
  } else if (/^\d*\.?\d*$/.test(postalIndexValue)) {
    validationVisualization(
      postalIndexContainer,
      postalIndexInput,
      false,
      "მხოლოდ რიცხვები"
    );
  } else {
    allValid = false;
    validationVisualization(
      postalIndexContainer,
      postalIndexInput,
      true,
      "მხოლოდ რიცხვები"
    );
  }

  // price
  const priceValue = priceInput.value;
  const priceContainer = document.getElementById("al-price-messages");
  if (priceValue.length == 0) {
    allValid = false;
  } else if (/^\d*\.?\d*$/.test(priceValue)) {
    validationVisualization(
      priceContainer,
      priceInput,
      false,
      "მხოლოდ რიცხვები"
    );
  } else {
    allValid = false;

    validationVisualization(
      priceContainer,
      priceInput,
      true,
      "მხოლოდ რიცხვები"
    );
  }

  const areaValue = areaInput.value;
  const areaContainer = document.getElementById("al-area-messages");
  if (areaValue.length == 0) {
    allValid = false;
  } else if (/^\d*\.?\d*$/.test(areaValue)) {
    validationVisualization(areaContainer, areaInput, false, "მხოლოდ რიცხვები");
  } else {
    allValid = false;

    validationVisualization(areaContainer, areaInput, true, "მხოლოდ რიცხვები");
  }

  const roomsValue = roomsInput.value;
  const roomsContainer = document.getElementById("al-rooms-messages");
  if (roomsValue.length == 0) {
    allValid = false;
  } else if (/^\d+$/.test(roomsValue) && Number.isInteger(Number(roomsValue))) {
    validationVisualization(
      roomsContainer,
      roomsInput,
      false,
      "მხოლოდ მთელი რიცხვები"
    );
  } else {
    allValid = false;

    validationVisualization(
      roomsContainer,
      roomsInput,
      true,
      "მხოლოდ მთელი რიცხვები"
    );
  }

  const descriptionValue = descriptionInput.value;
  const wordCount = descriptionValue.trim().split(" ").length;
  const descriptionContainer = document.getElementById(
    "al-description-messages"
  );
  if (descriptionValue.length == 0) {
    allValid = false;
  } else if (wordCount >= 5) {
    validationVisualization(
      descriptionContainer,
      descriptionInput,
      false,
      "მინიმუმ ხუთი სიტყვა"
    );
  } else {
    allValid = false;

    validationVisualization(
      descriptionContainer,
      descriptionInput,
      true,
      "მინიმუმ ხუთი სიტყვა"
    );
  }
  return allValid;
  
}

async function getCityIdFromName(name) {
  const result = await new SendRequest("cities").getRequest();
  for (let city of result) {
    if (city["name"] == name) {
      return city["id"];
    }
  }
}

async function getAgentIdFromName(name) {
  const result = await new SendRequest("agents").getRequest();
  for (let agent of result) {
    if (agent["name"] == name) {
      return agent["id"];
    }
  }
}

async function ifSubmitOrCancelButtonIsClicked() {
  const submitButton = document.querySelector(".al-button-submit");
  const cancelButton = document.querySelector(".al-button-cancel");

  cancelButton.addEventListener("click", () => {
    window.location.href = "/";
  });

  submitButton.addEventListener("click", async () => {
    const addressInput = document.getElementById("al-address-input");
    const postalIndexInput = document.getElementById("al-postal-index-input");
    const priceInput = document.getElementById("al-price-input");
    const areaInput = document.getElementById("al-area-input");
    const roomsInput = document.getElementById("al-rooms-input");
    const descriptionInput = document.getElementById("al-text-area");
    const citySelectedValue = document.querySelector(".al-city .select-selected");
    const agentSelectedValue = document.querySelector(".al-agent .select-selected");
    const checkedRadioButton = document.querySelector('input[name="trading-type"]:checked');
    const labelText = document.querySelector(`label[for="${checkedRadioButton.id}"]`);
    const fileInput = document.getElementById("al-upload");

  
    const isValid = validateInput(
      addressInput,
      postalIndexInput,
      priceInput,
      areaInput,
      roomsInput,
      descriptionInput
    );

    const cityId = await getCityIdFromName(citySelectedValue.value);
    const agentId = await getAgentIdFromName(agentSelectedValue.value);

    if (isValid) {
      const file = fileInput.files[0];
      console.log(file);

      if (!file) {
        console.error("Please upload a file.");
        return;
      }

      const formData = new FormData();
      formData.append("price", priceInput.value);
      formData.append("zip_code", postalIndexInput.value);
      formData.append("description", descriptionInput.value);
      formData.append("area", areaInput.value);
      formData.append("city_id", cityId);
      formData.append("address", addressInput.value);
      formData.append("agent_id", agentId);
      formData.append("bedrooms", roomsInput.value);
      formData.append("is_rental", labelText.textContent);
      formData.append("image", file);


      const enstance = new SendRequest("real-estate");
      const result = await enstance.postRequest(formData);
      console.log(result);
      
    } else {
      console.error("There are invalid or missing inputs.");
    }
  });
}

function modalCloseButton() {
  document.querySelector(".modal-submit-button").addEventListener("click", () => {
    closeModal();
  })

  document.querySelector(".modal-cancel-button").addEventListener("click", () => {
    closeModal();
  })
}

function displayModal() {
  document.getElementById("modal").showModal();
}

function closeModal() {
  document.getElementById("modal").close();
}

document.addEventListener("DOMContentLoaded", async () => {
  await fillDropdownWithRegions();
  await fillDropdownWithAgents();

  await updateSelectedCity();

  await citiesDropdownState();
  setupCustomSelect();

  fileHandling();
  ifClickedDeletePreviewImage();

  liveValidation();

  ifSubmitOrCancelButtonIsClicked();

  tradeTypeRadioButtonCheck();
  modalCloseButton();
});
