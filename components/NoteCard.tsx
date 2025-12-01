import Link from "next/link";
import { Note } from "@/types";

interface NoteCardProps {
  note: Note;
}

export default function NoteCard({ note }: NoteCardProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  return (
    <Link href={`/notes/${note.id}`}>
      <div className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {note.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {getPreview(note.content)}
        </p>
        <p className="text-sm text-gray-400">
          {formatDate(note.createdAt)}
        </p>
      </div>
    </Link>
  );
}
