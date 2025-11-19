import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
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
  
  const [formData, setFormData] = useState({
    childId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    location: '',
    hostName: '',
    notes: '',
    pickupTime: ''
  });

  // Get children only
  const children = familyMembers.filter(member => member.type === 'child');

  // Filter sleepovers
  const filteredSleepovers = useMemo(() => {
    let filtered = sleepovers;

    // Child filter
    if (selectedChild !== 'all') {
      filtered = filtered.filter(sleepover => sleepover.childId === selectedChild);
    }

    // Time filter
    if (timeFilter === 'upcoming') {
      filtered = filtered.filter(sleepover => isFuture(parseISO(sleepover.date)));
    } else if (timeFilter === 'past') {
      filtered = filtered.filter(sleepover => isPast(parseISO(sleepover.date)));
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sleepovers, selectedChild, timeFilter]);

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
    if (!formData.childId || !formData.location.trim() || !formData.hostName.trim()) return;

    if (editingSleepover) {
      updateSleepover(editingSleepover.id, formData);
      setEditingSleepover(null);
    } else {
      addSleepover(formData);
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      childId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      location: '',
      hostName: '',
      notes: '',
      pickupTime: ''
    });
  };

  const handleEdit = (sleepover: Sleepover) => {
    setEditingSleepover(sleepover);
    setFormData({
      childId: sleepover.childId,
      date: sleepover.date,
      location: sleepover.location,
      hostName: sleepover.hostName,
      notes: sleepover.notes || '',
      pickupTime: sleepover.pickupTime || ''
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

  const getChildName = (childId: string) => {
    const child = familyMembers.find(member => member.id === childId);
    return child?.name || 'Onbekend kind';
  };

  const getChildColor = (childId: string) => {
    const child = familyMembers.find(member => member.id === childId);
    return child?.color || '#718096';
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
            onClick={() => setIsAddModalOpen(true)}
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
      <div className="sleepovers-list">
        {filteredSleepovers.length === 0 ? (
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
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              {sleepovers.length === 0 ? 'Eerste logeerpartijtje toevoegen' : 'Logeerpartijtje toevoegen'}
            </button>
          </div>
        ) : (
          <div className="sleepovers-grid">
            {filteredSleepovers.map(sleepover => {
              const child = familyMembers.find(member => member.id === sleepover.childId);
              const isUpcoming = isFuture(parseISO(sleepover.date));

              return (
                <div 
                  key={sleepover.id} 
                  className={`sleepover-card ${isUpcoming ? 'upcoming' : 'past'}`}
                  style={{ borderLeftColor: getChildColor(sleepover.childId) }}
                >
                  <div className="sleepover-header">
                    <div className="child-info">
                      <div 
                        className="child-avatar"
                        style={{ backgroundColor: getChildColor(sleepover.childId) }}
                      >
                        {getChildName(sleepover.childId).charAt(0)}
                      </div>
                      <div>
                        <h3>{getChildName(sleepover.childId)}</h3>
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
                    
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{sleepover.location}</span>
                    </div>
                    
                    <div className="detail-item">
                      <User size={16} />
                      <span>Bij {sleepover.hostName}</span>
                    </div>
                    
                    {sleepover.pickupTime && (
                      <div className="detail-item">
                        <Clock size={16} />
                        <span>Ophalen om {sleepover.pickupTime}</span>
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
                <label htmlFor="childId">Kind *</label>
                <select
                  id="childId"
                  value={formData.childId}
                  onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                  required
                >
                  <option value="">Selecteer een kind</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
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
                    value={formData.pickupTime}
                    onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Locatie *</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Bijv. Bij oma en opa, Bij vriendjes thuis..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hostName">Gastheer/vrouw *</label>
                <input
                  type="text"
                  id="hostName"
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  placeholder="Bijv. Oma, Familie Jansen, Lisa's ouders..."
                  required
                />
              </div>

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
