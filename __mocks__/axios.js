// src/__mocks__/axios.js
const mockAxios = {
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    isAxiosError: jest.fn((error) => error.isAxiosError === true), // Mock isAxiosError
};

module.exports = mockAxios;