import axios, { isAxiosError } from 'axios'; 
import { BASE_URL, endpoints } from './apiConfig';
import { UserRequest, User } from './types';

class ApiError extends Error {
    constructor(public message: string, public status?: number) {
        super(message);
        this.name = 'ApiError';
    }
}


// Utility function to handle errors
const handleError = (error: unknown): { status: string; message: string; error?: unknown } => {

    // Log the error message if it has a response structure
    const message = (error as any).response?.data?.message || 'An unexpected error occurred';
    
    // Return the error status and message
    return { status: 'error', message, error }; // Return the error itself
};
// Function to get users
export const get_users = async (data?: Record<string, any>): Promise<{ status: string; data?: User[]; message?: string }> => {
    const url = `${BASE_URL}${endpoints.get_users}`;

    try {
        const response = await axios.get(url, { params: data });
        return { status: 'success', data: response.data.results }; // Adjust based on your API response structure
    } catch (error) {
        const { status, message } = handleError(error);
        return { status, message };
    }
};
// Function to post a new user
export const post_users = async (userRequest: UserRequest): Promise<{ status: string; message?: string; data?: User }> => {
    const url = `${BASE_URL}${endpoints.post_users}`;

    // Validate the user request
    if (!userRequest.name) {
        return {
            status: 'error',
            message: 'Name is required',
        };
    }

    try {
        const response = await axios.post(url, userRequest);
        return { status: 'success', data: response.data }; // Assuming response.data is a single user object
    } catch (error) {
        const { status, message } = handleError(error);
        return { status, message };
    }
};

/// Function to get a user by ID
export const get_users_id = async (userId: { id: number }): Promise<{ status: string; data?: User; message?: string; error?: unknown }> => {
    const url = `${BASE_URL}${endpoints.get_users}/${userId.id}`;

    try {
        const response = await axios.get(url);
        return { status: 'success', data: response.data }; // Assuming response.data is a single user object
    } catch (error) {
        const { status, message, error: originalError } = handleError(error);
        return { status, message }; // Return the error status and message
    }
};