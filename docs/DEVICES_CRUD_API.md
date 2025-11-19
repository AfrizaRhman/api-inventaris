# Devices CRUD API Documentation

This documentation describes the Devices CRUD endpoints in the NAMS API, which follow the same pagination, search, and filtering pattern as the other modules in the system.

## Base URL

All device endpoints are prefixed with `/devices`

## Security Features

- All endpoints require JWT authentication
- Role-based access control (admin privileges required)
- Request validation with class-validator
- Protected routes with JWT guards
- Soft delete implementation

## Data Model

The Device model contains the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | Yes | Unique identifier for the device |
| odtw_id | string (UUID) | Yes | Reference to the ODTW location |
| token | string | No | Authentication token for the device |
| device_id | string | No | Unique identifier for the physical device |
| device_name | string | No | Human-readable name for the device |
| webhook_url | string | No | URL where the device sends webhook notifications |
| logged_in | boolean | No | Whether the device is currently logged in |
| connected | boolean | No | Whether the device is currently connected |
| jid | string | No | Jabber ID for the device |
| meta_data | JSON | No | Additional metadata about the device |
| created_at | integer | Yes | Unix timestamp of creation |
| updated_at | integer | Yes | Unix timestamp of last update |
| deleted_at | integer | No | Unix timestamp of soft deletion |
| created_by | string (UUID) | No | User who created the device |
| updated_by | string (UUID) | No | User who last updated the device |
| deleted_by | string (UUID) | No | User who soft-deleted the device |

## Endpoints

### Create a Device

Creates a new device record.

**POST** `/devices`

#### Request Body
```json
{
  "odtw_id": "string",
  "token": "string",
  "device_id": "string",
  "device_name": "string",
  "webhook_url": "string",
  "logged_in": "boolean",
  "connected": "boolean",
  "jid": "string",
  "meta_data": "json"
}
```

#### Validation Rules
- `odtw_id` is required and must reference an existing ODTW
- `device_id` must be unique across all devices
- If `device_id` is provided, it cannot conflict with an existing device

#### Response
Returns the created device object with all fields.

**Status:** 201 Created

### List Devices (Paginated)

Retrieves a paginated list of devices with optional filtering, searching, and sorting.

**POST** `/devices/list`

#### Request Body
```json
{
  "page": 1,
  "limit": 10,
  "search": "string",
  "filters": {
    "odtw_id": "string",
    "status": "string"
  },
  "sort": {
    "field": "created_at",
    "direction": "desc"
  }
}
```

#### Parameters
- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)
- `search`: Text to search in `device_id` and `token` fields
- `filters`: Object containing filter criteria
  - `odtw_id`: Filter by ODTW ID
  - `status`: Filter by status (if implemented)
- `sort`: Object specifying sort field and direction
  - `field`: Field to sort by (default: `created_at`)
  - `direction`: Sort direction (`asc` or `desc`, default: `desc`)

#### Response
Returns a paginated response with the following structure:

```json
{
  "data": [
    {
      "id": "string",
      "odtw_id": "string",
      "token": "string",
      "device_id": "string",
      "device_name": "string",
      "webhook_url": "string",
      "created_at": "number",
      "updated_at": "number",
      "deleted_at": "number"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

**Status:** 200 OK

### Get Device by ID

Retrieves a specific device by its ID.

**GET** `/devices/:id`

#### Response
Returns the device object with all fields.

**Status:** 200 OK

**Error:** 404 Not Found if device does not exist

### Update Device

Updates an existing device.

**PATCH** `/devices/:id`

#### Request Body
```json
{
  "token": "string",
  "device_id": "string",
  "device_name": "string",
  "webhook_url": "string",
  "logged_in": "boolean",
  "connected": "boolean",
  "jid": "string",
  "meta_data": "json"
}
```

#### Validation Rules
- Device must exist
- If `device_id` is being updated, it must not conflict with an existing device

#### Response
Returns the updated device object with all fields.

**Status:** 200 OK

**Error:** 404 Not Found if device does not exist

### Delete Device (Soft Delete)

Soft deletes a device by setting the `deleted_at` timestamp.

**DELETE** `/devices/:id`

#### Response
Returns the device object with the `deleted_at` field updated.

**Status:** 200 OK

**Error:** 404 Not Found if device does not exist

## Notes

- All endpoints require JWT authentication.
- Admin-only endpoints require appropriate role privileges.
- All list endpoints use select fields for minimal, consistent responses.
- Error handling is consistent across the API (404 for not found, appropriate error messages for validation failures).
- The API implements soft delete functionality - deleted records are not permanently removed but are filtered out in list queries.
- The `device_id` field must be unique across all devices.