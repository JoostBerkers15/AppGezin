import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { ShoppingItem, ShoppingCategory, Shop } from '../types';
import { 
  ShoppingCart, 
  Plus, 
  Check, 
  X, 
  Package,
  PackageX,
  Search,
  Edit2,
  Trash2,
  Settings,
  Save,
  Store,
  RotateCcw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import '../styles/ShoppingPage.css';

const ShoppingPage: React.FC = () => {
  const { 
    shoppingItems, 
    shoppingCategories,
    shops,
    addShoppingItem, 
    updateShoppingItem, 
    deleteShoppingItem,
    addShoppingCategory,
    updateShoppingCategory,
    deleteShoppingCategory,
    addShop,
    updateShop,
    deleteShop
  } = useAppData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOutOfStock, setShowOutOfStock] = useState(false);
  const [isShopMode, setIsShopMode] = useState(false);
  const [showCompletedInShop, setShowCompletedInShop] = useState(false);
  const [collapsedShops, setCollapsedShops] = useState<Set<string>>(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  
  // Category management state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ShoppingCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#718096'
  });
  
  // Shop management state
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [shopFormData, setShopFormData] = useState({
    name: '',
    address: '',
    notes: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    notes: '',
    shopid: ''
  });

  // Filter and search items
  const filteredItems = useMemo(() => {
    let filtered = shoppingItems;

    // Shop mode filter: only show items that are not in stock (instock = false)
    if (isShopMode) {
      filtered = filtered.filter(item => item.instock === false);
      
      // In shop mode, optionally show completed items
      if (!showCompletedInShop) {
        filtered = filtered.filter(item => !item.iscompleted);
      }
    } else {
      // Normal mode (voorraad beheer): filter by out of stock if enabled
      if (showOutOfStock) {
        filtered = filtered.filter(item => item.instock === false);
      }
    }

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

    return filtered.sort((a, b) => {
      // In shop mode, sort by completion status first, then by name
      if (isShopMode && a.iscompleted !== b.iscompleted) {
        return a.iscompleted ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [shoppingItems, searchTerm, selectedCategory, showCompletedInShop, showOutOfStock, isShopMode]);

  // Group items by shop, then by category
  const groupedItems = useMemo(() => {
    const shopGroups: Record<string, Record<string, ShoppingItem[]>> = {};
    
    filteredItems.forEach(item => {
      const shopId = item.shopid || 'no-shop';
      if (!shopGroups[shopId]) {
        shopGroups[shopId] = {};
      }
      if (!shopGroups[shopId][item.category]) {
        shopGroups[shopId][item.category] = [];
      }
      shopGroups[shopId][item.category].push(item);
    });

    return shopGroups;
  }, [filteredItems]);

  const toggleShopCollapse = (shopId: string) => {
    setCollapsedShops(prev => {
      const newSet = new Set(prev);
      if (newSet.has(shopId)) {
        newSet.delete(shopId);
      } else {
        newSet.add(shopId);
      }
      return newSet;
    });
  };

  const toggleCategoryCollapse = (shopId: string, category: string) => {
    const key = `${shopId}-${category}`;
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const total = shoppingItems.length;
    const completed = shoppingItems.filter(item => item.iscompleted).length;
    const pending = total - completed;
    const outOfStock = shoppingItems.filter(item => item.instock === false).length;
    const inShopModePending = shoppingItems.filter(item => item.instock === false && !item.iscompleted).length;
    const inShopModeCompleted = shoppingItems.filter(item => item.instock === false && item.iscompleted).length;

    return { total, completed, pending, outOfStock, inShopModePending, inShopModeCompleted };
  }, [shoppingItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category) return;

    const itemData = {
      name: formData.name.trim(),
      category: formData.category, // optioneel/voor migratie
      category_id: formData.category, // verplicht veld voor ShoppingItem
      notes: formData.notes.trim() || undefined,
      shopid: formData.shopid || undefined,
      iscompleted: false,
      instock: true  // New items are in stock by default
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
      notes: '',
      shopid: ''
    });
  };

  const handleEdit = (item: ShoppingItem) => {
    setEditingItem(item);
    // Bepaal altijd de juiste categoryId:
    const categoryId =
      item.category_id ||
      (shoppingCategories.find((c) => c.name === item.category)?.id ?? '');
    setFormData({
      name: item.name,
      category: categoryId,
      notes: item.notes || '',
      shopid: item.shopid || ''
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

  const toggleInStock = (id: string, instock: boolean | undefined) => {
    updateShoppingItem(id, { instock: !instock });
  };

  const finishShopping = () => {
    // In shop mode: set all completed items back to in stock and uncheck them
    const completedItems = shoppingItems.filter(item => item.iscompleted && item.instock === false);
    if (completedItems.length === 0) return;
    
    if (window.confirm(`Klaar met winkelen? ${completedItems.length} afgevinkte items worden weer op voorraad gezet.`)) {
      completedItems.forEach(item => {
        updateShoppingItem(item.id, { 
          instock: true,
          iscompleted: false
        });
      });
    }
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

  // Shop management functions
  const handleShopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopFormData.name.trim()) return;

    if (editingShop) {
      updateShop(editingShop.id, shopFormData);
      setEditingShop(null);
    } else {
      addShop(shopFormData);
    }

    setShopFormData({ name: '', address: '', notes: '' });
    setIsShopModalOpen(false);
  };

  const handleShopEdit = (shop: Shop) => {
    setEditingShop(shop);
    setShopFormData({
      name: shop.name,
      address: shop.address || '',
      notes: shop.notes || ''
    });
    setIsShopModalOpen(true);
  };

  const handleShopDelete = (id: string) => {
    const shop = shops.find(s => s.id === id);
    if (!shop) return;
    
    // Check if any items use this shop
    const itemsUsingShop = shoppingItems.filter(item => item.shopid === shop.id);
    if (itemsUsingShop.length > 0) {
      alert(`Deze winkel wordt nog gebruikt door ${itemsUsingShop.length} item(s). Verwijder eerst deze items of wijzig hun winkel.`);
      return;
    }

    if (window.confirm(`Weet je zeker dat je de winkel "${shop.name}" wilt verwijderen?`)) {
      deleteShop(id);
    }
  };

  const closeShopModal = () => {
    setIsShopModalOpen(false);
    setEditingShop(null);
    setShopFormData({ name: '', address: '', notes: '' });
  };

  const getShopName = (shopId?: string) => {
    if (!shopId) return null;
    const shop = shops.find(s => s.id === shopId);
    return shop?.name || null;
  };

  // Predefined colors for categories
  const categoryColors = [
    '#48bb78', '#e53e3e', '#4299e1', '#ed8936', '#38b2ac',
    '#9f7aea', '#f56565', '#ecc94b', '#718096', '#4fd1c5',
    '#fc8181', '#f6ad55', '#90cdf4', '#a0aec0'
  ];

  return (
    <div className={`shopping-page ${isShopMode ? 'shop-mode' : ''}`}>
      <div className="page-header">
        <div className="page-title">
          <ShoppingCart size={32} />
          <h1>Boodschappenlijst</h1>
        </div>
        
        <div className="header-actions">
          {!isShopMode && (
            <>
              <button 
                className="add-button secondary"
                onClick={() => setIsCategoryModalOpen(true)}
                title="Categorieën beheren"
              >
                <Settings size={20} />
                Categorieën
              </button>
              <button 
                className="add-button secondary"
                onClick={() => setIsShopModalOpen(true)}
                title="Winkels beheren"
              >
                <Store size={20} />
                Winkels
              </button>
            </>
          )}
          <button 
            className={`add-button ${isShopMode ? 'secondary' : ''}`}
            onClick={() => setIsShopMode(!isShopMode)}
            title={isShopMode ? 'Voorraad beheer' : 'Winkel mode'}
          >
            {isShopMode ? <Package size={20} /> : <Store size={20} />}
            {isShopMode ? 'Voorraad Beheer' : 'Winkel Mode'}
          </button>
          {!isShopMode && (
            <button 
              className="add-button"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              Item toevoegen
            </button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {!isShopMode && (
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
      )}
      
      {/* Shop Mode Minimal Stats */}
      {isShopMode && (
        <div className="shop-mode-stats">
          <span>{stats.inShopModePending} te kopen</span>
          {stats.inShopModeCompleted > 0 && (
            <span className="shop-mode-completed-count">{stats.inShopModeCompleted} afgevinkt</span>
          )}
          {stats.inShopModeCompleted > 0 && (
            <button 
              className="finish-shopping-button"
              onClick={finishShopping}
              title="Klaar met winkelen - zet alle afgevinkte items weer op voorraad"
            >
              <Check size={16} />
              Klaar met winkelen
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className={`filters-section ${isShopMode ? 'shop-mode-filters' : ''}`}>
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Zoek items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!isShopMode && (
          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
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
                  checked={showOutOfStock}
                  onChange={(e) => setShowOutOfStock(e.target.checked)}
                />
                <span>Alleen niet op voorraad</span>
              </label>
            </div>
          </div>
        )}
        
        {isShopMode && (
          <div className="filter-controls shop-mode-controls">
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
                  checked={showCompletedInShop}
                  onChange={(e) => setShowCompletedInShop(e.target.checked)}
                />
                <span>Toon afgevinkt</span>
              </label>
            </div>
          </div>
        )}
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
          Object.entries(groupedItems).map(([shopId, categoryGroups]) => {
            const shopName = shopId === 'no-shop' ? 'Geen winkel' : getShopName(shopId) || 'Onbekende winkel';
            const isShopCollapsed = collapsedShops.has(shopId);
            
            return (
              <div key={shopId} className="shop-section">
                <div 
                  className="shop-header"
                  onClick={() => toggleShopCollapse(shopId)}
                >
                  <div className="shop-header-left">
                    {isShopCollapsed ? (
                      <ChevronRight size={20} className="collapse-icon" />
                    ) : (
                      <ChevronDown size={20} className="collapse-icon" />
                    )}
                    <Store size={20} />
                    <h2>{shopName}</h2>
                  </div>
                  <span className="shop-item-count">
                    {Object.values(categoryGroups).reduce((sum, items) => sum + items.length, 0)} items
                  </span>
                </div>
                
                {!isShopCollapsed && (
                  <div className="shop-categories">
                    {Object.entries(categoryGroups).map(([categoryName, items]) => {
                      // categoryName is meestal een id (category_id)
                      const categoryObj = shoppingCategories.find(c => c.id === categoryName);
                      const headerLabel = categoryObj?.description || categoryObj?.name || categoryName;
                      const categoryKey = `${shopId}-${categoryName}`;
                      const isCategoryCollapsed = collapsedCategories.has(categoryKey);
                      
                      return (
                        <div key={categoryKey} className="category-section">
                          <div 
                            className="category-header"
                            onClick={() => toggleCategoryCollapse(shopId, categoryName)}
                            style={{ borderLeftColor: getCategoryColor(categoryName) }}
                          >
                            <div className="category-header-left">
                              {isCategoryCollapsed ? (
                                <ChevronRight size={16} className="collapse-icon" />
                              ) : (
                                <ChevronDown size={16} className="collapse-icon" />
                              )}
                              <h3>{headerLabel}</h3>
                            </div>
                            <span className="item-count">{items.length} items</span>
                          </div>
                          
                          {!isCategoryCollapsed && (
                            <div className={`items-grid ${isShopMode ? 'shop-mode-grid' : ''}`}>
                              {items.map(item => (
                                <div 
                                  key={item.id} 
                                  className={`item-card ${item.iscompleted ? 'completed' : ''} ${item.instock ? 'in-stock' : ''} ${isShopMode ? 'shop-mode-card' : ''}`}
                                >
                                  <div className="item-main">
                                    {isShopMode && (
                                      <button
                                        className={`check-button ${item.iscompleted ? 'checked' : ''}`}
                                        onClick={() => toggleCompleted(item.id, item.iscompleted)}
                                        aria-label={item.iscompleted ? 'Markeer als niet gekocht' : 'Markeer als gekocht'}
                                      >
                                        {item.iscompleted && <Check size={16} />}
                                      </button>
                                    )}
                                    
                                    <div className="item-info">
                                      <h4>{item.name}</h4>
                                      {item.notes && (
                                        <p className="item-notes">{item.notes}</p>
                                      )}
                                    </div>
                                    
                                    {!isShopMode && (
                                      <button
                                        className={`stock-button ${item.instock ? 'in-stock' : 'out-of-stock'}`}
                                        onClick={() => toggleInStock(item.id, item.instock)}
                                        title={item.instock ? 'Markeer als niet op voorraad' : 'Markeer als op voorraad'}
                                        aria-label={item.instock ? 'Markeer als niet op voorraad' : 'Markeer als op voorraad'}
                                      >
                                        {item.instock ? <Package size={16} /> : <PackageX size={16} />}
                                      </button>
                                    )}
                                  </div>
                                  
                                  {!isShopMode && (
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
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
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
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="shopid">Winkel</label>
                <select
                  id="shopid"
                  value={formData.shopid}
                  onChange={(e) => setFormData({ ...formData, shopid: e.target.value })}
                >
                  <option value="">Geen winkel</option>
                  {shops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
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

      {/* Shop Management Modal */}
      {isShopModalOpen && (
        <div className="modal-overlay" onClick={closeShopModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingShop ? 'Winkel bewerken' : 'Winkel toevoegen'}</h2>
              <button className="close-button" onClick={closeShopModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleShopSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="shop-name">Naam *</label>
                <input
                  type="text"
                  id="shop-name"
                  value={shopFormData.name}
                  onChange={(e) => setShopFormData({ ...shopFormData, name: e.target.value })}
                  placeholder="Bijv. Albert Heijn, Jumbo, Lidl..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="shop-address">Adres</label>
                <input
                  type="text"
                  id="shop-address"
                  value={shopFormData.address}
                  onChange={(e) => setShopFormData({ ...shopFormData, address: e.target.value })}
                  placeholder="Bijv. Hoofdstraat 123, Amsterdam"
                />
              </div>

              <div className="form-group">
                <label htmlFor="shop-notes">Opmerkingen</label>
                <textarea
                  id="shop-notes"
                  value={shopFormData.notes}
                  onChange={(e) => setShopFormData({ ...shopFormData, notes: e.target.value })}
                  placeholder="Optionele opmerkingen over de winkel..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeShopModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingShop ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>

            {/* Shop List */}
            <div className="category-list-section">
              <h3>Bestaande winkels</h3>
              {shops.length === 0 ? (
                <p className="empty-text">Geen winkels toegevoegd</p>
              ) : (
                <div className="category-list">
                  {shops.map(shop => (
                    <div key={shop.id} className="category-list-item">
                      <div className="shop-info">
                        <span className="category-list-name">{shop.name}</span>
                        {shop.address && (
                          <span className="shop-address">{shop.address}</span>
                        )}
                      </div>
                      <div className="category-list-actions">
                        <button
                          className="action-button edit"
                          onClick={() => handleShopEdit(shop)}
                          aria-label={`Bewerk ${shop.name}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="action-button delete"
                          onClick={() => handleShopDelete(shop.id)}
                          aria-label={`Verwijder ${shop.name}`}
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
