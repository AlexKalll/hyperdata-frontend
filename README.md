
# Mahder Frontend

> A comprehensive project management and data annotation platform with role-based access control

## Table of Contents

- [About](#about)
  - [Key Features](#key-features)
  - [Screenshots](#screenshots)
  - [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Development](#development)
  - [Running Development Server](#running-development-server)
  - [Building for Production](#building-for-production)
  - [Running Production Build](#running-production-build)
  - [Linting](#linting)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
  - [Docker Deployment](#docker-deployment)
  - [Docker Compose](#docker-compose)
  - [Production Build](#production-build)
- [Scripts](#scripts)
- [Documentation](#documentation)
- [Support](#support)
- [License](#license)

## About

Mahder Frontend is a comprehensive project management and data annotation platform built with Next.js 15 and React 19. The system provides a complete workflow solution for managing complex projects that require structured data collection, annotation, and review processes. With its role-based access control architecture, Mahder Frontend enables organizations to efficiently coordinate teams across different stages of project execution, from initial setup through final review and approval.

The platform is designed to handle large-scale data annotation projects, research initiatives, and collaborative workflows where multiple stakeholders need controlled access to different aspects of the project lifecycle. Built with modern web technologies and a focus on user experience, Mahder Frontend delivers a responsive, intuitive interface that scales from small teams to enterprise-level deployments.

### Key Features

- **Role-Based Access Control**: Comprehensive permission system with four distinct user roles, each with tailored interfaces and capabilities
- **Project Management**: Complete project lifecycle management from creation to completion with milestone tracking and progress monitoring
- **Task Management**: Advanced task assignment, tracking, and workflow management with automated notifications and status updates
- **Data Annotation**: Specialized tools for data collection, annotation, and validation with support for various data types and formats
- **Real-Time Collaboration**: Live updates and notifications to keep team members synchronized across all project activities
- **Dashboard Analytics**: Comprehensive reporting and analytics dashboards with customizable metrics and visualizations
- **File Management**: Secure file upload, storage, and sharing capabilities with version control and access permissions
- **Audit Trail**: Complete activity logging and audit capabilities for compliance and project tracking
- **Responsive Design**: Mobile-friendly interface that works seamlessly across desktop, tablet, and mobile devices
- **Integration Ready**: RESTful API architecture designed for easy integration with external systems and tools

### Screenshots

Get a visual overview of the Mahder Frontend platform's key features and interfaces:

#### Project Management
![Project List](docs/images/project-list.png)
*Comprehensive project overview with status tracking, progress monitoring, and quick access to project details*

#### Task Dashboard
![Task Dashboard](docs/images/task-dashboard.png)
*Centralized task management dashboard showing task assignments, status updates, and performance metrics*

#### Task Management
![Task List](docs/images/task-list.png)
*Detailed task list view with filtering, sorting, and bulk action capabilities for efficient task coordination*

#### Micro-Task Workflow
![Micro-Task List](docs/images/micro-task-list.png)
*Granular micro-task management interface for breaking down complex tasks into manageable units*

#### Task Submission
![Task Submission](docs/images/task-submisison.png)
*Intuitive task submission interface with file upload, annotation tools, and quality validation features*

### User Roles

The platform supports four distinct user roles, each with specific capabilities and access levels:

#### SuperAdmin
- **System Administration**: Complete system configuration and management capabilities
- **User Management**: Create, modify, and manage all user accounts across the platform
- **Global Oversight**: Access to all projects, analytics, and system-wide reporting
- **Security Management**: Configure security settings, permissions, and access controls
- **System Monitoring**: Monitor system performance, usage statistics, and health metrics

#### ProjectManager
- **Project Creation**: Create and configure new projects with custom workflows and requirements
- **Team Management**: Assign team members to projects and manage role-based permissions
- **Progress Tracking**: Monitor project progress, milestones, and deliverables
- **Resource Allocation**: Manage project resources, budgets, and timelines
- **Reporting**: Generate project-specific reports and analytics for stakeholders

#### Facilitator
- **Task Coordination**: Manage and coordinate tasks between team members and reviewers
- **Quality Assurance**: Oversee data quality and annotation standards compliance
- **Workflow Management**: Configure and optimize project workflows for efficiency
- **Team Communication**: Facilitate communication between project stakeholders
- **Progress Monitoring**: Track task completion and identify potential bottlenecks

#### Reviewer
- **Content Review**: Review and validate submitted work and annotations
- **Quality Control**: Ensure data quality and adherence to project standards
- **Approval Workflow**: Approve or reject submissions with detailed feedback
- **Reporting**: Generate review reports and quality metrics
- **Feedback Management**: Provide structured feedback to improve work quality

## Tech Stack

Mahder Frontend is built with modern web technologies, carefully selected for performance, developer experience, and maintainability. The stack emphasizes type safety, component reusability, and scalable architecture patterns.

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router, server-side rendering, and full-stack capabilities
- **[React 19](https://react.dev/)** - Component-based UI library with latest features and optimizations
- **[TypeScript 5.8](https://www.typescriptlang.org/)** - Type-safe JavaScript with enhanced developer experience

### Styling & UI
- **[TailwindCSS 4](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI development
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality, accessible React components built on Radix UI
- **[Radix UI](https://www.radix-ui.com/)** - Low-level UI primitives for building design systems
- **[Lucide React](https://lucide.dev/)** - Beautiful and consistent icon library
- **[React Icons](https://react-icons.github.io/react-icons/)** - Popular icon libraries as React components

### State Management & Data Fetching
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management solution
- **[TanStack Query](https://tanstack.com/query)** - Powerful data synchronization for React applications
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client for API requests

### Authentication & Security
- **[NextAuth.js](https://next-auth.js.org/)** - Complete authentication solution for Next.js
- **[JSON Web Token](https://jwt.io/)** - Secure token-based authentication
- **[js-cookie](https://github.com/js-cookie/js-cookie)** - Simple API for handling browser cookies

### Forms & Validation
- **[React Hook Form](https://react-hook-form.com/)** - Performant forms with easy validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation library
- **[@hookform/resolvers](https://github.com/react-hook-form/resolvers)** - Validation resolvers for React Hook Form

### Data Visualization & Charts
- **[Chart.js](https://www.chartjs.org/)** - Simple yet flexible JavaScript charting library
- **[React Chart.js 2](https://react-chartjs-2.js.org/)** - React wrapper for Chart.js
- **[Recharts](https://recharts.org/)** - Composable charting library built on React components

### Data Processing & File Handling
- **[Papa Parse](https://www.papaparse.com/)** - Fast and powerful CSV parser
- **[XLSX](https://sheetjs.com/)** - Excel file processing and manipulation
- **[WaveSurfer.js](https://wavesurfer-js.org/)** - Audio waveform visualization and interaction

### UI Enhancement & Utilities
- **[React Toastify](https://fkhadra.github.io/react-toastify/)** - Notification system for user feedback
- **[Sonner](https://sonner.emilkowal.ski/)** - Opinionated toast component for React
- **[date-fns](https://date-fns.org/)** - Modern JavaScript date utility library
- **[clsx](https://github.com/lukeed/clsx)** - Utility for constructing className strings
- **[Tailwind Merge](https://github.com/dcastil/tailwind-merge)** - Merge Tailwind CSS classes without style conflicts
- **[Class Variance Authority](https://cva.style/)** - Create type-safe component variants

### Development Tools
- **[ESLint](https://eslint.org/)** - Code linting and quality enforcement
- **[Prettier](https://prettier.io/)** - Code formatting and style consistency
- **[Husky](https://typicode.github.io/husky/)** - Git hooks for automated quality checks
- **[lint-staged](https://github.com/okonet/lint-staged)** - Run linters on staged git files
- **[PostCSS](https://postcss.org/)** - CSS transformation and optimization
- **[Autoprefixer](https://autoprefixer.github.io/)** - Automatic CSS vendor prefixing

### Package Management
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager with strict dependency resolution

## Getting Started

Follow these instructions to get the Mahder Frontend project running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following software installed on your system:

- **[Node.js](https://nodejs.org/) 20 or higher** - JavaScript runtime environment
  ```bash
  # Check your Node.js version
  node --version
  ```

- **[pnpm](https://pnpm.io/)** - Package manager (recommended over npm/yarn)
  ```bash
  # Install pnpm globally if you haven't already
  npm install -g pnpm
  
  # Check your pnpm version
  pnpm --version
  ```

- **[Git](https://git-scm.com/)** - Version control system
  ```bash
  # Check your Git version
  git --version
  ```

### Installation

Follow these step-by-step instructions to set up the project locally:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mahder-frontend
   ```

2. **Install dependencies**
   ```bash
   # Install all project dependencies using pnpm
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory by copying the example file:
   
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Then edit the `.env` file with your configuration:
   
   ```env
   # Base API URLs
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   NEXT_PUBLIC_BASE_URL=http://localhost:3001
   
   # NextAuth Configuration
   NEXTAUTH_SECRET=your-strong-secret-here
   NEXTAUTH_URL=http://localhost:3001
   ```
   
   **Important**: Replace `your-strong-secret-here` with a secure random string. You can generate one using:
   ```bash
   # Generate a secure secret
   openssl rand -base64 32
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3001](http://localhost:3001) to see the application running.

### Environment Configuration

The application requires several environment variables to function properly. Create a `.env` file in the root directory with the following configuration:

#### Example .env File Structure

```env
# Base API URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# NextAuth Configuration
NEXTAUTH_SECRET=your-strong-secret-here
NEXTAUTH_URL=http://localhost:3001
```

#### Environment Variables Explained

| Variable | Description | Required | Purpose |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend API server | Yes | Defines where the frontend will make API calls to communicate with the backend services |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the frontend application | Yes | Used for generating absolute URLs, redirects, and canonical links |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js session encryption | Yes | Encrypts JWT tokens and session data for secure authentication |
| `NEXTAUTH_URL` | Canonical URL of your site for NextAuth.js | Yes | Required by NextAuth.js for OAuth callbacks and session management |

#### Environment Files Explained

The project uses two different environment files for different deployment scenarios:

**`.env` (Development/Local)**
- Used for local development and testing
- Contains localhost URLs and development-specific configurations
- Should not be committed to version control (already in .gitignore)
- Example values point to local development servers

**`.env.production` (Production)**
- Used for production deployments
- Contains production server URLs and optimized configurations
- Should contain actual production domain names and secure secrets
- May be committed to version control if it doesn't contain sensitive data, or managed through deployment pipelines

**Key Differences:**
- **URLs**: Development uses `localhost` addresses, production uses actual domain names
- **Security**: Production requires stronger secrets and HTTPS URLs
- **Performance**: Production may include additional optimization flags
- **Deployment**: Production file is used by build systems and deployment tools

#### Important Security Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should never contain sensitive information
- `NEXTAUTH_SECRET` should be a strong, randomly generated string (minimum 32 characters) in production
- Never commit sensitive environment variables to version control
- Use environment variable management tools or deployment platform secrets for production
- Ensure production URLs use HTTPS for security

## Development

This section covers the essential development workflow commands and processes for working with the Mahder Frontend project. These commands will help you run the application locally, build for production, and maintain code quality.

### Running Development Server

To start the development server with hot reload and development optimizations:

```bash
pnpm dev
```

**What this does:**
- Starts the Next.js development server on `http://localhost:3000`
- Enables hot module replacement (HMR) for instant updates when you save files
- Provides detailed error messages and debugging information
- Automatically compiles TypeScript and processes CSS
- Enables React development tools and debugging features

**Development Features:**
- **Hot Reload**: Changes to your code are instantly reflected in the browser
- **Error Overlay**: Detailed error messages displayed directly in the browser
- **Fast Refresh**: Preserves component state during code updates
- **Source Maps**: Debug with original source code in browser dev tools
- **TypeScript Checking**: Real-time type checking and error reporting

The development server will continue running until you stop it with `Ctrl+C` (or `Cmd+C` on macOS).

### Building for Production

To create an optimized production build:

```bash
pnpm build
```

**What this does:**
- Compiles and optimizes all TypeScript code to JavaScript
- Bundles and minifies CSS and JavaScript files
- Optimizes images and static assets
- Generates static HTML pages where possible (Static Site Generation)
- Creates a `.next` directory with the production-ready application
- Performs tree-shaking to remove unused code
- Applies code splitting for optimal loading performance

**Build Output:**
- **Static Assets**: Optimized images, fonts, and other static files
- **JavaScript Bundles**: Minified and compressed JS files with cache-friendly names
- **CSS Files**: Optimized and minified stylesheets
- **HTML Pages**: Pre-rendered pages for improved performance
- **Build Manifest**: Information about the build for deployment tools

**Build Verification:**
The build process will fail if there are:
- TypeScript compilation errors
- ESLint errors (if configured to fail on errors)
- Missing environment variables required for build
- Import/export issues or circular dependencies

### Running Production Build

To run the production build locally for testing:

```bash
pnpm start
```

**Prerequisites:**
- You must run `pnpm build` first to create the production build
- All required environment variables must be configured

**What this does:**
- Starts a production server serving the optimized build
- Runs on `http://localhost:3000` by default
- Uses the same performance optimizations as production deployment
- Serves pre-rendered pages and optimized assets
- Enables production-level caching and compression

**Use Cases:**
- **Pre-deployment Testing**: Verify the production build works correctly
- **Performance Testing**: Test with production optimizations enabled
- **Integration Testing**: Test with production-like environment
- **Debugging**: Debug issues that only occur in production builds

**Important Notes:**
- This serves the static build created by `pnpm build`
- Changes to source code won't be reflected until you rebuild
- Environment variables from `.env.production` (if present) will be used
- The server runs in production mode with all optimizations enabled

### Linting

To run code quality checks and enforce coding standards:

```bash
pnpm lint
```

**What this does:**
- Runs ESLint to check JavaScript and TypeScript code quality
- Identifies potential bugs, code smells, and style violations
- Enforces consistent coding patterns across the project
- Checks for accessibility issues in React components
- Validates import/export statements and dependencies

**Linting Rules:**
The project uses a comprehensive ESLint configuration that includes:
- **Next.js Rules**: Next.js-specific best practices and optimizations
- **React Rules**: React hooks rules and component best practices
- **TypeScript Rules**: Type safety and TypeScript-specific patterns
- **Accessibility Rules**: WCAG compliance and accessibility standards
- **Import Rules**: Proper import/export organization and validation

**Common Issues Detected:**
- Unused variables and imports
- Missing dependencies in React hooks
- Accessibility violations (missing alt text, improper ARIA usage)
- TypeScript type errors and inconsistencies
- Code formatting inconsistencies
- Potential security vulnerabilities

**Fixing Lint Issues:**
```bash
# Some issues can be automatically fixed
pnpm lint --fix

# For issues that require manual intervention, the linter will provide:
# - File location and line number
# - Description of the issue
# - Suggested fix (when available)
# - Link to documentation explaining the rule
```

**Integration with Development:**
- Linting is automatically run during the build process
- Consider setting up pre-commit hooks to run linting before commits
- Many editors can be configured to show lint errors in real-time
- The development server may show lint warnings in the console

## Project Structure

The Mahder Frontend project follows a well-organized directory structure that leverages Next.js 15's App Router architecture with route groups for clean separation of concerns. This structure promotes maintainability, scalability, and clear separation between different application areas.

### Directory Overview

```
mahder-frontend/
├── .kiro/                          # Kiro IDE configuration and specs
│   └── specs/                      # Feature specifications and documentation
├── public/                         # Static assets served directly by the web server
│   ├── logo/                       # Brand logos and variations
│   ├── *.svg                       # Icon files (contact, database_lock, eye, etc.)
│   ├── *.png                       # Image assets (avatars, covers, etc.)
│   └── next.svg                    # Next.js logo
├── src/                            # Main source code directory
│   ├── app/                        # Next.js App Router directory (main application)
│   │   ├── (auth)/                 # Authentication route group
│   │   │   └── login/              # Login page and authentication flows
│   │   ├── (dashboard)/            # Role-based dashboard route group
│   │   │   ├── superadmin/         # SuperAdmin dashboard and features
│   │   │   ├── projectmanager/     # Project Manager dashboard and features
│   │   │   ├── facilitator/        # Facilitator dashboard and features
│   │   │   ├── reviewer/           # Reviewer dashboard and features
│   │   │   └── layout.tsx          # Shared dashboard layout
│   │   ├── (public)/               # Public pages route group
│   │   │   └── linkForm/           # Public forms and landing pages
│   │   ├── (shared)/               # Shared application pages
│   │   │   └── settings/           # User settings and preferences
│   │   ├── api/                    # API routes and server-side logic
│   │   │   ├── auth/               # Authentication API endpoints
│   │   │   ├── debug/              # Development and debugging endpoints
│   │   │   └── test-env/           # Environment testing endpoints
│   │   ├── components/             # React components organized by feature
│   │   │   ├── auth/               # Authentication-related components
│   │   │   ├── baseData/           # Base data management components
│   │   │   ├── facilitator/        # Facilitator-specific components
│   │   │   ├── layout/             # Layout and navigation components
│   │   │   ├── log/                # Logging and audit components
│   │   │   ├── payment/            # Payment processing components
│   │   │   ├── project/            # Project management components
│   │   │   ├── projectManager/     # Project Manager specific components
│   │   │   ├── reviewer/           # Reviewer-specific components
│   │   │   ├── tasks/              # Task management components
│   │   │   ├── ui/                 # Reusable UI components (shadcn/ui)
│   │   │   ├── users/              # User management components
│   │   │   ├── usersProject/       # User-project relationship components
│   │   │   └── utils/              # Utility components and helpers
│   │   ├── context/                # React Context providers
│   │   │   └── auth-context.tsx    # Authentication context and state
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useAuthSession.ts   # Authentication session management
│   │   │   └── useSessionExpiry.ts # Session expiration handling
│   │   ├── lib/                    # Utility libraries and configurations
│   │   │   ├── api.ts              # API client configuration
│   │   │   ├── auth.ts             # Authentication utilities
│   │   │   └── generic-base-data-service.ts # Base data service utilities
│   │   ├── types/                  # TypeScript type definitions
│   │   │   ├── basedate.ts         # Base data type definitions
│   │   │   ├── countryCodes.ts     # Country code types
│   │   │   ├── dateUtils.ts        # Date utility types
│   │   │   ├── global.ts           # Global type definitions
│   │   │   ├── project.ts          # Project-related types
│   │   │   └── statistics.ts       # Statistics and analytics types
│   │   ├── globals.css             # Global CSS styles and Tailwind imports
│   │   ├── layout.tsx              # Root layout component
│   │   └── page.tsx                # Home page component
│   ├── components/                 # Shared components directory
│   │   └── ui/                     # Reusable UI component library
│   │       ├── button.tsx          # Button component variants
│   │       ├── card.tsx            # Card layout components
│   │       ├── dialog.tsx          # Modal dialog components
│   │       ├── input.tsx           # Form input components
│   │       ├── pagination.tsx      # Pagination components
│   │       ├── select.tsx          # Select dropdown components
│   │       ├── table.tsx           # Data table components
│   │       └── tabs.tsx            # Tab navigation components
│   ├── lib/                        # Shared utility libraries
│   │   ├── hooks/                  # Shared custom hooks
│   │   │   ├── useBasedata.ts      # Base data management hook
│   │   │   ├── useDebounce.ts      # Input debouncing hook
│   │   │   ├── useFacilitator.ts   # Facilitator operations hook
│   │   │   ├── useProject.ts       # Project management hook
│   │   │   ├── useTask.ts          # Task management hook
│   │   │   └── [other hooks]       # Additional specialized hooks
│   │   ├── auth.ts                 # Authentication utilities and configuration
│   │   └── utils.ts                # General utility functions
│   ├── types/                      # Shared TypeScript definitions
│   │   ├── auth.ts                 # Authentication type definitions
│   │   └── next-auth.d.ts          # NextAuth.js type extensions
│   ├── middleware.ts               # Next.js middleware for route protection
│   └── providers.tsx               # Application-wide context providers
├── .env                            # Environment variables (development)
├── .env.production                 # Production environment variables
├── .gitignore                      # Git ignore patterns
├── components.json                 # shadcn/ui component configuration
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Docker container configuration
├── eslint.config.mjs               # ESLint configuration
├── middleware.ts                   # Additional middleware configuration
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies and scripts
├── pnpm-lock.yaml                  # pnpm lockfile
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # TailwindCSS configuration
├── tsconfig.json                   # TypeScript configuration
├── README.md                       # Project documentation (this file)
└── USER_MANUAL.md                  # Comprehensive user guide
```

### Next.js App Router Architecture

The project leverages Next.js 15's App Router with route groups (indicated by parentheses) to organize routes logically without affecting the URL structure:

#### Route Groups Explained

**`(auth)` - Authentication Routes**
- **Purpose**: Handles user authentication flows
- **URL Pattern**: `/login`, `/register`, `/forgot-password`
- **Features**: Login forms, password reset, OAuth integration
- **Access**: Public routes, redirects authenticated users

**`(dashboard)` - Role-Based Dashboard Routes**
- **Purpose**: Main application interface with role-specific functionality
- **URL Pattern**: `/superadmin/*`, `/projectmanager/*`, `/facilitator/*`, `/reviewer/*`
- **Features**: Role-specific dashboards, navigation, and feature access
- **Access**: Protected routes requiring authentication and role verification

**`(public)` - Public Pages**
- **Purpose**: Publicly accessible pages and forms
- **URL Pattern**: `/linkForm/*`, `/about`, `/contact`
- **Features**: Public forms, landing pages, informational content
- **Access**: Open to all users, no authentication required

**`(shared)` - Shared Application Pages**
- **Purpose**: Common pages accessible to all authenticated users
- **URL Pattern**: `/settings/*`, `/profile/*`
- **Features**: User settings, profile management, shared utilities
- **Access**: Requires authentication but available to all roles

### Role-Based Dashboard Structure

Each role has its own dedicated dashboard area with specific features and capabilities:

#### SuperAdmin Dashboard (`/superadmin`)
```
superadmin/
├── page.tsx                    # SuperAdmin dashboard overview
├── basedata/                   # System base data management
├── log/                        # System activity logs
├── project/                    # All projects management
├── projectArchive/             # Archived projects
├── projectDetail/              # Detailed project views
├── setting/                    # System settings and configuration
├── tasks/                      # System-wide task management
├── userLog/                    # User activity tracking
└── users/                      # User management and administration
```

#### Project Manager Dashboard (`/projectmanager`)
```
projectmanager/
├── page.tsx                    # Project Manager dashboard overview
├── project/                    # Project creation and management
├── projectDetail/              # Detailed project management views
└── tasks/                      # Project task management
```

#### Facilitator Dashboard (`/facilitator`)
```
facilitator/
├── page.tsx                    # Facilitator dashboard overview
└── tasks/                      # Task coordination and management
```

#### Reviewer Dashboard (`/reviewer`)
```
reviewer/
├── page.tsx                    # Reviewer dashboard overview
├── submissions/                # Review submissions and approvals
└── tasks/                      # Review task management
```

### Component Organization

Components are organized by feature and responsibility to promote reusability and maintainability:

#### Feature-Based Components (`src/app/components/`)
- **Role-Specific**: Components tailored for specific user roles (facilitator/, projectManager/, reviewer/)
- **Feature-Specific**: Components grouped by functionality (auth/, project/, tasks/, users/)
- **Layout Components**: Navigation, headers, sidebars, and layout structures
- **Business Logic**: Components that handle specific business requirements

#### Shared UI Components (`src/components/ui/`)
- **Design System**: Consistent, reusable UI components built with shadcn/ui
- **Form Elements**: Inputs, buttons, selects, and form controls
- **Layout Elements**: Cards, dialogs, tables, and structural components
- **Navigation**: Pagination, tabs, and navigation components

### State Management and Data Flow

The application uses a layered approach to state management:

#### Global State (Context + Zustand)
- **Authentication State**: User session, roles, and permissions
- **Application State**: Global settings, notifications, and shared data
- **Theme State**: UI theme, preferences, and customization

#### Server State (TanStack Query)
- **API Data**: Cached server responses with automatic revalidation
- **Background Updates**: Automatic data synchronization
- **Optimistic Updates**: Immediate UI updates with server reconciliation

#### Local State (React Hooks)
- **Component State**: Form data, UI state, and component-specific data
- **Custom Hooks**: Reusable stateful logic for common patterns

### API and Data Layer

#### API Routes (`src/app/api/`)
- **Authentication**: Login, logout, session management
- **Debug**: Development tools and debugging endpoints
- **Test Environment**: Environment validation and testing

#### Data Services (`src/lib/` and `src/app/lib/`)
- **API Client**: Centralized HTTP client configuration
- **Authentication Services**: Session management and token handling
- **Generic Services**: Reusable data access patterns

### Type Safety and Development Experience

#### TypeScript Configuration
- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: Simplified imports with absolute paths
- **Type Definitions**: Comprehensive types for all data structures

#### Development Tools
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automatic code formatting
- **Husky**: Git hooks for quality gates
- **PostCSS**: CSS processing and optimization

This structure provides a solid foundation for scalable development while maintaining clear separation of concerns and promoting code reusability across the application.

## Deployment

This section covers various deployment options for the Mahder Frontend application, from Docker-based deployments to traditional production builds. Choose the deployment method that best fits your infrastructure and requirements.

### Quick Docker Setup

For a clean Docker build experience, follow these steps:

```bash
# 1. Clone the repository
git clone <repository-url>
cd mahder-frontend

# 2. Ensure no node_modules directory exists (clean state)
rm -rf node_modules

# 3. Copy environment file
cp .env.example .env

# 4. Build the Docker image
docker build -t mahder-frontend:latest .

# 5. Run the container
docker run -d --name mahder-frontend-app -p 3001:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api \
  -e NEXT_PUBLIC_BASE_URL=http://localhost:3001 \
  -e NEXTAUTH_SECRET=your-strong-secret-here \
  -e NEXTAUTH_URL=http://localhost:3001 \
  mahder-frontend:latest

# 6. Check if it's running
docker ps
curl -I http://localhost:3001
```

### Docker Deployment

The project includes a Dockerfile for containerized deployment, which provides a consistent environment across different deployment targets.

#### Building the Docker Image

To build a Docker image for the application:

```bash
# Build the Docker image with a specific tag
docker build -t mahder-frontend:latest .

# Build with a custom tag for versioning
docker build -t mahder-frontend:v1.0.0 .
```

**Build Process:**
- Uses Node.js 20 Alpine Linux as the base image for smaller size and security
- Installs pnpm globally for efficient package management
- Copies package files and installs dependencies
- Copies source code and builds the production application
- Exposes port 3000 for the Next.js application
- Sets the default command to start the production server

#### Running the Docker Container

To run the containerized application:

```bash
# Run with default settings
docker run -p 3000:3000 mahder-frontend:latest

# Run with custom environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api \
  -e NEXT_PUBLIC_BASE_URL=https://yourdomain.com \
  -e NEXTAUTH_SECRET=your-production-secret \
  -e NEXTAUTH_URL=https://yourdomain.com \
  mahder-frontend:latest

# Run in detached mode with a custom name
docker run -d --name mahder-frontend-app -p 3000:3000 Mahder-frontend:latest
```

**Container Configuration:**
- **Port Mapping**: Maps container port 3000 to host port 3000 (customizable)
- **Environment Variables**: Pass production environment variables at runtime
- **Detached Mode**: Use `-d` flag to run container in the background
- **Container Name**: Use `--name` to assign a memorable name to the container

#### Docker Image Management

```bash
# List Docker images
docker images

# Remove old images
docker rmi mahder-frontend:old-version

# View running containers
docker ps

# Stop a running container
docker stop mahder-frontend-app

# Remove a stopped container
docker rm mahder-frontend-app
```

#### Common Docker Issues and Solutions

**Issue: Large build context or "invalid file request node_modules" error**
```
=> ERROR [internal] load build context
=> => transferring context: 623.61MB
failed to solve: invalid file request node_modules/-
```

**Solution**: This happens when Docker tries to include `node_modules` and other large directories in the build context. The project includes a `.dockerignore` file to prevent this, but if you're still experiencing issues:

1. **Ensure .dockerignore exists**: Check that `.dockerignore` is in the same directory as your `Dockerfile`
2. **Clean node_modules**: Remove the `node_modules` directory before building:
   ```bash
   rm -rf mahder-frontend/node_modules
   docker build -t mahder-frontend:latest mahder-frontend/
   ```
3. **Check for hidden files**: Ensure no hidden files are causing issues:
   ```bash
   # List all files including hidden ones
   ls -la mahder-frontend/
   ```
4. **Build from clean state**: Clone a fresh copy of the repository if the issue persists

**Issue: Permission denied errors**
```
EACCES: permission denied, open '/app/_tmp_...'
```

**Solution**: This is handled by our multi-stage Dockerfile with proper user permissions. If you still encounter this, ensure you're using the latest Dockerfile.

**Issue: TypeScript compilation errors during build**
```
Failed to load next.config.ts
```

**Solution**: The project now uses `next.config.js` instead of `next.config.ts` to avoid TypeScript dependencies at runtime.

### Docker Compose

For more complex deployments or when you need to coordinate multiple services, use Docker Compose with the provided configuration file.

#### Using Docker Compose

```bash
# Start the application using Docker Compose
docker compose up

# Start in detached mode (background)
docker compose up -d

# Stop the application
docker compose down

# Rebuild and start (useful after code changes)
docker compose up --build
```

#### Docker Compose Configuration

The `docker-compose.yml` file includes:

```yaml
services:
  mahder-frontend:
    build:
      context: .
      dockerfile: Dockerfile
    image: ${DOCKER_IMAGE_NAME:-mahder-frontend}:${DOCKER_IMAGE_TAG:-latest}
    container_name: ${CONTAINER_NAME:-mahder-frontend-app}
    ports:
      - "${HOST_PORT:-3001}:3000"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-http://localhost:3000/api}
      - NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL:-http://localhost:3001}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-your-strong-secret-here}
      - NEXTAUTH_URL=${NEXTAUTH_URL:-http://localhost:3001}
      - NODE_ENV=${NODE_ENV:-production}
    restart: unless-stopped
    networks:
      - mahder-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  mahder-network:
    driver: bridge
```

**Environment Variables for Docker Compose:**
- `DOCKER_IMAGE_NAME`: Docker image name (e.g., `mahder-frontend`)
- `DOCKER_IMAGE_TAG`: Docker image tag (e.g., `latest`, `v1.0.0`)
- `CONTAINER_NAME`: Docker container name (e.g., `mahder-frontend-app`)
- `HOST_PORT`: Host port to map to container port 3000
- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL
- `NEXT_PUBLIC_BASE_URL`: Frontend application URL
- `NEXTAUTH_SECRET`: Authentication secret key
- `NEXTAUTH_URL`: Authentication callback URL
- `NODE_ENV`: Node runtime environment for the container

**Setting Environment Variables:**
Create a `.env` file in the same directory as the Docker Compose file, or copy `.env.docker` to `.env`:

```env
DOCKER_IMAGE_NAME=mahder-frontend
DOCKER_IMAGE_TAG=latest
CONTAINER_NAME=mahder-frontend-app
HOST_PORT=3001
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NEXTAUTH_SECRET=your-strong-secret-here
NEXTAUTH_URL=http://localhost:3001
NODE_ENV=production
```

### Production Build

For traditional deployment without Docker, you can build and run the application directly on your server.

#### Building for Production

```bash
# Install dependencies (if not already installed)
pnpm install

# Create an optimized production build
pnpm build
```

**Build Output:**
- Creates a `.next` directory with the optimized application
- Generates static assets, JavaScript bundles, and CSS files
- Pre-renders pages where possible for improved performance
- Optimizes images and applies code splitting

**Build Requirements:**
- Node.js 20 or higher must be installed on the production server
- All required environment variables must be configured
- Sufficient disk space for build artifacts and dependencies

#### Running the Production Build

```bash
# Start the production server
pnpm start
```

**Production Server Features:**
- Serves the optimized build created by `pnpm build`
- Runs on port 3000 by default (configurable via PORT environment variable)
- Enables production optimizations including caching and compression
- Serves pre-rendered pages and static assets efficiently

**Custom Port Configuration:**
```bash
# Run on a custom port
PORT=8080 pnpm start

# Or set the PORT environment variable
export PORT=8080
pnpm start
```

### Production Environment Configuration

Proper environment configuration is crucial for production deployments. The application supports different environment files for different deployment scenarios.

#### Environment Files

**`.env.production` (Production Environment)**
Create a `.env.production` file for production-specific configuration:

```env
# Production API URLs (replace with your actual domains)
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# NextAuth Configuration (production values)
NEXTAUTH_SECRET=your-very-strong-production-secret-minimum-32-characters
NEXTAUTH_URL=https://yourdomain.com
```

**Environment Variable Requirements:**

| Variable | Production Requirements | Security Notes |
|----------|------------------------|----------------|
| `NEXT_PUBLIC_API_BASE_URL` | Must use HTTPS in production | Exposed to browser, no sensitive data |
| `NEXT_PUBLIC_BASE_URL` | Must match your domain with HTTPS | Used for redirects and canonical URLs |
| `NEXTAUTH_SECRET` | Strong random string (32+ characters) | Keep secret, never commit to version control |
| `NEXTAUTH_URL` | Must match your production domain | Required for OAuth callbacks |

#### Security Best Practices

**Environment Variable Security:**
- Never commit `.env` files containing sensitive information to version control
- Use strong, randomly generated secrets for `NEXTAUTH_SECRET`
- Ensure all URLs use HTTPS in production
- Use environment variable management tools or deployment platform secrets
- Regularly rotate secrets and API keys

**Production Checklist:**
- [ ] All environment variables are configured with production values
- [ ] `NEXTAUTH_SECRET` is a strong, unique secret (minimum 32 characters)
- [ ] All URLs use HTTPS protocol
- [ ] API endpoints are accessible from the production environment
- [ ] CORS settings are configured on the backend API
- [ ] SSL certificates are properly configured
- [ ] Firewall rules allow necessary traffic
- [ ] Monitoring and logging are configured

#### Deployment Platform Examples

**Docker-based Platforms (AWS ECS, Google Cloud Run, Azure Container Instances):**
```bash
# Build and tag for registry
docker build -t your-registry/mahder-frontend:v1.0.0 .
docker push your-registry/mahder-frontend:v1.0.0

# Deploy with platform-specific commands
# Platform will handle environment variables and scaling
```

**Traditional VPS/Server Deployment:**
```bash
# On your production server
git clone <repository-url>
cd mahder-frontend
pnpm install
pnpm build

# Set up environment variables
cp .env.production .env

# Start with process manager (PM2 example)
pm2 start "pnpm start" --name mahder-frontend
```

**Serverless Platforms (Vercel, Netlify):**
- Configure environment variables in the platform dashboard
- Connect your Git repository for automatic deployments
- Platform handles build and deployment automatically

#### Monitoring and Maintenance

**Health Checks:**
```bash
# Check if the application is running
curl http://localhost:3000/api/health

# Monitor application logs
docker logs mahder-frontend-app

# Check resource usage
docker stats mahder-frontend-app
```

**Updates and Maintenance:**
- Regularly update dependencies for security patches
- Monitor application performance and error rates
- Set up automated backups if using persistent data
- Plan for zero-downtime deployments using load balancers
- Implement proper logging and monitoring solutions

**Troubleshooting Common Issues:**
- **Port conflicts**: Ensure the chosen port is available and not blocked by firewall
- **Environment variables**: Verify all required variables are set with correct values
- **API connectivity**: Ensure the backend API is accessible from the frontend
- **Memory issues**: Monitor container/server memory usage and adjust limits if needed
- **Build failures**: Check Node.js version compatibility and dependency conflicts

## Scripts

The project includes several npm/pnpm scripts to streamline development and deployment workflows. All scripts should be run using `pnpm` for consistency with the project's package management approach.

### Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `pnpm dev` | Starts the development server with hot reload on `http://localhost:3000`. Includes development optimizations, detailed error messages, and React development tools. |
| `build` | `pnpm build` | Creates an optimized production build. Compiles TypeScript, bundles assets, applies code splitting, and generates static pages where possible. Output is stored in the `.next` directory. |
| `start` | `pnpm start` | Starts the production server using the build created by `pnpm build`. Serves the optimized application with production-level caching and compression enabled. |
| `lint` | `pnpm lint` | Runs ESLint to check code quality, identify potential bugs, enforce coding standards, and validate accessibility compliance. Includes Next.js, React, TypeScript, and accessibility rules. |

### Script Usage Examples

```bash
# Development workflow
pnpm dev                    # Start development server
pnpm lint                   # Check code quality
pnpm build                  # Test production build

# Production deployment
pnpm install               # Install dependencies
pnpm build                 # Create production build
pnpm start                 # Start production server

# Code quality checks
pnpm lint                  # Run all linting rules
pnpm lint --fix            # Auto-fix linting issues where possible
```

### Script Dependencies

- **`dev`**: Requires environment variables to be configured in `.env`
- **`build`**: Requires all dependencies installed and valid TypeScript/ESLint configuration
- **`start`**: Requires a successful `pnpm build` to have been run first
- **`lint`**: Runs independently but may reference TypeScript configuration for type checking

## Security

### Security Considerations

When deploying Mahder Frontend, please consider the following security best practices:

#### Environment Variables
- Never commit `.env` files with real credentials to version control
- Use strong, randomly generated secrets (minimum 32 characters)
- Rotate secrets regularly in production environments
- Use environment variable management tools for production deployments

#### HTTPS in Production
- Always use HTTPS in production environments
- Ensure SSL certificates are properly configured and up to date
- Configure proper CORS settings on your backend API

#### Authentication
- Use strong `NEXTAUTH_SECRET` values in production
- Implement proper session management and timeout policies
- Consider implementing additional security measures like rate limiting

#### Reporting Security Issues
If you discover a security vulnerability, please report it responsibly:
1. **Do not** create a public GitHub issue
2. Email the maintainers directly with details
3. Allow time for the issue to be addressed before public disclosure

## Documentation

For comprehensive information about using the Mahder Frontend system, refer to the following documentation resources:

### User Manual
The **[USER_MANUAL.md](USER_MANUAL.md)** file contains detailed guides for all user roles and system features:

- **System Overview**: Complete introduction to the platform and its capabilities
- **Role-Specific Guides**: Detailed instructions for SuperAdmin, Project Manager, Facilitator, and Reviewer roles
- **Feature Documentation**: Step-by-step guides for all major features and workflows
- **Common Tasks**: Instructions for frequently performed operations
- **Troubleshooting**: Solutions to common issues and error scenarios

### Additional Resources

- **API Documentation**: Contact your system administrator for API documentation if you need to integrate with external systems
- **Architecture Documentation**: Technical architecture details are available in the project's design documents
- **Deployment Guides**: Refer to the [Deployment](#deployment) section in this README for deployment instructions

### Getting Help with Documentation

If you find any gaps in the documentation or need clarification on specific features:

1. Check the [USER_MANUAL.md](USER_MANUAL.md) for detailed user guides
2. Review the troubleshooting section for common issues
3. Contact your system administrator or technical support team
4. For developers: Review the code comments and type definitions in the source code

## Support

### Getting Help

If you encounter issues or need assistance with the Mahder Frontend system, follow these steps to get the help you need:

#### For End Users
1. **Check the User Manual**: Start with the [USER_MANUAL.md](USER_MANUAL.md) for comprehensive guides and troubleshooting steps
2. **Contact Your Administrator**: Reach out to your organization's system administrator or project manager
3. **Report Issues**: If you discover bugs or system issues, report them through your organization's established support channels

#### For Developers and System Administrators
1. **Review Documentation**: Check this README and the USER_MANUAL.md for setup and configuration guidance
2. **Check Logs**: Review application logs for error messages and debugging information
3. **Verify Configuration**: Ensure all environment variables and dependencies are properly configured
4. **Community Resources**: Consult the documentation for the underlying technologies (Next.js, React, etc.)

#### Technical Support Channels

**Internal Support:**
- Contact your organization's IT department or system administrator
- Reach out to the development team responsible for your deployment
- Use your organization's internal ticketing system or help desk

**Development Support:**
- Review the project's issue tracking system (if available)
- Check the project repository for known issues and solutions
- Consult with the development team or technical lead

#### Reporting Issues

When reporting issues, please include the following information to help with troubleshooting:

**For End Users:**
- Your user role (SuperAdmin, Project Manager, Facilitator, Reviewer)
- The specific page or feature where the issue occurred
- Steps to reproduce the problem
- Any error messages displayed
- Browser type and version
- Screenshots (if applicable)

**For Technical Issues:**
- Environment details (development, staging, production)
- Browser console errors (F12 → Console tab)
- Network errors (F12 → Network tab)
- Server logs (if accessible)
- Configuration details (without sensitive information)
- Steps to reproduce the issue

#### Emergency Support

For critical system issues that affect business operations:

1. **Immediate Action**: Contact your organization's emergency IT support or on-call technical team
2. **Document the Issue**: Record the time, affected users, and business impact
3. **Preserve Evidence**: Take screenshots and save error logs before attempting fixes
4. **Follow Escalation Procedures**: Use your organization's established emergency response procedures

### Self-Help Resources

Before contacting support, try these self-help options:

- **Clear Browser Cache**: Clear your browser cache and cookies, then try again
- **Try Different Browser**: Test the issue in a different web browser
- **Check Network Connection**: Ensure you have a stable internet connection
- **Restart Browser**: Close and restart your web browser
- **Review Recent Changes**: Consider if any recent system changes might be related to the issue

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### Open Source

Mahder Frontend is an open source project. We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.


#### Community

- **Issues**: Report bugs and request features through [GitHub Issues](../../issues)
- **Discussions**: Join community discussions and ask questions
- **Pull Requests**: Submit your contributions through pull requests

### Usage Rights

This open source project is available under the Apache License 2.0, which allows for:

- Commercial and non-commercial use
- Modification and distribution
- Private use
- Patent use (with explicit patent grant)
- Sublicensing

The Apache License 2.0 provides additional protections including:
- Explicit patent grants from contributors
- Protection against patent litigation
- Clear attribution requirements
- Trademark protection

Please ensure compliance with the license terms and include proper attribution when using or distributing this software.

