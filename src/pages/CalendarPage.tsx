import React, { useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import { useAppData } from '../hooks/useAppData';
import { CalendarEvent, FamilyMember } from '../types';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Filter, 
  Clock, 
  MapPin, 
  Users,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarPage.css';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const CalendarPage: React.FC = () => {
  const { 
    calendarEvents, 
    addCalendarEvent, 
    updateCalendarEvent, 
    deleteCalendarEvent,
    familyMembers 
  } = useAppData();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '',
    description: '',
    participants: [] as string[],
    type: 'activity' as CalendarEvent['type'],
    location: ''
  });

  const eventTypeLabels = {
    appointment: 'Afspraak',
    activity: 'Activiteit',
    meal: 'Maaltijd',
    sleepover: 'Logeren',
    task: 'Taak'
  };

  const eventTypeColors = {
    appointment: '#3182ce',
    activity: '#38a169',
    meal: '#d69e2e',
    sleepover: '#805ad5',
    task: '#e53e3e'
  };

  // Filter events based on selected family members
  const filteredEvents = useMemo(() => {
    if (selectedFilters.length === 0) return calendarEvents;
    
    return calendarEvents.filter(event => 
      event.participants.some(participantId => 
        selectedFilters.includes(participantId)
      )
    );
  }, [calendarEvents, selectedFilters]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    return filteredEvents.filter(event => 
      isSameDay(parseISO(event.date), selectedDate)
    ).sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  }, [filteredEvents, selectedDate]);

  // Get dates that have events for calendar highlighting
  const eventDates = useMemo(() => {
    return filteredEvents.map(event => parseISO(event.date));
  }, [filteredEvents]);

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const eventData = {
      ...formData,
      participants: formData.participants.length > 0 ? formData.participants : []
    };

    if (editingEvent) {
      updateCalendarEvent(editingEvent.id, eventData);
      setEditingEvent(null);
    } else {
      addCalendarEvent(eventData);
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: '',
      description: '',
      participants: [],
      type: 'activity',
      location: ''
    });
  };

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time || '',
      description: event.description || '',
      participants: event.participants,
      type: event.type,
      location: event.location || ''
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) {
      deleteCalendarEvent(id);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingEvent(null);
    resetForm();
  };

  const toggleFilter = (memberId: string) => {
    setSelectedFilters(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = filteredEvents.filter(event => 
        isSameDay(parseISO(event.date), date)
      );
      
      if (dayEvents.length > 0) {
        return (
          <div className="calendar-tile-content">
            {dayEvents.slice(0, 3).map((event, index) => (
              <div 
                key={event.id}
                className="calendar-event-dot"
                style={{ backgroundColor: eventTypeColors[event.type] }}
              />
            ))}
            {dayEvents.length > 3 && (
              <div className="calendar-event-more">+{dayEvents.length - 3}</div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <div className="page-title">
          <CalendarIcon size={32} />
          <h1>Gezinskalender</h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="filter-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filters ({selectedFilters.length})
          </button>
          
          <button 
            className="add-button"
            onClick={() => {
              setFormData(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={20} />
            Afspraak toevoegen
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filter op gezinsleden</h3>
            {selectedFilters.length > 0 && (
              <button className="clear-filters" onClick={clearFilters}>
                Wis filters
              </button>
            )}
          </div>
          
          <div className="filter-options">
            {familyMembers.map(member => (
              <button
                key={member.id}
                className={`filter-option ${selectedFilters.includes(member.id) ? 'active' : ''}`}
                onClick={() => toggleFilter(member.id)}
                style={{ 
                  borderColor: selectedFilters.includes(member.id) ? member.color : '#e2e8f0',
                  backgroundColor: selectedFilters.includes(member.id) ? `${member.color}20` : 'white'
                }}
              >
                <div 
                  className="filter-color"
                  style={{ backgroundColor: member.color }}
                />
                {member.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-section">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            locale="nl-NL"
            tileContent={tileContent}
            className="custom-calendar"
          />
        </div>

        <div className="events-section">
          <div className="events-header">
            <h2>
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: nl })}
            </h2>
            <span className="events-count">
              {selectedDateEvents.length} afspraak{selectedDateEvents.length !== 1 ? 'en' : ''}
            </span>
          </div>

          <div className="events-list">
            {selectedDateEvents.length === 0 ? (
              <div className="no-events">
                <CalendarIcon size={48} />
                <p>Geen afspraken voor deze dag</p>
                <button 
                  className="add-button small"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
                    setIsAddModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  Afspraak toevoegen
                </button>
              </div>
            ) : (
              selectedDateEvents.map(event => {
                const eventParticipants = familyMembers.filter(member => 
                  event.participants.includes(member.id)
                );
                
                return (
                  <div 
                    key={event.id} 
                    className="event-card"
                    style={{ borderLeftColor: eventTypeColors[event.type] }}
                  >
                    <div className="event-header">
                      <div className="event-title-section">
                        <h3>{event.title}</h3>
                        <span className="event-type">
                          {eventTypeLabels[event.type]}
                        </span>
                      </div>
                      
                      <div className="event-actions">
                        <button 
                          className="action-button edit"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="action-button delete"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="event-details">
                      {event.time && (
                        <div className="event-detail">
                          <Clock size={16} />
                          <span>{event.time}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="event-detail">
                          <MapPin size={16} />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {eventParticipants.length > 0 && (
                        <div className="event-detail">
                          <Users size={16} />
                          <div className="participants">
                            {eventParticipants.map(participant => (
                              <span 
                                key={participant.id}
                                className="participant"
                                style={{ backgroundColor: `${participant.color}20`, color: participant.color }}
                              >
                                {participant.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <div className="event-description">
                        {event.description}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Afspraak bewerken' : 'Afspraak toevoegen'}</h2>
              <button className="close-button" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title">Titel *</label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Voer de titel in"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Type *</label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as CalendarEvent['type'] })}
                    required
                  >
                    {Object.entries(eventTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
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
                  <label htmlFor="time">Tijd</label>
                  <input
                    type="time"
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Locatie</label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Waar vindt het plaats?"
                />
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

              <div className="form-group">
                <label htmlFor="description">Beschrijving</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Extra informatie..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingEvent ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
