# Mahder Frontend - Comprehensive User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [User Roles](#user-roles)
4. [SuperAdmin User Manual](#superadmin-user-manual)
5. [Project Manager User Manual](#project-manager-user-manual)
6. [Facilitator User Manual](#facilitator-user-manual)
7. [Reviewer User Manual](#reviewer-user-manual)
8. [Common Features](#common-features)
9. [Troubleshooting](#troubleshooting)
10. [Support](#support)

---

## Introduction

Welcome to the Mahder Frontend system - a comprehensive project management and data annotation platform. This manual provides detailed instructions for all user types to effectively navigate and utilize the system's features.

## System Overview

The Mahder Frontend system is designed to manage projects, tasks, and data annotation workflows with role-based access control. The system supports four distinct user roles, each with specific permissions and responsibilities.

## User Roles

The system supports four main user roles:

1. **SuperAdmin** - Full system administration and management
2. **ProjectManager** - Project and task management
3. **Facilitator** - Task facilitation and user management
4. **Reviewer** - Quality assurance and data review

---

# SuperAdmin User Manual

## Overview

SuperAdmins have complete system access and are responsible for overall system administration, user management, and system configuration.

## Dashboard Features

### Main Dashboard (`/superadmin`)

- **Total Projects**: View count of all projects in the system
- **Total Tasks**: View count of all tasks across projects
- **Total Micro Tasks**: View count of all micro-tasks
- **Total Users**: View count of all system users (reviewers, contributors, project managers)
- **Language/Dialect Distribution**: Visual charts showing data distribution by language and dialect
- **Dataset Statistics**: Yearly and language-based dataset analytics

## User Management (`/superadmin/users`)

### Features:

- View all system users
- Create new user accounts
- Edit user profiles and roles
- Activate/deactivate user accounts
- Manage user permissions
- Search and filter users
- Export user data

### How to Use:

1. Navigate to "User Management" from the sidebar
2. Use the search bar to find specific users
3. Click "Add User" to create new accounts
4. Use the action buttons to edit, activate, or deactivate users
5. Apply filters to view users by role, status, or other criteria

## Project Management (`/superadmin/project`)

### Features:

- View all projects in the system
- Create new projects
- Edit project details
- Archive projects
- Assign project managers
- Monitor project progress
- View project statistics

### How to Use:

1. Navigate to "Project Management" from the sidebar
2. View the project list with key information
3. Click "Create Project" to add new projects
4. Use the project cards to access detailed project information
5. Assign project managers using the assignment interface

## Base Data Management (`/superadmin/basedata`)

### Available Base Data Types:

- **Language** (`/superadmin/basedata/language`)
- **Dialect** (`/superadmin/basedata/dialect`)
- **Sector** (`/superadmin/basedata/sector`)
- **Organization** (`/superadmin/basedata/organization`)
- **Country** (`/superadmin/basedata/country`)
- **Region** (`/superadmin/basedata/region`)
- **Zone** (`/superadmin/basedata/zone`)
- **Rejection Type** (`/superadmin/basedata/rejectionType`)
- **Annotation Type** (`/superadmin/basedata/annotationType`)
- **Annotation** (`/superadmin/basedata/annotation`)
- **Flag Type** (`/superadmin/basedata/flagType`)

### How to Use Base Data:

1. Navigate to "Base Data" from the sidebar
2. Select the specific data type you want to manage
3. Use CRUD operations (Create, Read, Update, Delete) for each data type
4. Search and filter data as needed
5. Export data for external use

## Archive Management (`/superadmin/projectArchive`)

### Features:

- View archived projects
- Restore archived projects
- Permanent deletion of archived items
- Archive search and filtering

## System Logs (`/superadmin/log`)

### Features:

- View system activity logs
- Monitor user actions
- Track system events
- Export log data
- Filter logs by date, user, or action type

## Settings (`/superadmin/setting`)

### Features:

- System configuration
- User role management
- Security settings
- Notification preferences
- System maintenance tools

---

# Project Manager User Manual

## Overview

Project Managers are responsible for creating and managing projects, assigning tasks, and overseeing project progress.

## Dashboard Features

### Main Dashboard (`/projectmanager`)

- **Project Overview**: View assigned projects with key metrics
- **Task Statistics**: Monitor task completion rates
- **Team Performance**: Track contributor and reviewer performance
- **Project Timeline**: View project deadlines and milestones

## Project Management (`/projectmanager/project`)

### Features:

- View assigned projects
- Create new projects (if permitted)
- Edit project details
- Assign team members (contributors, reviewers, facilitators)
- Monitor project progress
- Generate project reports

### How to Use:

1. Navigate to "Projects" from the sidebar
2. Select a project from the dropdown or view all projects
3. Use the project overview to see key metrics
4. Access detailed project information through project cards
5. Assign team members using the member management interface

## Task Management

### Creating Tasks:

1. Navigate to your project
2. Click "Create Task" or "Add Task"
3. Fill in task details:
   - Task name and description
   - Task type (annotation, transcription, etc.)
   - Instructions for contributors
   - Deadlines and requirements
4. Assign contributors and reviewers
5. Save and activate the task

### Managing Tasks:

- View task status and progress
- Edit task details
- Assign or reassign team members
- Monitor task completion
- Review task submissions

### Task Types:

- **Annotation Tasks**: Data labeling and categorization
- **Transcription Tasks**: Audio-to-text conversion
- **Translation Tasks**: Language translation work
- **Review Tasks**: Quality assurance and validation

## Team Management

### Adding Team Members:

1. Navigate to your project
2. Go to the "Users" or "Team" section
3. Click "Add Members" or "Create Project Member"
4. Search for users by email or name
5. Select contributors, reviewers, or facilitators
6. Assign roles and permissions
7. Send invitations

### Managing Team Members:

- View team member profiles
- Monitor individual performance
- Adjust roles and permissions
- Remove team members if needed
- Track work progress

## Micro-Task Management

### Features:

- View micro-tasks within larger tasks
- Monitor micro-task completion
- Assign micro-tasks to specific contributors
- Review micro-task submissions
- Track quality metrics

### How to Use:

1. Navigate to a specific task
2. Access the "Micro Tasks" tab
3. View the list of micro-tasks
4. Monitor progress and quality
5. Take action on completed micro-tasks

## Settings (`/projectmanager/setting`)

### Features:

- Profile management
- Notification preferences
- Project preferences
- Team management settings

---

# Facilitator User Manual

## Overview

Facilitators assist in task management and help coordinate between contributors and reviewers.

## Dashboard Features

### Main Dashboard (`/facilitator`)

- **Assigned Tasks**: View tasks assigned to you
- **Task Progress**: Monitor task completion status
- **Contributor Management**: View and manage contributors
- **Quality Metrics**: Track submission quality

## Task Management (`/facilitator/`)

### Features:

- View assigned tasks
- Access task details and instructions
- Monitor task progress
- Manage contributors
- Review submissions
- Coordinate with reviewers

### How to Use:

1. Navigate to "Tasks" from the sidebar
2. View your assigned tasks in the task list
3. Click on a task to access detailed information
4. Use the task interface to:
   - View task instructions
   - Monitor contributor progress
   - Review submissions
   - Coordinate with team members

## Contributor Management

### Features:

- View assigned contributors
- Monitor contributor performance
- Review contributor submissions
- Provide feedback and guidance
- Manage contributor assignments

### How to Use:

1. Navigate to a specific task
2. Access the "Users" tab
3. View the list of assigned contributors
4. Monitor individual contributor progress
5. Review submissions and provide feedback
6. Adjust assignments as needed

## Micro-Task Coordination

### Features:

- View micro-tasks within larger tasks
- Monitor micro-task distribution
- Track completion rates
- Coordinate with contributors
- Ensure quality standards

### How to Use:

1. Access a specific task
2. Navigate to the micro-task section
3. View the micro-task list and status
4. Monitor contributor progress
5. Coordinate task distribution
6. Ensure timely completion

## Submission Review

### Features:

- Review contributor submissions
- Check submission quality
- Provide feedback to contributors
- Coordinate with reviewers
- Track review progress

### How to Use:

1. Navigate to task submissions
2. Review individual submissions
3. Check for quality and completeness
4. Provide feedback to contributors
5. Coordinate with reviewers for final approval

---

# Reviewer User Manual

## Overview

Reviewers are responsible for quality assurance, reviewing submissions, and ensuring data quality standards.

## Dashboard Features

### Main Dashboard (`/reviewer`)

- **Review Queue**: View tasks awaiting review
- **Review Statistics**: Track review completion rates
- **Quality Metrics**: Monitor submission quality
- **Performance Dashboard**: View reviewer performance metrics

## Task Review (`/reviewer/tasks`)

### Features:

- View tasks assigned for review
- Access task details and requirements
- Review contributor submissions
- Approve or reject submissions
- Provide feedback and comments
- Flag problematic submissions

### How to Use:

1. Navigate to "Tasks" from the sidebar
2. View your assigned review tasks
3. Click on a task to access the review interface
4. Review submissions using the review tools
5. Make approval/rejection decisions
6. Provide detailed feedback

## Submission Review Process

### Review Interface:

1. **View Submission**: Access the contributor's work
2. **Check Quality**: Verify accuracy and completeness
3. **Compare Standards**: Ensure compliance with requirements
4. **Make Decision**: Approve, reject, or flag the submission
5. **Provide Feedback**: Add comments and suggestions

### Review Actions:

- **Approve**: Accept the submission as meeting quality standards
- **Reject**: Return the submission for revision with feedback
- **Flag**: Mark for special attention or further review
- **Comment**: Add detailed feedback and suggestions

## Quality Assurance Tools

### Features:

- Annotation validation
- Audio quality assessment
- Text accuracy verification
- Compliance checking
- Quality scoring

### How to Use:

1. Access the review interface for a submission
2. Use the quality assessment tools
3. Check against established standards
4. Document any issues or concerns
5. Make informed approval decisions

## Micro-Task Review

### Features:

- Review individual micro-tasks
- Monitor micro-task quality
- Track review progress
- Coordinate with facilitators
- Ensure consistent standards

### How to Use:

1. Navigate to micro-task submissions
2. Review each micro-task individually
3. Check for quality and accuracy
4. Make approval/rejection decisions
5. Provide specific feedback

## Rejection and Flagging

### Rejection Process:

1. Select rejection reasons from predefined options
2. Add detailed comments explaining the rejection
3. Provide specific guidance for improvement
4. Submit the rejection with feedback

### Flagging Process:

1. Select appropriate flag types
2. Add comments explaining the flag
3. Specify the nature of the issue
4. Submit the flag for further review

---

# Common Features

## Authentication and Login

### Login Process:

1. Navigate to the login page
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to your role-specific dashboard

### Password Management:

- Use strong passwords
- Change passwords regularly
- Contact admin for password reset

## Navigation

### Sidebar Navigation:

- **Dashboard**: Access your main dashboard
- **Role-specific menus**: Access features based on your role
- **Settings**: Manage your account settings
- **Help & Support**: Access help resources

### Breadcrumb Navigation:

- Use breadcrumbs to track your location
- Click on breadcrumb items to navigate back

## Search and Filtering

### Search Features:

- Use search bars to find specific items
- Search by name, email, or other identifiers
- Use advanced search options when available

### Filtering:

- Apply filters to narrow down results
- Use multiple filters simultaneously
- Save filter preferences for future use

## Data Export

### Export Options:

- Export data to CSV, Excel, or PDF formats
- Select specific data fields for export
- Schedule regular exports if needed

## Notifications

### Notification Types:

- Task assignments
- Submission reviews
- System updates
- Deadline reminders

### Managing Notifications:

- View notifications in the notification panel
- Mark notifications as read
- Configure notification preferences

---

# Troubleshooting

## Common Issues

### Login Problems:

- **Issue**: Cannot log in
- **Solution**: Check email and password, contact admin for reset

### Access Denied:

- **Issue**: Cannot access certain features
- **Solution**: Verify your role permissions, contact admin

### Performance Issues:

- **Issue**: Slow loading or system lag
- **Solution**: Check internet connection, clear browser cache

### Data Not Loading:

- **Issue**: Data not appearing in lists
- **Solution**: Refresh the page, check filters, contact support

## Browser Compatibility

### Supported Browsers:

- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)

### Browser Settings:

- Enable JavaScript
- Allow cookies
- Disable pop-up blockers for the site

## Error Messages

### Common Error Messages:

- **"Session Expired"**: Log out and log back in
- **"Access Denied"**: Contact admin for permission review
- **"Data Not Found"**: Check if the item exists or was deleted
- **"Network Error"**: Check internet connection

---

# Support

## Getting Help

### Self-Service Options:

- Check this user manual
- Review FAQ sections
- Use in-app help features

### Contact Support:

- **Email**: [Support Email]
- **Phone**: [Support Phone]
- **Hours**: [Support Hours]

### Escalation Process:

1. Try self-service options first
2. Contact support team
3. Escalate to system administrator if needed

## Training Resources

### Available Training:

- User manual (this document)
- Video tutorials
- Live training sessions
- Documentation library

### Best Practices:

- Follow role-specific guidelines
- Maintain data quality standards
- Communicate effectively with team members
- Report issues promptly

---

## Conclusion

This comprehensive user manual provides detailed guidance for all user types in the Mahder Frontend system. Each role has specific responsibilities and access levels, ensuring efficient project management and data quality control.

For additional support or questions not covered in this manual, please contact the system administrator or support team.

---

_Last Updated: [Current Date]_
_Version: 1.0_
