import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { Task, FamilyMember } from '../types';
import { 
  CheckSquare, 
  Plus, 
  Calendar,
  User,
  AlertCircle,
  Clock,
  Edit2,
  Trash2,
  X,
  Filter,
  Search
} from 'lucide-react';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { nl } from 'date-fns/locale';
import '../styles/TasksPage.css';

const TasksPage: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask,
    familyMembers 
  } = useAppData();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as Task['priority'],
    category: 'Algemeen'
  });

  const priorityLabels = {
    low: 'Laag',
    medium: 'Gemiddeld',
    high: 'Hoog'
  };

  const priorityColors = {
    low: '#48bb78',
    medium: '#ed8936',
    high: '#e53e3e'
  };

  const statusLabels = {
    pending: 'Te doen',
    in_progress: 'Bezig',
    completed: 'Voltooid'
  };

  const categories = [
    'Algemeen',
    'Huishouden',
    'School',
    'Werk',
    'Gezondheid',
    'Financiën',
    'Hobby',
    'Onderhoud'
  ];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      filtered = filtered.filter(task => task.assignedTo === assigneeFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by status first (pending, in_progress, completed)
      const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
      if (a.status !== b.status) {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      
      // Then by priority (high, medium, low)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      
      // Finally by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      
      return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    const overdue = tasks.filter(task => 
      task.dueDate && 
      task.status !== 'completed' && 
      isPast(parseISO(task.dueDate))
    ).length;

    return { total, pending, inProgress, completed, overdue };
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      ...formData,
      status: 'pending' as Task['status'],
      assignedTo: formData.assignedTo || undefined
    };

    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(null);
    } else {
      addTask(taskData);
    }

    resetForm();
    setIsAddModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium',
      category: 'Algemeen'
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate || '',
      priority: task.priority,
      category: task.category
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Weet je zeker dat je deze taak wilt verwijderen?')) {
      deleteTask(id);
    }
  };

  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    updateTask(id, { status: newStatus });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingTask(null);
    resetForm();
  };

  const getAssigneeName = (assigneeId?: string) => {
    if (!assigneeId) return 'Niet toegewezen';
    const assignee = familyMembers.find(member => member.id === assigneeId);
    return assignee?.name || 'Onbekend';
  };

  const getAssigneeColor = (assigneeId?: string) => {
    if (!assigneeId) return '#718096';
    const assignee = familyMembers.find(member => member.id === assigneeId);
    return assignee?.color || '#718096';
  };

  const isTaskOverdue = (task: Task) => {
    return task.dueDate && 
           task.status !== 'completed' && 
           isPast(parseISO(task.dueDate));
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div className="page-title">
          <CheckSquare size={32} />
          <h1>Takenlijst</h1>
        </div>
        
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={20} />
            Taak toevoegen
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <CheckSquare size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Totaal taken</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.pending}</span>
            <span className="stat-label">Te doen</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon in-progress">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.inProgress}</span>
            <span className="stat-label">Bezig</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <CheckSquare size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Voltooid</span>
          </div>
        </div>

        {stats.overdue > 0 && (
          <div className="stat-card">
            <div className="stat-icon overdue">
              <AlertCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.overdue}</span>
              <span className="stat-label">Verlopen</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Zoek taken..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Alle statussen</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Alle prioriteiten</option>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Alle personen</option>
            <option value="">Niet toegewezen</option>
            {familyMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <CheckSquare size={64} />
            <h2>Geen taken gevonden</h2>
            <p>
              {tasks.length === 0 
                ? 'Voeg je eerste taak toe om te beginnen'
                : 'Pas je filters aan om taken te zien'
              }
            </p>
            <button 
              className="add-button"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus size={20} />
              {tasks.length === 0 ? 'Eerste taak toevoegen' : 'Taak toevoegen'}
            </button>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map(task => {
              const isOverdue = isTaskOverdue(task);
              const assignee = familyMembers.find(member => member.id === task.assignedTo);

              return (
                <div 
                  key={task.id} 
                  className={`task-card ${task.status} ${isOverdue ? 'overdue' : ''}`}
                >
                  <div className="task-header">
                    <div className="task-priority">
                      <div 
                        className="priority-indicator"
                        style={{ backgroundColor: priorityColors[task.priority] }}
                        title={`Prioriteit: ${priorityLabels[task.priority]}`}
                      />
                      <span className="task-category">{task.category}</span>
                    </div>
                    
                    <div className="task-actions">
                      <button 
                        className="action-button edit"
                        onClick={() => handleEdit(task)}
                        aria-label="Bewerken"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={() => handleDelete(task.id)}
                        aria-label="Verwijderen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="task-content">
                    <h3>{task.title}</h3>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                  </div>

                  <div className="task-details">
                    {task.dueDate && (
                      <div className={`task-detail ${isOverdue ? 'overdue' : ''}`}>
                        <Calendar size={16} />
                        <span>
                          {format(parseISO(task.dueDate), 'dd MMM yyyy', { locale: nl })}
                          {isOverdue && ' (verlopen)'}
                        </span>
                      </div>
                    )}
                    
                    {task.assignedTo && assignee && (
                      <div className="task-detail">
                        <User size={16} />
                        <span 
                          className="assignee"
                          style={{ 
                            backgroundColor: `${assignee.color}20`, 
                            color: assignee.color 
                          }}
                        >
                          {assignee.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="task-footer">
                    <div className="status-controls">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                        className={`status-select ${task.status}`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="task-meta">
                      <span className="created-date">
                        Aangemaakt: {format(parseISO(task.createdDate), 'dd MMM', { locale: nl })}
                      </span>
                    </div>
                  </div>
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
              <h2>{editingTask ? 'Taak bewerken' : 'Taak toevoegen'}</h2>
              <button className="close-button" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Titel *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Wat moet er gedaan worden?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Beschrijving</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Extra details over de taak..."
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Categorie *</label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Prioriteit *</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    required
                  >
                    {Object.entries(priorityLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="assignedTo">Toegewezen aan</label>
                  <select
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  >
                    <option value="">Niet toegewezen</option>
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="dueDate">Deadline</label>
                  <input
                    type="date"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    min={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={closeModal}>
                  Annuleren
                </button>
                <button type="submit" className="save-button">
                  {editingTask ? 'Opslaan' : 'Toevoegen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
