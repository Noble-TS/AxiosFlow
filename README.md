# AxiosFlow
## Revolutionizing Frontend API Interaction
AxiosFlow is a powerful TypeScript library that automatically generates type-safe API functions, providing a seamless and intuitive way to interact with your backend services.

## Key Features
### Comprehensive Type Safety
 - Robust Error Prevention: Ensures type-safe API calls
 - Compile-Time Validation: Catches type mismatches before runtime
 - Enhanced Code Quality: Reduces potential errors in API interactions
### Intelligent Type Generation
 - Automatic Function Creation:
 - Generates fully typed API client functions
 - Eliminates manual type definitions
 - Dramatically reduces boilerplate code
 - Compile-Time Type Safety:
 - Guarantees type consistency across API interactions
 - Provides comprehensive type inference
### End-to-End Type Inference
 - Backend to Frontend Type Mapping:
 - Seamless type propagation
 - Catches potential type mismatches during development
### Code Reliability:
 - Enhances type consistency
 - Minimizes runtime type-related errors
## Core Capabilities
 - Automatic API function generation
 - Type-safe API interactions
 - Dynamic URL parameter support
 - Minimal configuration required



# AxiosFlow API

AxiosFlow API is an TypeScript library, which has the potential to completely change the way we do backend API development. With intelligent routing, type-safe implementations, and automatic schema generation, it takes care of most of the complicated things while you build your robust web APIs.

## Main Benefits

- Type-Safe Routing: Compile-time type checking for API endpoints
- Dynamic Route Generation: Automatically create routes with minimal configuration
- Intelligent Schema Export: Generate type-safe API schemas for frontend consumption
- Seamless Express Integration: Works perfectly with Express.js
- Decorator-Based API Definition: Clean, intuitive API method declarations

## Configuration

### Backend setup

#### Installation

#### Install core dependencies
```
npm install express cors dotenv axiosflow-api
```

#### Install TypeScript and types
```
npm install -D typescript @types/express @types/cors ts-node
```

## Step-by-Step Setup

### 1. Create Controller (userController.ts)

```typescript
import { Request, Response } from 'express';

// Interfaces for type safety
export class UserRequest {
  name: string | undefined;
}

export class User {
  id: number | undefined;
  name: string | undefined;
}

export class UserController {
  private users: User[] = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Doe' },
  ];

  getUsers(req: Request, res: Response): Response {
    return res.status(200).json({
      status: 'success',
      data: this.users,
    });
  }

  getUserById(req: Request, res: Response): Response {
    const userId = parseInt(req.params.id);
    const user = this.users.find((u) => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
      });
    }
    
    return res.status(200).json({
      status: 'success',
      data: user,
    });
  }

  createUser(req: Request, res: Response): Response {
    const { name } = req.body as UserRequest;
    
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Name is required',
      });
    }
    
    const newUser = { 
      id: this.users.length + 1, 
      name 
    };
    
    this.users.push(newUser);
    return res.status(201).json({
      status: 'success',
      data: newUser,
    });
  }
} 
```
### 2. Create User Routes (userRoutes.ts)

```typescript
import { registerRoute, typeRef } from 'axiosflow-api';
import { UserController, UserRequest, User } from '../controllers/userController';

// Create an instance of the controller
const userController = new UserController();

// Define routes and register them dynamically
export function registerUserRoutes() {
  registerRoute(
    userController, 
    'GET', 
    '/users', 
    null, 
    typeRef<User>('User', { id: 'number', name: 'string' }), 
    [], 
    'getUsers'
  );
  
  registerRoute(
    userController, 
    'GET', 
    '/users/:id', 
    null, 
    typeRef<User>('User', { id: 'number', name: 'string' }), 
    [], 
    'getUserById'
  );
  
  registerRoute(
    userController, 
    'POST', 
    '/users', 
    typeRef<UserRequest>('UserRequest', { name: 'string' }), 
    typeRef<User>('User', { id: 'number', name: 'string' }), 
    [], 
    'createUser'
  );
}

// Export the controller instance for use in the router
export const controllerInstances = {
  UserController: userController,
};
```
### 3. Create Router (router.ts)

```typescript
import { Router } from 'express';
import { createRoutes } from 'axiosflow-api';
import { registerUserRoutes, controllerInstances } from './userRoutes';

const router = Router();

// Register user routes
registerUserRoutes();

// Dynamically create routes based on registered metadata
createRoutes(router, controllerInstances);

export default router;
```
### 4. Create Server (server.ts)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/router';
import { exportRoutesForSchema } from 'axiosflow-api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);

// Route to export API schema
app.get('/axiosflow', (req, res) => {
  const routes = exportRoutesForSchema();
  res.json(routes);
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong', 
    error: process.env.NODE_ENV !== 'production' ? err : {} 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```
### Advanced Configuration: Middleware and Interceptors

```typescript
import { Request, Response, NextFunction } from 'express';
import { registerRoute, typeRef } from 'axiosflow-api';

// Logging Middleware
export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

// Validation Middleware
export const validateUserName = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  
  if (!name || name.length < 2) {
    return res.status(400).json({
      status: 'error',
      message: 'Name must be at least 2 characters long'
    });
  }
  
  next();
};

export function registerUserRoutes() {
  // GET Users - Simple logging middleware
  registerRoute(
    userController, 
    'GET', 
    '/users', 
    null, 
    typeRef<User>('User', { id: 'number', name: 'string' }), 
    [loggingMiddleware], 
    'getUsers'
  );
  
  // GET User by ID - Authentication and logging
  registerRoute(
    userController, 
    'GET', 
    '/users/:id', 
    null, 
    typeRef<User>('User', { id: 'number', name: 'string' }), 
    [validateUserName, loggingMiddleware], 
    'getUserById'
  );
  

```
## Client Setup 

### Prerequisites

Node.js (v16+)
TypeScript
Axios

#### Global installation  via npm 
```
npm install -g axiosflow
```
#### Verify Installation
```t
axiosflow --help 
```
#### Generate API Functions

```t
# Basic generation
axiosflow generate

# With specific options
axiosflow generate -b http://localhost:3000 -o ./src/services
```
### 3. Generated Files Structure in project structure

```t
src/services/
├── apiFunctions.ts     # Generated API functions
├── apiConfig.ts        # API endpoint configurations
├── types.ts            # Type definitions
└── api-schema.json     # API schema documentation
```
## Usage in React/TypeScript Project
### Fetch Users

```typescript
import { get_users } from './services/apiFunctions';

async function UserList() {
  try {
    const users = await get_users();
    // Handle users
  } catch (error) {
    // Handle error
  }
}
```
### Create User

```typescript
import { post_users } from './services/apiFunctions';

async function createUser(name: string) {
  try {
    const newUser = await post_users({ name });
    // Handle new user
  } catch (error) {
    // Handle error
  }
}

```
or in components :

```typescript
import React, { useEffect, useState } from 'react';
import { get_users, post_users, get_users_id } from '../services/apiFunctions';
import { User, UserRequest } from '../services/types';

const UserComponent: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    

    // Fetch the list of users from the API on component mount 
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('Attempting to fetch users...');
                const userList = await get_users();
                
                console.log('Fetched Users:', userList);
                
                if (userList.length > 0) {
                    setUsers(userList);
                } else {
                    setError('No users found');
                }
            } catch (err) {
                console.error('Fetch Users Error:', err);
                
                const errorMessage = err instanceof Error 
                    ? err.message 
                    : 'An unexpected error occurred';
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);
return (
    <div> 
    <h1>Users Lists</h1>
    </div>
);

};
```
Check the `examples` folder for implementation samples on both the client and server sides