import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategoriesList,
  createCategory,
  deleteCategoryById,
} from '../api/api';
import { getCategoryIcon } from './MenuFilterBar';
import { useCart } from '../context/CartContext';

const INITIAL_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'Coffee & Hot Drinks',
  image: '/images/hot-coffee.jpg',
  prepTime: '3-5 mins',
  calories: '',
  tags: '',
  available: true,
};

const PRESET_IMAGES = [
  { label: '☕ Espresso / Hot Coffee', value: '/images/hot-coffee.jpg' },
  { label: '☕ Cappuccino / Latte', value: '/images/cappuccino.jpg' },
  { label: '☕ South Indian Filter Coffee', value: '/images/filter-kaapi.jpg' },
  { label: '🧋 Classic Cold Coffee', value: '/images/cold-coffee.jpg' },
  { label: '🍫 Chocolate Frappe', value: '/images/chocolate-cold-coffee.jpg' },
  { label: '🍵 Royal Spiced Chai', value: '/images/kulhad-chai.jpg' },
  { label: '🌊 Blue Lagoon Mocktail', value: '/images/blue-lagoon.jpg' },
  { label: '🍋 Lemon Mint Cooler', value: '/images/lemon-mint-cooler.jpg' },
  { label: '🍓 Strawberry Cooler', value: '/images/strawberry-cooler.jpg' },
  { label: '🍟 Crispy French Fries', value: '/images/french-fries.jpg' },
  { label: '🍟 Spicy Peri Peri Fries', value: '/images/peri-peri-fries.jpg' },
  { label: '🍕 Cheese Garlic Bread / Pizza', value: '/images/cheese-garlic-bread.jpg' },
  { label: '🍔 Veg Cheese Burger', value: '/images/veg-cheese-burger.jpg' },
  { label: '🍔 Aloo Tikki Burger', value: '/images/aloo-tikki-burger.jpg' },
  { label: '🥪 Grilled Veg Sandwich', value: '/images/grilled-sandwich.jpg' },
  { label: '🥪 Paneer Tikka Sandwich', value: '/images/paneer-sandwich.jpg' },
  { label: '🍜 Double Cheese Maggi', value: '/images/cheese-maggi.jpg' },
  { label: '🍝 Creamy White Sauce Pasta', value: '/images/white-sauce-pasta.jpg' },
  { label: '🍝 Pink Sauce Pasta', value: '/images/pink-sauce-pasta.jpg' },
  { label: '🍝 Tangy Arrabbiata Red Pasta', value: '/images/red-sauce-pasta.jpg' },
  { label: '🥐 Butter Bun Maska', value: '/images/bun-maska.jpg' },
  { label: '🥐 Almond Croissant', value: '/images/almond-croissant.jpg' },
  { label: '🍫 Sizzling Brownie with Ice Cream', value: '/images/brownie-icecream.jpg' },
  { label: '🍫 Choco Lava Cake', value: '/images/lava-cake.jpg' },
  { label: '🍰 Basque Burnt Cheesecake', value: '/images/basque-cheesecake.jpg' },
  { label: '🧇 Belgian Chocolate Waffle', value: '/images/chocolate-waffle.jpg' },
];

