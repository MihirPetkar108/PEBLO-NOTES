import mongoose, { Schema, Document } from 'mongoose';
import { INote } from '../types';

export interface NoteDocument extends INote, Document {}

const NoteSchema = new Schema<NoteDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
      default: 'Untitled Note',
    },
    content: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    shareId: {
      type: String,
      unique: true,
      sparse: true,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    aiActionItems: {
      type: [String],
      default: [],
    },
    aiSuggestedTitle: {
      type: String,
      default: null,
    },
    aiUsageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, tags: 1 });
NoteSchema.index({ shareId: 1 });
NoteSchema.index({ userId: 1, title: 'text', content: 'text' });

export const Note = mongoose.model<NoteDocument>('Note', NoteSchema);
