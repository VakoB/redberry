import SendRequest from "./requests.js";

async function fetchRealEstates() {
  try {
    const estates = new SendRequest("real-estates");

    console.log(await estates.getRequest());
    let result = await estates.getRequest();

    const container = document.getElementById("real-estate-container");
    let counter = 1;

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
  } catch (error) {
    console.error("Error fetching real estates:", error);
  }
}

function makeDropdownVisible() {
  const dropdownActivators = document.querySelectorAll(".dropdown-activator");

  dropdownActivators.forEach((dropdownActivator) => {
    const dropdown = dropdownActivator.querySelector(".filters-dropdown");
    if (!dropdown) {
      console.log("oh no");
      return;
    }

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


fetchRealEstates();
makeDropdownVisible();