export const ManageMenuModal = ({
  isOpen,
  onClose,
  categories,
  menuItems,
  onMenuUpdated,
  onCategoriesUpdated,
}) => {
  const { showToast } = useCart();
  const [activeSubTab, setActiveSubTab] = useState('list'); // 'list' | 'add' | 'edit' | 'categories'
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [lastUpdatedId, setLastUpdatedId] = useState(null);

  // Category management state
  const [catList, setCatList] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [catError, setCatError] = useState(null);

  // Load categories when tab opens
  useEffect(() => {
    if (isOpen && activeSubTab === 'categories') {
      loadCategoryList();
    }
  }, [isOpen, activeSubTab]);

  const loadCategoryList = async () => {
    setCatLoading(true);
    setCatError(null);
    try {
      const res = await getCategoriesList();
      if (res.success) setCatList(res.data);
    } catch (e) {
      setCatError('Failed to load categories');
    } finally {
      setCatLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    setCatError(null);
    try {
      await createCategory(newCatName.trim());
      showToast(`Category "${newCatName.trim()}" added!`, 'success');
      setNewCatName('');
      await loadCategoryList();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (e) {
      setCatError(e.message || 'Failed to add category');
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Items in this category will still exist.`)) return;
    setCatLoading(true);
    try {
      await deleteCategoryById(cat._id);
      showToast(`Category "${cat.name}" deleted`, 'info');
      await loadCategoryList();
      if (onCategoriesUpdated) onCategoriesUpdated();
    } catch (e) {
      setCatError(e.message || 'Failed to delete category');
    } finally {
      setCatLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setError(null);
    setSuccessMessage(null);
    setActiveSubTab('add');
  };

  const handleStartEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price !== undefined ? String(item.price) : '',
      category: item.category || 'Coffee & Hot Drinks',
      image: item.image || '',
      prepTime: item.prepTime || '4-5 mins',
      calories: item.calories ? String(item.calories) : '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      available: item.available !== undefined ? item.available : true,
    });
    setError(null);
    setSuccessMessage(null);
    setActiveSubTab('edit');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      return;
    }

    try {
      setLoading(true);
      await deleteMenuItem(id);
      const deleteMsg = `Item "${name}" successfully deleted!`;
      setSuccessMessage(deleteMsg);
      showToast(deleteMsg, 'info');
      if (onMenuUpdated) onMenuUpdated(deleteMsg);
    } catch (err) {
      showToast(`Failed to delete: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      setError('Name, description, and price are required.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      image: formData.image.trim() || undefined,
      prepTime: formData.prepTime.trim(),
      calories: formData.calories ? Number(formData.calories) : null,
      tags: formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      available: formData.available,
    };

    try {
      if (editingId) {
        await updateMenuItem(editingId, payload);
        const updateMsg = `Item "${payload.name}" successfully updated!`;
        setSuccessMessage(updateMsg);
        setLastUpdatedId(editingId);
        showToast(updateMsg, 'success');
        if (onMenuUpdated) onMenuUpdated(updateMsg);
      } else {
        const created = await createMenuItem(payload);
        const createMsg = `Item "${payload.name}" successfully created!`;
        setSuccessMessage(createMsg);
        if (created?.data?._id) setLastUpdatedId(created.data._id);
        showToast(createMsg, 'success');
        if (onMenuUpdated) onMenuUpdated(createMsg);
      }
      setActiveSubTab('list');
      setFormData(INITIAL_FORM);
      setEditingId(null);
    } catch (err) {
      setError(err.message || 'Failed to save menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '780px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Menu Management (CRUD)</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Create, view, update, and remove items from MongoDB
            </p>
          </div>
          <button className="drawer-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-primary)',
            flexWrap: 'wrap',
          }}
        >
          <button
            className={`dining-tab-btn ${activeSubTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('list')}
          >
            <span>All Menu Items ({menuItems.length})</span>
          </button>
          <button
            className={`dining-tab-btn ${activeSubTab === 'add' ? 'active' : ''}`}
            onClick={handleStartAdd}
          >
            <Plus size={15} />
            <span>Add New Item</span>
          </button>
          <button
            className={`dining-tab-btn ${activeSubTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('categories')}
          >
            <Tag size={15} />
            <span>Manage Categories ({categories.length})</span>
          </button>
          {activeSubTab === 'edit' && (
            <button className="dining-tab-btn active">
              <Pencil size={15} />
              <span>Edit Item</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Prominent Success Message Banner (Above Items) */}
          {successMessage && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #6ee7b7',
                color: '#065f46',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)',
                animation: 'fadeIn 0.25s ease-in-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={20} style={{ color: '#059669', flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMessage(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#047857',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {error && (
            <div
              style={{
                background: '#fee2e2',
                border: '1px solid #f87171',
                color: '#b91c1c',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {activeSubTab === 'list' ? (
            /* Items List Table / Cards */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto' }}>
              {menuItems.map((item) => {
                const isJustUpdated = item._id === lastUpdatedId;
                return (
                  <div
                    key={item._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: isJustUpdated ? '#f0fdf4' : 'var(--bg-primary)',
                      border: isJustUpdated ? '2px solid #10b981' : '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      gap: '1rem',
                      transition: 'all 0.3s ease',
                      boxShadow: isJustUpdated ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
                    }}
                  >
                    <img
                      src={item.image || '/images/hot-coffee.jpg'}
                      alt={item.name}
                      style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/hot-coffee.jpg';
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: 'var(--espresso)', fontSize: '0.95rem' }}>
                          {item.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: 'var(--bg-secondary)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {item.category}
                        </span>
                        {isJustUpdated && (
                          <span
                            style={{
                              fontSize: '0.72rem',
                              background: '#10b981',
                              color: '#ffffff',
                              padding: '0.15rem 0.55rem',
                              borderRadius: '4px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <CheckCircle2 size={11} /> Successfully Updated
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        ₹{Number(item.price).toLocaleString('en-IN')} • Rating: ★{item.rating || 4.8}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleStartEdit(item)}
                        title="Edit Item"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleDelete(item._id, item.name)}
                        title="Delete Item"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeSubTab === 'categories' ? (
            /* Manage Categories Panel */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Add new category */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}
              >
                <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--espresso)', display: 'block', marginBottom: '0.6rem' }}>
                  <Plus size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Add New Category
                </label>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Healthy Bowls, Juices, Wraps..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                    style={{ flex: 1 }}
                    disabled={catLoading}
                  />
                  <button
                    className="btn-primary"
                    onClick={handleAddCategory}
                    disabled={catLoading || !newCatName.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {catLoading ? <Loader2 size={15} className="spinner" /> : <Plus size={15} />}
                    <span>Add</span>
                  </button>
                </div>
                {catError && (
                  <p style={{ color: '#b91c1c', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    <AlertCircle size={13} style={{ verticalAlign: 'middle' }} /> {catError}
                  </p>
                )}
              </div>

              {/* Category list */}
              <div style={{ maxHeight: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {catLoading && catList.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={24} className="spinner" style={{ margin: '0 auto' }} />
                    <p style={{ marginTop: '0.5rem' }}>Loading categories...</p>
                  </div>
                ) : catList.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No categories found.</p>
                ) : (
                  catList.map((cat) => {
                    const CatIcon = getCategoryIcon(cat.name);
                    return (
                      <div
                        key={cat._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 1rem',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CatIcon size={16} style={{ color: 'var(--latte)', flexShrink: 0 }} />
                          <span style={{ fontWeight: 500, color: 'var(--espresso)', fontSize: '0.9rem' }}>
                            {cat.name}
                          </span>
                        </div>
                        <button
                          className="btn-danger"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                          onClick={() => handleDeleteCategory(cat)}
                          title={`Delete "${cat.name}"`}
                          disabled={catLoading}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                New categories appear instantly in the menu filter bar and item form dropdown.
              </p>
            </div>
          ) : (
            /* Add or Edit Form */
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Item Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Honey Cinnamon Cortado"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Category <span className="required">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Description <span className="required">*</span>
                </label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Detailed description of flavors, roast, or ingredients..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">
                    Price (₹ INR) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="form-input"
                    placeholder="e.g. 190"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Prep Time</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 4-5 mins"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Item Image
                  </label>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Pick a café preset or enter URL
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 70px', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <select
                      className="form-select"
                      value={PRESET_IMAGES.some((p) => p.value === formData.image) ? formData.image : (formData.image ? 'custom' : '')}
                      onChange={(e) => {
                        if (e.target.value !== 'custom') {
                          setFormData({ ...formData, image: e.target.value });
                        }
                      }}
                    >
                      <option value="">-- Choose Pre-saved Café Photo --</option>
                      {PRESET_IMAGES.map((img) => (
                        <option key={img.value} value={img.value}>
                          {img.label}
                        </option>
                      ))}
                      <option value="custom">🌐 Custom Image URL...</option>
                    </select>

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Or enter direct image URL (/images/... or https://...)"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  {/* Live Thumbnail Preview */}
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={formData.image || '/images/hot-coffee.jpg'}
                      alt="Thumbnail Preview"
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        objectFit: 'cover',
                        border: '2px solid var(--border-subtle)',
                        background: 'var(--bg-secondary)',
                        margin: '0 auto',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/hot-coffee.jpg';
                      }}
                    />
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                      Preview
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Calories (optional)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 180"
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tags (comma separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Best Seller, Organic, Vegan"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveSubTab('list')}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingId ? 'Update Item' : 'Add Item'}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
