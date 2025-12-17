import { Schema, model } from 'mongoose';
import { ICategory, ISubCategory } from './category.type';

// category schema
const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  { timestamps: true },
);

// sub-category schema
const subCategorySchema = new Schema<ISubCategory>(
  {
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: false },
    isDeleted: { type: Boolean, required: false, default: false },
  },
  {
    timestamps: true,
  },
);

const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);

const Category = model<ICategory>('Category', categorySchema);
export default { SubCategory, Category };
