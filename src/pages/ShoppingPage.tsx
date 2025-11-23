import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { ShoppingItem, ShoppingCategory } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  X, 
  Package, 
  PackageX,
  Filter,
  Search,
  Edit2,
  Trash2
} from 'lucide-react';
import '../styles/ShoppingPage.css';

const ShoppingPage: React.FC = () => {
  const { 
    shoppingItems, 
    shoppingCategories,
    addShoppingItem, 
    updateShoppingItem, 
    deleteShoppingItem,
    addShoppingCategory 
  } = useAppData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 1,
    unit: 'stuks',
    instock: true
  });

  const units = ['stuks', 'kg', 'gram', 'liter', 'ml', 'pakken', 'blikken', 'flessen'];

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = shoppingItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    // Out of stock filter
    if (!showOutOfStock) {
      filtered = filtered.filter(item => item.instock);
    }

    return filtered.sort((a, b) => {
      // Sort by completion status first, then by name
      if (a.iscompleted !== b.iscompleted) {
        return a.iscompleted ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [shoppingItems, searchTerm, selectedCategory, showCompleted, showOutOfStock]);

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
    const outOfStock = shoppingItems.filter(item => !item.instock).length;
    const pending = total - completed;

    return { total, completed, outOfStock, pending };
  }, [shoppingItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) return;

    const itemData = {
      ...formData,
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
      quantity: 1,
      unit: 'stuks',
      instock: true
    });
  };

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      instock: item.instock
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

  const toggleInStock = (id: string, instock: boolean) => {
    updateShoppingItem(id, { instock: !instock });
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

  return (
    <div className="shopping-page">
      <div className="page-header">
        <div className="page-title">
          <ShoppingCart size={32} />
          <h1>Boodschappenlijst</h1>
        </div>
        
        <div className="header-actions">
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
        
        <div className="stat-card">
          <div className="stat-icon out-of-stock">
            <PackageX size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.outOfStock}</span>
            <span className="stat-label">Op</span>
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
            
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showOutOfStock}
                onChange={(e) => setShowOutOfStock(e.target.checked)}
              />
              <span>Toon 'op' items</span>
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
                    className={`item-card ${item.iscompleted ? 'completed' : ''} ${!item.instock ? 'out-of-stock' : ''}`}
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
                        <p>{item.quantity} {item.unit}</p>
                      </div>
                      
                      <div className="item-status">
                        <button
                          className={`stock-button ${item.instock ? 'in-stock' : 'out-of-stock'}`}
                          onClick={() => toggleInStock(item.id, item.instock)}
                          title={item.instock ? 'Markeer als op' : 'Markeer als voorradig'}
                        >
                          {item.instock ? <Package size={16} /> : <PackageX size={16} />}
                        </button>
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

      {/* Add/Edit Modal */}
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quantity">Aantal *</label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unit">Eenheid *</label>
                  <select
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
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
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.instock}
                    onChange={(e) => setFormData({ ...formData, instock: e.target.checked })}
                  />
                  <span>Momenteel op voorraad</span>
                </label>
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
    </div>
  );
};

export default ShoppingPage;
