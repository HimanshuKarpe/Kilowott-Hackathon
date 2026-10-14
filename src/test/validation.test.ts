import { describe, it, expect } from 'vitest';
import { validateProduct } from '../domain/validation';
import { Product } from '../types/product';

const mockExistingProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'AUDIO-WH1000',
    name: 'Wireless Headphones',
    description: 'Noise cancelling over-ear headphones',
    price: 349.99,
    stockQuantity: 42,
    category: 'Audio',
    publicationStatus: 'published',
    syncStatus: 'synced',
    attributes: [{ id: 'attr-1', name: 'Color', value: 'Black' }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-2',
    sku: 'TECH-KB900',
    name: 'Mechanical Keyboard',
    description: 'Hot-swappable mechanical switch keyboard',
    price: 129.5,
    stockQuantity: 15,
    category: 'Electronics',
    publicationStatus: 'draft',
    syncStatus: 'pending_sync',
    attributes: [{ id: 'attr-2', name: 'Switch', value: 'Brown' }],
    createdAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('validateProduct', () => {
  it('passes when valid product data is provided', () => {
    const result = validateProduct(
      {
        name: 'Ultra Wide Monitor 34"',
        sku: 'MON-UW34-PRO',
        description: 'IPS curved gaming monitor with HDR',
        price: 599.99,
        stockQuantity: 20,
        category: 'Displays',
        publicationStatus: 'published',
        attributes: [{ id: 'a1', name: 'Resolution', value: '3440x1440' }],
      },
      mockExistingProducts
    );

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  describe('Name validation', () => {
    it('fails when name is missing or whitespace', () => {
      const result = validateProduct({ name: '   ' }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toMatch(/name is required/i);
    });

    it('fails when name is less than 2 characters', () => {
      const result = validateProduct({ name: 'A' }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toMatch(/at least 2 characters/i);
    });
  });

  describe('SKU uniqueness and formatting', () => {
    it('fails when SKU is missing', () => {
      const result = validateProduct({ sku: '' }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.sku).toMatch(/SKU is required/i);
    });

    it('fails when SKU contains invalid special characters', () => {
      const result = validateProduct({ sku: 'PROD#123@!' }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.sku).toMatch(/letters, numbers, hyphens/i);
    });

    it('fails when SKU duplicates an existing product (case-insensitive)', () => {
      const result = validateProduct(
        { sku: 'audio-wh1000' }, // Lowercase duplicate of AUDIO-WH1000
        mockExistingProducts
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.sku).toMatch(/already in use/i);
    });

    it('allows keeping the same SKU when updating the current product', () => {
      const result = validateProduct(
        {
          name: 'Wireless Headphones V2',
          sku: 'AUDIO-WH1000',
          price: 379.99,
          stockQuantity: 50,
          category: 'Audio',
        },
        mockExistingProducts,
        'prod-1' // Self ID
      );

      expect(result.errors.sku).toBeUndefined();
    });
  });

  describe('Price and Sale Price validation', () => {
    it('fails when price is negative', () => {
      const result = validateProduct({ price: -15 }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.price).toMatch(/cannot be negative/i);
    });

    it('fails when price is non-numeric', () => {
      const result = validateProduct({ price: 'abc' as unknown as number }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.price).toMatch(/valid number/i);
    });

    it('allows 0 as a valid price for giveaways or promotions', () => {
      const result = validateProduct(
        {
          name: 'Sample Swag Bag',
          sku: 'SWAG-001',
          price: 0,
          stockQuantity: 100,
          category: 'Merchandise',
        },
        mockExistingProducts
      );
      expect(result.errors.price).toBeUndefined();
    });

    it('fails when sale price is greater than standard price', () => {
      const result = validateProduct(
        {
          price: 100,
          salePrice: 150,
        },
        mockExistingProducts
      );
      expect(result.isValid).toBe(false);
      expect(result.errors.salePrice).toMatch(/higher than standard price/i);
    });
  });

  describe('Stock quantity validation', () => {
    it('fails when stock is negative', () => {
      const result = validateProduct({ stockQuantity: -5 }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.stockQuantity).toMatch(/cannot be negative/i);
    });

    it('fails when stock is a non-integer float', () => {
      const result = validateProduct({ stockQuantity: 12.5 }, mockExistingProducts);
      expect(result.isValid).toBe(false);
      expect(result.errors.stockQuantity).toMatch(/whole integer/i);
    });

    it('accepts 0 as valid out-of-stock state', () => {
      const result = validateProduct({ stockQuantity: 0 }, mockExistingProducts);
      expect(result.errors.stockQuantity).toBeUndefined();
    });
  });

  describe('Dynamic attributes validation', () => {
    it('catches empty attribute name when value is provided', () => {
      const result = validateProduct(
        {
          attributes: [{ id: '1', name: '', value: 'Blue' }],
        },
        mockExistingProducts
      );
      expect(result.isValid).toBe(false);
      expect(result.errors['attributes.0.name']).toBeDefined();
    });

    it('catches duplicate attribute keys within the same product', () => {
      const result = validateProduct(
        {
          attributes: [
            { id: '1', name: 'Color', value: 'Black' },
            { id: '2', name: 'color', value: 'White' }, // Duplicate
          ],
        },
        mockExistingProducts
      );
      expect(result.isValid).toBe(false);
      expect(result.errors['attributes.1.name']).toMatch(/duplicate/i);
    });
  });
});
