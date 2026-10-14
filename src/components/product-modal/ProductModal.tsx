import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types/product';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useCatalog } from '../../context/CatalogContext';
import { validateProduct, ProductFormData } from '../../domain/validation';
import { calculateCompleteness } from '../../domain/completeness';
import { Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

const COMMON_ATTRIBUTE_SUGGESTIONS = [
  'Color',
  'Size',
  'Material',
  'Weight',
  'Dimensions',
  'Battery Life',
  'Connectivity',
  'Warranty',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
}) => {
  const { products, categories, createProduct, updateProduct, syncSingleProduct } = useCatalog();

  const isEditing = Boolean(productToEdit);

  // Form state
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    sku: '',
    description: '',
    price: '',
    regularPrice: '',
    salePrice: '',
    stockQuantity: '',
    category: '',
    publicationStatus: 'draft',
    attributes: [],
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncAfterSave, setSyncAfterSave] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Pre-fill when editing or reset when creating
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        sku: productToEdit.sku,
        description: productToEdit.description,
        price: productToEdit.price,
        regularPrice: productToEdit.regularPrice ?? productToEdit.price,
        salePrice: productToEdit.salePrice ?? '',
        stockQuantity: productToEdit.stockQuantity,
        category: productToEdit.category,
        publicationStatus: productToEdit.publicationStatus,
        attributes: productToEdit.attributes || [],
        imageUrl: productToEdit.imageUrl || '',
      });
      setCustomCategoryInput('');
    } else {
      setFormData({
        name: '',
        sku: '',
        description: '',
        price: '',
        regularPrice: '',
        salePrice: '',
        stockQuantity: 0,
        category: categories[0] || 'Electronics',
        publicationStatus: 'published',
        attributes: [
          { id: `attr-${Date.now()}-1`, name: 'Color', value: '' },
        ],
        imageUrl: '',
      });
      setCustomCategoryInput('');
    }
    setErrors({});
  }, [productToEdit, isOpen, categories]);

  // Live completeness calculation
  const completeness = useMemo(() => {
    return calculateCompleteness({
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      category: formData.category,
      publicationStatus: formData.publicationStatus,
      imageUrl: formData.imageUrl,
      attributes: formData.attributes,
      price: Number(formData.price) || 0,
      regularPrice: formData.regularPrice ? Number(formData.regularPrice) : undefined,
      salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
      stockQuantity: Number(formData.stockQuantity) || 0,
    });
  }, [formData]);

  // Dynamic Attribute Handlers
  const handleAddAttribute = (suggestedKey?: string) => {
    setFormData((prev) => ({
      ...prev,
      attributes: [
        ...prev.attributes,
        {
          id: `attr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: suggestedKey || '',
          value: '',
        },
      ],
    }));
  };

  const handleUpdateAttribute = (index: number, field: 'name' | 'value', val: string) => {
    setFormData((prev) => {
      const updated = [...prev.attributes];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, attributes: updated };
    });
    // Clear attribute-specific error
    if (errors[`attributes.${index}.${field}`]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[`attributes.${index}.${field}`];
        return copy;
      });
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index),
    }));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const categoryToSave = customCategoryInput.trim() || formData.category;
    const submissionData = {
      ...formData,
      category: categoryToSave,
    };

    // Run pure domain validation
    const validation = validateProduct(submissionData, products, productToEdit?.id);
    if (!validation.isValid) {
      setErrors(validation.errors as Record<string, string>);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && productToEdit) {
        const res = await updateProduct(productToEdit.id, submissionData);
        if (res.success && res.product && syncAfterSave) {
          await syncSingleProduct(res.product.id);
        }
        if (res.success) onClose();
      } else {
        const res = await createProduct(submissionData);
        if (res.success && res.product && syncAfterSave) {
          await syncSingleProduct(res.product.id);
        }
        if (res.success) onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Product: ${productToEdit?.name}` : 'Create New Product'}
      subtitle={
        isEditing
          ? `SKU: ${productToEdit?.sku} • Modifying catalogue master data`
          : 'Define core product details, attributes, and stock for WooCommerce synchronization'
      }
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Completeness & Quality Bar */}
        <div className="p-4 rounded-xl bg-surface-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Data Quality Score
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    completeness.score >= 80
                      ? 'text-emerald-400'
                      : completeness.score >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {completeness.score}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {completeness.isComplete
                  ? 'All essential fields satisfied for WooCommerce'
                  : `Needs: ${completeness.missingFields.slice(0, 3).join(', ')}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncAfterSave}
                onChange={(e) => setSyncAfterSave(e.target.checked)}
                className="rounded border-slate-700 bg-surface-900 text-brand-600 focus:ring-brand-500"
              />
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-brand-400" />
                <span>Auto-sync to WooCommerce on save</span>
              </span>
            </label>
          </div>
        </div>

        {/* Section 1: Core Product Identity */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            1. General Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Product Name (2 cols) */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ergonomic Mechanical Keyboard"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-surface-950 border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.name
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
            </div>

            {/* SKU (1 col) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>SKU (Unique) <span className="text-rose-400">*</span></span>
                <span className="text-[10px] text-slate-500 font-mono">UPPERCASE</span>
              </label>
              <input
                type="text"
                placeholder="e.g. TECH-KB-900"
                value={formData.sku}
                onChange={(e) => {
                  setFormData({ ...formData, sku: e.target.value.toUpperCase() });
                  if (errors.sku) setErrors({ ...errors, sku: '' });
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-surface-950 font-mono border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.sku
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {errors.sku && <p className="text-xs text-rose-400 mt-1">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Category <span className="text-rose-400">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value });
                    if (errors.category) setErrors({ ...errors, category: '' });
                  }}
                  className="flex-1 px-3 py-2 rounded-xl bg-surface-950 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-surface-900">
                      {c}
                    </option>
                  ))}
                  <option value="__new__" className="bg-surface-900">
                    + Add New Category...
                  </option>
                </select>
              </div>

              {formData.category === '__new__' && (
                <input
                  type="text"
                  placeholder="Enter new category name..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="w-full mt-2 px-3.5 py-1.5 rounded-xl bg-surface-950 border border-brand-500/50 text-xs text-white focus:outline-none"
                />
              )}
              {errors.category && <p className="text-xs text-rose-400 mt-1">{errors.category}</p>}
            </div>

            {/* Publication Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Publication Status</label>
              <select
                value={formData.publicationStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publicationStatus: e.target.value as ProductFormData['publicationStatus'],
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-surface-950 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-brand-500"
              >
                <option value="published" className="bg-surface-900">Published (Visible in Store)</option>
                <option value="draft" className="bg-surface-900">Draft (Internal Review)</option>
                <option value="archived" className="bg-surface-900">Archived (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span>Product Description</span>
              <span className="text-[10px] text-slate-500">
                {formData.description.length} chars (min 20 for full completeness)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide engaging technical and marketing copy for your customers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            2. Pricing & Inventory Controls
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="29.99"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) setErrors({ ...errors, price: '' });
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-surface-950 font-mono border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.price
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {errors.price && <p className="text-xs text-rose-400 mt-1">{errors.price}</p>}
            </div>

            {/* Sale Price (Optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Sale Price ($) <span className="text-slate-500 text-[10px]">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="24.99"
                value={formData.salePrice ?? ''}
                onChange={(e) => {
                  setFormData({ ...formData, salePrice: e.target.value });
                  if (errors.salePrice) setErrors({ ...errors, salePrice: '' });
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-surface-950 font-mono border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.salePrice
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {errors.salePrice && <p className="text-xs text-rose-400 mt-1">{errors.salePrice}</p>}
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Stock Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                placeholder="50"
                value={formData.stockQuantity}
                onChange={(e) => {
                  setFormData({ ...formData, stockQuantity: e.target.value });
                  if (errors.stockQuantity) setErrors({ ...errors, stockQuantity: '' });
                }}
                className={`w-full px-3.5 py-2 rounded-xl bg-surface-950 font-mono border text-sm text-white focus:outline-none focus:ring-1 ${
                  errors.stockQuantity
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {errors.stockQuantity && (
                <p className="text-xs text-rose-400 mt-1">{errors.stockQuantity}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Dynamic Product Attributes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Dynamic Attributes & Specifications
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Key-value parameters mapped to WooCommerce product attributes.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddAttribute()}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Attribute
            </Button>
          </div>

          {/* Common Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1">Quick Add:</span>
            {COMMON_ATTRIBUTE_SUGGESTIONS.map((sug) => {
              const alreadyHas = formData.attributes.some(
                (a) => a.name.toLowerCase() === sug.toLowerCase()
              );
              return (
                <button
                  key={sug}
                  type="button"
                  disabled={alreadyHas}
                  onClick={() => handleAddAttribute(sug)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    alreadyHas
                      ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
                      : 'border-slate-700 hover:border-brand-500 text-slate-300 hover:text-white bg-surface-950'
                  }`}
                >
                  +{sug}
                </button>
              );
            })}
          </div>

          {/* Dynamic Attributes List */}
          {formData.attributes.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
              No custom attributes added yet. Click &quot;Add Attribute&quot; or choose a suggestion above.
            </div>
          ) : (
            <div className="space-y-2.5">
              {formData.attributes.map((attr, index) => {
                const nameErr = errors[`attributes.${index}.name`];
                const valErr = errors[`attributes.${index}.value`];

                return (
                  <div
                    key={attr.id}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-surface-950/60 border border-slate-800/80"
                  >
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Attribute Name (e.g. Color)"
                        value={attr.name}
                        onChange={(e) => handleUpdateAttribute(index, 'name', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg bg-surface-900 border text-xs text-white focus:outline-none ${
                          nameErr ? 'border-rose-500' : 'border-slate-700 focus:border-brand-500'
                        }`}
                      />
                      {nameErr && <p className="text-[10px] text-rose-400">{nameErr}</p>}
                    </div>

                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        placeholder="Value (e.g. Space Gray, XL, 40h)"
                        value={attr.value}
                        onChange={(e) => handleUpdateAttribute(index, 'value', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg bg-surface-900 border text-xs text-white focus:outline-none ${
                          valErr ? 'border-rose-500' : 'border-slate-700 focus:border-brand-500'
                        }`}
                      />
                      {valErr && <p className="text-[10px] text-rose-400">{valErr}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-surface-800 transition-colors mt-0.5"
                      title="Remove attribute"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Image & Showcase Media */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
            4. Showcase Media
          </h4>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Product Image URL
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/... or direct image link"
              value={formData.imageUrl || ''}
              onChange={(e) => {
                setFormData({ ...formData, imageUrl: e.target.value });
                if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
              }}
              className={`w-full px-3.5 py-2 rounded-xl bg-surface-950 border text-sm text-white focus:outline-none ${
                errors.imageUrl
                  ? 'border-rose-500'
                  : 'border-slate-700 focus:border-brand-500'
              }`}
            />
            {errors.imageUrl && <p className="text-xs text-rose-400 mt-1">{errors.imageUrl}</p>}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
            {isEditing ? 'Save Product Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
