"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NoteForm from "@/components/NoteForm";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import Header from "@/components/Header";
import { getNoteById, updateNote, deleteNote } from "@/lib/actions";
import { Note } from "@/types";

export default function NoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch note data on mount
  useEffect(() => {
    const fetchNote = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getNoteById(params.id);

        if (result.success) {
          setNote(result.data);
        } else {
          // Handle error (unauthorized or not found)
          setError(result.error || "Failed to load note");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error("Error fetching note:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [params.id]);

  const handleSubmit = async (title: string, content: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await updateNote(params.id, { title, content });

      if (result.success) {
        // Update local state with new data
        setNote(result.data);
        // Optionally redirect to dashboard or show success message
        router.push("/");
      } else {
        // Display error message
        setError(result.error || "Failed to update note");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error updating note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteNote(params.id);

      if (result.success) {
        // Redirect to dashboard after successful deletion
        router.push("/");
      } else {
        // Display error message
        setError(result.error || "Failed to delete note");
        setShowDeleteDialog(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error deleting note:", err);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state (unauthorized or not found)
  if (error && !note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <svg
                  className="w-6 h-6 text-red-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-lg font-medium text-red-800">
                    Error loading note
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Note</h1>
            <button
              onClick={handleDeleteClick}
              disabled={isSubmitting || isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Delete Note
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            {note && (
              <NoteForm
                initialData={note}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </div>
      </main>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  );
}
