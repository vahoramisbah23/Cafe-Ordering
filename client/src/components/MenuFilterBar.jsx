import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  Coffee,
  Snowflake,
  CupSoda,
  Croissant,
  Utensils,
  CakeSlice,
  Pizza,
  Sandwich,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  All: Coffee,
  'Coffee & Hot Drinks': Coffee,
  'Coolers & Refreshers': Snowflake,
  'Quick Bites': Utensils,
  'Sandwiches & Burgers': Sandwich,
  'Pasta & Maggi': Utensils,
  'Desserts': CakeSlice,
  'Pizza': Pizza,
  'Pizzas': Pizza,
  'Pizza & Pasta': Pizza,
  'Pizza & Sides': Pizza,
  'Italian Pizza': Pizza,
  'Wood Fired Pizza': Pizza,
  // backward compatibility
  'Specialty Brews & Cold Bar': Coffee,
  'Artisan Sourdough & Tartines': Utensils,
  'Gourmet Bagels & Paninis': Sandwich,
  'Artisanal Viennoiserie & Bakes': Croissant,
  'Decadent Desserts': CakeSlice,
  'Kulhad Chai & Teas': CupSoda,
  'Desi & Iced Coffees': Coffee,
  'Bun Maska & Bakes': Croissant,
  'Sandwiches & Toasts': Sandwich,
  'Adda Snacks & Maggi': Utensils,
  'Sweet Treats': CakeSlice,
  'Hot Coffee': Coffee,
  'Cold Brews & Iced': Snowflake,
};

export const getCategoryIcon = (categoryName) => {
  if (!categoryName) return Utensils;
  if (CATEGORY_ICONS[categoryName]) return CATEGORY_ICONS[categoryName];

  const lower = categoryName.toLowerCase();
  if (lower.includes('pizza')) return Pizza;
  if (lower.includes('burger') || lower.includes('sandwich') || lower.includes('panini')) return Sandwich;
  if (lower.includes('coffee') || lower.includes('tea') || lower.includes('chai') || lower.includes('brew')) return Coffee;
  if (lower.includes('cooler') || lower.includes('refresher') || lower.includes('ice') || lower.includes('shake') || lower.includes('soda')) return Snowflake;
  if (lower.includes('dessert') || lower.includes('cake') || lower.includes('sweet') || lower.includes('brownie')) return CakeSlice;
  if (lower.includes('pasta') || lower.includes('maggi') || lower.includes('noodle')) return Utensils;
  if (lower.includes('croissant') || lower.includes('bake') || lower.includes('bread') || lower.includes('toast')) return Croissant;

  return Utensils;
};

export const MenuFilterBar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="filter-toolbar">
      {/* Search and Sort Row */}
      <div className="search-sort-row">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={18} />
          <input
            type="text"
            className="search-input"
            placeholder="Search coffee, maggi, french fries, burger, pasta, brownie..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="sort-select-wrapper">
          <label className="sort-label">
            <SlidersHorizontal size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
            Sort by:
          </label>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="">Featured / Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Customer Rated</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-pills-scroll">
        <button
          className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => onSelectCategory('All')}
        >
          <Coffee size={16} />
          <span>All Menu</span>
        </button>

        {categories.map((cat) => {
          const IconComp = getCategoryIcon(cat);
          return (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat)}
            >
              <IconComp size={16} />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
