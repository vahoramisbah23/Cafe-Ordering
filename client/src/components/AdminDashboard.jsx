import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Clock,
  Coffee,
  Plus,
  Pencil,
  Trash2,
  Tag,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  X,
  Filter,
  DollarSign,
  Utensils,
  LogOut,
  ChevronRight,
  Pizza,
  ShoppingBag,
  Minus,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  getOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getCategoriesList,
  createCategory,
  deleteCategoryById,
} from '../api/api';
import { getCategoryIcon } from './MenuFilterBar';

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

const INITIAL_ITEM_FORM = {
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

export const AdminDashboard = ({ onSwitchToCustomerView, onMenuChanged }) => {
  const { user, logout } = useAuth();
  const { showToast } = useCart();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'menu' | 'categories'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Menu item modal / form
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_ITEM_FORM);
  const [itemFormError, setItemFormError] = useState(null);
  const [itemSubmitting, setItemSubmitting] = useState(false);
  const [itemSearch, setItemSearch] = useState('');

  // Customer Order Items Modification Modal state
  const [orderItemsModalOpen, setOrderItemsModalOpen] = useState(false);
  const [orderBeingEdited, setOrderBeingEdited] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [selectedMenuAddItem, setSelectedMenuAddItem] = useState('');
  const [addQuantity, setAddQuantity] = useState(1);
  const [orderItemsSaving, setOrderItemsSaving] = useState(false);

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);

  // Orders filter & search
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordRes, menuRes, catRes] = await Promise.all([
        getOrders(),
        getMenuItems(),
        getCategoriesList(),
      ]);

      if (ordRes.success) setOrders(ordRes.data || []);
      if (menuRes.success) setMenuItems(menuRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute analytics
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'Placed' || o.status === 'Brewing' || o.status === 'Ready' || o.status === 'Pending' || o.status === 'Preparing'
  ).length;

  // Handle Order status change (Live Tracking progression)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) =>
          prev.map((ord) => (ord._id === orderId ? { ...ord, status: newStatus } : ord))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  // Open modal to modify items inside customer order
  const handleOpenOrderItemsModal = (order) => {
    setOrderBeingEdited(order);
    setEditedItems(order.items.map((it) => ({ ...it })));
    if (menuItems.length > 0) {
      setSelectedMenuAddItem(menuItems[0]._id);
    }
    setAddQuantity(1);
    setOrderItemsModalOpen(true);
  };

  // Modify quantity of item in customer order
  const handleUpdateItemQuantity = (index, delta) => {
    setEditedItems((prev) => {
      const updated = [...prev];
      const newQty = (updated[index].quantity || 1) + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  // Remove item from customer order
  const handleRemoveItemFromOrder = (index) => {
    setEditedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Add item from catalog to customer order
  const handleAddItemToOrder = () => {
    if (!selectedMenuAddItem) return;
    const foundMenu = menuItems.find((m) => m._id === selectedMenuAddItem);
    if (!foundMenu) return;

    setEditedItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.name.toLowerCase() === foundMenu.name.toLowerCase());
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += Number(addQuantity) || 1;
        return updated;
      }
      return [
        ...prev,
        {
          menuItem: foundMenu._id,
          name: foundMenu.name,
          price: foundMenu.price,
          quantity: Number(addQuantity) || 1,
          image: foundMenu.image || '/images/hot-coffee.jpg',
        },
      ];
    });
    setAddQuantity(1);
    showToast(`Added "${foundMenu.name}" to order!`, 'info');
  };

  // Save modified customer order items
  const handleSaveOrderItems = async () => {
    if (editedItems.length === 0) {
      showToast('Order must contain at least one item', 'error');
      return;
    }
    setOrderItemsSaving(true);
    try {
      const res = await updateOrder(orderBeingEdited._id, { items: editedItems });
      if (res.success && res.data) {
        showToast(`Order #${orderBeingEdited.orderNumber} items updated successfully!`, 'success');
        setOrders((prev) => prev.map((o) => (o._id === orderBeingEdited._id ? res.data : o)));
        setOrderItemsModalOpen(false);
        setOrderBeingEdited(null);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order items', 'error');
    } finally {
      setOrderItemsSaving(false);
    }
  };

  // Delete customer order
  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!window.confirm(`Are you sure you want to permanently delete order #${orderNumber}?`)) return;
    try {
      const res = await deleteOrder(orderId);
      if (res.success) {
        showToast(`Order #${orderNumber} deleted successfully`, 'info');
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete order', 'error');
    }
  };

  // Toggle item stock availability directly
  const handleToggleAvailability = async (item) => {
    try {
      const updated = !item.available;
      const res = await updateMenuItem(item._id, { available: updated });
      if (res.success) {
        showToast(`"${item.name}" marked as ${updated ? 'In Stock' : 'Sold Out'}`, 'info');
        setMenuItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, available: updated } : i))
        );
        if (onMenuChanged) onMenuChanged();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update availability', 'error');
    }
  };

  // Handle Start Add Item
  const handleStartAddItem = () => {
    setFormData(INITIAL_ITEM_FORM);
    setEditingItemId(null);
    setItemFormError(null);
    setItemModalOpen(true);
  };

  // Handle Start Edit Item
  const handleStartEditItem = (item) => {
    setEditingItemId(item._id);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price !== undefined ? String(item.price) : '',
      category: item.category || 'Coffee & Hot Drinks',
      image: item.image || '/images/hot-coffee.jpg',
      prepTime: item.prepTime || '4-5 mins',
      calories: item.calories ? String(item.calories) : '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      available: item.available !== undefined ? item.available : true,
    });
    setItemFormError(null);
    setItemModalOpen(true);
  };

  // Save Item (Create or Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      setItemFormError('Name, description, and price are required.');
      return;
    }

    setItemSubmitting(true);
    setItemFormError(null);

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
      if (editingItemId) {
        await updateMenuItem(editingItemId, payload);
        showToast(`Item "${payload.name}" updated successfully!`, 'success');
      } else {
        await createMenuItem(payload);
        showToast(`Item "${payload.name}" created successfully!`, 'success');
      }
      setItemModalOpen(false);
      await loadAllData();
      if (onMenuChanged) onMenuChanged();
    } catch (err) {
      setItemFormError(err.message || 'Failed to save menu item');
    } finally {
      setItemSubmitting(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from the menu?`)) return;
    try {
      await deleteMenuItem(item._id);
      showToast(`Deleted "${item.name}"`, 'info');
      setMenuItems((prev) => prev.filter((i) => i._id !== item._id));
      if (onMenuChanged) onMenuChanged();
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  // Add Category
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setCatLoading(true);
    setCatError(null);
    try {
      await createCategory(newCatName.trim());
      showToast(`Category "${newCatName.trim()}" created!`, 'success');
      setNewCatName('');
      const catRes = await getCategoriesList();
      if (catRes.success) setCategories(catRes.data || []);
      if (onMenuChanged) onMenuChanged();
    } catch (err) {
      setCatError(err.message || 'Failed to add category');
    } finally {
      setCatLoading(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? Menu items under this category will remain.`)) return;
    setCatLoading(true);
    try {
      await deleteCategoryById(cat._id);
      showToast(`Category "${cat.name}" removed`, 'info');
      setCategories((prev) => prev.filter((c) => c._id !== cat._id));
      if (onMenuChanged) onMenuChanged();
    } catch (err) {
      setCatError(err.message || 'Failed to delete category');
    } finally {
      setCatLoading(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchStatus =
      orderStatusFilter === 'All' ||
      (orderStatusFilter === 'Active'
        ? ord.status === 'Placed' || ord.status === 'Brewing' || ord.status === 'Ready' || ord.status === 'Pending' || ord.status === 'Preparing'
        : ord.status === orderStatusFilter);

    const matchSearch =
      !orderSearch.trim() ||
      ord.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      ord.customer.email.toLowerCase().includes(orderSearch.toLowerCase());

    return matchStatus && matchSearch;
  });

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    if (!itemSearch.trim()) return true;
    const q = itemSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  // Helper for dynamic subtotal in items edit modal
  const modalSubtotal = editedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const modalTax = Math.round(modalSubtotal * 0.05);
  const modalTotal = modalSubtotal + modalTax;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Admin Top Navigation & Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1f1107 0%, var(--espresso) 100%)',
          color: '#fff',
          borderRadius: '16px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                background: 'rgba(217, 119, 6, 0.25)',
                color: '#f59e0b',
                border: '1px solid rgba(217, 119, 6, 0.4)',
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={14} /> Admin Dashboard
            </span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
              Logged in as: <strong style={{ color: '#fff' }}>{user?.name || 'Admin'}</strong> · Café Point, Nadiad
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-serif)', margin: '0 0 0.3rem 0' }}>
            Menu & Customer Order Management
          </h1>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
            Admin controls only: Add, update & remove items, manage customer order progress
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              color: 'rgba(255, 255, 255, 0.9)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShieldCheck size={15} style={{ color: '#f59e0b' }} />
            <span>Admin: {user?.name || 'Administrator'}</span>
          </div>
          <button
            onClick={logout}
            style={{
              background: '#b91c1c',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Gross Revenue (₹)
            </span>
        
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.5rem' }}>
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>From {totalOrdersCount} customer orders</span>
        </div>

        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Orders
            </span>
            <Package size={20} style={{ color: 'var(--caramel)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--espresso)', marginTop: '0.5rem' }}>
            {totalOrdersCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Recorded in database</span>
        </div>

        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Active in Kitchen
            </span>
            <Clock size={20} style={{ color: '#2563eb' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#2563eb', marginTop: '0.5rem' }}>
            {activeOrdersCount}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Live brewing / preparing</span>
        </div>

        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              Café Menu Items
            </span>
            <Coffee size={20} style={{ color: 'var(--espresso)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--espresso)', marginTop: '0.5rem' }}>
            {menuItems.length}
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Across {categories.length} categories</span>
        </div>
      </div>

      {/* Main Admin Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border-subtle)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid var(--espresso)' : '3px solid transparent',
            fontWeight: activeTab === 'overview' ? 700 : 500,
            color: activeTab === 'overview' ? 'var(--espresso)' : 'var(--text-secondary)',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <TrendingUp size={16} />
          <span>Overview & Feed</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid var(--espresso)' : '3px solid transparent',
            fontWeight: activeTab === 'orders' ? 700 : 500,
            color: activeTab === 'orders' ? 'var(--espresso)' : 'var(--text-secondary)',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Package size={16} />
          <span>Customer Orders & Tracking ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'menu' ? '3px solid var(--espresso)' : '3px solid transparent',
            fontWeight: activeTab === 'menu' ? 700 : 500,
            color: activeTab === 'menu' ? 'var(--espresso)' : 'var(--text-secondary)',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Coffee size={16} />
          <span>Menu Items CRUD ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          style={{
            padding: '0.75rem 1.25rem',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'categories' ? '3px solid var(--espresso)' : '3px solid transparent',
            fontWeight: activeTab === 'categories' ? 700 : 500,
            color: activeTab === 'categories' ? 'var(--espresso)' : 'var(--text-secondary)',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Tag size={16} />
          <span>Categories ({categories.length})</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--espresso)' }}>Live Kitchen Feed</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Real-time snapshot of active orders and recent transactions
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button onClick={handleStartAddItem} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                <Plus size={15} />
                <span>Add Menu Item</span>
              </button>
              <button onClick={loadAllData} className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}>
                <RefreshCw size={14} className={loading ? 'spinner' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
              Recent Orders (Latest 5)
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Order #</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Dining</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--espresso)' }}>
                        {ord.orderNumber}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div>{ord.customer.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ord.customer.phone}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{ord.customer.diningOption}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>
                        ₹{ord.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px',
                            background:
                              ord.status === 'Completed'
                                ? '#dcfce7'
                                : ord.status === 'Brewing' || ord.status === 'Preparing'
                                ? '#e0e7ff'
                                : '#fef3c7',
                            color:
                              ord.status === 'Completed'
                                ? '#166534'
                                : ord.status === 'Brewing' || ord.status === 'Preparing'
                                ? '#3730a3'
                                : '#92400e',
                          }}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders Management (Add, Update, Remove Customer Order Items & Live Track) */}
      {activeTab === 'orders' && (
        <div>
          {/* Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
                placeholder="Search by order #, name, email..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                className="form-select"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active in Kitchen</option>
                <option value="Placed">Placed</option>
                <option value="Brewing">Brewing</option>
                <option value="Ready">Ready</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <button onClick={loadAllData} className="btn-secondary" style={{ padding: '0.5rem 0.8rem' }} title="Refresh Orders">
                <RefreshCw size={14} className={loading ? 'spinner' : ''} />
              </button>
            </div>
          </div>

          {/* Orders Cards with Live Tracking and Item Management */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredOrders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No orders match your search criteria.
              </p>
            ) : (
              filteredOrders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '14px',
                    padding: '1.25rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top Bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '0.75rem',
                      marginBottom: '0.75rem',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--espresso)' }}>
                          {ord.orderNumber}
                        </span>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            background: 'var(--bg-secondary)',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {ord.customer.diningOption}
                          {ord.customer.tableNumber ? ` · ${ord.customer.tableNumber}` : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Customer: <strong>{ord.customer.name}</strong> · {ord.customer.phone} · {ord.customer.email}
                      </div>
                    </div>

                    {/* Order Action Buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={() => handleOpenOrderItemsModal(ord)}
                        className="btn-primary"
                        style={{
                          padding: '0.45rem 0.95rem',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: 'var(--espresso)',
                        }}
                        title="Add, Update or Remove items in this customer order"
                      >
                        <Pencil size={13} />
                        <span>Manage Items ({ord.items.length})</span>
                      </button>

                      <button
                        onClick={() => handleDeleteOrder(ord._id, ord.orderNumber)}
                        className="btn-danger"
                        style={{
                          padding: '0.45rem 0.75rem',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Delete this order"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Live Order Tracking Interactive Step Bar */}
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Live Tracking Stage:
                      </span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--espresso)' }}>
                        Current Status: {ord.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {[
                        { val: 'Placed', label: '1. Placed' },
                        { val: 'Brewing', label: '2. Brewing' },
                        { val: 'Ready', label: '3. Ready' },
                        { val: 'Completed', label: '4. Completed' },
                        { val: 'Cancelled', label: 'Cancelled' },
                      ].map((step) => {
                        const isCurrent = ord.status === step.val;
                        return (
                          <button
                            key={step.val}
                            onClick={() => handleStatusChange(ord._id, step.val)}
                            style={{
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.78rem',
                              fontWeight: isCurrent ? 800 : 500,
                              border: isCurrent ? '1px solid var(--espresso)' : '1px solid var(--border-subtle)',
                              background: isCurrent ? 'var(--espresso)' : '#fff',
                              color: isCurrent ? '#fff' : 'var(--text-secondary)',
                              cursor: 'pointer',
                              boxShadow: isCurrent ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {step.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Order Items List */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.4rem' }}>
                        Order Items:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {ord.items.map((i, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: 'var(--bg-secondary)',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                            }}
                          >
                            <span style={{ color: 'var(--espresso)', fontWeight: 600 }}>
                              {i.name} <span style={{ color: 'var(--text-muted)' }}>x {i.quantity}</span>
                            </span>
                            <span style={{ fontWeight: 700 }}>₹{i.price * i.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '180px' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        Payment: <strong>{ord.paymentMethod}</strong>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--espresso)', marginTop: '0.35rem' }}>
                        Total: ₹{ord.totalAmount?.toLocaleString('en-IN')}
                      </div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        (Subtotal ₹{ord.subtotal} + 5% GST ₹{ord.tax})
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Menu Items CRUD (Add, Update, Remove Menu Items) */}
      {activeTab === 'menu' && (
        <div>
          {/* Header & Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.2rem' }}
                placeholder="Search menu items..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
              />
            </div>

            <button onClick={handleStartAddItem} className="btn-primary" style={{ padding: '0.55rem 1.15rem' }}>
              <Plus size={16} />
              <span>Add New Menu Item</span>
            </button>
          </div>

          {/* Items List with Edit, Delete, Stock Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filteredMenuItems.map((item) => (
              <div
                key={item._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '240px', flex: 1 }}>
                  <img
                    src={item.image || '/images/hot-coffee.jpg'}
                    alt={item.name}
                    style={{ width: '54px', height: '54px', borderRadius: '10px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/hot-coffee.jpg';
                    }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--espresso)', fontSize: '0.95rem' }}>
                        {item.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'var(--bg-secondary)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      ₹{Number(item.price).toLocaleString('en-IN')} · Prep: {item.prepTime || '5 mins'}
                    </div>
                  </div>
                </div>

                {/* Stock Toggle + Edit + Delete */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    style={{
                      border: 'none',
                      background: item.available ? '#dcfce7' : '#fee2e2',
                      color: item.available ? '#166534' : '#991b1b',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                    title="Click to toggle in stock / sold out"
                  >
                    {item.available ? '🟢 In Stock' : '🔴 Sold Out'}
                  </button>

                  <button
                    className="btn-secondary"
                    onClick={() => handleStartEditItem(item)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    title="Edit Item Details"
                  >
                    <Pencil size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteItem(item)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    title="Delete Item from Menu"
                  >
                    <Trash2 size={14} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Categories Management */}
      {activeTab === 'categories' && (
        <div style={{ maxWidth: '640px' }}>
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--espresso)' }}>
              Add New Category
            </h3>
            <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Categories with "Pizza", "Coffee", "Sandwich" etc. automatically receive matching icons!
            </p>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Pizza, Wraps, Thick Shakes..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                style={{ flex: 1 }}
              />
              <button
                onClick={handleAddCategory}
                disabled={catLoading || !newCatName.trim()}
                className="btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                <Plus size={16} />
                <span>Add Category</span>
              </button>
            </div>
            {catError && (
              <p style={{ color: '#b91c1c', fontSize: '0.82rem', marginTop: '0.5rem' }}>{catError}</p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.map((cat) => {
              const CatIcon = getCategoryIcon(cat.name);
              return (
                <div
                  key={cat._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <CatIcon size={18} style={{ color: 'var(--latte)', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: 'var(--espresso)', fontSize: '0.92rem' }}>
                      {cat.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="btn-danger"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                    title={`Delete ${cat.name}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal 1: Manage Customer Order Items (Add, Update Quantity, Remove from Order) */}
      {orderItemsModalOpen && orderBeingEdited && (
        <div className="modal-backdrop" onClick={() => setOrderItemsModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Modify Customer Order #{orderBeingEdited.orderNumber}</h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Customer: {orderBeingEdited.customer.name} ({orderBeingEdited.customer.phone})
                </p>
              </div>
              <button className="drawer-close-btn" onClick={() => setOrderItemsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Add New Item To Customer Order */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--espresso)', display: 'block', marginBottom: '0.5rem' }}>
                  <Plus size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Add Menu Item to Order:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto', gap: '0.5rem', alignItems: 'center' }}>
                  <select
                    className="form-select"
                    value={selectedMenuAddItem}
                    onChange={(e) => setSelectedMenuAddItem(e.target.value)}
                  >
                    {menuItems.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} — ₹{m.price}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={addQuantity}
                    onChange={(e) => setAddQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    title="Quantity"
                  />

                  <button
                    onClick={handleAddItemToOrder}
                    className="btn-primary"
                    style={{ whiteSpace: 'nowrap', padding: '0.5rem 0.85rem' }}
                  >
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Current Order Items List with Increment / Decrement / Remove */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--espresso)', marginBottom: '0.5rem' }}>
                  Current Order Items ({editedItems.length}):
                </div>
                {editedItems.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#b91c1c', padding: '1rem' }}>
                    Order must have at least one item. Add an item above.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {editedItems.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          gap: '0.75rem',
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 600, color: 'var(--espresso)', fontSize: '0.92rem' }}>
                            {item.name}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            ₹{item.price} each
                          </span>
                        </div>

                        {/* Quantity controls (+ / -) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(idx, -1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--bg-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span style={{ minWidth: '22px', textAlign: 'center', fontWeight: 700 }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQuantity(idx, 1)}
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--bg-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Line total */}
                        <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 700 }}>
                          ₹{item.price * item.quantity}
                        </span>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromOrder(idx)}
                          className="btn-danger"
                          style={{ padding: '0.35rem 0.55rem', borderRadius: '6px' }}
                          title="Remove item from order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Financial Recalculation Summary */}
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                  fontSize: '0.88rem',
                }}
              >
                <div>
                  <div>Subtotal: <strong>₹{modalSubtotal}</strong></div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>5% Restaurant GST: ₹{modalTax}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>New Total Amount:</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--espresso)' }}>
                    ₹{modalTotal}
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setOrderItemsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveOrderItems}
                  disabled={orderItemsSaving || editedItems.length === 0}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                >
                  <Check size={16} />
                  <span>{orderItemsSaving ? 'Saving...' : 'Save Order Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Menu Item CRUD (Add / Edit Menu Item with 26 Preset Images) */}
      {itemModalOpen && (
        <div className="modal-backdrop" onClick={() => setItemModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                {editingItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h2>
              <button className="drawer-close-btn" onClick={() => setItemModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {itemFormError && (
                <div
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #f87171',
                    color: '#b91c1c',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem',
                  }}
                >
                  {itemFormError}
                </div>
              )}

              <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Item Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Farmhouse Veggie Pizza"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Category <span className="required">*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Crisp description of flavors and ingredients..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">
                      Price (₹ INR) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      className="form-input"
                      placeholder="120"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Prep Time</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="5-10 mins"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    />
                  </div>
                </div>

                {/* Preset Image Selector + Preview */}
                <div className="form-group" style={{ marginBottom: 0 }}>
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

                    <div style={{ textAlign: 'center' }}>
                      <img
                        src={formData.image || '/images/hot-coffee.jpg'}
                        alt="Preview"
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '2px solid var(--border-subtle)',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/hot-coffee.jpg';
                        }}
                      />
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                        Preview
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setItemModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={itemSubmitting}>
                    <span>{editingItemId ? 'Update Item' : 'Add to Menu'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
