import React from 'react';
import { Sparkles, Archive, ArchiveRestore, Share2, Trash2, MoreHorizontal, Link2 } from 'lucide-react';
import { Note } from '../../types';
import { formatDate, getTagColor, truncate, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onClick: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onToggleShare: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note, isSelected, onClick, onDelete, onArchive, onToggleShare,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const copyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (note.shareId) {
      navigator.clipboard.writeText(`${window.location.origin}/shared/${note.shareId}`);
      toast.success('Share link copied!');
    }
  };

  const preview = note.content
    ? truncate(note.content.replace(/\n/g, ' '), 100)
    : 'No content yet...';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border p-4 cursor-pointer transition-all duration-150 animate-in',
        isSelected
          ? 'border-brand-400 bg-brand-50 dark:bg-brand-950/30 dark:border-brand-600'
          : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--border-strong)] hover:shadow-sm'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-medium text-[var(--text)] text-sm leading-snug line-clamp-1 flex-1">
          {note.title || 'Untitled Note'}
        </h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          {note.aiSummary && (
            <span title="Has AI summary" className="text-brand-500">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          )}
          {note.isPublic && (
            <button onClick={copyShareLink} title="Copy share link" className="text-green-500 hover:text-green-600">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--text-subtle)] hover:text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-all"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 z-20 card shadow-lg min-w-[160px] py-1 animate-in">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleShare(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {note.isPublic ? 'Make private' : 'Share publicly'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onArchive(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)]"
                >
                  {note.isArchived ? <ArchiveRestore className="w-3.5 h-3.5" /> : <Archive className="w-3.5 h-3.5" />}
                  {note.isArchived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview */}
      <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3 line-clamp-2">
        {preview}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {note.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={cn('badge text-xs', getTagColor(tag))}>
              {tag}
            </span>
          ))}
          {note.tags.length > 3 && (
            <span className="badge-default text-xs">+{note.tags.length - 3}</span>
          )}
        </div>
        <span className="text-xs text-[var(--text-subtle)] flex-shrink-0">
          {formatDate(note.updatedAt)}
        </span>
      </div>
    </div>
  );
};
