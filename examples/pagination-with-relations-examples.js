// Example usage of the new pagination with relations feature

// 1. Simple include - Get rental units with their property
const simpleIncludeExample = {
  page: 1,
  limit: 10,
  include: {
    property: true
  }
};

// 2. Multiple relations - Get rental units with property, prices, and galleries
const multipleRelationsExample = {
  page: 1,
  limit: 10,
  include: {
    property: true,
    prices: true,
    galleries: true
  }
};

// 3. Nested relations - Get properties with owner, pic, and rental units
const nestedRelationsExample = {
  page: 1,
  limit: 10,
  include: {
    owner: true,
    pic: true,
    rental_units: {
      include: {
        prices: true,
        galleries: true
      }
    }
  }
};

// 4. With search and filters
const complexExample = {
  page: 1,
  limit: 10,
  search: "villa",
  searchFields: ["name", "type"],
  sortField: "created_at",
  sortDirection: "desc",
  filters: [
    {
      field: "status",
      condition: "equal",
      value: "ready"
    }
  ],
  include: {
    property: {
      include: {
        owner: true
      }
    },
    prices: true
  }
};

// 5. HTTP Request examples

// Simple GET request with query params:
// GET /rental-units/list?page=1&limit=10&include[property]=true

// POST request with body:
/*
POST /rental-units/list
Content-Type: application/json

{
  "page": 1,
  "limit": 10,
  "include": {
    "property": {
      "include": {
        "owner": true,
        "pic": true
      }
    },
    "prices": true,
    "galleries": true
  }
}
*/

// 6. Frontend JavaScript example:
const fetchRentalUnitsWithRelations = async () => {
  const response = await fetch('/api/rental-units/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your-jwt-token'
    },
    body: JSON.stringify({
      page: 1,
      limit: 10,
      include: {
        property: {
          include: {
            owner: true,
            pic: true
          }
        },
        prices: true
      }
    })
  });
  
  const data = await response.json();
  return data;
};

// 7. Expected response structure:
/*
{
  "data": [
    {
      "id": "rental-unit-uuid",
      "name": "Villa Room 1",
      "type": "villa",
      "capacity": 4,
      "status": "ready",
      "property": {
        "id": "property-uuid",
        "name": "Beautiful Villa Resort",
        "category": "villa",
        "owner": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "pic": {
          "id": "pic-user-uuid",
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      },
      "prices": [
        {
          "id": "price-uuid",
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
*/
