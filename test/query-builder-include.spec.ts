import { QueryBuilderService } from '../src/common/services/query-builder.service';
import {
  PaginationDto,
  QueryBuilderOptions,
} from '../src/common/dto/pagination.dto';

describe('QueryBuilderService - Include Relations', () => {
  it('should handle simple includes', () => {
    const paginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      include: {
        property: true,
        prices: true,
      },
    };

    const options: QueryBuilderOptions = {
      allowedIncludes: ['property', 'prices', 'galleries'],
    };

    const result = QueryBuilderService.buildQueryParams(paginationDto, options);

    expect(result.include).toEqual({
      property: true,
      prices: true,
    });
  });

  it('should handle nested includes', () => {
    const paginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      include: {
        property: {
          include: {
            owner: true,
            pic: true,
          },
        },
      },
    };

    const options: QueryBuilderOptions = {
      allowedIncludes: ['property'],
    };

    const result = QueryBuilderService.buildQueryParams(paginationDto, options);

    expect(result.include).toEqual({
      property: {
        include: {
          owner: true,
          pic: true,
        },
      },
    });
  });

  it('should filter out non-allowed includes', () => {
    const paginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      include: {
        property: true,
        prices: true,
        unauthorized: true, // This should be filtered out
      },
    };

    const options: QueryBuilderOptions = {
      allowedIncludes: ['property', 'prices'],
    };

    const result = QueryBuilderService.buildQueryParams(paginationDto, options);

    expect(result.include).toEqual({
      property: true,
      prices: true,
    });
    expect(result.include).not.toHaveProperty('unauthorized');
  });

  it('should merge with default includes', () => {
    const paginationDto: PaginationDto = {
      page: 1,
      limit: 10,
      include: {
        property: true,
      },
    };

    const options: QueryBuilderOptions = {
      defaultInclude: {
        galleries: true,
      },
      allowedIncludes: ['property'],
    };

    const result = QueryBuilderService.buildQueryParams(paginationDto, options);

    expect(result.include).toEqual({
      galleries: true,
      property: true,
    });
  });

  it('should use default includes when no include is provided', () => {
    const paginationDto: PaginationDto = {
      page: 1,
      limit: 10,
    };

    const options: QueryBuilderOptions = {
      defaultInclude: {
        galleries: true,
        prices: true,
      },
    };

    const result = QueryBuilderService.buildQueryParams(paginationDto, options);

    expect(result.include).toEqual({
      galleries: true,
      prices: true,
    });
  });
});
