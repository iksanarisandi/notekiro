# Design Document - Simple Note App

## Overview

Aplikasi note sederhana ini dibangun menggunakan Next.js 14+ dengan App Router, Clerk untuk autentikasi, dan Cloudflare D1 (SQLite) untuk database. Aplikasi akan di-deploy ke Cloudflare Pages dengan edge runtime untuk performa optimal.

## Architecture

### Tech Stack
- **Frontend Framework**: Next.js 14+ (App Router)
- **Authentication**: Clerk
- **Database**: Cloudflare D1 (SQLite)
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **Runtime**: Cloudflare Workers (Edge Runtime)

### High-Level Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   Clerk Auth        │
│   (Authentication)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Next.js App       │
│   (Cloudflare Pages)│
│   - Pages/Routes    │
│   - Server Actions  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Cloudflare D1     │
│   (SQLite Database) │
└─────────────────────┘
```

## Components and Interfaces

### 1. Authentication Layer (Clerk)

**Clerk Configuration**:
- Middleware untuk proteksi route
- Sign-in dan sign-up components
- User session management

**Protected Routes**:
- `/` - Dashboard/Note list (requires auth)
- `/notes/[id]` - Note detail (requires auth)
- `/notes/new` - Create note (requires auth)

**Public Routes**:
- `/sign-in` - Login page
- `/sign-up` - Register page

### 2. Database Schema (Cloudflare D1)

**Table: notes**
```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
```

### 3. Page Components

**a. Dashboard/Note List Page (`/`)**
- Menampilkan daftar note user
- Tombol "Create New Note"
- Tombol logout
- Card untuk setiap note dengan preview

**b. Note Detail/Edit Page (`/notes/[id]`)**
- Form untuk edit judul dan konten
- Tombol save dan delete
- Tombol back ke dashboard

**c. Create Note Page (`/notes/new`)**
- Form untuk input judul dan konten baru
- Tombol save dan cancel

### 4. Server Actions

**a. `createNote(formData)`**
- Input: title, content
- Validasi input
- Ambil userId dari Clerk
- Insert ke D1 database
- Return note baru atau error

**b. `getNotes()`**
- Ambil userId dari Clerk
- Query semua note user dari D1
- Return array of notes

**c. `getNoteById(id)`**
- Input: note id
- Ambil userId dari Clerk
- Query note dengan validasi ownership
- Return note atau error

**d. `updateNote(id, formData)`**
- Input: note id, title, content
- Validasi ownership
- Update note di D1
- Return updated note atau error

**e. `deleteNote(id)`**
- Input: note id
- Validasi ownership
- Delete note dari D1
- Return success atau error

### 5. UI Components

**a. NoteCard**
- Props: note (id, title, content, createdAt)
- Menampilkan preview note
- Link ke detail page

**b. NoteForm**
- Props: initialData (optional), onSubmit, onCancel
- Form dengan title dan content textarea
- Validasi client-side

**c. DeleteConfirmDialog**
- Props: isOpen, onConfirm, onCancel
- Modal konfirmasi hapus

**d. Header**
- User info dari Clerk
- Logout button

## Data Models

### Note Model (TypeScript)
```typescript
interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface CreateNoteInput {
  title: string;
  content: string;
}

interface UpdateNoteInput {
  title: string;
  content: string;
}
```

## Error Handling

### Client-Side Errors
- Form validation errors ditampilkan inline
- Network errors ditampilkan dengan toast/alert
- Unauthorized access redirect ke login

### Server-Side Errors
- Database errors: log dan return generic error message
- Authentication errors: return 401 dan redirect
- Authorization errors: return 403
- Validation errors: return 400 dengan detail

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: string;
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}
```

## Testing Strategy

### Unit Tests
- Server actions validation logic
- Utility functions

### Integration Tests
- Server actions dengan mock D1 database
- Authentication flow dengan mock Clerk

### E2E Tests (Optional)
- Complete user flow: login → create note → edit → delete
- Menggunakan Playwright atau Cypress

## Cloudflare Deployment Configuration

### wrangler.toml
```toml
name = "simple-note-app"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "notes-db"
database_id = "<database-id>"
```

### next.config.js
```javascript
module.exports = {
  experimental: {
    runtime: 'edge',
  },
}
```

### Environment Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/`

## Security Considerations

1. **Authentication**: Semua route kecuali sign-in/sign-up dilindungi Clerk middleware
2. **Authorization**: Setiap operasi CRUD validasi userId matches note owner
3. **Input Validation**: Validasi di client dan server side
4. **SQL Injection**: Menggunakan prepared statements D1
5. **XSS Protection**: Next.js auto-escaping, sanitize user input

## Performance Optimization

1. **Edge Runtime**: Deploy ke Cloudflare edge untuk latency rendah
2. **Database Indexing**: Index pada user_id dan created_at
3. **Caching**: Leverage Cloudflare cache untuk static assets
4. **Code Splitting**: Next.js automatic code splitting
5. **Lazy Loading**: Load components on demand
