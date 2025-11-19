import React, { useState } from 'react';
import { useAppData } from '../hooks/useAppData';
import { FamilyMember } from '../types';
import { Plus, Edit2, Trash2, Users, Baby, Heart, UserCheck } from 'lucide-react';
import '../styles/FamilyPage.css';

const FamilyPage: React.FC = () => {
  const { familyMembers, addFamilyMember, updateFamilyMember, deleteFamilyMember } = useAppData();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'child' as FamilyMember['type'],
    birthDate: '',
    color: '#3182ce'
  });

  const memberTypeLabels = {
    child: 'Kind',
    parent: 'Ouder',
    grandparent: 'Opa/Oma',
    babysitter: 'Oppas'
  };

  const memberTypeIcons = {
    child: Baby,
    parent: Heart,
    grandparent: Users,
    babysitter: UserCheck
  };

  const predefinedColors = [
    '#3182ce', '#e53e3e', '#38a169', '#d69e2e', '#805ad5',
    '#dd6b20', '#319795', '#e53e3e', '#9f7aea', '#48bb78'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMember) {
      updateFamilyMember(editingMember.id, formData);
      setEditingMember(null);
    } else {
      addFamilyMember(formData);
    }

    setFormData({
      name: '',
      type: 'child',
      birthDate: '',
      color: '#3182ce'
    });
    setIsAddModalOpen(false);
  };

  const handleEdit = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      type: member.type,
      birthDate: member.birthDate || '',
      color: member.color
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Weet je zeker dat je dit gezinslid wilt verwijderen?')) {
      deleteFamilyMember(id);
    }
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingMember(null);
    setFormData({
      name: '',
      type: 'child',
      birthDate: '',
      color: '#3182ce'
    });
  };

  const groupedMembers = familyMembers.reduce((groups, member) => {
    const type = member.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(member);
    return groups;
  }, {} as Record<FamilyMember['type'], FamilyMember[]>);

  return (
    <div className="family-page">
      <div className="page-header">
        <div className="page-title">
          <Users size={32} />
          <h1>Gezinsconfiguratie</h1>
        </div>
        <button 
          className="add-button"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={20} />
          Gezinslid toevoegen
        </button>
      </div>

      <div className="family-groups">
        {Object.entries(groupedMembers).map(([type, members]) => {
          const IconComponent = memberTypeIcons[type as FamilyMember['type']];
          return (
            <div key={type} className="family-group">
              <div className="group-header">
                <IconComponent size={24} />
                <h2>{memberTypeLabels[type as FamilyMember['type']]}</h2>
                <span className="member-count">{members.length}</span>
              </div>
              
              <div className="members-grid">
                {members.map((member) => (
                  <div key={member.id} className="member-card">
                    <div 
                      className="member-avatar"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="member-info">
                      <h3>{member.name}</h3>
                      {member.birthDate && (
                        <p className="birth-date">
                          Geboren: {new Date(member.birthDate).toLocaleDateString('nl-NL')}
                        </p>
                      )}
                    </div>
                    
                    <div className="member-actions">
                      <button 
                        className="action-button edit"
                        onClick={() => handleEdit(member)}
                        aria-label={`Bewerk ${member.name}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDelete(member.id)}
                        aria-label={`Verwijder ${member.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {familyMembers.length === 0 && (
        <div className="empty-state">
          <Users size={64} />
          <h2>Nog geen gezinsleden</h2>
          <p>Voeg je eerste gezinslid toe om te beginnen</p>
          <button 
            className="add-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            Eerste gezinslid toevoegen
          </button>
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingMember ? 'Gezinslid bewerken' : 'Gezinslid toevoegen'}</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Naam *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Voer de naam in"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type *</label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as FamilyMember['type'] })}
                  required
                >
                  <option value="child">Kind</option>
                  <option value="parent">Ouder</option>
                  <option value="grandparent">Opa/Oma</option>
                  <option value="babysitter">Oppas</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="birthDate">Geboortedatum</label>
                <input
                  type="date"
                  id="birthDate"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Kleur (voor kalender)</label>
                <div className="color-picker">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                  <div className="color-presets">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`color-preset ${formData.color === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                        aria-label={`Selecteer kleur ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingMember ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyPage;
