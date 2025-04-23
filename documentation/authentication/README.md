# BetterAuth Documentation

This directory contains comprehensive documentation for using BetterAuth in our project. BetterAuth is a framework-agnostic authentication and authorization library for TypeScript that provides a wide range of authentication features.

## Table of Contents

1. [Getting Started](./getting-started.md) - Basic setup and configuration
2. [Authentication Providers](./authentication-providers.md) - Social sign-on, including Microsoft authentication
3. [Session Management](./session-management.md) - Managing user sessions
4. [Client-Side Authentication](./client-side.md) - Client-side authentication APIs and hooks
5. [Server-Side Authentication](./server-side.md) - Server-side authentication APIs
6. [API Endpoints](./api-endpoints.md) - Available API endpoints and their usage
7. [Database Integration](./database.md) - Database configuration, including Redis secondary storage
8. [User Management](./user-management.md) - User and account management
9. [Role-Based Access Control](./rbac.md) - Managing user roles and permissions
10. [Plugins](./plugins.md) - Using plugins to extend functionality
11. [Hooks and Middleware](./hooks-middleware.md) - Before/After hooks and context usage
12. [TypeScript Integration](./typescript.md) - TypeScript support and type definitions
13. [Error Handling](./error-handling.md) - Handling authentication errors
14. [Security Best Practices](./security.md) - Security considerations and best practices

## Key Features

- **Social Sign-on Integration** - Microsoft, Google, GitHub, and more
- **Session Management** - Secure, customizable sessions
- **Role-Based Access Control** - Fine-grained permission management
- **TypeScript Support** - Full type safety for your authentication flow
- **Plugin Architecture** - Extend functionality with plugins like JWT, API Keys, and more
- **Database Adapters** - Works with Prisma and other database solutions

## Project-Specific Configuration

Our project uses BetterAuth v1.2.7 with Next.js 15. Key configuration files:

- `/src/lib/auth/config.ts` - Server-side configuration
- `/src/lib/auth/client.ts` - Client-side configuration
