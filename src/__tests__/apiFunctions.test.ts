import axios from 'axios';
import { get_users, post_users, get_users_id } from '../services/apiFunctions';
import { User, UserRequest } from '../services/types';

// Explicitly type the mocked axios
jest.mock('axios');
type MockedAxios = typeof axios & {
    mockResolvedValueOnce: jest.Mock;
    mockRejectedValueOnce: jest.Mock;
  };
  // In your test file
let mockedAxios: MockedAxios;

describe('API Functions', () => {
    beforeEach(() => {
        mockedAxios = axios as MockedAxios;
        jest.spyOn(axios, 'request').mockImplementation(mockedAxios.mockResolvedValueOnce);
      });

    describe('get_users', () => {
        test('should fetch users successfully', async () => {
            const mockUsers: User[] = [{ id: 1, name: 'John Doe' }];
            
            // Mock axios to return the users
            mockedAxios.mockResolvedValueOnce({
                data: mockUsers,
                status: 200,
                statusText: 'OK'
            });

            const result = await get_users();
            
            expect(result).toEqual(mockUsers);
            expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
                method: 'GET',
                url: expect.stringContaining('/users'),
                params: undefined
            }));
        });

        test('should handle axios error', async () => {
            const errorMessage = 'Network Error';
            
            // Mock axios to throw an error with specific structure
            const mockError = new Error(errorMessage) as any;
            mockError.isAxiosError = true;
            mockError.response = {
                data: { message: errorMessage },
                status: 500
            };
            
            mockedAxios.mockRejectedValueOnce(mockError);

            await expect(get_users()).rejects.toThrow(errorMessage);
        });
    });

    describe('post_users', () => {
        test('should create a user successfully', async () => {
            const userRequest: UserRequest = { name: 'John Doe' };
            const createdUser: User = { id: 1, name: 'John Doe' };
            
            // Mock axios to return the created user
            mockedAxios.mockResolvedValueOnce({
                data: createdUser,
                status: 201,
                statusText: 'Created'
            });

            const result = await post_users(userRequest);
            
            expect(result).toEqual(createdUser);
            expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
                method: 'POST',
                url: expect.stringContaining('/users'),
                data: userRequest
            }));
        });

        test('should handle post error', async () => {
            const userRequest: UserRequest = { name: 'John Doe' };
            const errorMessage = 'Creation Failed';
            
            // Mock axios to throw an error with specific structure
            const mockError = new Error(errorMessage) as any;
            mockError.isAxiosError = true;
            mockError.response = {
                data: { message: errorMessage },
                status: 400
            };
            
            mockedAxios.mockRejectedValueOnce(mockError);

            await expect(post_users(userRequest)).rejects.toThrow(errorMessage);
        });
    });

    describe('get_users_id', () => {
        test('should fetch a user by ID successfully', async () => {
            const user: User = { id: 1, name: 'John Doe' };
            
            // Mock axios to return the user
            mockedAxios.mockResolvedValueOnce({
                data: user,
                status: 200,
                statusText: 'OK'
            });

            const result = await get_users_id({ id: 1 });
            
            expect(result).toEqual(user);
            expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
                method: 'GET',
                url: expect.stringContaining(`/users/${user.id}`),
                params: { id: 1 }
            }));
        });

        test('should handle user not found error', async () => {
            const errorMessage = 'User not found';
            
            // Mock axios to throw a not found error with specific structure
            const mockError = new Error(errorMessage) as any;
            mockError.isAxiosError = true;
            mockError.response = {
                data: { message: errorMessage },
                status: 404
            };
            
            mockedAxios.mockRejectedValueOnce(mockError);

            await expect(get_users_id({ id: 999 })).rejects.toThrow(errorMessage);
        });
    });
});