import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles, Save, Archive, ArchiveRestore, Trash2, Share2, Link2,
  Tag, X, ChevronDown, CheckCircle2, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Note } from '../../types';
import { useUpdateNote, useDeleteNote, useGenerateSummary, useToggleShare } from '../../hooks/useNotes';
import { formatDate, getTagColor, cn } from '../../lib/utils';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface NoteEditorProps {
  note: Note;
  onClose?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ note, onClose }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [category, setCategory] = useState(note.category);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showAI, setShowAI] = useState(!!note.aiSummary);
  const [showMeta, setShowMeta] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirty = useRef(false);

  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const generateSummary = useGenerateSummary();
  const toggleShare = useToggleShare();

  // Sync when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setCategory(note.category);
    setShowAI(!!note.aiSummary);
    setShowDeleteConfirm(false);
    isDirty.current = false;
  }, [note._id]);

  const save = useCallback(async (data: Partial<Note>) => {
    setIsSaving(true);
    try {
      await updateNote.mutateAsync({ id: note._id, data });
    } finally {
      setIsSaving(false);
    }
  }, [note._id]);

  // Auto-save
  useEffect(() => {
    if (!isDirty.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      save({ title, content, tags, category });
    }, 1000);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, tags, category]);

  const handleChange = (field: 'title' | 'content' | 'tags' | 'category', value: string | string[]) => {
    isDirty.current = true;
    if (field === 'title') setTitle(value as string);
    if (field === 'content') setContent(value as string);
    if (field === 'tags') setTags(value as string[]);
    if (field === 'category') setCategory(value as string);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      handleChange('tags', [...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', tags.filter((t) => t !== tag));
  };

  const handleDelete = async () => {
    await deleteNote.mutateAsync(note._id);
    setShowDeleteConfirm(false);
    onClose?.();
  };

  const handleArchive = async () => {
    await save({ isArchived: !note.isArchived });
    toast.success(note.isArchived ? 'Note unarchived' : 'Note archived');
  };

  const handleToggleShare = async () => {
    const result = await toggleShare.mutateAsync(note._id);
    if (result.isPublic && result.shareId) {
      navigator.clipboard.writeText(`${window.location.origin}/shared/${result.shareId}`);
      toast.success('Share link copied to clipboard!');
    } else {
      toast.success('Note is now private');
    }
  };

  const handleGenerateAI = async () => {
    if (!content.trim() && !title.trim()) {
      toast.error('Add some content first');
      return;
    }
    // Save current state first
    await save({ title, content, tags, category });
    await generateSummary.mutateAsync(note._id);
    setShowAI(true);
  };

  const isGenerating = generateSummary.isPending;

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] animate-in">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-subtle)]">
          {isSaving ? (
            <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</>
          ) : (
            <><CheckCircle2 className="w-3 h-3 text-green-500" /> Saved</>
          )}
        </div>
        <div className="flex-1" />

        <button
          onClick={handleGenerateAI}
          disabled={isGenerating}
          className="btn-secondary text-xs h-8 gap-1.5"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          )}
          {isGenerating ? 'Generating...' : 'AI Summary'}
        </button>

        <button
          onClick={handleToggleShare}
          className={cn('btn-secondary text-xs h-8 gap-1.5', note.isPublic && 'text-green-600 border-green-300 dark:border-green-800')}
        >
          {note.isPublic ? <Link2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          {note.isPublic ? 'Shared' : 'Share'}
        </button>

        <button onClick={handleArchive} className="btn-ghost text-xs h-8">
          {note.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="btn-ghost text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => { if (isDirty.current) save({ title, content, tags, category }); }}
          className="btn-ghost text-xs h-8"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Title */}
          <input
            className="w-full text-2xl font-bold text-[var(--text)] bg-transparent outline-none border-none placeholder-[var(--text-subtle)] mb-4"
            value={title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Note title..."
          />

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-4 text-xs text-[var(--text-subtle)]">
            <span>Updated {formatDate(note.updatedAt)}</span>
            {note.aiUsageCount > 0 && (
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-400" />
                AI used {note.aiUsageCount}x
              </span>
            )}
            <button
              onClick={() => setShowMeta(!showMeta)}
              className="flex items-center gap-1 hover:text-[var(--text-muted)] ml-auto"
            >
              <Tag className="w-3 h-3" />
              Tags & Category
              <ChevronDown className={cn('w-3 h-3 transition-transform', showMeta && 'rotate-180')} />
            </button>
          </div>

          {/* Tags & Category */}
          {showMeta && (
            <div className="card p-4 mb-5 space-y-3 animate-in">
              <div>
                <label className="label text-xs">Category</label>
                <input
                  className="input text-sm"
                  value={category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="e.g. Work, Personal..."
                />
              </div>
              <div>
                <label className="label text-xs">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag) => (
                    <span key={tag} className={cn('badge text-xs flex items-center gap-1', getTagColor(tag))}>
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:opacity-70">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input text-sm flex-1"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag, press Enter..."
                  />
                  <button onClick={addTag} className="btn-secondary text-xs px-3">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* AI Results */}
          {showAI && note.aiSummary && (
            <div className="card p-4 mb-5 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20 animate-in">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">AI Insights</span>
                <button onClick={() => setShowAI(false)} className="ml-auto text-[var(--text-subtle)] hover:text-[var(--text-muted)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-sm text-[var(--text)] leading-relaxed mb-3">{note.aiSummary}</p>
              {note.aiActionItems && note.aiActionItems.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Action Items</div>
                  <ul className="space-y-1">
                    {note.aiActionItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {note.aiSuggestedTitle && note.aiSuggestedTitle !== note.title && (
                <button
                  onClick={() => handleChange('title', note.aiSuggestedTitle!)}
                  className="mt-3 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Suggested title: "{note.aiSuggestedTitle}" — Apply
                </button>
              )}
            </div>
          )}

          {/* Content editor */}
          <textarea
            className="note-editor"
            value={content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Start writing your note... (auto-saves as you type)"
          />
        </div>
      </div>
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete note?"
        description={`This will permanently delete "${title.trim() || 'Untitled Note'}". This action cannot be undone.`}
        confirmText="Delete note"
        loadingText="Deleting..."
        isLoading={deleteNote.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};
