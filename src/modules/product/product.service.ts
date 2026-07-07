import { ProductModel, IProduct } from "./product.model";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { buildPaginationMeta } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../../config/cloudinary";

interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  unit?: string;
}

interface UpdateProductInput extends Partial<CreateProductInput> {
  removeImages?: string | string[];
}

const SEARCHABLE_FIELDS = ["name", "sku", "category"];

export const ProductService = {
  create: async (
    input: CreateProductInput,
    createdBy: string,
    files?: Express.Multer.File[],
  ): Promise<IProduct> => {
    const existing = await ProductModel.findOne({
      sku: input.sku.toUpperCase(),
    });
    if (existing) {
      throw ApiError.conflict(`SKU '${input.sku}' already exists`);
    }

    const images = files?.length
      ? await Promise.all(
          files.map(async (file) => {
            const result = await uploadBufferToCloudinary(
              file.buffer,
              "products",
            );
            return { url: result.secure_url, publicId: result.public_id };
          }),
        )
      : [];

    const product = await ProductModel.create({
      ...input,
      createdBy,
      images,
    });

    return product;
  },

  getAll: async (queryParams: Record<string, unknown>) => {
    // Only show active products by default; ?includeInactive=true reveals soft-deleted ones
    const includeInactive = queryParams.includeInactive === "true";
    const baseFilter = includeInactive ? {} : { isActive: true };

    const filteredParams = { ...queryParams };
    delete filteredParams.includeInactive;

    const builder = new QueryBuilder<IProduct>(
      ProductModel.find(baseFilter),
      filteredParams,
    );

    const builtQuery = builder
      .search(SEARCHABLE_FIELDS)
      .filter()
      .sort()
      .paginate();
    const [items, total] = await Promise.all([
      builtQuery.query.exec(),
      ProductModel.countDocuments(builtQuery.query.getFilter()),
    ]);

    return {
      items,
      meta: buildPaginationMeta(
        builder.getPaginationInfo().page,
        builder.getPaginationInfo().limit,
        total,
      ),
    };
  },

  getById: async (id: string): Promise<IProduct> => {
    const product = await ProductModel.findById(id);
    if (!product) throw ApiError.notFound("Product not found");
    return product;
  },

  update: async (
    id: string,
    input: UpdateProductInput,
    files?: Express.Multer.File[],
  ): Promise<IProduct> => {
    const product = await ProductModel.findById(id);
    if (!product) throw ApiError.notFound("Product not found");

    // Remove requested existing images (Cloudinary + document)
    if (input.removeImages) {
      const idsToRemove = Array.isArray(input.removeImages)
        ? input.removeImages
        : [input.removeImages];

      await Promise.all(
        idsToRemove.map((publicId) => deleteFromCloudinary(publicId)),
      );
      product.images = product.images.filter(
        (img) => !idsToRemove.includes(img.publicId),
      );
    }

    // Upload and append any newly attached images
    if (files?.length) {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const result = await uploadBufferToCloudinary(
            file.buffer,
            "products",
          );
          return { url: result.secure_url, publicId: result.public_id };
        }),
      );
      product.images.push(...uploaded);
    }

    const { removeImages: _removeImages, ...rest } = input;
    Object.assign(product, rest);

    await product.save();
    return product;
  },

  // Soft delete — keeps historical sale records intact and referable
  remove: async (id: string): Promise<void> => {
    const product = await ProductModel.findById(id);
    if (!product) throw ApiError.notFound("Product not found");
    product.isActive = false;
    await product.save();
  },

  restore: async (id: string): Promise<IProduct> => {
    const product = await ProductModel.findById(id);
    if (!product) throw ApiError.notFound("Product not found");
    product.isActive = true;
    await product.save();
    return product;
  },

  // Bonus: dedicated stock adjustment endpoint (+/-) used by Sale module later
  adjustStock: async (id: string, quantity: number): Promise<IProduct> => {
    const product = await ProductModel.findById(id);
    if (!product) throw ApiError.notFound("Product not found");

    const newStock = product.stock + quantity;
    if (newStock < 0) {
      throw ApiError.badRequest(
        `Insufficient stock. Available: ${product.stock}, requested change: ${quantity}`,
      );
    }

    product.stock = newStock;
    await product.save();
    return product;
  },
};
