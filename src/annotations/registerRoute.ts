import { RequestHandler, Router } from 'express';
import 'reflect-metadata';

// infer type properties uses  to expose types for client without needing to write types for api functions ,it handles itself
export function typeRef<T extends object>(name: string, propertiesOverride?: Record<string, string>): { name: string, properties: Record<string, string> } {

    const properties: Record<string, string> = propertiesOverride || {};
    if (!propertiesOverride) {
        // record utilities for infering properties 
        const keys = Object.keys({} as T) as Array<keyof T>;
        keys.forEach(key => {
            const type = typeof ({} as T)[key];
            properties[key as string] = type === 'number' ? 'number' : type === 'string' ? 'string' : type === 'boolean' ? 'boolean' : 'any';
            console.log(`Property: ${key as string}, Type: ${properties[key as string]}`);
        });
    }
    return {
        name,
        properties
    };
}

// dynamically create routes for backend api endpoints 
export function createRoutes(router: Router, controllerInstances: Record<string, any>) {
    const routes = getRegisteredRoutes();
    routes.forEach(route => {
        const method = route.method.toLowerCase() as 'get' | 'post' | 'put' | 'delete';
        const path = route.path;
        const middlewares = route.middlewares || [];
        const controllerInstance = controllerInstances[route.controllerName];
        if (controllerInstance) {
            router[method](path, ...middlewares, (req, res) => {
                const handler = controllerInstance[route.methodName];
                handler.call(controllerInstance, req, res);
            });
        }
    });
}



//metadata interface
export interface RouteReflectedMetadatas {
    method: string;
    path: string;
    requestType?: { name: string, properties: Record<string, string> } | null;
    responseType?: { name: string, properties: Record<string, string> } | null;
    controllerName: string;
    methodName: string;
    middlewares?: RequestHandler[];
}

// route for metadata storage
const routeReflectedMetadatas: RouteReflectedMetadatas[] = [];

// utility types to infer properties 
type TypeProperties<T> = {
    [K in keyof T]: T[K] extends number ? 'number' : T[K] extends string ? 'string' : T[K] extends boolean ? 'boolean' : 'any';
};

// fnction to expose routes for client and includes custom middleware for server side 
export function exposeRoute(
    method: string,
    path: string,
    requestType: { name: string, properties: Record<string, string> } | null,
    responseType: { name: string, properties: Record<string, string> },
    middlewares: RequestHandler[] = []
) {
    return (
        target: any,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ) => {

        // make sure using reflection
        if (!Reflect.hasMetadata) {
            require('reflect-metadata');
        }

        // Store route metadata
        const metadata: RouteReflectedMetadatas = {
            method,
            path,
            requestType,
            responseType,
            controllerName: target.constructor.name,
            methodName: propertyKey.toString(),
            middlewares
        };


        routeReflectedMetadatas.push(metadata); // saving metedata with all parameters

        // save routing metadata 
        Reflect.defineMetadata('route:method', method, target, propertyKey);
        Reflect.defineMetadata('route:path', path, target, propertyKey);
        Reflect.defineMetadata('route:requestType', requestType, target, propertyKey);
        Reflect.defineMetadata('route:responseType', responseType, target, propertyKey);
        Reflect.defineMetadata('route:middlewares', middlewares, target, propertyKey);
    };
}

// helper function to register routes 
export function registerRoute<T>(
    controller: T,
    method: string,
    path: string,
    requestType: { name: string, properties: Record<string, string> } | null,
    responseType: { name: string, properties: Record<string, string> },
    middlewares: RequestHandler[],
    handlerName: keyof T
) {
    exposeRoute(method, path, requestType, responseType, middlewares)(
        controller, handlerName as string | symbol, Object.getOwnPropertyDescriptor(controller, handlerName as string | symbol)!
    );
}

// returns all registered routes 
export function getRegisteredRoutes(): RouteReflectedMetadatas[] {
    return routeReflectedMetadatas;
}

//   export routes for schema generation in client side 
export function exportRoutesForSchema(): Array<{
    method: string;
    path: string;
    request: { name: string, properties: Record<string, string> } | null;
    response: { name: string, properties: Record<string, string> } | null;
}> {
    return routeReflectedMetadatas.map(route => ({
        method: route.method,
        path: route.path,
        request: route.requestType || null,
        response: route.responseType || null,
    }));
}
