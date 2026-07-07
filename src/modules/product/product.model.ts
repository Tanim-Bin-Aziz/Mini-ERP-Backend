import { Schema, model, Document } from 'mongoose';
import { emitLowStockAlert } from '../../config/socket';

export interface IProductImage {
  url: string;
  publicId: string;
}

export interface IProduct extends Document {
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  unit: string; // e.g. pcs, kg, box
  images: IProductImage[];
  isActive: boolean; // soft delete flag
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 10, min: 0 },
    unit: { type: String, default: 'pcs' },
    images: { type: [productImageSchema], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Bonus: prevent negative stock at the schema level regardless of caller
productSchema.pre('save', function (next) {
  if (this.stock < 0) {
    return next(new Error('Stock cannot be negative'));
  }
  next();
});

// Bonus: emit a real-time low-stock alert whenever stock drops at/below threshold
productSchema.post('save', function (doc) {
  if (doc.stock <= doc.lowStockThreshold) {
    try {
      emitLowStockAlert({
        productId: doc._id.toString(),
        name: doc.name,
        stock: doc.stock,
      });
    } catch {
      // socket not initialized (e.g. during seeding/tests) — safe to ignore
    }
  }
});

productSchema.index({ name: 'text', sku: 'text', category: 'text' });

export const ProductModel = model<IProduct>('Product', productSchema);
