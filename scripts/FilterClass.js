import SendRequest from "./SendRequest.js";

export default class FilterClass {
  constructor() {
    this.filterCriteria = {
      regions: [-1],
      price: [-1, -1],
      area: [-1, -1],
      rooms: -1,
    };

    this.activeFilters = [];
  }

  updateData(key, data) {
    this.filterCriteria[key] = data;
  }

  getFilterCriteria() {
    return this.filterCriteria;
  }

  setFilterCriteria(newObject) {
    this.filterCriteria = newObject;
  }

  removeFilter(type, id = 0) {
    let filters = this.getFilterCriteria();

    switch (type) {
      case "regions":
        let index = filters[type].indexOf(id);
        if (index > -1) {
          filters[type].splice(index, 1);
          console.log("Removed region with id", id);
          if (filters[type].length === 0) {
            this.filterCriteria[type] = [-1];
          }
        }
        break;

      case "price":
      case "area":
        this.filterCriteria[type] = [-1, -1];
        break;

      case "rooms":
        this.filterCriteria[type] = -1;
        break;
    }

    localStorage.setItem(
      "realEstateFilters",
      JSON.stringify(this.getFilterCriteria())
    );
  }

  resetToDefault() {
    this.filterCriteria["regions"] = [-1];
    this.filterCriteria["price"] = [-1, -1];
    this.filterCriteria["area"] = [-1, -1];
    this.filterCriteria["rooms"] = -1;

    localStorage.setItem(
      "realEstateFilters",
      JSON.stringify(this.getFilterCriteria())
    );
  }
}

// deleteDate(key, value) {

// }
