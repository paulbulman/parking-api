const index = require("./index");

describe("index handler", () => {
  it("returns a 200 status code", async () => {
    const response = await index.handler();
    expect(response.statusCode).toBe(200);
  });
});
