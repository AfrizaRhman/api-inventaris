# Client CRUD API Documentation

This documentation describes the Client CRUD endpoints in the DWMS API, which follow the same pagination, search, and filtering pattern as the Auth module's `getAllUndeletedUsers` endpoint.

## Overview

The Client module provides comprehensive CRUD operations with advanced features:
- ✅ **Pagination** with customizable page size and sorting
- ✅ **Search** across multiple fields
- ✅ **Advanced Filtering** with multiple conditions
- ✅ **Soft Delete** functionality
- ✅ **Admin-only Access** with role-based authorization
- ✅ **Data Validation** using class-validator decorators

## Base URL
All client endpoints are prefixed with `/clients`

## Authentication
All endpoints require JWT authentication with admin role privileges.

```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Get All Clients (Paginated)
**Endpoint:** `POST /clients/list`

**Description:** Retrieve all undeleted clients with enhanced pagination, search, and filtering capabilities.

**Request Body:**
```typescript
{
  page?: number;           // Default: 1
  limit?: number;          // Default: 10, Max: 100
  sortField?: string;      // Available: id, name, client_type, email, phone, status, created_at, updated_at
  sortDirection?: 'asc' | 'desc'; // Default: 'asc'
  search?: string;         // Search term
  searchFields?: string[]; // Fields to search in: ['name', 'email', 'phone']
  filters?: ColumnFilterDto[]; // Advanced filtering
}
```

**Filter Conditions:**
- `contain` / `not_contain`
- `equal` / `not_equal`
- `start_with` / `end_with`
- `is_null` / `is_not_null`
- `greater_than` / `greater_than_or_equal`
- `less_than` / `less_than_or_equal`
- `in` / `not_in`
- `between`
- `date_after` / `date_before`

**Example Request:**
```json
{
  "page": 1,
  "limit": 10,
  "sortField": "created_at",
  "sortDirection": "desc",
  "search": "acme",
  "searchFields": ["name", "email"],
  "filters": [
    {
      "field": "client_type",
      "condition": "equal",
      "value": "company"
    },
    {
      "field": "status",
      "condition": "equal",
      "value": "active"
    }
  ]
}
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corporation",
      "client_type": "company",
      "email": "contact@acme.com",
      "phone": "+1234567890",
      "address": "123 Business Street",
      "village": "Business Village",
      "district": "Business District",
      "province": "Business Province",
      "profile": "Company profile description",
      "main_photo": "photo_url",
      "website_url": "https://acme.com",
      "status": "active",
      "created_at": 1642781234,
      "updated_at": 1642781234,
      "deleted_at": null
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. Create Client
**Endpoint:** `POST /clients`

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "client_type": "company", // Options: individual, company, organization
  "email": "contact@acme.com", // Optional, must be unique
  "phone": "+1234567890", // Optional, must be unique
  "address": "123 Business Street", // Optional
  "village": "Business Village", // Optional
  "district": "Business District", // Optional
  "province": "Business Province", // Optional
  "profile": "Company description", // Optional
  "main_photo": "photo_url", // Optional
  "website_url": "https://acme.com", // Optional
  "status": "active" // Optional, Options: active, inactive, suspended
}
```

### 3. Get Client by ID
**Endpoint:** `GET /clients/{id}`

**Response:** Single client object (same structure as above)

### 4. Update Client
**Endpoint:** `PATCH /clients/{id}`

**Request Body:** Partial client object (same fields as create, all optional)

### 5. Soft Delete Client
**Endpoint:** `DELETE /clients/{id}`

**Description:** Marks the client as deleted without removing from database.

### 6. Get All Clients (Including Deleted)
**Endpoint:** `GET /clients/admin/clients/all`

**Description:** Returns all clients including soft-deleted ones.

### 7. Get Only Deleted Clients
**Endpoint:** `GET /clients/admin/clients/deleted`

**Description:** Returns only soft-deleted clients.

### 8. Restore Deleted Client
**Endpoint:** `PATCH /clients/admin/clients/{id}/restore`

**Description:** Restores a soft-deleted client.

### 9. Permanently Delete Client
**Endpoint:** `DELETE /clients/admin/clients/{id}/permanent`

**Description:** Permanently removes the client from the database (hard delete).

### 10. Get Soft Delete Statistics
**Endpoint:** `GET /clients/admin/stats/soft-delete`

**Response:**
```json
{
  "total": 100,
  "active": 85,
  "deleted": 15
}
```

## Client Types
- `individual` - Individual person
- `company` - Business company
- `organization` - Non-profit or other organization

## Client Status
- `active` - Active client
- `inactive` - Inactive but not deleted
- `suspended` - Temporarily suspended

## Validation Rules

### Required Fields
- `name`: 2-50 characters
- `client_type`: Must be one of the enum values

### Optional Fields
- `email`: Valid email format, max 70 characters, unique
- `phone`: Valid phone number format, max 20 characters, unique
- `address`: String
- `village`: Max 50 characters
- `district`: Max 50 characters
- `province`: Max 50 characters
- `profile`: String
- `main_photo`: String (URL or file path)
- `website_url`: Valid URL format
- `status`: Must be one of the enum values

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "message": "Unauthorized: Admin access required"
}
```

**404 Not Found:**
```json
{
  "message": "Client not found"
}
```

**409 Conflict:**
```json
{
  "message": "Client with this email already exists"
}
```

**400 Bad Request:**
```json
{
  "message": ["name must be longer than or equal to 2 characters"],
  "error": "Bad Request",
  "statusCode": 400
}
```

## Usage Tips

1. **Pagination:** Use reasonable page sizes (10-50) for better performance
2. **Search:** Combine search with filters for more precise results
3. **Sorting:** Use indexed fields for better performance
4. **Filtering:** Use specific filters instead of broad searches when possible
5. **Soft Delete:** Always use soft delete for data integrity unless permanent deletion is required

## Example Usage in Frontend

```typescript
// Get paginated clients with filters
const getClients = async (filters: any) => {
  const response = await fetch('/clients/admin/clients', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      page: 1,
      limit: 20,
      sortField: 'name',
      sortDirection: 'asc',
      search: filters.search,
      filters: [
        {
          field: 'status',
          condition: 'equal',
          value: 'active'
        }
      ]
    })
  });
  
  return await response.json();
};
```

This Client CRUD implementation follows the exact same pattern as the Auth module's `getAllUndeletedUsers` endpoint, providing consistent API behavior across the application.
