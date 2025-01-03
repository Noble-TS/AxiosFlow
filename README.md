# AxiosFlow

[![Weekly Downloads](https://img.shields.io/npm/dw/axiosflow?label=Downloads&color=blue)](https://www.npmjs.com/package/axiosflow)
[![Version](https://img.shields.io/npm/v/axiosflow)](https://www.npmjs.com/package/axiosflow)
[![License](https://img.shields.io/npm/l/axiosflow)](https://www.npmjs.com/package/axiosflow)
[![GitHub Issues](https://img.shields.io/github/issues/Noble-TS/AxiosFlow)](https://github.com/Noble-TS/AxiosFlow/issues)
[![GitHub Stars](https://img.shields.io/github/stars/Noble-TS/AxiosFlow)](https://github.com/Noble-TS/AxiosFlow/stargazers)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Noble-TS/AxiosFlow/ci.yml)](https://github.com/Noble-TS/AxiosFlow/actions)

**Automatically Generate Type-Safe API Functions for Your RESTful APIs**

AxiosFlow is a powerful TypeScript library that simplifies API consumption by automatically generating type-safe API functions for your RESTful APIs. It eliminates boilerplate code, ensures compile-time type safety, and works seamlessly with Express.js and Axios.

---

## Why AxiosFlow?

Building type-safe APIs can be time-consuming and error-prone. AxiosFlow solves this by:

- **Automating API Function Generation**: No more writing repetitive API call functions.
- **Ensuring Compile-Time Type Safety**: Catch errors before runtime with TypeScript.
- **Reducing Boilerplate Code**: Focus on building features, not writing API glue code.
- **Seamless Integration**: Works with your existing Express.js backend and Axios client.

---

## Key Features

### Comprehensive Type Safety
- **Robust Error Prevention**: Ensures type-safe API calls.
- **Compile-Time Validation**: Catches type mismatches before runtime.
- **Enhanced Code Quality**: Reduces potential errors in API interactions.

### Intelligent Type Generation
- **Automatic Function Creation**: Generates fully typed API client functions.
- **Eliminates Manual Type Definitions**: Dramatically reduces boilerplate code.
- **Compile-Time Type Safety**: Guarantees type consistency across API interactions.

### End-to-End Type Inference
- **Backend to Frontend Type Mapping**: Seamless type propagation.
- **Catches Potential Type Mismatches**: Ensures consistency during development.

### Core Capabilities
- **Automatic API Function Generation**: Generates type-safe API functions with minimal configuration.
- **Dynamic URL Parameter Support**: Easily handle dynamic routes like `/users/:id`.
- **Minimal Configuration Required**: Works out of the box with Express.js and Axios.

---

## How AxiosFlow Compares to Other Tools

| Feature/Tool          | AxiosFlow               | tRPC                   | OpenAPI (Swagger)      | GraphQL Code Generator | Zodios                 | Manual Typing          |
|------------------------|-------------------------|------------------------|------------------------|------------------------|------------------------|------------------------|
| **Type Safety**        | Compile-time            | Compile-time           | Runtime                | Compile-time           | Runtime (Zod)          | Manual                 |
| **Ease of Use**        | Easy (Express.js + Axios)| Moderate (tRPC setup)  | Moderate (YAML/JSON)   | Moderate (GraphQL)     | Moderate (Zod schemas) | Manual                 |
| **Flexibility**        | High (framework-agnostic)| Low (tRPC-specific)    | High (RESTful APIs)    | Low (GraphQL-only)     | High (Zod integration) | High                   |
| **Boilerplate Code**   | Minimal                 | Minimal                | Moderate               | Minimal                | Moderate               | High                   |

AxiosFlow is the **simplest and most flexible solution** for adding type safety to RESTful APIs without requiring a new framework or maintaining a separate schema.

---

## Quick Start

## Examples

Check out the [`examples`](./examples) folder for complete implementation samples:

- **[Client](./examples/client)**: A React/TypeScript frontend using AxiosFlow.
- **[Server](./examples/server)**: An Express.js backend with AxiosFlow integration.

## CodeSandbox

Check out the live examples on CodeSandbox to see AxiosFlow in action:

[![Client and Server Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/github/Noble-TS/examples)  


### Backend setup

#### Installation

#### Install core dependencies
```
npm install express@4.21.2  cors dotenv axiosflow-api
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


//  CSRF middleware
const csrfProtection: RequestHandler = (req, res, next) => {
  csrf({ cookie: true });
  next();
};

// logger middleware
const logger: RequestHandler = (req, res, next) => {
    console.log(`${req.method} ${req.path}`);
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
    [csrfProtection,logger], 
    'getUsers'
  );
  
  // GET User by ID - Authentication and logging
  registerRoute(
    userController, 
    'GET', 
    '/users/:id', 
    null, 
    typeRef<User>('User', { id: 'number', name: 'string' }), 
    [csrfProtection, logger], 
    'getUserById'
  );
  
}
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
