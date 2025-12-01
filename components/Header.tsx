import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Simple Note App</h1>
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
