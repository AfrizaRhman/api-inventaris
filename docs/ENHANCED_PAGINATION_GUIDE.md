# Enhanced Pagination API Usage Guide

This guide demonstrates how to use the enhanced pagination system with relational queries in your NestJS controllers.

## Basic Features

### 1. Include Relations (Existing Feature)
```typescript
// Frontend request
const request = {
  page: 1,
  limit: 10,
  include: {
    property: {
      include: {
        owner: true,
        pic: true
      }
    },
    prices: true,
    galleries: true
  }
};

// Controller
@Post('list')
async getAllPaginated(@Body() paginationDto: PaginationDto) {
  return this.rentalUnitsService.findAllPaginated(paginationDto);
}
```

### 2. Select Specific Fields
```typescript
// Frontend request with select (overrides include)
const request = {
  page: 1,
  limit: 10,
  include: { property: true }, // Will be ignored if select is provided
};

// In your service's buildQueryParams call
const queryParams = QueryBuilderService.buildQueryParams(
  paginationDto,
  this.getQueryOptions(),
  additionalWhere,
  {
    property: {
      select: {
        id: true,
        name: true,
        address: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    },
    prices: {
      select: {
        id: true,
        amount: true,
        type: true
      }
    }
  } // select parameter
);
```

### 3. Dot Notation Search in Relations
```typescript
// Frontend request
const request = {
  page: 1,
  limit: 10,
  search: "John", // Will search in 'property.owner.name' if configured
  include: {
    property: {
      include: { owner: true }
    }
  }
};

// In your service's getQueryOptions()
protected getQueryOptions() {
  return {
    searchFields: [
      'name',
      'description',
      'property.name',      // Search in related property name
      'property.address',   // Search in related property address
      'property.owner.name' // Search in related property owner name
    ],
    // ... other options
  };
}
```

## Advanced Relational Queries with additionalWhere

