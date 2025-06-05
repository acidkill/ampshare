// /home/acidkill/repos/ampshare/__mocks__/jsonwebtoken.js
const jwt = jest.requireActual('jsonwebtoken');

module.exports = {
  ...jwt, // Export all actual members
  sign: jest.fn(), // Mock the sign function
};
