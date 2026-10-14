import { Product, CompletenessReport } from '../types/product';

/**
 * Evaluates the quality and completeness of a product's information in the PIM.
 * Criteria:
 * - Basic info (Name, SKU, Category): 30%
 * - Commercials (Price, Stock): 30%
 * - Rich Content (Description >= 20 chars, Image URL): 25%
 * - Custom Attributes (At least 1 configured): 15%
 */
export function calculateCompleteness(product: Partial<Product>): CompletenessReport {
  let score = 0;
  const missingFields: string[] = [];
  const recommendations: string[] = [];

  // 1. Name (10 pts)
  if (product.name && product.name.trim().length >= 2) {
    score += 10;
  } else {
    missingFields.push('Product Name');
    recommendations.push('Provide a descriptive product title');
  }

  // 2. SKU (10 pts)
  if (product.sku && product.sku.trim().length >= 3) {
    score += 10;
  } else {
    missingFields.push('SKU');
    recommendations.push('Set a unique stock keeping unit (SKU)');
  }

  // 3. Category (10 pts)
  if (product.category && product.category.trim()) {
    score += 10;
  } else {
    missingFields.push('Category');
    recommendations.push('Assign a primary category');
  }

  // 4. Price (15 pts)
  if (typeof product.price === 'number' && !isNaN(product.price) && product.price > 0) {
    score += 15;
  } else if (product.price === 0) {
    score += 5; // Free item or placeholder
    recommendations.push('Verify if ₹0.00 price is intended');
  } else {
    missingFields.push('Price');
    recommendations.push('Specify a valid selling price');
  }

  // 5. Stock Quantity (15 pts)
  if (typeof product.stockQuantity === 'number' && !isNaN(product.stockQuantity) && product.stockQuantity >= 0) {
    score += 15;
    if (product.stockQuantity === 0) {
      recommendations.push('Item is currently out of stock');
    }
  } else {
    missingFields.push('Stock Quantity');
    recommendations.push('Set inventory stock quantity');
  }

  // 6. Description (15 pts)
  const descLength = (product.description || '').trim().length;
  if (descLength >= 20) {
    score += 15;
  } else if (descLength > 0) {
    score += 5;
    recommendations.push('Expand description (currently under 20 characters)');
  } else {
    missingFields.push('Description');
    recommendations.push('Add an engaging product description');
  }

  // 7. Image (10 pts)
  if (product.imageUrl && product.imageUrl.trim()) {
    score += 10;
  } else {
    missingFields.push('Product Image');
    recommendations.push('Upload or link a product showcase image');
  }

  // 8. Dynamic Attributes (15 pts)
  const validAttributes = (product.attributes || []).filter(
    (a) => a.name && a.name.trim() && a.value && a.value.trim()
  );
  if (validAttributes.length >= 2) {
    score += 15;
  } else if (validAttributes.length === 1) {
    score += 8;
    recommendations.push('Add additional technical or styling attributes (e.g. Color, Size)');
  } else {
    missingFields.push('Attributes');
    recommendations.push('Add at least one custom specification attribute');
  }

  // Clamp score
  score = Math.min(100, Math.max(0, score));

  // Determine completeness threshold (>= 75% score and essential fields present)
  const hasCoreFields =
    Boolean(product.name?.trim()) &&
    Boolean(product.sku?.trim()) &&
    Boolean(product.category?.trim()) &&
    typeof product.price === 'number' &&
    product.price >= 0 &&
    typeof product.stockQuantity === 'number' &&
    product.stockQuantity >= 0;

  const isComplete = hasCoreFields && score >= 75;

  return {
    score,
    isComplete,
    missingFields,
    recommendations,
  };
}
