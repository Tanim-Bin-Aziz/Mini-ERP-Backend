import { Schema, model, Document } from 'mongoose';

export interface ISaleItem {
  product: Schema.Types.ObjectId;
  name: string; // snapshot at time of sale (product name may change later)
  sku: string;
  unitPrice: number; // snapshot — historical accuracy even if product price changes
  quantity: number;
  lineTotal: number;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile_banking' | 'bank_transfer';
export type SaleStatus = 'completed' | 'refunded';

export interface ISale extends Document {
  invoiceNumber: string;
  customer: Schema.Types.ObjectId;
  items: ISaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  soldBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: [(v: ISaleItem[]) => v.length > 0, 'A sale must have at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'mobile_banking', 'bank_transfer'],
      default: 'cash',
    },
    status: { type: String, enum: ['completed', 'refunded'], default: 'completed' },
    soldBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

saleSchema.index({ invoiceNumber: 'text' });

export const SaleModel = model<ISale>('Sale', saleSchema);
