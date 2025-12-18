/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import { ICategory, ISubCategory } from './category.type';
import categoryModel from './category.model';
import { Types } from 'mongoose';
import { CategoryBaseService, SubCategoryBaseService } from '../../../service';
const ObjectId = Types.ObjectId;
const { Category, SubCategory } = categoryModel;
class CategoryServices {
  // Create a new category
  async createCategory(data: ICategory): Promise<ICategory> {
    const category = await Category.create(data);
    return category;
  }

  // Get category by ID
  async getCategoryById(
    categoryId: string,
    query?: any,
  ): Promise<ICategory | null> {
    const select = query?.select || 'name description image isDeleted';

    const category = await Category.findById(categoryId).select(select);
    return category;
  }

  // Update category
  async updateCategory(
    categoryId: string,
    updates: Partial<ICategory>,
  ): Promise<ICategory> {
    const category = await this.getCategoryById(categoryId);

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    // Update category fields
    Object.assign(category, updates);

    await category.save();
    return category;
  }

  // Delete category (soft delete)
  async deleteCategory(categoryId: string): Promise<ICategory> {
    const category = await this.getCategoryById(categoryId);

    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    // Soft delete by setting isDeleted flag
    category.isDeleted = true;
    await category.save();
    return category;
  }

  // Get all categories
  async getAllCategories(query: any) {
    const filter: Record<string, any> = { isDeleted: false };
    if (query.search) {
      filter['$or'] = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const categories = await CategoryBaseService.findMany({
      //   select: 'name description image',
      select: query.select || 'name description image',
      filters: filter,
      ...query,
    });
    return categories;
  }
}

class SubCategoryServices {
  // Create a new subcategory
  async createSubCategory(data: ISubCategory): Promise<ISubCategory> {
    const isExistingCategory = await CategoryService.getCategoryById(
      data.category as unknown as string,
    );

    if (!isExistingCategory || isExistingCategory.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }

    return await SubCategory.create(data);
  }

  // Get subcategory by ID
  async getSubCategoryById(
    subCategoryId: string,
    query?: any,
  ): Promise<ISubCategory | null> {
    const select = query?.select || 'category name description image isDeleted';

    return await SubCategory.findById(subCategoryId).select(select);
  }

  // Update subcategory
  async updateSubCategory(
    subCategoryId: string,
    updates: Partial<ISubCategory>,
  ): Promise<ISubCategory> {
    const subCategory = await this.getSubCategoryById(subCategoryId);

    if (!subCategory)
      throw new AppError(httpStatus.NOT_FOUND, 'SubCategory not found');

    // Update subcategory fields
    Object.assign(subCategory, updates);

    await subCategory.save();
    return subCategory;
  }

  // Delete subcategory (soft delete)
  async deleteSubCategory(subCategoryId: string): Promise<ISubCategory> {
    const subCategory = await this.getSubCategoryById(subCategoryId);

    if (!subCategory) {
      throw new AppError(httpStatus.NOT_FOUND, 'SubCategory not found');
    }

    // Soft delete by setting isDeleted flag
    subCategory.isDeleted = true;
    await subCategory.save();
    return subCategory;
  }

  // Get all subcategories for a given category
  async getAllSubCategoriesByCategoryId(categoryId: string, query?: any) {
    const select = query?.select || 'name description image';
    const filter: Record<string, any> = { isDeleted: false };
    if (query?.search) {
      filter['$or'] = [
        { name: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
      ];
    }

    const subCategories = await SubCategoryBaseService.findMany({
      filters: { category: new ObjectId(categoryId), ...filter },
      select,
      ...query,
    });
    return subCategories;
  }
}

export const CategoryService = new CategoryServices();
export const SubCategoryService = new SubCategoryServices();
export default { CategoryService, SubCategoryService };
