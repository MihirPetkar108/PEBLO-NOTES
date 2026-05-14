import { Response } from 'express';
import { nanoid } from 'nanoid';
import { Note } from '../models/Note';
import { AuthRequest } from '../types';
import { generateAISummary } from '../services/ai.service';

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { search, tags, category, archived, sort = '-updatedAt', page = '1', limit = '20' } = req.query;

    const query: Record<string, unknown> = { userId, isArchived: archived === 'true' ? true : false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tags) {
      const tagArray = String(tags).split(',').map((t) => t.trim());
      query.tags = { $in: tagArray };
    }

    if (category) {
      query.category = category;
    }

    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const skip = (pageNum - 1) * limitNum;

    const [notes, total] = await Promise.all([
      Note.find(query).sort(String(sort)).skip(skip).limit(limitNum).lean(),
      Note.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: notes,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notes';
    res.status(500).json({ success: false, message });
  }
};

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { title, content, tags, category } = req.body;

    const note = await Note.create({
      userId,
      title: title || 'Untitled Note',
      content: content || '',
      tags: tags || [],
      category: category || 'General',
    });

    res.status(201).json({ success: true, data: note });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create note';
    res.status(500).json({ success: false, message });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    res.status(200).json({ success: true, data: note });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update note';
    res.status(500).json({ success: false, message });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete note';
    res.status(500).json({ success: false, message });
  }
};

export const generateSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    if (!process.env.OPENAI_API_KEY) {
      res.status(503).json({ success: false, message: 'AI service not configured. Please set OPENAI_API_KEY.' });
      return;
    }

    const result = await generateAISummary(note.title, note.content);

    note.aiSummary = result.summary;
    note.aiActionItems = result.actionItems;
    note.aiSuggestedTitle = result.suggestedTitle;
    note.aiUsageCount = (note.aiUsageCount || 0) + 1;
    await note.save();

    res.status(200).json({
      success: true,
      data: {
        summary: result.summary,
        actionItems: result.actionItems,
        suggestedTitle: result.suggestedTitle,
        note,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AI generation failed';
    res.status(500).json({ success: false, message });
  }
};

export const toggleShare = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const note = await Note.findOne({ _id: id, userId });

    if (!note) {
      res.status(404).json({ success: false, message: 'Note not found' });
      return;
    }

    if (note.isPublic) {
      note.isPublic = false;
      note.shareId = undefined;
    } else {
      note.isPublic = true;
      note.shareId = nanoid(10);
    }

    await note.save();

    res.status(200).json({
      success: true,
      data: {
        isPublic: note.isPublic,
        shareId: note.shareId,
        shareUrl: note.shareId ? `/shared/${note.shareId}` : null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to toggle share';
    res.status(500).json({ success: false, message });
  }
};

export const getSharedNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shareId } = req.params;

    const note = await Note.findOne({ shareId, isPublic: true }).populate('userId', 'name').lean();

    if (!note) {
      res.status(404).json({ success: false, message: 'Shared note not found or no longer public' });
      return;
    }

    res.status(200).json({ success: true, data: note });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch shared note';
    res.status(500).json({ success: false, message });
  }
};

export const getInsights = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalNotes,
      archivedNotes,
      recentNotes,
      weeklyActivity,
      tagAggregation,
      aiUsageTotal,
    ] = await Promise.all([
      Note.countDocuments({ userId, isArchived: false }),
      Note.countDocuments({ userId, isArchived: true }),
      Note.find({ userId, isArchived: false })
        .sort('-updatedAt')
        .limit(5)
        .select('title updatedAt tags')
        .lean(),
      Note.countDocuments({ userId, createdAt: { $gte: sevenDaysAgo } }),
      Note.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), isArchived: false } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Note.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
        { $group: { _id: null, total: { $sum: '$aiUsageCount' } } },
      ]),
    ]);

    // Daily activity for past 7 days
    const dailyActivityRaw = await Note.aggregate([
      {
        $match: {
          userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const found = dailyActivityRaw.find((d) => d._id === dateStr);
      return { date: dateStr, count: found ? found.count : 0 };
    });

    res.status(200).json({
      success: true,
      data: {
        totalNotes,
        archivedNotes,
        recentNotes,
        weeklyActivity,
        dailyActivity,
        topTags: tagAggregation.map((t) => ({ tag: t._id, count: t.count })),
        aiUsageTotal: aiUsageTotal[0]?.total || 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch insights';
    res.status(500).json({ success: false, message });
  }
};
