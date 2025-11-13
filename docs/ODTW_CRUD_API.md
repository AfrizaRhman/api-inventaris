# ODTW CRUD API Documentation

This documentation describes the ODTW CRUD endpoints in the nams-office API, which follow the same pagination, search, and filtering pattern as the Users module's `getAllUndeletedUsers` endpoint.

## Overview

The ODTW module provides comprehensive CRUD operations with advanced features:
- ✅ **Pagination** with customizable page size and sorting
- ✅ **Search** across multiple fields
- ✅ **Advanced Filtering** with multiple conditions
- ✅ **Soft Delete** functionality
- ✅ **Role-based Access** with role-based authorization
- ✅ **Data Validation** using class-validator decorators

## Security Features

- All endpoints require JWT authentication
- Role-based access control (perhutani role required for most operations)
- Request validation with class-validator
- Protected routes with JWT guards

## Core Endpoints

### POST /odtws
**Create a new ODTW** (perhutani role only)

Request Body:
```json
{
  "name": "ODTW Name",
  "address": "ODTW Address",
  "village": "Village Name",
  "district": "District Name",
  "city": "City Name",
  "province": "Province Name",
  "email": "odtw@example.com",
  "longitude": "123.456",
  "latitude": "78.901",
  "status": "active"
}
```

### POST /odtws/list
**Get paginated ODTWs with filters** (perhutani role only)

Request Body:
```json
{
  "page": 1,
  "limit": 20,
  "sortField": "name",
  "sortDirection": "asc",
  "search": "search_term",
  "filters": [
    {
      "field": "status",
      "condition": "equal",
      "value": "active"
    }
  ]
}
```

### GET /odtws/:id
**Get ODTW by ID** (perhutani and user roles)

### PATCH /odtws/:id
**Update an ODTW** (perhutani role only)

Request Body:
```json
{
  "name": "Updated ODTW Name",
  "status": "inactive"
}
```

### DELETE /odtws/:id
**Soft delete an ODTW** (perhutani role only)

### GET /odtws/admin/odtws
**Get all ODTWs including soft deleted ones** (perhutani role only)

## Implementation Approach

The ODTW CRUD implementation follows the exact same pattern as the Users module:

1. **Separated Components**: Clear separation between table/list operations and form operations
2. **Consistent Patterns**: Same pagination, search, and filtering patterns as the Users module
3. **Error Handling**: Comprehensive error handling for conflicts (email/name already exists)
4. **Role-based Access**: Proper role-based access control with perhutani role required for most operations
5. **Soft Delete**: Laravel-style soft delete with epoch timestamps
6. **Type Safety**: Proper type safety with appropriate type assertions

This approach ensures consistency across the application and makes it easier to maintain and extend the codebase.