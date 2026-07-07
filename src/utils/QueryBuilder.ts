import { Query } from 'mongoose';

interface QueryParams {
  page?: string;
  limit?: string;
  sort?: string;
  search?: string;
  [key: string]: unknown;
}

/**
 * Generic Query Builder — Bonus Feature
 * Chainable helper that adds search, filter, sort & pagination
 * to any Mongoose Query. Reusable across Product, Customer, Sale modules.
 */
export class QueryBuilder<T> {
  public query: Query<T[], T>;
  private queryParams: QueryParams;
  private paginationInfo = { page: 1, limit: 10 };

  constructor(query: Query<T[], T>, queryParams: QueryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  search(searchableFields: string[]) {
    const searchTerm = this.queryParams.search;
    if (searchTerm) {
      this.query = this.query.find({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })) as never,
      });
    }
    return this;
  }

  filter(excludeFields: string[] = ['page', 'limit', 'sort', 'search']) {
    const filters = { ...this.queryParams };
    excludeFields.forEach((field) => delete filters[field]);
    if (Object.keys(filters).length) {
      this.query = this.query.find(filters as never);
    }
    return this;
  }

  sort() {
    const sortBy = this.queryParams.sort
      ? String(this.queryParams.sort).split(',').join(' ')
      : '-createdAt';
    this.query = this.query.sort(sortBy);
    return this;
  }

  paginate() {
    const page = Math.max(Number(this.queryParams.page) || 1, 1);
    const limit = Math.max(Number(this.queryParams.limit) || 10, 1);
    const skip = (page - 1) * limit;
    this.paginationInfo = { page, limit };
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  getPaginationInfo() {
    return this.paginationInfo;
  }
}