### 1. Properties Owned by Specific User
```typescript
@Post('by-owner/:ownerId')
async getPropertiesByOwner(
  @Param('ownerId') ownerId: string,
  @Body() paginationDto: PaginationDto,
) {
  const additionalWhere = {
    owner_id: ownerId,
  };
  
  return this.propertiesService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 2. Properties with Ready Rental Units
```typescript
@Post('with-ready-units')
async getPropertiesWithReadyUnits(@Body() paginationDto: PaginationDto) {
  const additionalWhere = QueryBuilderService.relationExists(
    'rental_units',
    'some',
    { status: 'ready' },
  );
  
  return this.propertiesService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 3. Properties with No Rental Units
```typescript
@Post('without-units')
async getPropertiesWithoutUnits(@Body() paginationDto: PaginationDto) {
  const additionalWhere = QueryBuilderService.relationExists(
    'rental_units',
    'none',
  );
  
  return this.propertiesService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 4. Search by Owner Name (Relational Search)
```typescript
@Post('by-owner-name')
async getPropertiesByOwnerName(
  @Body() body: { ownerName: string } & PaginationDto,
) {
  const { ownerName, ...paginationDto } = body;
  
  const additionalWhere = {
    owner: {
      name: {
        contains: ownerName,
        mode: 'insensitive',
      },
    },
  };
  
  return this.propertiesService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 5. Properties with Rental Units in Price Range
```typescript
@Post('by-price-range')
async getPropertiesByPriceRange(
  @Body() body: { minPrice: number; maxPrice: number } & PaginationDto,
) {
  const { minPrice, maxPrice, ...paginationDto } = body;
  
  const additionalWhere = {
    rental_units: {
      some: {
        prices: {
          some: {
            AND: [
              { amount: { gte: minPrice } },
              { amount: { lte: maxPrice } },
            ],
          },
        },
      },
    },
  };
  
  return this.propertiesService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 6. Complex Search Using Helper Methods
```typescript
@Post('advanced-search')
async advancedSearch(
  @Body() body: {
    ownerName?: string;
    hasReadyUnits?: boolean;
    priceRange?: { min: number; max: number };
    categories?: string[];
  } & PaginationDto,
) {
  const { ownerName, hasReadyUnits, priceRange, categories, ...paginationDto } = body;
  
  const additionalWhere = QueryBuilderService.buildPropertyRelationFilter({
    ownerName,
    hasReadyUnits,
    priceRange,
    category: categories,
  });
  
  return this.propertiesService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 7. Rental Units by Property Owner
```typescript
@Post('by-property-owner')
async getRentalUnitsByPropertyOwner(
  @Body() body: { ownerName: string } & PaginationDto,
) {
  const { ownerName, ...paginationDto } = body;
  
  const additionalWhere = QueryBuilderService.nestedRelationFilter(
    'property.owner.name',
    { contains: ownerName, mode: 'insensitive' },
  );
  
  return this.rentalUnitsService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 8. Multiple Conditions Combined
```typescript
@Post('available-in-location')
async getAvailableInLocation(
  @Body() body: { city: string; minCapacity?: number } & PaginationDto,
) {
  const { city, minCapacity, ...paginationDto } = body;
  
  const conditions: any[] = [
    { status: 'ready' },
    {
      property: {
        city: { contains: city, mode: 'insensitive' },
      },
    },
  ];
  
  if (minCapacity) {
    conditions.push({ capacity: { gte: minCapacity } });
  }
  
  const additionalWhere = QueryBuilderService.combineConditions('AND', conditions);
  
  return this.rentalUnitsService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

### 9. Comprehensive Search Using buildRentalUnitRelationFilter
```typescript
@Post('comprehensive-search')
async comprehensiveSearch(
  @Body() body: {
    propertyOwnerName?: string;
    propertyName?: string;
    propertyCategories?: string[];
    minPrice?: number;
    maxPrice?: number;
    minCapacity?: number;
    city?: string;
    province?: string;
    hasImages?: boolean;
  } & PaginationDto,
) {
  const {
    propertyOwnerName,
    propertyName,
    propertyCategories,
    minPrice,
    maxPrice,
    minCapacity,
    city,
    province,
    hasImages,
    ...paginationDto
  } = body;
  
  const additionalWhere = QueryBuilderService.buildRentalUnitRelationFilter({
    propertyOwnerName,
    propertyName,
    propertyCategory: propertyCategories,
    priceRange: minPrice && maxPrice ? { min: minPrice, max: maxPrice } : undefined,
    availableCapacity: minCapacity,
    propertyLocation: { city, province },
    hasImages,
  });
  
  return this.rentalUnitsService.findAllPaginated(
    paginationDto,
    additionalWhere,
  );
}
```

## Helper Methods Available

### QueryBuilderService.relationExists(relationName, condition, filter?)
- `relationName`: The name of the relation field
- `condition`: 'some', 'every', or 'none'
- `filter`: Optional filter to apply to the related records

### QueryBuilderService.nestedRelationFilter(path, condition)
- `path`: Dot notation path like 'property.owner.name'
- `condition`: Prisma condition object

### QueryBuilderService.combineConditions(operator, conditions)
- `operator`: 'AND' or 'OR'
- `conditions`: Array of condition objects

### QueryBuilderService.buildPropertyRelationFilter(options)
Helper for property-related filters with options:
- `ownerName`: Filter by owner name
- `hasReadyUnits`: Filter properties with ready rental units
- `priceRange`: Filter by rental unit price range
- `category`: Filter by property categories

### QueryBuilderService.buildRentalUnitRelationFilter(options)
Helper for rental unit-related filters with options:
- `propertyOwnerName`: Filter by property owner name
- `propertyName`: Filter by property name
- `propertyCategory`: Filter by property categories
- `priceRange`: Filter by price range
- `availableCapacity`: Filter by minimum capacity
- `propertyLocation`: Filter by city/province
- `hasImages`: Filter units with/without images

## Frontend API Call Examples

```typescript
// 1. Basic list with includes
const basicRequest = {
  page: 1,
  limit: 10,
  include: {
    property: {
      include: {
        owner: true,
        pic: true
      }
    },
    prices: true,
    galleries: true
  }
};

// 2. Search with dot notation
const searchRequest = {
  page: 1,
  limit: 10,
  search: "John",  // Will search in property.owner.name if configured
  include: {
    property: {
      include: { owner: true }
    }
  }
};

// 3. Advanced property search
const advancedPropertySearch = {
  page: 1,
  limit: 10,
  ownerName: "John",
  hasReadyUnits: true,
  priceRange: { min: 500000, max: 1000000 },
  categories: ["villa", "resort"],
  include: {
    owner: true,
    rental_units: {
      include: {
        prices: true
      }
    }
  }
};

// 4. Comprehensive rental unit search
const comprehensiveRentalSearch = {
  page: 1,
  limit: 10,
  propertyOwnerName: "John",
  propertyCategories: ["villa", "resort"],
  minPrice: 500000,
  maxPrice: 1000000,
  minCapacity: 4,
  city: "Ubud",
  hasImages: true,
  include: {
    property: {
      include: {
        owner: true
      }
    },
    prices: true,
    galleries: true
  }
};

// API calls using your composable
const res1 = await api.apiCall('/rental-units/list', { 
  method: 'POST', 
  body: basicRequest 
});

const res2 = await api.apiCall('/properties/advanced-search', { 
  method: 'POST', 
  body: advancedPropertySearch 
});

const res3 = await api.apiCall('/rental-units/comprehensive-search', { 
  method: 'POST', 
  body: comprehensiveRentalSearch 
});
```

## Key Benefits

1. **Flexible Relations**: Support for both `include` and `select` with automatic prioritization
2. **Dot Notation Search**: Search across related entities using dot notation in searchFields
3. **Complex Filtering**: Use `additionalWhere` for sophisticated relational queries
4. **Helper Methods**: Pre-built helpers for common relational query patterns
5. **Type Safety**: Full TypeScript support with proper type checking
6. **Performance**: Optimized queries with proper Prisma query building

## Migration Notes

This enhanced system is backward compatible. Existing code using basic includes will continue to work without changes. The new features are additive and optional.

### 4. Client-side Usage

```typescript
// Properties with ready rental units
const additionalWhere = QueryBuilderService.relationExists(
  'rental_units', 'some', { status: 'ready' }
);

// Rental units by property owner name
const additionalWhere = QueryBuilderService.nestedRelationFilter(
  'property.owner.name',
  { contains: 'John', mode: 'insensitive' }
);

// Complex search with multiple filters
const additionalWhere = QueryBuilderService.buildRentalUnitRelationFilter({
  propertyOwnerName: 'John',
  priceRange: { min: 500000, max: 1000000 },
  hasImages: true,
  propertyLocation: { city: 'Ubud' }
});