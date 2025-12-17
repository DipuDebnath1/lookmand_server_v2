import express from 'express';
import { CategoryController } from './category.controller';

import auth from '../../../middleware/auth';
import validationRequest from '../../utils/validationRequest';
import {
  categoryCreateValidation,
  categoryUpdateValidation,
  subCategoryCreateValidation,
  subCategoryUpdateValidation,
} from './category.validation';
import Roles from '../../const/Roles';
import fileUploader from '../../../middleware/fileUpload/fileUploader';

const router = express.Router();

// File upload configuration
const UPLOADS_FOLDER = 'categories';
const fileUpload = fileUploader(UPLOADS_FOLDER);

// ********** CATEGORY ROUTES **********

// Create a new category
router.post(
  '/',
  auth(Roles.ADMIN), // Assuming 'admin' has permission to create categories
  fileUpload.single('image'), // Handle image upload
  validationRequest(categoryCreateValidation),
  CategoryController.createCategory,
);

// Get all categories
router.get('/', CategoryController.getAllCategories);

// Get category by ID
router.get('/:categoryId', CategoryController.getCategoryById);

// Update category
router.put(
  '/:categoryId',
  auth(Roles.ADMIN),
  fileUpload.single('image'), // Handle image upload
  validationRequest(categoryUpdateValidation),
  CategoryController.updateCategory,
);

// Soft delete category
router.delete(
  '/:categoryId',
  auth(Roles.ADMIN),
  CategoryController.deleteCategory,
);

// ********** SUBCATEGORY ROUTES **********

// Create a new subcategory
router.post(
  '/subcategory',
  auth(Roles.ADMIN),
  fileUpload.single('image'), // Handle image upload
  validationRequest(subCategoryCreateValidation),
  CategoryController.createSubCategory,
);

// Get all subcategories by category ID
router.get(
  '/:categoryId/subcategories',
  CategoryController.getAllSubCategoriesByCategoryId,
);

// Get subcategory by ID
router.get(
  '/subcategory/:subCategoryId',
  CategoryController.getSubCategoryById,
);

// Update subcategory
router.put(
  '/subcategory/:subCategoryId',
  auth(Roles.ADMIN),
  fileUpload.single('image'), // Handle image upload
  validationRequest(subCategoryUpdateValidation),
  CategoryController.updateSubCategory,
);

// Soft delete subcategory
router.delete(
  '/subcategory/:subCategoryId',
  auth(Roles.ADMIN),
  CategoryController.deleteSubCategory,
);

export default router;
