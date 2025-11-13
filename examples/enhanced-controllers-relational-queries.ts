// Enhanced Controllers with Relational Query Examples
// This file demonstrates how to use the enhanced pagination system with relational queries

import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaginationDto } from '../src/common/dto/pagination.dto';
import { QueryBuilderService } from '../src/common/services/query-builder.service';

// Frontend API call examples:

/*
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

// 2. Properties with ready units
const propertiesWithReadyUnits = {
  page: 1,
  limit: 10,
  include: {
    owner: true,
    rental_units: {
      where: { status: 'ready' }
    }
  }
};

// 3. Advanced search
const advancedSearch = {
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
const comprehensiveSearch = {
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

// API calls:
const res1 = await api.apiCall('/properties/list', { method: 'POST', body: basicRequest });
const res2 = await api.apiCall('/properties/with-ready-units', { method: 'POST', body: propertiesWithReadyUnits });
const res3 = await api.apiCall('/properties/advanced-search', { method: 'POST', body: advancedSearch });
const res4 = await api.apiCall('/rental-units/comprehensive-search', { method: 'POST', body: comprehensiveSearch });
*/
