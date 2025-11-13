/**
 * Client CRUD Examples
 *
 * This file demonstrates how to use the Client CRUD endpoints following
 * the same pattern as the Auth module's getAllUndeletedUsers endpoint.
 */

export interface ClientPaginationExample {
  // Example request body for getAllUndeletedClients endpoint
  // POST /clients/admin/clients
  paginationRequest: {
    page: number;
    limit: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    search?: string;
    searchFields?: string[];
    filters?: Array<{
      field: string;
      condition: string;
      value?: any;
      values?: any[];
    }>;
  };
}

// Example usage:
export const clientEndpointExamples = {
  // Get paginated clients with search and filters
  getAllUndeletedClients: {
    method: 'POST',
    url: '/clients/admin/clients',
    headers: {
      Authorization: 'Bearer <jwt_token>',
      'Content-Type': 'application/json',
    },
    body: {
      page: 1,
      limit: 10,
      sortField: 'created_at',
      sortDirection: 'desc',
      search: 'john',
      searchFields: ['name', 'email'],
      filters: [
        {
          field: 'client_type',
          condition: 'equal',
          value: 'company',
        },
        {
          field: 'status',
          condition: 'equal',
          value: 'active',
        },
      ],
    },
  },

  // Create a new client
  createClient: {
    method: 'POST',
    url: '/clients',
    headers: {
      Authorization: 'Bearer <jwt_token>',
      'Content-Type': 'application/json',
    },
    body: {
      name: 'Acme Corporation',
      client_type: 'company',
      email: 'contact@acme.com',
      phone: '+1234567890',
      address: '123 Business Street',
      village: 'Business Village',
      district: 'Business District',
      province: 'Business Province',
      website_url: 'https://acme.com',
      status: 'active',
    },
  },

  // Get client by ID
  getClientById: {
    method: 'GET',
    url: '/clients/{id}',
    headers: {
      Authorization: 'Bearer <jwt_token>',
    },
  },

  // Update client
  updateClient: {
    method: 'PATCH',
    url: '/clients/{id}',
    headers: {
      Authorization: 'Bearer <jwt_token>',
      'Content-Type': 'application/json',
    },
    body: {
      name: 'Updated Company Name',
      status: 'inactive',
    },
  },

  // Soft delete client
  deleteClient: {
    method: 'DELETE',
    url: '/clients/{id}',
    headers: {
      Authorization: 'Bearer <jwt_token>',
    },
  },

  // Get all clients including deleted
  getAllClientsWithDeleted: {
    method: 'GET',
    url: '/clients/admin/clients/all',
    headers: {
      Authorization: 'Bearer <jwt_token>',
    },
  },

  // Get only deleted clients
  getDeletedClients: {
    method: 'GET',
    url: '/clients/admin/clients/deleted',
    headers: {
      Authorization: 'Bearer <jwt_token>',
    },
  },

  // Restore deleted client
  restoreClient: {
    method: 'PATCH',
    url: '/clients/admin/clients/{id}/restore',
    headers: {
      Authorization: 'Bearer <jwt_token>',
    },
  },

  // Permanently delete client
  permanentlyDeleteClient: {
    method: 'DELETE',
    url: '/clients/admin/clients/{id}/permanent',
    headers: {
      Authorization: 'Bearer <jwt_token>',
    },
  },

  // Get soft delete statistics
  getSoftDeleteStats: {
    method: 'GET',
    url: '/clients/admin/stats/soft-delete',
    headers: {
      Authorization: 'Bearer <jwt_token>',
    },
  },
};
