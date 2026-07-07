import { CustomerModel, ICustomer } from './customer.model';
import { QueryBuilder } from '../../utils/QueryBuilder';
import { buildPaginationMeta } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

interface CustomerInput {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

const SEARCHABLE_FIELDS = ['name', 'phone', 'email'];

export const CustomerService = {
  create: async (input: CustomerInput, createdBy: string): Promise<ICustomer> => {
    const existing = await CustomerModel.findOne({ phone: input.phone });
    if (existing) {
      throw ApiError.conflict(`Customer with phone '${input.phone}' already exists`);
    }
    return CustomerModel.create({ ...input, createdBy });
  },

  getAll: async (queryParams: Record<string, unknown>) => {
    const includeInactive = queryParams.includeInactive === 'true';
    const baseFilter = includeInactive ? {} : { isActive: true };

    const filteredParams = { ...queryParams };
    delete filteredParams.includeInactive;

    const builder = new QueryBuilder<ICustomer>(
      CustomerModel.find(baseFilter),
      filteredParams
    );

    const builtQuery = builder.search(SEARCHABLE_FIELDS).filter().sort().paginate();
    const [items, total] = await Promise.all([
      builtQuery.query.exec(),
      CustomerModel.countDocuments(builtQuery.query.getFilter()),
    ]);

    return {
      items,
      meta: buildPaginationMeta(
        builder.getPaginationInfo().page,
        builder.getPaginationInfo().limit,
        total
      ),
    };
  },

  getById: async (id: string): Promise<ICustomer> => {
    const customer = await CustomerModel.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    return customer;
  },

  update: async (id: string, input: Partial<CustomerInput>): Promise<ICustomer> => {
    const customer = await CustomerModel.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');

    if (input.phone && input.phone !== customer.phone) {
      const dup = await CustomerModel.findOne({ phone: input.phone });
      if (dup) throw ApiError.conflict(`Customer with phone '${input.phone}' already exists`);
    }

    Object.assign(customer, input);
    await customer.save();
    return customer;
  },

  remove: async (id: string): Promise<void> => {
    const customer = await CustomerModel.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    customer.isActive = false;
    await customer.save();
  },

  restore: async (id: string): Promise<ICustomer> => {
    const customer = await CustomerModel.findById(id);
    if (!customer) throw ApiError.notFound('Customer not found');
    customer.isActive = true;
    await customer.save();
    return customer;
  },

  // Used internally by Sale module after a sale is completed
  incrementTotalPurchases: async (id: string, amount: number): Promise<void> => {
    await CustomerModel.findByIdAndUpdate(id, { $inc: { totalPurchases: amount } });
  },
};
