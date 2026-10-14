import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types/product';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useCatalog } from '../../context/CatalogContext';
import { validateProduct, ProductFormData } from '../../domain/validation';
import { calculateCompleteness } from '../../domain/completeness';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

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
    publicationStatus: 'published',
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
          ? `SKU: ${productToEdit?.sku} • Update catalogue attributes, pricing, or status`
          : 'Enter product information, commercials, attributes and sync settings'
      }
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Data Quality Score Summary */}
        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Data Completeness:
            </span>
            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  completeness.score >= 75
                    ? 'bg-emerald-500'
                    : completeness.score >= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${completeness.score}%` }}
              />
            </div>
            <span
              className={`font-mono font-bold text-xs ${
                completeness.score >= 75
                  ? 'text-emerald-700'
                  : completeness.score >= 50
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {completeness.score}%
            </span>
            <span className="text-slate-500 text-xs">
              {completeness.isComplete
                ? '• Complete & Ready'
                : `• Missing: ${completeness.missingFields.slice(0, 2).join(', ')}`}
            </span>
          </div>
        </div>

        {/* SECTION 1: General information */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
            1. General Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Product Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-slate-700 block">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ergonomic Mechanical Keyboard"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                className={`w-full px-3 py-2 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.name ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
                <span>SKU <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-slate-500 font-mono">UNIQUE</span>
              </label>
              <input
                type="text"
                placeholder="e.g. TECH-KB-900"
                value={formData.sku}
                onChange={(e) => {
                  setFormData({ ...formData, sku: e.target.value.toUpperCase() });
                  if (errors.sku) setErrors({ ...errors, sku: '' });
                }}
                className={`w-full px-3 py-2 rounded-lg bg-white font-mono border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.sku ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.sku && <p className="text-xs text-rose-600 mt-1">{errors.sku}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: '' });
                }}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__new__">+ Add New Category...</option>
              </select>

              {formData.category === '__new__' && (
                <input
                  type="text"
                  placeholder="Enter new category name..."
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 rounded-lg bg-white border border-blue-400 text-sm text-slate-900 focus:outline-none"
                />
              )}
              {errors.category && <p className="text-xs text-rose-600 mt-1">{errors.category}</p>}
            </div>

            {/* Image URL */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">
                Product Image URL <span className="text-slate-400 text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/... or image link"
                value={formData.imageUrl || ''}
                onChange={(e) => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  if (errors.imageUrl) setErrors({ ...errors, imageUrl: '' });
                }}
                className={`w-full px-3 py-2 rounded-lg bg-white border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.imageUrl ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.imageUrl && <p className="text-xs text-rose-600 mt-1">{errors.imageUrl}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 flex items-center justify-between">
              <span>Description</span>
              <span className="text-[11px] text-slate-500 font-mono">
                {formData.description.length} chars (min 20 for quality score)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Provide engaging technical and marketing product description..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed"
            />
          </div>
        </div>

        {/* SECTION 2: Pricing and inventory */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
            2. Pricing and Inventory
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#0F172A] block">
                Standard Price (₹) <span className="text-rose-500">*</span>
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
                className={`w-full px-3 py-2 rounded-lg bg-white font-mono border text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.price ? 'border-rose-500' : 'border-[#E2E8F0] focus:border-blue-500'
                }`}
              />
              {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
            </div>

            {/* Sale Price */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#0F172A] block">
                Sale Price (₹) <span className="text-[#64748B] text-xs font-normal">(Optional)</span>
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
                className={`w-full px-3 py-2 rounded-lg bg-white font-mono border text-sm text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.salePrice ? 'border-rose-500' : 'border-[#E2E8F0] focus:border-blue-500'
                }`}
              />
              {errors.salePrice && <p className="text-xs text-rose-600 mt-1">{errors.salePrice}</p>}
            </div>

            {/* Stock Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">
                Stock Quantity <span className="text-rose-500">*</span>
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
                className={`w-full px-3 py-2 rounded-lg bg-white font-mono border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                  errors.stockQuantity ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
              {errors.stockQuantity && (
                <p className="text-xs text-rose-600 mt-1">{errors.stockQuantity}</p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: Product attributes */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                3. Product Attributes
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Key-value parameters mapped to WooCommerce variant attributes.
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

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1 font-medium">Quick Suggestions:</span>
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
                  className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                    alreadyHas
                      ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed bg-slate-50'
                      : 'border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 bg-white'
                  }`}
                >
                  +{sug}
                </button>
              );
            })}
          </div>

          {/* Attributes List */}
          {formData.attributes.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50/50">
              No custom attributes assigned yet. Click &quot;Add Attribute&quot; or choose a suggestion above.
            </div>
          ) : (
            <div className="space-y-2">
              {formData.attributes.map((attr, index) => {
                const nameErr = errors[`attributes.${index}.name`];
                const valErr = errors[`attributes.${index}.value`];

                return (
                  <div
                    key={attr.id}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Attribute Name (e.g. Color)"
                        value={attr.name}
                        onChange={(e) => handleUpdateAttribute(index, 'name', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-md bg-white border text-xs text-slate-900 focus:outline-none ${
                          nameErr ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      {nameErr && <p className="text-[11px] text-rose-600 mt-0.5">{nameErr}</p>}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Value (e.g. Midnight Blue, XL)"
                        value={attr.value}
                        onChange={(e) => handleUpdateAttribute(index, 'value', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-md bg-white border text-xs text-slate-900 focus:outline-none ${
                          valErr ? 'border-rose-500' : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                      {valErr && <p className="text-[11px] text-rose-600 mt-0.5">{valErr}</p>}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200/60 transition-colors"
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

        {/* SECTION 4: Publication and synchronisation settings */}
        <div className="space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2">
            4. Publication and Synchronisation Settings
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Publication Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">
                Merchandising Publication Status
              </label>
              <select
                value={formData.publicationStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publicationStatus: e.target.value as ProductFormData['publicationStatus'],
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="published">Published (Visible in storefront)</option>
                <option value="draft">Draft (Internal review)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
            </div>

            {/* Synchronisation Option */}
            <div className="flex flex-col justify-center">
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={syncAfterSave}
                  onChange={(e) => setSyncAfterSave(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Auto-synchronise on save</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                    Immediately queue and dispatch this product update to WooCommerce REST API v3 upon saving.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
