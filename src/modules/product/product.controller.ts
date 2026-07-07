import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { ProductService } from "./product.service";

export const ProductController = {
  create: catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw ApiError.unauthorized();
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      throw ApiError.badRequest("At least one product image is required");
    }
    const product = await ProductService.create(req.body, req.user._id, files);
    res
      .status(201)
      .json(new ApiResponse(201, "Product created successfully", product));
  }),

  getAll: catchAsync(async (req: Request, res: Response) => {
    const { items, meta } = await ProductService.getAll(
      req.query as Record<string, unknown>,
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Products fetched successfully", items, meta));
  }),

  getById: catchAsync(async (req: Request, res: Response) => {
    const product = await ProductService.getById(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, "Product fetched successfully", product));
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    const product = await ProductService.update(req.params.id, req.body, files);
    res
      .status(200)
      .json(new ApiResponse(200, "Product updated successfully", product));
  }),

  remove: catchAsync(async (req: Request, res: Response) => {
    await ProductService.remove(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, "Product deactivated successfully"));
  }),

  restore: catchAsync(async (req: Request, res: Response) => {
    const product = await ProductService.restore(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, "Product restored successfully", product));
  }),

  adjustStock: catchAsync(async (req: Request, res: Response) => {
    const { quantity } = req.body;
    const product = await ProductService.adjustStock(
      req.params.id,
      Number(quantity),
    );
    res
      .status(200)
      .json(new ApiResponse(200, "Stock adjusted successfully", product));
  }),
};
