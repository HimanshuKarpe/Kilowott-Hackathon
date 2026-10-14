import { Product, ProductFilters } from '../types/product';
import { calculateCompleteness } from './completeness';

/**
 * Pure function to filter and search products.
 */
export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return products.filter((product) => {
    // 1. Text Search across name, SKU, category, description, and attributes
    if (query) {
      const matchName = product.name.toLowerCase().includes(query);
      const matchSku = product.sku.toLowerCase().includes(query);
      const matchCategory = product.category.toLowerCase().includes(query);
      const matchDesc = (product.description || '').toLowerCase().includes(query);
      const matchAttr = (product.attributes || []).some(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.value.toLowerCase().includes(query)
      );

      if (!matchName && !matchSku && !matchCategory && !matchDesc && !matchAttr) {
        return false;
      }
    }

    // 2. Category filter
    if (filters.category && filters.category !== 'all') {
      if (product.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // 3. Publication status filter
    if (filters.publicationStatus && filters.publicationStatus !== 'all') {
      if (product.publicationStatus !== filters.publicationStatus) {
        return false;
      }
    }

    // 4. Sync status filter
    if (filters.syncStatus && filters.syncStatus !== 'all') {
      if (product.syncStatus !== filters.syncStatus) {
        return false;
      }
    }

    // 5. Completeness filter
    if (filters.completeness && filters.completeness !== 'all') {
      const report = calculateCompleteness(product);
      if (filters.completeness === 'complete' && !report.isComplete) {
        return false;
      }
      if (filters.completeness === 'incomplete' && report.isComplete) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Pure function to sort products by selected field and direction.
 */
export function sortProducts(
  products: Product[],
  field: ProductFilters['sortField'],
  direction: ProductFilters['sortDirection']
): Product[] {
  const sorted = [...products];
  const modifier = direction === 'asc' ? 1 : -1;

  return sorted.sort((a, b) => {
    switch (field) {
      case 'name':
        return a.name.localeCompare(b.name) * modifier;

      case 'price':
        return (a.price - b.price) * modifier;

      case 'stockQuantity':
        return (a.stockQuantity - b.stockQuantity) * modifier;

      case 'updatedAt': {
        const timeA = new Date(a.updatedAt).getTime() || 0;
        const timeB = new Date(b.updatedAt).getTime() || 0;
        return (timeA - timeB) * modifier;
      }

      case 'lastSyncedAt': {
        const timeA = a.lastSyncedAt ? new Date(a.lastSyncedAt).getTime() : 0;
        const timeB = b.lastSyncedAt ? new Date(b.lastSyncedAt).getTime() : 0;
        return (timeA - timeB) * modifier;
      }

      case 'completeness': {
        const compA = calculateCompleteness(a).score;
        const compB = calculateCompleteness(b).score;
        return (compA - compB) * modifier;
      }

      default:
        return 0;
    }
  });
}
