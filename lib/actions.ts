'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { getDatabase, rowToNote } from './db';
import { CreateNoteInput, UpdateNoteInput, Note, ActionResponse } from '@/types';

/**
 * Create a new note for the authenticated user
 */
export async function createNote(input: CreateNoteInput): Promise<ActionResponse<Note>> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: 'Title is required' };
    }

    if (!input.content || input.content.trim().length === 0) {
      return { success: false, error: 'Content is required' };
    }

    // Generate ID and timestamps
    const id = crypto.randomUUID();
    const now = Date.now();

    // Insert into database
    const db = getDatabase();
    const result = await db
      .prepare(
        'INSERT INTO notes (id, user_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      )
      .bind(id, userId, input.title.trim(), input.content.trim(), now, now)
      .run();

    if (!result.success) {
      return { success: false, error: 'Failed to create note' };
    }

    // Revalidate the notes list page
    revalidatePath('/');

    // Return the created note
    const note: Note = {
      id,
      userId,
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: note };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get all notes for the authenticated user
 */
export async function getNotes(): Promise<ActionResponse<Note[]>> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Query notes from database
    const db = getDatabase();
    const result = await db
      .prepare(
        'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC'
      )
      .bind(userId)
      .all();

    if (!result.success) {
      return { success: false, error: 'Failed to fetch notes' };
    }

    // Convert rows to Note objects
    const notes = (result.results || []).map((row) => rowToNote(row as any));

    return { success: true, data: notes };
  } catch (error) {
    console.error('Error fetching notes:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Get a specific note by ID with ownership validation
 */
export async function getNoteById(id: string): Promise<ActionResponse<Note>> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'Note ID is required' };
    }

    // Query note from database with ownership check
    const db = getDatabase();
    const result = await db
      .prepare(
        'SELECT * FROM notes WHERE id = ? AND user_id = ?'
      )
      .bind(id, userId)
      .first();

    if (!result) {
      return { success: false, error: 'Note not found' };
    }

    // Convert row to Note object
    const note = rowToNote(result as any);

    return { success: true, data: note };
  } catch (error) {
    console.error('Error fetching note:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Update an existing note with ownership validation
 */
export async function updateNote(id: string, input: UpdateNoteInput): Promise<ActionResponse<Note>> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'Note ID is required' };
    }

    if (!input.title || input.title.trim().length === 0) {
      return { success: false, error: 'Title is required' };
    }

    if (!input.content || input.content.trim().length === 0) {
      return { success: false, error: 'Content is required' };
    }

    // Check if note exists and user owns it
    const db = getDatabase();
    const existingNote = await db
      .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first();

    if (!existingNote) {
      return { success: false, error: 'Note not found' };
    }

    // Update note in database
    const now = Date.now();
    const result = await db
      .prepare(
        'UPDATE notes SET title = ?, content = ?, updated_at = ? WHERE id = ? AND user_id = ?'
      )
      .bind(input.title.trim(), input.content.trim(), now, id, userId)
      .run();

    if (!result.success) {
      return { success: false, error: 'Failed to update note' };
    }

    // Revalidate paths
    revalidatePath('/');
    revalidatePath(`/notes/${id}`);

    // Return updated note
    const note: Note = {
      id,
      userId,
      title: input.title.trim(),
      content: input.content.trim(),
      createdAt: (existingNote as any).created_at,
      updatedAt: now,
    };

    return { success: true, data: note };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Delete a note with ownership validation
 */
export async function deleteNote(id: string): Promise<ActionResponse<void>> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Validate input
    if (!id || id.trim().length === 0) {
      return { success: false, error: 'Note ID is required' };
    }

    // Check if note exists and user owns it
    const db = getDatabase();
    const existingNote = await db
      .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .first();

    if (!existingNote) {
      return { success: false, error: 'Note not found' };
    }

    // Delete note from database
    const result = await db
      .prepare('DELETE FROM notes WHERE id = ? AND user_id = ?')
      .bind(id, userId)
      .run();

    if (!result.success) {
      return { success: false, error: 'Failed to delete note' };
    }

    // Revalidate the notes list page
    revalidatePath('/');

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
