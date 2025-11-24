import React, { useState, useMemo, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Sleepover, FamilyMember } from '../types';
import { 
  Bed, 
  Plus, 
  Calendar,
  MapPin,
  Clock,
  User,
  Edit2,
  Trash2,
  X,
  Filter
} from 'lucide-react';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { nl } from 'date-fns/locale';
import '../styles/SleepoverPage.css';

const SleepoverPage: React.FC = () => {
  const { 
    sleepovers, 
    addSleepover, 
    updateSleepover, 
    deleteSleepover,
    familyMembers 
  } = useAppData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSleepover, setEditingSleepover] = useState<Sleepover | null>(null);
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [isTableCompact, setIsTableCompact] = useLocalStorage<boolean>('sleepovers.compactTable', true);
  const [sortKey, setSortKey] = useState<'date' | 'child' | 'location'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  const [formData, setFormData] = useState({
    children: [] as string[], // Changed to array for multiple children
    date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    locationtype: 'oppas' as 'opa_oma_asten' | 'opa_oma_heusden' | 'oppas' | 'anders',
    hostname: '',
    notes: '',
    pickuptime: ''
  });

  // Get children only
  const children = familyMembers.filter(member => member.type === 'child');

  // Initialize formData with all children when children are available
  useEffect(() => {
    if (children.length > 0 && formData.children.length === 0 && !isAddModalOpen) {
      const allChildIds = children.map(child => child.id);
      setFormData(prev => ({
        ...prev,
        children: allChildIds
      }));
    }
  }, [children.length, isAddModalOpen]);

  const changeSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Filter sleepovers
  const filteredSleepovers = useMemo(() => {
    let filtered = sleepovers;

    // Child filter
    if (selectedChild !== 'all') {
      filtered = filtered.filter(sleepover => sleepover.childid === selectedChild);
    }

    // Time filter
    if (timeFilter === 'upcoming') {
      filtered = filtered.filter(sleepover => isFuture(parseISO(sleepover.date)));
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(sleepover => isPast(parseISO(sleepover.date)));
    }

    return filtered;
  }, [sleepovers, selectedChild, timeFilter]);

  const getChildName = (childId: string) => {
    const child = familyMembers.find(member => member.id === childId);
    return child?.name || 'Onbekend kind';
  };

  const getChildColor = (childId: string) => {
    const child = familyMembers.find(member => member.id === childId);
    return child?.color || '#718096';
  };

  // Sorted sleepovers
  const sortedSleepovers = useMemo(() => {
    const arr = [...filteredSleepovers];
    
    arr.sort((a, b) => {
      if (sortKey === 'date') {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return diff;
      }
      if (sortKey === 'child') {
        const aName = getChildName(a.childid).toLowerCase();
        const bName = getChildName(b.childid).toLowerCase();
        return aName.localeCompare(bName);
      }
      if (sortKey === 'location') {
        const aLoc = (a.location || '').toLowerCase();
        const bLoc = (b.location || '').toLowerCase();
        return aLoc.localeCompare(bLoc);
      }
      return 0;
    });

    if (sortDir === 'desc') arr.reverse();
    return arr;
  }, [filteredSleepovers, sortKey, sortDir, familyMembers]);

  // Statistics
  const stats = useMemo(() => {
    const total = sleepovers.length;
    const upcoming = sleepovers.filter(sleepover => isFuture(parseISO(sleepover.date))).length;
    const thisMonth = sleepovers.filter(sleepover => {
      const sleepoverDate = parseISO(sleepover.date);
      const now = new Date();
      return sleepoverDate.getMonth() === now.getMonth() && 
             sleepoverDate.getFullYear() === now.getFullYear();
    }).length;

    return { total, upcoming, thisMonth };
  }, [sleepovers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.children.length === 0) return;

    // Build location string from locationtype
    let locationText = '';
    if (formData.locationtype === 'opa_oma_asten') {
      locationText = 'Opa/Oma Asten';
    } else if (formData.locationtype === 'opa_oma_heusden') {
      locationText = 'Opa/Oma Heusden';
    } else if (formData.locationtype === 'oppas') {
      locationText = 'Oppas';
    } else if (formData.locationtype === 'anders') {
      locationText = formData.location || 'Anders';
    }

    // Create a sleepover for each selected child
    if (editingSleepover) {
      // For editing, update the existing one
      const updateData = {
        childid: formData.children[0], // Use first selected child
        date: formData.date,
        location: locationText || undefined,
        hostname: formData.hostname || undefined,
        notes: formData.notes || undefined,
        pickuptime: formData.pickuptime || undefined
      };
      updateSleepover(editingSleepover.id, updateData);
      setEditingSleepover(null);
    } else {
      // For new entries, create one sleepover per child
      const promises = formData.children.map(childId => {
        const sleepoverData = {
          childid: childId,
          date: formData.date,
          location: locationText || undefined,
          hostname: formData.hostname || undefined,
          notes: formData.notes || undefined,
          pickuptime: formData.pickuptime || undefined
        };
        return addSleepover(sleepoverData);
      });
      Promise.all(promises);
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    // By default, select all children
    const allChildIds = children.map(child => child.id);
    setFormData({
      children: allChildIds,
      date: format(new Date(), 'yyyy-MM-dd'),
      location: '',
      locationtype: 'oppas',
      hostname: '',
      notes: '',
      pickuptime: ''
    });
  };

  const handleEdit = (sleepover: Sleepover) => {
    setEditingSleepover(sleepover);
    
    // Parse location back to locationtype
    let locationtype: 'opa_oma_asten' | 'opa_oma_heusden' | 'oppas' | 'anders' = 'oppas';
    let location = '';
    
    if (sleepover.location) {
      if (sleepover.location === 'Opa/Oma Asten') {
        locationtype = 'opa_oma_asten';
      } else if (sleepover.location === 'Opa/Oma Heusden') {
        locationtype = 'opa_oma_heusden';
      } else if (sleepover.location === 'Oppas') {
        locationtype = 'oppas';
      } else {
        locationtype = 'anders';
        location = sleepover.location;
      }
    }
    
    setFormData({
      children: [sleepover.childid], // Single child for editing
      date: sleepover.date,
      location: location,
      locationtype: locationtype,
      hostname: sleepover.hostname || '',
      notes: sleepover.notes || '',
      pickuptime: sleepover.pickuptime || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Weet je zeker dat je dit logeerpartijtje wilt verwijderen?')) {
      deleteSleepover(id);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingSleepover(null);
    resetForm();
  };

  return (
    <div className="sleepover-page">
      <div className="page-header">
        <div className="page-title">
          <Bed size={32} />
          <h1>Logeren Tracking</h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={() => {
              resetForm(); // Reset form with all children selected by default
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={20} />
            Logeerpartijtje toevoegen
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Bed size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Totaal logeerpartijtjes</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon upcoming">
            <Calendar size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.upcoming}</span>
            <span className="stat-label">Komende logeerpartijtjes</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon this-month">
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.thisMonth}</span>
            <span className="stat-label">Deze maand</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="child-filter">Kind:</label>
            <select
              id="child-filter"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="filter-select"
            >
              <option value="all">Alle kinderen</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="time-filter">Periode:</label>
            <select
              id="time-filter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as 'all' | 'upcoming' | 'past')}
              className="filter-select"
            >
              <option value="all">Alle periodes</option>
              <option value="upcoming">Komende</option>
              <option value="past">Afgelopen</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sleepovers List */}
      <div className={`sleepovers-list ${isTableCompact ? 'table' : ''}`}>
        {sortedSleepovers.length === 0 ? (
          <div className="empty-state">
            <Bed size={64} />
            <h2>Geen logeerpartijtjes gevonden</h2>
            <p>
              {sleepovers.length === 0 
                ? 'Voeg het eerste logeerpartijtje toe om te beginnen'
                : 'Pas je filters aan om logeerpartijtjes te zien'
              }
            </p>
            <button 
              className="add-button"
              onClick={() => {
                resetForm(); // Reset form with all children selected by default
                setIsAddModalOpen(true);
              }}
            >
              <Plus size={20} />
              {sleepovers.length === 0 ? 'Eerste logeerpartijtje toevoegen' : 'Logeerpartijtje toevoegen'}
            </button>
          </div>
        ) : (
          isTableCompact ? (
            <div className="sleepovers-table-wrap">
              <table className="sleepovers-table">
                <thead>
                  <tr>
                    <th><button type="button" onClick={() => changeSort('child')}>Kind{sortKey==='child' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th><button type="button" onClick={() => changeSort('date')}>Datum{sortKey==='date' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th><button type="button" onClick={() => changeSort('location')}>Locatie{sortKey==='location' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th>Ophaaltijd</th>
                    <th>Notities</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sortedSleepovers.map(sleepover => {
                    const isUpcoming = isFuture(parseISO(sleepover.date));
                    return (
                      <tr
                        key={sleepover.id}
                        className={isUpcoming ? 'upcoming' : 'past'}
                      >
                        <td className="td-child">
                          <div className="child-info-table">
                            <div 
                              className="child-avatar-table"
                              style={{ backgroundColor: getChildColor(sleepover.childid) }}
                            >
                              {getChildName(sleepover.childid).charAt(0)}
                            </div>
                            <span>{getChildName(sleepover.childid)}</span>
                          </div>
                        </td>
                        <td className="td-date">{format(parseISO(sleepover.date), 'dd MMM yyyy', { locale: nl })}</td>
                        <td className="td-location">{sleepover.location || '—'}</td>
                        <td className="td-pickuptime">{sleepover.pickuptime || '—'}</td>
                        <td className="td-notes">{sleepover.notes || '—'}</td>
                        <td className="td-actions">
                          <button className="action-button edit" onClick={() => handleEdit(sleepover)} aria-label="Bewerken"><Edit2 size={14} /></button>
                          <button className="action-button delete" onClick={() => handleDelete(sleepover.id)} aria-label="Verwijderen"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="sleepovers-grid">
              {sortedSleepovers.map(sleepover => {
              const child = familyMembers.find(member => member.id === sleepover.childid);
              const isUpcoming = isFuture(parseISO(sleepover.date));

              return (
                <div 
                  key={sleepover.id} 
                  className={`sleepover-card ${isUpcoming ? 'upcoming' : 'past'}`}
                  style={{ borderLeftColor: getChildColor(sleepover.childid) }}
                >
                  <div className="sleepover-header">
                    <div className="child-info">
                      <div 
                        className="child-avatar"
                        style={{ backgroundColor: getChildColor(sleepover.childid) }}
                      >
                        {getChildName(sleepover.childid).charAt(0)}
                      </div>
                      <div>
                        <h3>{getChildName(sleepover.childid)}</h3>
                        <span className={`status ${isUpcoming ? 'upcoming' : 'past'}`}>
                          {isUpcoming ? 'Komend' : 'Afgelopen'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="sleepover-actions">
                      <button 
                        className="action-button edit"
                        onClick={() => handleEdit(sleepover)}
                        aria-label="Bewerken"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDelete(sleepover.id)}
                        aria-label="Verwijderen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="sleepover-details">
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{format(parseISO(sleepover.date), 'EEEE d MMMM yyyy', { locale: nl })}</span>
                    </div>
                    
                    {sleepover.location && (
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{sleepover.location}</span>
                      </div>
                    )}
                    
                    {sleepover.pickuptime && (
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>Ophalen om {sleepover.pickuptime}</span>
                      </div>
                    )}
                  </div>

                  {sleepover.notes && (
                    <div className="sleepover-notes">
                      <p>{sleepover.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSleepover ? 'Logeerpartijtje bewerken' : 'Logeerpartijtje toevoegen'}</h2>
              <button className="close-button" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Kinderen *</label>
                <div className="participants-selector">
                  {children.map(child => (
                    <button
                      key={child.id}
                      type="button"
                      className={`participant-option ${formData.children.includes(child.id) ? 'selected' : ''}`}
                      onClick={() => {
                        const isSelected = formData.children.includes(child.id);
                        setFormData({
                          ...formData,
                          children: isSelected
                            ? formData.children.filter(id => id !== child.id)
                            : [...formData.children, child.id]
                        });
                      }}
                      style={{
                        borderColor: formData.children.includes(child.id) ? child.color : '#e2e8f0',
                        backgroundColor: formData.children.includes(child.id) ? `${child.color}20` : 'white'
                      }}
                    >
                      <div 
                        className="participant-color"
                        style={{ backgroundColor: child.color }}
                      />
                      {child.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Datum *</label>
                  <input
                    type="date"
                    id="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pickupTime">Ophaaltijd</label>
                  <input
                    type="time"
                    id="pickupTime"
                    value={formData.pickuptime}
                    onChange={(e) => setFormData({ ...formData, pickuptime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Locatie type *</label>
                <div className="filter-selector">
                  <button
                    type="button"
                    className={`filter-option ${formData.locationtype === 'opa_oma_asten' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, locationtype: 'opa_oma_asten' })}
                  >
                    Opa/Oma Asten
                  </button>
                  <button
                    type="button"
                    className={`filter-option ${formData.locationtype === 'opa_oma_heusden' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, locationtype: 'opa_oma_heusden' })}
                  >
                    Opa/Oma Heusden
                  </button>
                  <button
                    type="button"
                    className={`filter-option ${formData.locationtype === 'oppas' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, locationtype: 'oppas' })}
                  >
                    Oppas
                  </button>
                  <button
                    type="button"
                    className={`filter-option ${formData.locationtype === 'anders' ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, locationtype: 'anders' })}
                  >
                    Anders
                  </button>
                </div>
              </div>

              {formData.locationtype === 'anders' && (
                <div className="form-group">
                  <label htmlFor="location">Locatie (optioneel)</label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Bijv. Bij vriendjes thuis..."
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="notes">Notities</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Extra informatie, wat mee te nemen, contactgegevens..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingSleepover ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SleepoverPage;
