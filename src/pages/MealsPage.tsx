import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Meal, FamilyMember } from '../types';
import { 
  UtensilsCrossed, 
  Plus, 
  Calendar,
  MapPin,
  Users,
  Edit2,
  Trash2,
  X,
  Repeat,
  Coffee,
  Sun,
  Moon,
  Cookie
} from 'lucide-react';
import { format, parseISO, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { nl } from 'date-fns/locale';
import '../styles/MealsPage.css';

const MealsPage: React.FC = () => {
  const { 
    meals, 
    addMeal, 
    updateMeal, 
    deleteMeal,
    familyMembers 
  } = useAppData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mealtype: 'dinner' as Meal['mealtype'],
    dish: '',
    location: 'home' as Meal['location'],
    locationdetails: '',
    participants: [] as string[],
    recurring: {
      frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
      enddate: ''
    }
  });

  const mealTypeLabels = {
    breakfast: 'Ontbijt',
    lunch: 'Lunch',
    dinner: 'Avondeten',
    snack: 'Tussendoortje'
  };

  const mealTypeIcons = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie
  };

  const locationLabels = {
    home: 'Thuis',
    restaurant: 'Restaurant',
    school: 'School',
    work: 'Werk',
    other: 'Anders'
  };

  // Get week range
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filter meals for current week
  const weekMeals = useMemo(() => {
    return meals.filter(meal => {
      const mealDate = parseISO(meal.date);
      return mealDate >= weekStart && mealDate <= weekEnd;
    });
  }, [meals, weekStart, weekEnd]);

  // Group meals by day and meal type
  const mealsByDay = useMemo(() => {
    const grouped: Record<string, Record<Meal['mealtype'], Meal[]>> = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: []
      };
    });

    weekMeals.forEach(meal => {
      const dayKey = meal.date;
      if (grouped[dayKey]) {
        grouped[dayKey][meal.mealtype].push(meal);
      }
    });

    return grouped;
  }, [weekMeals, weekDays]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dish.trim()) return;

    if (editingMeal) {
      const mealData = {
        ...formData,
        participants: formData.participants.length > 0 ? formData.participants : [],
        recurring: formData.recurring.enddate ? JSON.stringify(formData.recurring) : undefined
      };
      updateMeal(editingMeal.id, mealData);
      setEditingMeal(null);
    } else {
      // If recurring, create multiple meals
      if (formData.recurring.enddate) {
        const startDate = parseISO(formData.date);
        const endDate = parseISO(formData.recurring.enddate);
        let currentDate = startDate;

        while (currentDate <= endDate) {
          addMeal({
            mealtype: formData.mealtype,
            dish: formData.dish,
            location: formData.location,
            locationdetails: formData.locationdetails,
            participants: formData.participants.length > 0 ? formData.participants : [],
            date: format(currentDate, 'yyyy-MM-dd'),
            recurring: undefined // Don't store recurring info in individual meals
          });

          // Increment based on frequency
          switch (formData.recurring.frequency) {
            case 'daily':
              currentDate = addDays(currentDate, 1);
              break;
            case 'weekly':
              currentDate = addDays(currentDate, 7);
              break;
            case 'monthly':
              currentDate = addDays(currentDate, 30);
              break;
          }
        }
      } else {
        addMeal({
          mealtype: formData.mealtype,
          dish: formData.dish,
          location: formData.location,
          locationdetails: formData.locationdetails,
          participants: formData.participants.length > 0 ? formData.participants : [],
          date: formData.date,
          recurring: undefined
        });
      }
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      mealtype: 'dinner',
      dish: '',
      location: 'home',
      locationdetails: '',
      participants: [],
      recurring: {
        frequency: 'weekly',
        enddate: ''
      }
    });
  };

  const handleEdit = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      date: meal.date,
      mealtype: meal.mealtype,
      dish: meal.dish,
      location: meal.location,
      locationdetails: meal.locationdetails || '',
      participants: meal.participants,
      recurring: {
        frequency: 'weekly',
        enddate: ''
      }
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Weet je zeker dat je deze maaltijd wilt verwijderen?')) {
      deleteMeal(id);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingMeal(null);
    resetForm();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setSelectedWeek(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const goToToday = () => {
    setSelectedWeek(new Date());
  };

  return (
    <div className="meals-page">
      <div className="page-header">
        <div className="page-title">
          <UtensilsCrossed size={32} />
          <h1>Maaltijdplanning</h1>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-button ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              Lijst
            </button>
          </div>
          
          <button 
            className="add-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            Maaltijd toevoegen
          </button>
        </div>
      </div>

      {viewMode === 'week' && (
        <>
          {/* Week Navigation */}
          <div className="week-navigation">
            <button className="nav-button" onClick={() => navigateWeek('prev')}>
              ← Vorige week
            </button>
            
            <div className="week-info">
              <h2>
                {format(weekStart, 'd MMMM', { locale: nl })} - {format(weekEnd, 'd MMMM yyyy', { locale: nl })}
              </h2>
              <button className="today-button" onClick={goToToday}>
                Vandaag
              </button>
            </div>
            
            <button className="nav-button" onClick={() => navigateWeek('next')}>
              Volgende week →
            </button>
          </div>

          {/* Week View */}
          <div className="week-grid">
            {weekDays.map(day => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayMeals = mealsByDay[dayKey];
              const isToday = isSameDay(day, new Date());

              return (
                <div key={dayKey} className={`day-column ${isToday ? 'today' : ''}`}>
                  <div className="day-header">
                    <h3>{format(day, 'EEEE', { locale: nl })}</h3>
                    <span className="day-date">{format(day, 'd MMM', { locale: nl })}</span>
                  </div>

                  <div className="meal-slots">
                    {Object.entries(mealTypeLabels).map(([type, label]) => {
                      const IconComponent = mealTypeIcons[type as Meal['mealtype']];
                      const typeMeals = dayMeals[type as Meal['mealtype']];

                      return (
                        <div key={type} className="meal-slot">
                          <div className="meal-slot-header">
                            <IconComponent size={16} />
                            <span>{label}</span>
                          </div>

                          {typeMeals.length === 0 ? (
                            <button 
                              className="add-meal-button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  date: dayKey,
                                  mealtype: type as Meal['mealtype']
                                }));
                                setIsAddModalOpen(true);
                              }}
                            >
                              <Plus size={14} />
                              Toevoegen
                            </button>
                          ) : (
                            <div className="meal-items">
                              {typeMeals.map(meal => {
                                const mealParticipants = familyMembers.filter(member => 
                                  meal.participants.includes(member.id)
                                );

                                return (
                                  <div key={meal.id} className="meal-item">
                                    <div className="meal-content">
                                      <h4>{meal.dish}</h4>
                                      {meal.location !== 'home' && (
                                        <div className="meal-location">
                                          <MapPin size={12} />
                                          <span>
                                            {locationLabels[meal.location]}
                                            {meal.locationdetails && ` - ${meal.locationdetails}`}
                                          </span>
                                        </div>
                                      )}
                                      {mealParticipants.length > 0 && (
                                        <div className="meal-participants">
                                          <Users size={12} />
                                          <div className="participants-list">
                                            {mealParticipants.map(participant => (
                                              <span 
                                                key={participant.id}
                                                className="participant-dot"
                                                style={{ backgroundColor: participant.color }}
                                                title={participant.name}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="meal-actions">
                                      <button 
                                        className="action-button edit"
                                        onClick={() => handleEdit(meal)}
                                      >
                                        <Edit2 size={12} />
                                      </button>
                                      <button 
                                        className="action-button delete"
                                        onClick={() => handleDelete(meal.id)}
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {viewMode === 'list' && (
        <div className="list-view">
          <div className="meals-list">
            {meals.length === 0 ? (
              <div className="empty-state">
                <UtensilsCrossed size={64} />
                <h2>Nog geen maaltijden gepland</h2>
                <p>Voeg je eerste maaltijd toe om te beginnen</p>
                <button 
                  className="add-button"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus size={20} />
                  Eerste maaltijd toevoegen
                </button>
              </div>
            ) : (
              meals
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(meal => {
                  const IconComponent = mealTypeIcons[meal.mealtype];
                  const mealParticipants = familyMembers.filter(member => 
                    meal.participants.includes(member.id)
                  );

                  return (
                    <div key={meal.id} className="meal-card">
                      <div className="meal-header">
                        <div className="meal-type">
                          <IconComponent size={20} />
                          <span>{mealTypeLabels[meal.mealtype]}</span>
                        </div>
                        <div className="meal-date">
                          <Calendar size={16} />
                          <span>{format(parseISO(meal.date), 'EEEE d MMMM yyyy', { locale: nl })}</span>
                        </div>
                      </div>

                      <div className="meal-body">
                        <h3>{meal.dish}</h3>
                        
                        <div className="meal-details">
                          {meal.location !== 'home' && (
                            <div className="meal-detail">
                              <MapPin size={16} />
                              <span>
                                {locationLabels[meal.location]}
                                {meal.locationdetails && ` - ${meal.locationdetails}`}
                              </span>
                            </div>
                          )}
                          
                          {mealParticipants.length > 0 && (
                            <div className="meal-detail">
                              <Users size={16} />
                              <div className="participants">
                                {mealParticipants.map(participant => (
                                  <span 
                                    key={participant.id}
                                    className="participant"
                                    style={{ 
                                      backgroundColor: `${participant.color}20`, 
                                      color: participant.color 
                                    }}
                                  >
                                    {participant.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="meal-actions">
                        <button 
                          className="action-button edit"
                          onClick={() => handleEdit(meal)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDelete(meal.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMeal ? 'Maaltijd bewerken' : 'Maaltijd toevoegen'}</h2>
              <button className="close-button" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
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
                  <label htmlFor="mealType">Maaltijd *</label>
                  <select
                    id="mealType"
                    value={formData.mealtype}
                    onChange={(e) => setFormData({ ...formData, mealtype: e.target.value as Meal['mealtype'] })}
                    required
                  >
                    {Object.entries(mealTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dish">Gerecht *</label>
                <input
                  type="text"
                  id="dish"
                  value={formData.dish}
                  onChange={(e) => setFormData({ ...formData, dish: e.target.value })}
                  placeholder="Bijv. Spaghetti bolognese, Broodjes, Pannenkoeken..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="location">Locatie *</label>
                  <select
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value as Meal['location'] })}
                    required
                  >
                    {Object.entries(locationLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {formData.location === 'other' && (
                  <div className="form-group">
                    <label htmlFor="locationDetails">Locatie details</label>
                    <input
                      type="text"
                      id="locationDetails"
                      value={formData.locationdetails}
                      onChange={(e) => setFormData({ ...formData, locationdetails: e.target.value })}
                      placeholder="Specificeer de locatie..."
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Deelnemers</label>
                <div className="participants-selector">
                  {familyMembers.map(member => (
                    <button
                      key={member.id}
                      type="button"
                      className={`participant-option ${formData.participants.includes(member.id) ? 'selected' : ''}`}
                      onClick={() => {
                        const isSelected = formData.participants.includes(member.id);
                        setFormData({
                          ...formData,
                          participants: isSelected
                            ? formData.participants.filter(id => id !== member.id)
                            : [...formData.participants, member.id]
                        });
                      }}
                      style={{
                        borderColor: formData.participants.includes(member.id) ? member.color : '#e2e8f0',
                        backgroundColor: formData.participants.includes(member.id) ? `${member.color}20` : 'white'
                      }}
                    >
                      <div 
                        className="participant-color"
                        style={{ backgroundColor: member.color }}
                      />
                      {member.name}
                    </button>
                  ))}
                </div>
              </div>

              {!editingMeal && (
                <div className="recurring-section">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={!!formData.recurring.enddate}
                        onChange={(e) => setFormData({
                          ...formData,
                          recurring: {
                            ...formData.recurring,
                            enddate: e.target.checked ? format(addDays(parseISO(formData.date), 30), 'yyyy-MM-dd') : ''
                          }
                        })}
                      />
                      <Repeat size={16} />
                      <span>Herhalen</span>
                    </label>
                  </div>

                  {formData.recurring.enddate && (
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="frequency">Frequentie</label>
                        <select
                          id="frequency"
                          value={formData.recurring.frequency}
                          onChange={(e) => setFormData({
                            ...formData,
                            recurring: {
                              ...formData.recurring,
                              frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
                            }
                          })}
                        >
                          <option value="daily">Dagelijks</option>
                          <option value="weekly">Wekelijks</option>
                          <option value="monthly">Maandelijks</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="endDate">Tot datum</label>
                        <input
                          type="date"
                          id="endDate"
                          value={formData.recurring.enddate}
                          onChange={(e) => setFormData({
                            ...formData,
                            recurring: {
                              ...formData.recurring,
                              enddate: e.target.value
                            }
                          })}
                          min={formData.date}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingMeal ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsPage;
