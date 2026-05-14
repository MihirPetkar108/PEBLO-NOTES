import React, { useState } from "react";
import { Search, Filter, X, SlidersHorizontal, FileText } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { NoteCard } from "../components/notes/NoteCard";
import { NoteEditor } from "../components/notes/NoteEditor";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import {
    useNotes,
    useCreateNote,
    useUpdateNote,
    useDeleteNote,
    useToggleShare,
} from "../hooks/useNotes";
import { Note } from "../types";
import { cn } from "../lib/utils";

interface NotesPageProps {
    archived?: boolean;
}

const DEFAULT_CATEGORIES = [
    "All",
    "General",
    "Work",
    "Personal",
    "Study",
    "Ideas",
];

export const NotesPage: React.FC<NotesPageProps> = ({ archived = false }) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [category, setCategory] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [mobileView, setMobileView] = useState<"list" | "editor">("list");
    const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);

    const filters = {
        search: search || undefined,
        tags: selectedTags.length ? selectedTags.join(",") : undefined,
        category: category !== "All" && category ? category : undefined,
        archived,
    };

    const { data, isLoading } = useNotes(filters);
    const createNote = useCreateNote();
    const updateNote = useUpdateNote();
    const deleteNote = useDeleteNote();
    const toggleShare = useToggleShare();

    const notes = data?.data || [];

    // Collect all tags and categories from notes
    const allTags = [...new Set(notes.flatMap((n) => n.tags))].slice(0, 15);
    const dynamicCategories = [
        ...new Set(notes.map((n) => n.category).filter(Boolean)),
    ];
    const allCategories = [
        ...new Set([...DEFAULT_CATEGORIES, ...dynamicCategories]),
    ];

    const handleNewNote = async () => {
        const note = await createNote.mutateAsync({
            title: "Untitled Note",
            content: "",
            tags: [],
            category: "General",
        });
        setSelectedNote(note);
        setMobileView("editor");
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
        setMobileView("editor");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
    };

    const handleDeleteRequest = (note: Note) => {
        setNoteToDelete(note);
    };

    const handleConfirmDelete = async () => {
        if (!noteToDelete) return;
        await deleteNote.mutateAsync(noteToDelete._id);
        if (selectedNote?._id === noteToDelete._id) {
            setSelectedNote(null);
            setMobileView("list");
        }
        setNoteToDelete(null);
    };

    const handleArchive = async (note: Note) => {
        await updateNote.mutateAsync({
            id: note._id,
            data: { isArchived: !note.isArchived },
        });
        if (selectedNote?._id === note._id) {
            setSelectedNote(null);
            setMobileView("list");
        }
    };

    // Get fresh note from list
    const freshSelected = selectedNote
        ? notes.find((n) => n._id === selectedNote._id) || selectedNote
        : null;

    return (
        <Layout onNewNote={handleNewNote}>
            <div className="flex h-full">
                {/* Notes list */}
                <div
                    className={cn(
                        "flex flex-col border-r border-[var(--border)] bg-[var(--bg)]",
                        "md:w-80 lg:w-96 flex-shrink-0",
                        mobileView === "editor"
                            ? "hidden md:flex"
                            : "flex w-full",
                    )}
                >
                    {/* Header */}
                    <div className="px-4 py-4 border-b border-[var(--border)]">
                        <div className="flex items-center justify-between mb-3">
                            <h1 className="font-semibold text-[var(--text)]">
                                {archived ? "Archive" : "Notes"}
                                <span className="ml-2 text-xs text-[var(--text-subtle)] font-normal">
                                    {data?.pagination?.total ?? 0}
                                </span>
                            </h1>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "btn-ghost h-8 w-8 p-0",
                                    showFilters && "bg-[var(--bg-subtle)]",
                                )}
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                            <input
                                className="input pl-9 pr-8 text-sm h-9"
                                placeholder="Search notes..."
                                value={searchInput}
                                onChange={(e) => {
                                    setSearchInput(e.target.value);
                                    if (!e.target.value) setSearch("");
                                }}
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput("");
                                        setSearch("");
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        {/* Filters */}
                        {showFilters && (
                            <div className="mt-3 space-y-2 animate-in">
                                {/* Category */}
                                <div className="flex gap-1 flex-wrap">
                                    {allCategories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() =>
                                                setCategory(
                                                    cat === "All" ? "" : cat,
                                                )
                                            }
                                            className={cn(
                                                "badge text-xs cursor-pointer transition-all",
                                                (cat === "All" && !category) ||
                                                    category === cat
                                                    ? "badge-brand"
                                                    : "badge-default hover:bg-[var(--border)]",
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>

                                {/* Tags */}
                                {allTags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                        {allTags.map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() =>
                                                    setSelectedTags((prev) =>
                                                        prev.includes(tag)
                                                            ? prev.filter(
                                                                  (t) =>
                                                                      t !== tag,
                                                              )
                                                            : [...prev, tag],
                                                    )
                                                }
                                                className={cn(
                                                    "badge text-xs cursor-pointer",
                                                    selectedTags.includes(tag)
                                                        ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300"
                                                        : "badge-default",
                                                )}
                                            >
                                                <Filter className="w-2.5 h-2.5 inline mr-0.5" />
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Notes list */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="skeleton h-28 rounded-xl"
                                />
                            ))
                        ) : notes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-center">
                                <FileText className="w-10 h-10 text-[var(--text-subtle)] mb-3" />
                                <p className="text-sm text-[var(--text-muted)] font-medium">
                                    {archived
                                        ? "No archived notes"
                                        : search
                                          ? "No notes found"
                                          : "No notes yet"}
                                </p>
                                {!archived && !search && (
                                    <p className="text-xs text-[var(--text-subtle)] mt-1">
                                        Create your first note to get started
                                    </p>
                                )}
                            </div>
                        ) : (
                            notes.map((note) => (
                                <NoteCard
                                    key={note._id}
                                    note={note}
                                    isSelected={freshSelected?._id === note._id}
                                    onClick={() => handleSelectNote(note)}
                                    onDelete={() => handleDeleteRequest(note)}
                                    onArchive={() => handleArchive(note)}
                                    onToggleShare={() =>
                                        toggleShare.mutateAsync(note._id)
                                    }
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Editor panel */}
                <div
                    className={cn(
                        "flex-1 min-w-0",
                        mobileView === "list"
                            ? "hidden md:flex md:flex-col"
                            : "flex flex-col",
                    )}
                >
                    {freshSelected ? (
                        <>
                            {/* Mobile back button */}
                            <button
                                onClick={() => setMobileView("list")}
                                className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-[var(--border)] text-sm text-[var(--text-muted)] bg-[var(--bg-card)]"
                            >
                                ← Back to notes
                            </button>
                            <NoteEditor
                                key={freshSelected._id}
                                note={freshSelected}
                                onClose={() => {
                                    setSelectedNote(null);
                                    setMobileView("list");
                                }}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center px-8">
                            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-[var(--text-subtle)]" />
                            </div>
                            <h3 className="font-semibold text-[var(--text)] mb-1">
                                Select a note
                            </h3>
                            <p className="text-sm text-[var(--text-muted)]">
                                Choose a note from the list or create a new one
                            </p>
                            <button
                                onClick={handleNewNote}
                                className="btn-primary mt-4 text-sm"
                            >
                                Create new note
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <ConfirmDialog
                open={!!noteToDelete}
                title="Delete note?"
                description={`This will permanently delete "${noteToDelete?.title?.trim() || "Untitled Note"}". This action cannot be undone.`}
                confirmText="Delete note"
                loadingText="Deleting..."
                isLoading={deleteNote.isPending}
                onConfirm={handleConfirmDelete}
                onCancel={() => setNoteToDelete(null)}
            />
        </Layout>
    );
};
