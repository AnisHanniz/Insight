import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white p-4 h-screen">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav>
          <ul>
            <li>
              <Link href="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/packs" className="block py-2 px-4 hover:bg-gray-700 rounded">
                Manage Packs
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className="block py-2 px-4 hover:bg-gray-700 rounded">
                Manage Users
              </Link>
            </li>
            {/* Add more admin links here */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
