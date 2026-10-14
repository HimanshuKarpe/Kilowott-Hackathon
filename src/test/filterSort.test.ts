import { describe, it, expect } from 'vitest';
import { filterProducts, sortProducts } from '../domain/filterSort';
import { Product, ProductFilters } from '../types/product';

const sampleProducts: Product[] = [
  {
    id: 'p1',
    sku: 'LAP-001',
    name: 'ZenBook Pro Laptop',
    description: '15.6 inch OLED powerful productivity laptop',
    price: 1299.99,
    stockQuantity: 10,
    category: 'Computers',
    publicationStatus: 'published',
    syncStatus: 'synced',
    imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853',
    attributes: [
      { id: 'a1', name: 'RAM', value: '32GB' },
      { id: 'a2', name: 'Storage', value: '1TB SSD' },
    ],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-05',
  },
  {
    id: 'p2',
    sku: 'MOU-002',
    name: 'Ergonomic Vertical Mouse',
    description: 'Wireless ergonomic mouse reducing wrist strain',
    price: 49.99,
    stockQuantity: 50,
    category: 'Accessories',
    publicationStatus: 'draft',
    syncStatus: 'pending_sync',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
    attributes: [{ id: 'a3', name: 'Connectivity', value: 'Bluetooth 5.0' }],
    createdAt: '2026-01-02',
    updatedAt: '2026-01-06',
  },
  {
    id: 'p3',
    sku: 'KB-003',
    name: 'Low Profile Mechanical Keyboard',
    description: 'RGB backlight keyboard with red switches',
    price: 89.99,
    stockQuantity: 0,
    category: 'Accessories',
    publicationStatus: 'published',
    syncStatus: 'sync_error',
    attributes: [],
    createdAt: '2026-01-03',
    updatedAt: '2026-01-07',
  },
];

const defaultFilters: ProductFilters = {
  searchQuery: '',
  category: 'all',
  publicationStatus: 'all',
  syncStatus: 'all',
  completeness: 'all',
  sortField: 'name',
  sortDirection: 'asc',
};

describe('filterProducts', () => {
  it('filters by search query matching SKU, name, or attributes', () => {
    const res1 = filterProducts(sampleProducts, { ...defaultFilters, searchQuery: 'lap' });
    expect(res1.length).toBe(1);
    expect(res1[0].sku).toBe('LAP-001');

    const res2 = filterProducts(sampleProducts, { ...defaultFilters, searchQuery: '32GB' });
    expect(res2.length).toBe(1);
    expect(res2[0].name).toContain('ZenBook');
  });

  it('filters by category', () => {
    const res = filterProducts(sampleProducts, { ...defaultFilters, category: 'accessories' });
    expect(res.length).toBe(2);
  });

  it('filters by sync status', () => {
    const res = filterProducts(sampleProducts, { ...defaultFilters, syncStatus: 'sync_error' });
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('p3');
  });

  it('filters by publication status', () => {
    const res = filterProducts(sampleProducts, { ...defaultFilters, publicationStatus: 'draft' });
    expect(res.length).toBe(1);
    expect(res[0].name).toContain('Mouse');
  });
});

describe('sortProducts', () => {
  it('sorts by price ascending and descending', () => {
    const asc = sortProducts(sampleProducts, 'price', 'asc');
    expect(asc[0].price).toBe(49.99);
    expect(asc[2].price).toBe(1299.99);

    const desc = sortProducts(sampleProducts, 'price', 'desc');
    expect(desc[0].price).toBe(1299.99);
    expect(desc[2].price).toBe(49.99);
  });

  it('sorts by stock quantity ascending', () => {
    const asc = sortProducts(sampleProducts, 'stockQuantity', 'asc');
    expect(asc[0].stockQuantity).toBe(0);
    expect(asc[2].stockQuantity).toBe(50);
  });
});
