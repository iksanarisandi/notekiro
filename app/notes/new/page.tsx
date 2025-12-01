"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NoteForm from "@/components/NoteForm";
import Header from "@/components/Header";
import { createNote } from "@/lib/actions";

export default function NewNotePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (title: string, content: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createNote({ title, content });

      if (result.success) {
        // Redirect to dashboard after successful creation
        router.push("/");
      } else {
        // Display error message
        setError(result.error || "Failed to create note");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error creating note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create New Note
          </h1>

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
                    Error creating note
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <NoteForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
