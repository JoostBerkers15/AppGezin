import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { ShoppingItem, ShoppingCategory } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  X, 
  Package,
  Search,
  Edit2,
  Trash2,
  Settings,
  Save
} from 'lucide-react';
import '../styles/ShoppingPage.css';

const ShoppingPage: React.FC = () => {
  const { 
    shoppingItems, 
    shoppingCategories,
    addShoppingItem, 
    updateShoppingItem, 
    deleteShoppingItem,
    addShoppingCategory,
    updateShoppingCategory,
    deleteShoppingCategory
  } = useAppData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  
  // Category management state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ShoppingCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#718096'
  });
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    notes: ''
  });

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = shoppingItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Completed filter
    if (!showCompleted) {
      filtered = filtered.filter(item => !item.iscompleted);
    }

    return filtered.sort((a, b) => {
      // Sort by completion status first, then by name
      if (a.iscompleted !== b.iscompleted) {
        return a.iscompleted ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [shoppingItems, searchTerm, selectedCategory, showCompleted]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return groups;
  }, [filteredItems]);

  // Statistics
  const stats = useMemo(() => {
    const total = shoppingItems.length;
    const completed = shoppingItems.filter(item => item.iscompleted).length;
    const pending = total - completed;

    return { total, completed, pending };
  }, [shoppingItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) return;

    const itemData = {
      name: formData.name.trim(),
      category: formData.category,
      notes: formData.notes.trim() || undefined,
      iscompleted: false
    };

    if (editingItem) {
      updateShoppingItem(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      addShoppingItem(itemData);
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      notes: ''
    });
  };

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      notes: item.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      deleteShoppingItem(id);
    }
  };

  const toggleCompleted = (id: string, iscompleted: boolean) => {
    updateShoppingItem(id, { iscompleted: !iscompleted });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const getCategoryColor = (categoryName: string) => {
    const category = shoppingCategories.find(cat => cat.name === categoryName);
    return category?.color || '#718096';
  };

  const clearCompleted = () => {
    const completedItems = shoppingItems.filter(item => item.iscompleted);
    if (completedItems.length === 0) return;
    
    if (window.confirm(`Weet je zeker dat je ${completedItems.length} afgevinkte items wilt verwijderen?`)) {
      completedItems.forEach(item => deleteShoppingItem(item.id));
    }
  };

  // Category management functions
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    if (editingCategory) {
      updateShoppingCategory(editingCategory.id, categoryFormData);
      setEditingCategory(null);
    } else {
      addShoppingCategory(categoryFormData);
    }

    setCategoryFormData({ name: '', color: '#718096' });
    setIsCategoryModalOpen(false);
  };

  const handleCategoryEdit = (category: ShoppingCategory) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      color: category.color
    });
    setIsCategoryModalOpen(true);
  };

  const handleCategoryDelete = (id: string) => {
    const category = shoppingCategories.find(c => c.id === id);
    if (!category) return;
    
    // Check if any items use this category
    const itemsUsingCategory = shoppingItems.filter(item => item.category === category.name);
    if (itemsUsingCategory.length > 0) {
      alert(`Deze categorie wordt nog gebruikt door ${itemsUsingCategory.length} item(s). Verwijder eerst deze items of wijzig hun categorie.`);
      return;
    }

    if (window.confirm(`Weet je zeker dat je de categorie "${category.name}" wilt verwijderen?`)) {
      deleteShoppingCategory(id);
    }
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryFormData({ name: '', color: '#718096' });
  };

  // Predefined colors for categories
  const categoryColors = [
    '#48bb78', '#e53e3e', '#4299e1', '#ed8936', '#38b2ac',
    '#9f7aea', '#f56565', '#ecc94b', '#718096', '#4fd1c5',
    '#fc8181', '#f6ad55', '#90cdf4', '#a0aec0'
  ];

  return (
    <div className="shopping-page">
      <div className="page-header">
        <div className="page-title">
          <ShoppingCart size={32} />
          <h1>Boodschappenlijst</h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="add-button secondary"
            onClick={() => setIsCategoryModalOpen(true)}
            title="Categorieën beheren"
          >
            <Settings size={20} />
            Categorieën
          </button>
          <button 
            className="add-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            Item toevoegen
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Totaal items</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Te kopen</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <Check size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Afgevinkt</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Zoek items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            <option value="all">Alle categorieën</option>
            {shoppingCategories.map(category => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="toggle-filters">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
              <span>Toon afgevinkt</span>
            </label>
          </div>

          {stats.completed > 0 && (
            <button className="clear-completed" onClick={clearCompleted}>
              <Trash2 size={16} />
              Wis afgevinkt ({stats.completed})
            </button>
          )}
        </div>
      </div>

      {/* Shopping List */}
      <div className="shopping-list">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={64} />
            <h2>Geen items gevonden</h2>
            <p>Voeg je eerste boodschap toe of pas je filters aan</p>
            <button 
              className="add-button"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              Eerste item toevoegen
            </button>
          </div>
        ) : (
          Object.entries(groupedItems).map(([categoryName, items]) => (
            <div key={categoryName} className="category-section">
              <div 
                className="category-header"
                style={{ borderLeftColor: getCategoryColor(categoryName) }}
              >
                <h3>{categoryName}</h3>
                <span className="item-count">{items.length} items</span>
              </div>
              
              <div className="items-grid">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`item-card ${item.iscompleted ? 'completed' : ''}`}
                  >
                    <div className="item-main">
                      <button
                        className={`check-button ${item.iscompleted ? 'checked' : ''}`}
                        onClick={() => toggleCompleted(item.id, item.iscompleted)}
                        aria-label={item.iscompleted ? 'Markeer als niet gekocht' : 'Markeer als gekocht'}
                      >
                        {item.iscompleted && <Check size={16} />}
                      </button>
                      
                      <div className="item-info">
                        <h4>{item.name}</h4>
                        {item.notes && (
                          <p className="item-notes">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="item-actions">
                      <button 
                        className="action-button edit"
                        onClick={() => handleEdit(item)}
                        aria-label={`Bewerk ${item.name}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Verwijder ${item.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Item bewerken' : 'Item toevoegen'}</h2>
              <button className="close-button" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Naam *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Bijv. Melk, Brood, Appels..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categorie *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Selecteer een categorie</option>
                  {shoppingCategories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Opmerkingen</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optionele opmerkingen..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingItem ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="modal-overlay" onClick={closeCategoryModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Categorie bewerken' : 'Categorie toevoegen'}</h2>
              <button className="close-button" onClick={closeCategoryModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="category-name">Naam *</label>
                <input
                  type="text"
                  id="category-name"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="Bijv. Groente & Fruit"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-color">Kleur</label>
                <div className="color-picker-container">
                  <input
                    type="color"
                    id="category-color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className="color-input"
                  />
                  <div className="color-presets">
                    {categoryColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className="color-preset"
                        style={{ backgroundColor: color }}
                        onClick={() => setCategoryFormData({ ...categoryFormData, color })}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeCategoryModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingCategory ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>

            {/* Category List */}
            <div className="category-list-section">
              <h3>Bestaande categorieën</h3>
              {shoppingCategories.length === 0 ? (
                <p className="empty-text">Geen categorieën toegevoegd</p>
              ) : (
                <div className="category-list">
                  {shoppingCategories.map(category => (
                    <div key={category.id} className="category-list-item">
                      <div 
                        className="category-color-indicator"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="category-list-name">{category.name}</span>
                      <div className="category-list-actions">
                        <button
                          className="action-button edit"
                          onClick={() => handleCategoryEdit(category)}
                          aria-label={`Bewerk ${category.name}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleCategoryDelete(category.id)}
                          aria-label={`Verwijder ${category.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingPage;
