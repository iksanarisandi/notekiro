export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateNoteInput {
  title: string;
  content: string;
}

export interface UpdateNoteInput {
  title: string;
  content: string;
}

export type ActionResponse<T> = 
  | { success: true; data: T }
  | { success: false; error: string };
