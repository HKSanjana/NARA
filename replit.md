# NARA Research Institution Management System

## Overview

This is a full-stack web application for the National Aquatic Resources Research and Development Agency (NARA) of Sri Lanka. The system provides a comprehensive platform for managing research activities, divisions, publications, environmental monitoring data, and public services including RTI requests and contact management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom NARA brand colors (navy, blue, light)
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with custom middleware
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL (DATABASE_URL configured)
- **Authentication**: Session-based authentication with role management
- **File Upload**: Multer for document management
- **API Design**: RESTful endpoints with proper error handling and type safety

### Monorepo Structure
The application uses a monorepo pattern with three main directories:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript schemas and types

## Key Components

### Database Schema (shared/schema.ts)
- **Users**: Authentication and user profiles with role-based access
- **Divisions**: Research divisions with staff and service information
- **Calendar Events**: Research activity scheduling and management
- **Documents**: File management for publications and reports
- **RTI Requests**: Right to Information request handling
- **Sea Level Data**: Environmental monitoring data storage
- **Contact Messages**: Public inquiry management
- **Sessions**: Authentication session storage

### Authentication System
- JWT-based authentication with role-based access control
- Roles: user, admin, researcher
- Protected routes with middleware for admin-only functions
- Password hashing using bcryptjs

### File Management
- Document upload and storage system
- Categorized file organization (reports, publications, guidelines, forms)
- Download tracking and access control

### Public Services
- RTI (Right to Information) request submission and tracking
- Contact form with department routing
- Public access to research publications and data
- Environmental monitoring data visualization

## Data Flow

### Frontend to Backend Communication
1. React components use TanStack Query for API calls
2. Custom query client handles authentication and error states
3. Form submissions use React Hook Form with Zod validation
4. Real-time data updates through query invalidation

### Database Operations
1. Drizzle ORM provides type-safe database operations
2. Connection pooling with Neon serverless PostgreSQL
3. Migrations managed through Drizzle Kit
4. Shared schema ensures type consistency across frontend and backend

### File Upload Flow
1. Multer middleware handles multipart form data
2. Files stored in local filesystem with unique naming
3. Database records track file metadata and access permissions
4. Download endpoints serve files with proper headers

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: WebSocket-based with connection pooling
- **Migration Strategy**: Schema-first with Drizzle Kit

### UI Components
- **Radix UI**: Accessible component primitives
- **Shadcn/UI**: Pre-built component library
- **Lucide React**: Icon library
- **Recharts**: Data visualization for environmental monitoring

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast production builds
- **Vite**: Development server with HMR
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with proxy to backend
- TSX for running TypeScript server code directly
- Environment variables for database connection
- Replit-specific development enhancements

### Production Build
1. Frontend: Vite builds optimized React bundle to `dist/public`
2. Backend: ESBuild bundles server code to `dist/index.js`
3. Single deployment artifact with static file serving
4. Environment-based configuration for database connections

### Database Deployment
- Schema deployment through `drizzle-kit push`
- Environment variable configuration for DATABASE_URL
- Automatic connection validation on startup
- Migration support for schema updates

## Current Status

**Project Status**: ✅ SUCCESSFULLY DEPLOYED AND RUNNING
- **Last Updated**: January 29, 2025
- **Application Status**: Running on port 5000 with full functionality
- **Database**: PostgreSQL with Drizzle ORM fully configured and operational
- **Key Features**: All major pages implemented and tested working properly

## Recent Achievements

✅ Complete modernization from HTML/CSS to React/Express/PostgreSQL
✅ Fixed all critical technical issues (port configuration, CSS compilation, type safety)
✅ Database schema deployed and operational with all tables
✅ All major pages implemented and functional:
  - Home, About, Services, Divisions, Downloads, Library
  - Mail, RTI requests, Sea Level monitoring, Contact, Calendar
  - Admin dashboard with user management
✅ Professional government website styling with NARA brand colors
✅ Responsive design working across all pages
✅ API endpoints responding correctly with proper authentication

The system is designed to be a comprehensive research institution management platform with public-facing services, internal administration tools, and robust data management capabilities. The architecture supports scalability while maintaining type safety and developer experience through the TypeScript-first approach.