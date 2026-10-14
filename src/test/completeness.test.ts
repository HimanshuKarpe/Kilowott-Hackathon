import { describe, it, expect } from 'vitest';
import { calculateCompleteness } from '../domain/completeness';
import { Product } from '../types/product';

describe('calculateCompleteness', () => {
  it('identifies fully populated product as complete with 100% score', () => {
    const product: Product = {
      id: 'prod-full',
      sku: 'CAM-4K-PRO',
      name: 'Sony Alpha 4K Mirrorless Camera',
      description: 'Professional high performance camera body with full-frame sensor and 4K recording.',
      price: 2499.0,
      stockQuantity: 12,
      category: 'Photography',
      publicationStatus: 'published',
      syncStatus: 'synced',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
      attributes: [
        { id: '1', name: 'Sensor', value: 'Full Frame' },
        { id: '2', name: 'Lens Mount', value: 'Sony E' },
      ],
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    };

    const report = calculateCompleteness(product);
    expect(report.isComplete).toBe(true);
    expect(report.score).toBe(100);
    expect(report.missingFields.length).toBe(0);
  });

  it('marks incomplete product with low score and lists missing fields and recommendations', () => {
    const product: Partial<Product> = {
      name: 'Draft Item',
      price: 10,
    };

    const report = calculateCompleteness(product);
    expect(report.isComplete).toBe(false);
    expect(report.score).toBeLessThan(50);
    expect(report.missingFields).toContain('SKU');
    expect(report.missingFields).toContain('Category');
    expect(report.missingFields).toContain('Stock Quantity');
    expect(report.missingFields).toContain('Description');
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});
