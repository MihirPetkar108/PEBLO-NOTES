import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { NoteCard } from '../components/notes/NoteCard';
import { NoteEditor } from '../components/notes/NoteEditor';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useToggleShare } from '../hooks/useNotes';
import { Note } from '../types';
import { cn } from '../lib/utils';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [mobileView, setMobileView] = useState<'search' | 'editor'>('search');

  const { data, isLoading } = useNotes({ search: search || undefined });
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const toggleShare = useToggleShare();

  const notes = data?.data || [];
  const freshSelected = selectedNote ? notes.find((n) => n._id === selectedNote._id) || selectedNote : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(query);
  };

  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    await deleteNote.mutateAsync(noteToDelete._id);
    if (selectedNote?._id === noteToDelete._id) {
      setSelectedNote(null);
      setMobileView('search');
    }
    setNoteToDelete(null);
  };

  return (
    <Layout onNewNote={() => createNote.mutateAsync({})}>
      <div className="flex h-full">
        <div className={cn(
          'flex flex-col border-r border-[var(--border)]',
          'md:w-80 lg:w-96 flex-shrink-0',
          mobileView === 'editor' ? 'hidden md:flex' : 'flex w-full'
        )}>
          <div className="px-4 py-4 border-b border-[var(--border)]">
            <h1 className="font-semibold text-[var(--text)] mb-3">Search</h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  className="input pl-9 pr-8 h-9 text-sm"
                  placeholder="Search notes..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); if (!e.target.value) setSearch(''); }}
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setSearch(''); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button type="submit" className="btn-primary h-9 px-3 text-sm">Search</button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
            {isLoading && search ? (
              [...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)
            ) : !search ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <Search className="w-10 h-10 text-[var(--text-subtle)] mb-3" />
                <p className="text-sm text-[var(--text-muted)]">Type to search your notes</p>
              </div>
            ) : notes.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-[var(--text-muted)]">No results for "{search}"</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-[var(--text-subtle)] px-1">{notes.length} results for "{search}"</p>
                {notes.map((note) => (
                  <NoteCard
                    key={note._id}
                    note={note}
                    isSelected={freshSelected?._id === note._id}
                    onClick={() => { setSelectedNote(note); setMobileView('editor'); }}
                    onDelete={() => setNoteToDelete(note)}
                    onArchive={async () => {
                      await updateNote.mutateAsync({ id: note._id, data: { isArchived: !note.isArchived } });
                    }}
                    onToggleShare={() => toggleShare.mutateAsync(note._id)}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className={cn('flex-1 min-w-0', mobileView === 'search' ? 'hidden md:flex md:flex-col' : 'flex flex-col')}>
          {freshSelected ? (
            <>
              <button onClick={() => setMobileView('search')} className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] text-sm text-[var(--text-muted)] bg-[var(--bg-card)]">
                ← Back to search
              </button>
              <NoteEditor
                key={freshSelected._id}
                note={freshSelected}
                onClose={() => {
                  setSelectedNote(null);
                  setMobileView('search');
                }}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-[var(--text-subtle)]">Select a note to edit</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={!!noteToDelete}
        title="Delete note?"
        description={`This will permanently delete "${noteToDelete?.title?.trim() || 'Untitled Note'}". This action cannot be undone.`}
        confirmText="Delete note"
        loadingText="Deleting..."
        isLoading={deleteNote.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setNoteToDelete(null)}
      />
    </Layout>
  );
};
