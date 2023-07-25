const User = require("../../models/user");
const { getUser } = require("../../utils/UserOperation");

jest.mock("../../models/user"); // Mock the User model

describe("getUser function", () => {
  it("should return the user when a valid username is provided", async () => {
    // Create a mock user object
    const mockUser = {
      username: "john_doe",
    };

    // Mock the User.findOne method to return the mockUser object
    User.findOne.mockResolvedValue(mockUser);

    // Call the getUser function with the test username
    const result = await getUser("john_doe");

    // Expect the result to match the mockUser object
    expect(result).toEqual(mockUser);
  });

  it("should return an error message when an invalid username is provided", async () => {
    // Mock the User.findOne method to return null (user not found)
    User.findOne.mockResolvedValue(null);

    // Call the getUser function with an invalid username
    const result = await getUser("invaliduser");

    // Expect the result to be an object with an error message
    expect(result).toEqual({ error: "user not found" });
  });
});
