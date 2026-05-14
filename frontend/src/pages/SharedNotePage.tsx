import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, Calendar, Tag, User, AlertCircle } from 'lucide-react';
import { useSharedNote } from '../hooks/useNotes';
import { getTagColor, formatDate, cn } from '../lib/utils';

export const SharedNotePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { data: note, isLoading, isError } = useSharedNote(shareId || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !note) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text)] mb-2">Note not found</h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">
            This note may have been made private or deleted.
          </p>
          <Link to="/login" className="btn-primary text-sm">
            Open Peblo Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)]">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">Peblo Notes</span>
          </Link>
          <Link to="/signup" className="btn-primary text-xs h-8">
            Create free account
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-10 animate-in">
        {/* Note meta */}
        <div className="mb-2">
          {note.category && note.category !== 'General' && (
            <span className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              {note.category}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-[var(--text)] mb-4 leading-tight">
          {note.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-[var(--text-muted)]">
          {note.userId && typeof note.userId === 'object' && (
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {(note.userId as { name: string }).name}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(note.updatedAt)}
          </span>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-8">
            <Tag className="w-3.5 h-3.5 text-[var(--text-subtle)]" />
            {note.tags.map((tag) => (
              <span key={tag} className={cn('badge text-xs', getTagColor(tag))}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Summary */}
        {note.aiSummary && (
          <div className="card p-5 mb-8 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">AI Summary</span>
            </div>
            <p className="text-sm text-[var(--text)] leading-relaxed">{note.aiSummary}</p>
            {note.aiActionItems && note.aiActionItems.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Action Items</div>
                <ul className="space-y-1">
                  {note.aiActionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                      <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Note content */}
        <div className="prose prose-sm max-w-none">
          {note.content ? (
            <pre className="whitespace-pre-wrap font-sans text-[var(--text)] leading-relaxed text-[15px]">
              {note.content}
            </pre>
          ) : (
            <p className="text-[var(--text-subtle)] italic">This note has no content.</p>
          )}
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="border-t border-[var(--border)] mt-16">
        <div className="max-w-3xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-[var(--text-muted)] mb-3">
            Made with Peblo Notes — AI-powered note taking workspace
          </p>
          <Link to="/signup" className="btn-primary text-sm">
            Start for free
          </Link>
        </div>
      </footer>
    </div>
  );
};
