export default class SendRequest {
  constructor(page) {
    this.url = `https://api.real-estate-manager.redberryinternship.ge/api/${page}`;
    this.token = "9cfc535d-5997-41b1-8e02-a44f5571cd1a";
  }
  async getRequest() {
    try {
      let response = await fetch(this.url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
      });
      let result = response.json();
      return result;
    } catch (error) {
      console.error("Error fetching real estates:", error);
      return [];
    }
  }

  async postRequest(data) {
    try {
      let response = await fetch(this.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(data),
      });
      let result = response.json();
      return result;
    } catch (error) {
      console.error("Error fetching real estates:", error);
      return [];
    }
  }

}
