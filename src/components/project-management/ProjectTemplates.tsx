import React, { useState } from 'react';
import {
  Search,
  Filter,
  Star,
  Copy,
  Edit,
  Trash2,
  Plus,
  Clock,
  Users,
  Target,
  Zap,
  Palette,
  Code,
  BarChart3,
  Briefcase
} from 'lucide-react';
import { useProjectTemplates, ProjectTemplate } from '../../hooks/project-management/useProjectTemplates';
import './project-templates.css';

interface ProjectTemplatesProps {
  workspaceId: string;
  onCreateProject?: (templateId: string) => void;
  className?: string;
}

export function ProjectTemplates({ workspaceId, onCreateProject, className = '' }: ProjectTemplatesProps) {
  const {
    templates,
    featuredTemplates,
    myTemplates,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredTemplates,
    createProjectFromTemplate,
    duplicateTemplate,
    rateTemplate,
    favoriteTemplate,
    getTemplateAnalytics
  } = useProjectTemplates();

  const [viewMode, setViewMode] = useState<'all' | 'featured' | 'mine'>('featured');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const categories = [
    { key: 'software', label: 'Software', icon: Code },
    { key: 'marketing', label: 'Marketing', icon: BarChart3 },
    { key: 'design', label: 'Design', icon: Palette },
    { key: 'research', label: 'Research', icon: Target },
    { key: 'general', label: 'General', icon: Briefcase }
  ];

  const getCurrentTemplates = () => {
    switch (viewMode) {
      case 'featured':
        return featuredTemplates.filter(t => 
          !selectedCategory || t.category === selectedCategory
        ).filter(t =>
          searchQuery === '' || 
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      case 'mine':
        return myTemplates.filter(t => 
          !selectedCategory || t.category === selectedCategory
        ).filter(t =>
          searchQuery === '' || 
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        return filteredTemplates;
    }
  };

  const handleCreateProject = async (template: ProjectTemplate) => {
    try {
      const projectId = await createProjectFromTemplate({
        templateId: template.id,
        name: `${template.name} Project`,
        workspaceId,
        startDate: new Date().toISOString(),
        teamMembers: [],
        customizations: {}
      });
      
      onCreateProject?.(projectId);
    } catch (err) {
      console.error('Failed to create project from template:', err);
    }
  };

  if (isLoading) {
    return (
      <div className={`templates-loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`templates-error ${className}`}>
        <Target className="error-icon" />
        <h3>Failed to load templates</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`project-templates ${className}`}>
      {/* Header */}
      <div className="templates-header">
        <div className="header-info">
          <h1 className="templates-title">Project Templates</h1>
          <p className="templates-subtitle">
            Start your project with proven templates and best practices
          </p>
        </div>
        
        <button 
          className="create-template-btn"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus size={20} />
          Create Template
        </button>
      </div>

      {/* Filters and Search */}
      <div className="templates-controls">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            aria-label="Search templates"
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="view-tabs">
          <button
            className={`tab ${viewMode === 'featured' ? 'active' : ''}`}
            onClick={() => setViewMode('featured')}
          >
            <Star size={16} />
            Featured
          </button>
          <button
            className={`tab ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            All Templates
          </button>
          <button
            className={`tab ${viewMode === 'mine' ? 'active' : ''}`}
            onClick={() => setViewMode('mine')}
          >
            My Templates
          </button>
        </div>

        <div className="category-filters">
          <button
            className={`category-filter ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.key}
              className={`category-filter ${selectedCategory === category.key ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.key)}
            >
              <category.icon size={16} />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="templates-grid">
        {getCurrentTemplates().map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={() => handleCreateProject(template)}
            onDuplicate={() => duplicateTemplate(template.id, `${template.name} Copy`)}
            onRate={(rating) => rateTemplate(template.id, rating)}
            onFavorite={() => favoriteTemplate(template.id)}
            analytics={getTemplateAnalytics(template.id)}
          />
        ))}
      </div>

      {getCurrentTemplates().length === 0 && (
        <div className="empty-state">
          <Target className="empty-icon" />
          <h3>No templates found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUse={() => handleCreateProject(selectedTemplate)}
        />
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: ProjectTemplate;
  onUse: () => void;
  onDuplicate: () => void;
  onRate: (rating: number) => void;
  onFavorite: () => void;
  analytics: {
    usageCount: number;
    averageRating: number;
    successRate: number;
    averageCompletionTime: number;
  };
}

function TemplateCard({ template, onUse, onDuplicate, onRate, onFavorite, analytics }: TemplateCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'software': return Code;
      case 'marketing': return BarChart3;
      case 'design': return Palette;
      case 'research': return Target;
      default: return Briefcase;
    }
  };

  const CategoryIcon = getCategoryIcon(template.category);

  return (
    <div 
      className="template-card"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Card Header */}
      <div className="card-header">
        <div className="template-icon" data-color={template.color}>
          <span className="icon-emoji">{template.icon}</span>
        </div>
        <div className="card-actions" data-visible={showActions}>
          <button 
            onClick={onFavorite}
            className="action-btn favorite"
            title="Add to favorites"
            aria-label="Add to favorites"
          >
            <Star size={16} />
          </button>
          <button 
            onClick={onDuplicate}
            className="action-btn duplicate"
            title="Duplicate template"
            aria-label="Duplicate template"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <div className="template-category">
          <CategoryIcon size={14} />
          <span>{template.category}</span>
        </div>
        
        <h3 className="template-name">{template.name}</h3>
        <p className="template-description">{template.description}</p>

        {/* Template Stats */}
        <div className="template-stats">
          <div className="stat">
            <Users size={14} />
            <span>{analytics.usageCount} uses</span>
          </div>
          <div className="stat">
            <Star size={14} />
            <span>{analytics.averageRating.toFixed(1)}</span>
          </div>
          <div className="stat">
            <Clock size={14} />
            <span>{template.structure.phases.length} phases</span>
          </div>
        </div>

        {/* Tags */}
        <div className="template-tags">
          {template.tags.slice(0, 3).map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
          {template.tags.length > 3 && (
            <span className="tag more">+{template.tags.length - 3}</span>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="card-footer">
        <div className="template-metrics">
          <div className="metric">
            <span className="metric-label">Success Rate:</span>
            <span className="metric-value">{(analytics.successRate * 100).toFixed(0)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Avg. Time:</span>
            <span className="metric-value">{analytics.averageCompletionTime}d</span>
          </div>
        </div>
        
        <button 
          className="use-template-btn"
          onClick={onUse}
        >
          <Zap size={16} />
          Use Template
        </button>
      </div>
    </div>
  );
}

interface TemplateDetailModalProps {
  template: ProjectTemplate;
  onClose: () => void;
  onUse: () => void;
}

function TemplateDetailModal({ template, onClose, onUse }: TemplateDetailModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="template-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{template.name}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <div className="modal-content">
          <p className="template-description">{template.description}</p>

          {/* Phases */}
          <div className="template-phases">
            <h3>Project Phases</h3>
            <div className="phases-list">
              {template.structure.phases.map(phase => (
                <div key={phase.id} className="phase-item">
                  <div className="phase-header">
                    <h4>{phase.name}</h4>
                    <span className="phase-duration">{phase.duration} days</span>
                  </div>
                  <p>{phase.description}</p>
                  <div className="phase-tasks">
                    {template.structure.taskTemplates
                      .filter(task => task.phaseId === phase.id)
                      .slice(0, 3)
                      .map(task => (
                        <span key={task.id} className="task-preview">
                          {task.title}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          <div className="template-milestones">
            <h3>Key Milestones</h3>
            <div className="milestones-list">
              {template.structure.milestones.map(milestone => (
                <div key={milestone.id} className="milestone-item">
                  <h4>{milestone.name}</h4>
                  <p>{milestone.description}</p>
                  <span className="milestone-timeline">Day {milestone.dueOffset}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={onUse}>
            <Zap size={16} />
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
}
