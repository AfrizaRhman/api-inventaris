# Pagination with Relations

The `BaseService.findAllPaginated` method now supports including related data through the `include` parameter in the `PaginationDto`.

## How to Use

### 1. Include Simple Relations

To include related data, add an `include` property to your pagination request:

```typescript
const paginationDto: PaginationDto = {
  page: 1,
  limit: 10,
  include: {
    property: true,
    prices: true,
  }
};

// This will return rental units with their property and prices
const result = await rentalUnitsService.findAllPaginated(paginationDto);
```

### 2. Include Nested Relations

You can also include nested relations:

```typescript
const paginationDto: PaginationDto = {
  page: 1,
  limit: 10,
  include: {
    property: {
      include: {
        owner: true,
        pic: true,
      }
    },
    prices: true,
  }
};

// This will return rental units with their property (including owner and pic) and prices
const result = await rentalUnitsService.findAllPaginated(paginationDto);
```

### 3. Example API Usage

In your controller, you can now remove the commented select lines and use includes:

```typescript
@Get('paginated')
async findAllPaginated(@Query() paginationDto: PaginationDto) {
  // No need to define select manually anymore
  // The include will be handled automatically based on the request
  return this.rentalUnitsService.findAllPaginated(paginationDto);
}
```

### 4. Client-side Usage

From the frontend, you can pass the include parameter:

```javascript
// GET /rental-units/paginated?page=1&limit=10&include[property]=true&include[prices]=true

// Or with nested includes:
// GET /rental-units/paginated?page=1&limit=10&include[property][include][owner]=true&include[property][include][pic]=true
```

### 5. Available Relations

#### RentalUnits Service
- `property` - The property this rental unit belongs to
- `reservations` - All reservations for this rental unit
- `prices` - Price configurations for this rental unit
- `galleries` - Photo gallery for this rental unit

#### Properties Service
- `owner` - The user who owns this property
- `pic` - The person in charge of this property
- `rental_units` - All rental units in this property

## Security & Validation

The system includes security measures:

1. **Allowed Includes**: Each service defines which relations can be included through the `allowedIncludes` array
2. **Validation**: Only allowed relations will be included, others are filtered out
3. **Default Includes**: Services can define default relations to always include

## Example Response

With includes, your response will look like:

```json
{
  "data": [
    {
      "id": "uuid-1",
      "name": "Villa Room 1",
      "type": "villa",
      "capacity": 4,
      "property": {
        "id": "prop-uuid-1",
        "name": "Beautiful Villa Resort",
        "category": "villa",
        "owner": {
          "id": "user-uuid-1",
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      "prices": [
        {
          "id": "price-uuid-1",
          "price_type": "weekday",
          "amount": 500000
        }
      ]
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

## Migration from Current Implementation

If you're currently using `select` to manually define fields, you can now:

1. Remove the manual `select` object
2. Use `include` in the pagination DTO instead
3. The system will automatically handle the relations based on what's allowed

Before:
```typescript
const select = {
  id: true,
  name: true,
  // property: {
  //   name: true,
  //   address: true,
  // },
};
return this.rentalUnitsService.findAllPaginated(paginationDto, {}, select);
```

After:
```typescript
// Include is now handled automatically from the paginationDto
return this.rentalUnitsService.findAllPaginated(paginationDto);
```
