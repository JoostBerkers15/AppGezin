import React, { useState, useMemo } from 'react';
import { useAppData } from '../hooks/useAppData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Task } from '../types';
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
  Search
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
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
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedto: [] as string[],
    priority: 'medium' as Task['priority'],
    categories: ['Algemeen'] as string[],
    date: ''
  });
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    try { e.dataTransfer?.setData('text/plain', id); } catch {}
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  };

  const reorderTasks = async (draggedId: string, targetId: string) => {
    const base = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(a.createddate).getTime() - new Date(b.createddate).getTime());
    const draggedIndex = base.findIndex(t => t.id === draggedId);
    const targetIndex = base.findIndex(t => t.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const item = base.splice(draggedIndex, 1)[0];
    base.splice(targetIndex, 0, item);

    const updates: Array<Promise<any>> = [];
    base.forEach((t, i) => {
      const newOrder = i + 1;
      if (t.order !== newOrder) updates.push(updateTask(t.id, { order: newOrder }));
    });

    if (updates.length) await Promise.all(updates);
  };

  const onDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const draggedId = draggingId || e.dataTransfer?.getData('text/plain');
    if (!draggedId || draggedId === targetId) {
      setDraggingId(null);
      return;
    }
    await reorderTasks(draggedId, targetId);
    setDraggingId(null);
  };

  const [isCompact, setIsCompact] = useLocalStorage<boolean>('tasks.compactView', false);
  const [isTableCompact, setIsTableCompact] = useLocalStorage<boolean>('tasks.compactTable', false);
  const [sortKey, setSortKey] = useState<'title'|'date'|'assignedto'|'priority'|'status'>('date');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc');

  const changeSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };


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
    'Huis',
    'Hobby',
    'Financiën',
    'School',
    'Werk',
    'Gezondheid',
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
      if (assigneeFilter === '') {
        filtered = filtered.filter(task => !task.assignedto || task.assignedto.length === 0);
      } else {
        filtered = filtered.filter(task => task.assignedto && task.assignedto.includes(assigneeFilter));
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.categories && task.categories.includes(categoryFilter));
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
      
      // Fallback to creation date
      return new Date(b.createddate).getTime() - new Date(a.createddate).getTime();
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter, categoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(task => task.status === 'pending').length;
    const inProgress = tasks.filter(task => task.status === 'in_progress').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [tasks]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const taskData = {
      title: formData.title,
      description: formData.description,
      assignedto: formData.assignedto && formData.assignedto.length ? formData.assignedto : undefined,
      date: formData.date || undefined,
      priority: formData.priority,
      categories: formData.categories && formData.categories.length ? formData.categories : ['Algemeen'],
      status: 'pending' as Task['status']
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
      assignedto: [],
      priority: 'medium',
      categories: ['Algemeen'] as string[],
      date: ''
    });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      assignedto: task.assignedto || [],
      date: task.date || '',
      priority: task.priority,
      categories: task.categories || ['Algemeen']
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

  const getAssigneeNames = (assigneeIds?: string[]) => {
    if (!assigneeIds || assigneeIds.length === 0) return 'Niet toegewezen';
    return assigneeIds.map(id => familyMembers.find(m => m.id === id)?.name || 'Onbekend').join(', ');
  };

  const moveTaskUp = async (task: Task) => {
    const sorted = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(a.createddate).getTime() - new Date(b.createddate).getTime());
    const idx = sorted.findIndex(t => t.id === task.id);
    if (idx > 0) {
      const other = sorted[idx - 1];
      const aOrder = task.order || 0;
      const bOrder = other.order || 0;
      await updateTask(task.id, { order: bOrder });
      await updateTask(other.id, { order: aOrder });
    }
  };

  const moveTaskDown = async (task: Task) => {
    const sorted = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0) || new Date(a.createddate).getTime() - new Date(b.createddate).getTime());
    const idx = sorted.findIndex(t => t.id === task.id);
    if (idx < sorted.length - 1 && idx !== -1) {
      const other = sorted[idx + 1];
      const aOrder = task.order || 0;
      const bOrder = other.order || 0;
      await updateTask(task.id, { order: bOrder });
      await updateTask(other.id, { order: aOrder });
    }
  };

  // sortedTasks depends on filteredTasks and familyMembers — define it after those are available
  const sortedTasks = useMemo(() => {
    const arr = [...filteredTasks];
    const priorityOrder = { high: 0, medium: 1, low: 2 } as any;
    const statusOrder = { pending: 0, in_progress: 1, completed: 2 } as any;

    arr.sort((a, b) => {
      if (sortKey === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortKey === 'date') {
        if (a.date && b.date) {
          const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (diff !== 0) return diff;
        } else if (a.date) {
          return -1;
        } else if (b.date) {
          return 1;
        }
        // if dates are equal or both missing, fall back to priority
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // 'dueDate' (deadline) removed from UI; no sorting by dueDate
      if (sortKey === 'assignedto') {
        const aFirst = a.assignedto && a.assignedto.length ? a.assignedto[0] : undefined;
        const bFirst = b.assignedto && b.assignedto.length ? b.assignedto[0] : undefined;
        const na = (aFirst ? (familyMembers.find(m => m.id === aFirst)?.name || '') : '').toLowerCase();
        const nb = (bFirst ? (familyMembers.find(m => m.id === bFirst)?.name || '') : '').toLowerCase();
        return na.localeCompare(nb);
      }
      if (sortKey === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortKey === 'status') {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      return 0;
    });

    if (sortDir === 'desc') arr.reverse();
    return arr;
  }, [filteredTasks, sortKey, sortDir, familyMembers]);

  // 'dueDate' (deadline) removed from UI; no overdue calculation on frontend

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div className="page-title">
          <CheckSquare size={32} />
          <h1>Takenlijst</h1>
        </div>
        
        <div className="header-actions">
          <button
            className={`compact-toggle ${isCompact ? 'active' : ''}`}
            onClick={() => { setIsCompact(prev => !prev); if (isTableCompact) setIsTableCompact(false); }}
            aria-pressed={isCompact}
            title={isCompact ? 'Compactweergave uit' : 'Compactweergave aan'}
          >
            {isCompact ? 'Compact: aan' : 'Compact: uit'}
          </button>

          <button
            className={`compact-toggle table-toggle ${isTableCompact ? 'active' : ''}`}
            onClick={() => { setIsTableCompact(prev => !prev); if (!isTableCompact) setIsCompact(false); }}
            aria-pressed={isTableCompact}
            title={isTableCompact ? 'Tabelweergave uit' : 'Tabelweergave aan'}
          >
            {isTableCompact ? 'Tabel: aan' : 'Tabel: uit'}
          </button>

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

        {/* deadline/overdue removed from UI */}
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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Alle categorieën</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className={`tasks-list ${isCompact ? 'compact' : ''} ${isTableCompact ? 'table' : ''}`}>
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
          isTableCompact ? (
            <div className="tasks-table-wrap">
              <table className="tasks-table">
                <thead>
                  <tr>
                    <th><button type="button" onClick={() => changeSort('title')}>Titel{sortKey==='title' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th><button type="button" onClick={() => changeSort('date')}>Datum{sortKey==='date' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th><button type="button" onClick={() => changeSort('assignedto')}>Persoon{sortKey==='assignedto' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th><button type="button" onClick={() => changeSort('priority')}>Prioriteit{sortKey==='priority' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th><button type="button" onClick={() => changeSort('status')}>Status{sortKey==='status' ? (sortDir==='asc' ? ' ▲' : ' ▼') : ''}</button></th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {sortedTasks.map(task => {
                    const isOverdue = false; // overdue not used (deadline removed)
                    return (
                      <tr
                        key={task.id}
                        className={`${task.status}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id)}
                        onDragOver={onDragOver}
                        onDrop={(e) => onDrop(e, task.id)}
                      >
                        <td className="td-title">
                          <div className="title-wrap">
                            <span className="title-text">{task.title}</span>
                                <span className="category-text">{(task.categories || []).join(', ')}</span>
                          </div>
                        </td>
                        <td className="td-date">{task.date ? format(parseISO(task.date), 'dd MMM', { locale: nl }) : '-'}</td>
                            <td className="td-assignee">{task.assignedto && task.assignedto.length ? getAssigneeNames(task.assignedto) : '—'}</td>
                        <td className="td-priority">{priorityLabels[task.priority]}</td>
                        <td className="td-status">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                            className={`status-select ${task.status}`}
                          >
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="td-actions">
                          <button className="action-button edit" onClick={() => handleEdit(task)} aria-label="Bewerken"><Edit2 size={14} /></button>
                          <button className="action-button delete" onClick={() => handleDelete(task.id)} aria-label="Verwijderen"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="tasks-grid">
                  {filteredTasks.map(task => {
                  const isOverdue = false;

                  return (
                    <div 
                      key={task.id} 
                      className={`task-card ${task.status}`}
                      draggable
                      onDragStart={(e) => onDragStart(e, task.id)}
                      onDragOver={onDragOver}
                      onDrop={(e) => onDrop(e, task.id)}
                    >
                    <div className="task-header">
                      <div className="task-priority">
                        <div 
                          className="priority-indicator"
                          style={{ backgroundColor: priorityColors[task.priority] }}
                          title={`Prioriteit: ${priorityLabels[task.priority]}`}
                        />
                        <span className="task-category">{(task.categories || []).join(', ')}</span>
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
                      {task.date && (
                        <div className="task-detail">
                          <Calendar size={16} />
                          <span>
                            {format(parseISO(task.date), 'dd MMM yyyy', { locale: nl })}
                          </span>
                        </div>
                      )}
                      
                      {task.assignedto && task.assignedto.length > 0 && (
                        <div className="task-detail">
                          <User size={16} />
                          <span className="assignee-multi">
                            {task.assignedto?.map(id => {
                              const a = familyMembers.find(m => m.id === id);
                              return (
                                <span key={id} className="assignee" style={{ backgroundColor: `${a?.color}20`, color: a?.color }}>{a?.name}</span>
                              );
                            })}
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
                          Aangemaakt: {format(parseISO(task.createddate), 'dd MMM', { locale: nl })}
                        </span>
                      </div>
                    </div>
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
                  <label htmlFor="category">Categorie(s) *</label>
                  <select
                    id="category"
                    multiple
                    value={formData.categories}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                      setFormData({ ...formData, categories: opts });
                    }}
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
                  <label htmlFor="assignedto">Toegewezen aan</label>
                  <select
                    id="assignedto"
                    multiple
                    value={formData.assignedto}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                      setFormData({ ...formData, assignedto: opts });
                    }}
                  >
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Datum (optioneel)</label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
