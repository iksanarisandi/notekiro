import { Note } from '@/types';

// D1 Database type from Cloudflare Workers
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta: {
    duration: number;
    rows_read: number;
    rows_written: number;
  };
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

// Database row type (matches SQL schema)
export interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: number;
  updated_at: number;
}

// Helper function to convert database row to Note model
export function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Get D1 database instance from environment
export function getDatabase(): D1Database {
  // In Cloudflare Pages, the DB binding is available via process.env
  // This will be properly typed when running on Cloudflare
  const db = (process.env as any).DB as D1Database;
  
  if (!db) {
    throw new Error('D1 database binding not found. Make sure DB is configured in wrangler.toml');
  }
  
  return db;
}
