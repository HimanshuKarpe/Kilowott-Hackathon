import { Product, ProductAttribute } from '../types/product';
import { ValidationResult, FieldErrors } from '../types/validation';

export interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  price: number | string;
  regularPrice?: number | string;
  salePrice?: number | string | null;
  stockQuantity: number | string;
  category: string;
  publicationStatus: Product['publicationStatus'];
  attributes: ProductAttribute[];
  imageUrl?: string;
}

/**
 * Validates a product before saving, ensuring uniqueness of SKU,
 * positive numeric prices, non-negative integer stock, and required fields.
 */
export function validateProduct(
  data: Partial<ProductFormData>,
  existingProducts: Product[],
  currentProductId?: string
): ValidationResult<ProductFormData> {
  const errors: FieldErrors<ProductFormData> = {};

  // 1. Name validation
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    errors.name = 'Product name is required.';
  } else if (name.length < 2) {
    errors.name = 'Product name must be at least 2 characters.';
  } else if (name.length > 150) {
    errors.name = 'Product name must not exceed 150 characters.';
  }

  // 2. SKU validation
  const sku = typeof data.sku === 'string' ? data.sku.trim().toUpperCase() : '';
  if (!sku) {
    errors.sku = 'SKU is required.';
  } else if (!/^[A-Z0-9_\-]+$/.test(sku)) {
    errors.sku = 'SKU may only contain uppercase letters, numbers, hyphens, and underscores.';
  } else if (sku.length < 3) {
    errors.sku = 'SKU must be at least 3 characters.';
  } else {
    // Check uniqueness across catalogue
    const isDuplicate = existingProducts.some((p) => {
      // Exclude self if editing
      if (currentProductId && p.id === currentProductId) {
        return false;
      }
      return p.sku.trim().toUpperCase() === sku;
    });

    if (isDuplicate) {
      errors.sku = `SKU "${sku}" is already in use by another product. SKUs must be unique.`;
    }
  }

  // 3. Price validation
  if (data.price === undefined || data.price === null || data.price === '') {
    errors.price = 'Price is required.';
  } else {
    const numPrice = Number(data.price);
    if (isNaN(numPrice)) {
      errors.price = 'Price must be a valid number.';
    } else if (numPrice < 0) {
      errors.price = 'Price cannot be negative.';
    } else if (numPrice > 1_000_000) {
      errors.price = 'Price exceeds maximum allowed limit ($1,000,000).';
    }
  }

  // 4. Sale price validation
  if (data.salePrice !== undefined && data.salePrice !== null && data.salePrice !== '') {
    const numSalePrice = Number(data.salePrice);
    const numBasePrice = Number(data.price);
    if (isNaN(numSalePrice)) {
      errors.salePrice = 'Sale price must be a valid number.';
    } else if (numSalePrice < 0) {
      errors.salePrice = 'Sale price cannot be negative.';
    } else if (!isNaN(numBasePrice) && numSalePrice > numBasePrice) {
      errors.salePrice = 'Sale price cannot be higher than standard price.';
    }
  }

  // 5. Stock Quantity validation
  if (data.stockQuantity === undefined || data.stockQuantity === null || data.stockQuantity === '') {
    errors.stockQuantity = 'Stock quantity is required.';
  } else {
    const numStock = Number(data.stockQuantity);
    if (isNaN(numStock) || !Number.isInteger(numStock)) {
      errors.stockQuantity = 'Stock quantity must be a whole integer.';
    } else if (numStock < 0) {
      errors.stockQuantity = 'Stock quantity cannot be negative.';
    } else if (numStock > 1_000_000) {
      errors.stockQuantity = 'Stock quantity exceeds maximum allowed limit.';
    }
  }

  // 6. Category validation
  const category = typeof data.category === 'string' ? data.category.trim() : '';
  if (!category) {
    errors.category = 'Product category is required.';
  }

  // 7. Dynamic Attributes validation
  if (data.attributes && Array.isArray(data.attributes)) {
    const seenNames = new Set<string>();
    for (let i = 0; i < data.attributes.length; i++) {
      const attr = data.attributes[i];
      const attrName = (attr.name || '').trim().toLowerCase();
      const attrVal = (attr.value || '').trim();

      if (!attrName && attrVal) {
        errors[`attributes.${i}.name`] = 'Attribute name cannot be empty.';
      } else if (attrName && !attrVal) {
        errors[`attributes.${i}.value`] = 'Attribute value cannot be empty.';
      } else if (attrName && seenNames.has(attrName)) {
        errors[`attributes.${i}.name`] = `Duplicate attribute name "${attr.name}".`;
      } else if (attrName) {
        seenNames.add(attrName);
      }
    }
  }

  // 8. Image URL validation (optional, but if present must be URL)
  if (data.imageUrl && data.imageUrl.trim()) {
    const url = data.imageUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      errors.imageUrl = 'Image URL must start with http://, https://, or /';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
