import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { CategoryService, SubCategoryService } from './category.service';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../ErrorHandler/AppError';
import { ImageUrl } from '../../utils/urlAddInUploadedImage';

// Category Controller
export const CategoryController = {
  // Create a new category
  createCategory: catchAsync(async (req: Request, res: Response) => {
    if (!req.file)
      throw new AppError(httpStatus.BAD_REQUEST, 'Image file is required');
    req.body.image = ImageUrl(req.file);

    const newCategory = await CategoryService.createCategory(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'Category created successfully',
      success: true,
      data: newCategory,
    });
  }),

  // Get all categories
  getAllCategories: catchAsync(async (req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Categories fetched successfully',
      success: true,
      data: categories,
    });
  }),

  // Get category by ID
  getCategoryById: catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const category = await CategoryService.getCategoryById(categoryId);

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Category fetched successfully',
      success: true,
      data: category,
    });
  }),

  // Update category
  updateCategory: catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    if (req.file) req.body.image = ImageUrl(req.file);

    const updatedCategory = await CategoryService.updateCategory(
      categoryId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Category updated successfully',
      success: true,
      data: updatedCategory,
    });
  }),

  // Delete category (soft delete)
  deleteCategory: catchAsync(async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const deletedCategory = await CategoryService.deleteCategory(categoryId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'Category deleted successfully',
      success: true,
      data: deletedCategory,
    });
  }),

  // Create a new subcategory
  createSubCategory: catchAsync(async (req: Request, res: Response) => {
    if (!req.file)
      throw new AppError(httpStatus.BAD_REQUEST, 'Image file is required');
    req.body.image = ImageUrl(req.file);

    const newSubCategory = await SubCategoryService.createSubCategory(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      message: 'SubCategory created successfully',
      success: true,
      data: newSubCategory,
    });
  }),

  // Get all subcategories for a category
  getAllSubCategoriesByCategoryId: catchAsync(
    async (req: Request, res: Response) => {
      const { categoryId } = req.params;
      const subCategories =
        await SubCategoryService.getAllSubCategoriesByCategoryId(
          categoryId,
          req.query,
        );

      sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'SubCategories fetched successfully',
        success: true,
        data: subCategories,
      });
    },
  ),

  // Get subcategory by ID
  getSubCategoryById: catchAsync(async (req: Request, res: Response) => {
    const { subCategoryId } = req.params;
    const subCategory =
      await SubCategoryService.getSubCategoryById(subCategoryId);

    if (!subCategory) {
      throw new AppError(httpStatus.NOT_FOUND, 'SubCategory not found');
    }

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'SubCategory fetched successfully',
      success: true,
      data: subCategory,
    });
  }),

  // Update subcategory
  updateSubCategory: catchAsync(async (req: Request, res: Response) => {
    const { subCategoryId } = req.params;

    if (req.file) req.body.image = ImageUrl(req.file);

    const updatedSubCategory = await SubCategoryService.updateSubCategory(
      subCategoryId,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'SubCategory updated successfully',
      success: true,
      data: updatedSubCategory,
    });
  }),

  // Delete subcategory (soft delete)
  deleteSubCategory: catchAsync(async (req: Request, res: Response) => {
    const { subCategoryId } = req.params;
    const deletedSubCategory =
      await SubCategoryService.deleteSubCategory(subCategoryId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'SubCategory deleted successfully',
      success: true,
      data: deletedSubCategory,
    });
  }),
};
