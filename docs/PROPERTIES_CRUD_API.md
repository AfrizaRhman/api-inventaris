# Properties CRUD API

This document describes the CRUD API for the `properties` resource, aligned with the approach used for the `users` module. All endpoints are protected by `JwtAuthGuard`.

---

## Endpoints

### 1. Paginated, Filtered, Searchable List

**POST** `/properties/list`

- **Body:** [`PaginationDto`](../src/common/dto/pagination.dto.ts)
- **Description:** Returns paginated, filtered, and searchable list of properties.
- **Response fields:**
  - `id`, `name`, `category`, `status`, `owner_id`, `pic_id`, `address`, `village`, `district`, `province`, `main_photo`, `created_at`, `updated_at`, `deleted_at`
- **Example:**
  ```json
  {
    "page": 1,
    "limit": 10,
    "sortField": "created_at",
    "sortDirection": "desc",
    "search": "villa",
    "filters": [
      { "field": "status", "condition": "equal", "value": "active" }
    ]
  }
  ```

---

### 2. Create Property

**POST** `/properties`

- **Body:** [`CreatePropertyDto`](../src/properties/dto/property.dto.ts)
- **Description:** Creates a new property. `category` must be one of the allowed enum values.

---

### 3. Get Property by ID

**GET** `/properties/:id`

- **Description:** Returns property details by ID. Throws 404 if not found.

---

### 4. Update Property

**PATCH** `/properties/:id`

- **Body:** [`UpdatePropertyDto`](../src/properties/dto/property.dto.ts)
- **Description:** Updates an existing property by ID.

---

### 5. Soft Delete Property

**DELETE** `/properties/:id`

- **Description:** Soft deletes a property (sets `deleted_at` timestamp).

---

### 6. List All Properties (Including Soft Deleted, Admin Only)

**GET** `/properties/admin/all`

- **Description:** Returns all properties, including soft deleted ones. Only accessible to users with admin role.
- **Response fields:** Same as paginated list.

---

## Notes

- All endpoints require JWT authentication.
- Admin-only endpoints require `req.user.role !== 'user'`.
- All list endpoints use select fields for minimal, consistent responses.
- Error handling is consistent with the users module (404 for not found, error for unauthorized admin access).

---

## See Also

- [`PaginationDto`](../src/common/dto/pagination.dto.ts)
- [`CreatePropertyDto`, `UpdatePropertyDto`](../src/properties/dto/property.dto.ts)
- [`BaseService`](../src/common/services/base.service.ts)