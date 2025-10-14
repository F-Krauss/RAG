import { useState } from 'react';
export default function UserMenu({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);

  const user = {
    name: 'Luis Bedia',
    email: 'clientes@t-efficiency.com',
    avatar: 'https://ui-avatars.com/api/?name=Luis+Bedia&background=007bff&color=fff',
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <img
          src={user.avatar}
          alt="avatar"
          className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>

          <ul className="py-1 text-sm">
            <li>
              <button
                onClick={() => alert('Editar perfil')}
                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Editar perfil
              </button>
            </li>
            <li>
                <button
                onClick={onLogout}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
            >
                Cerrar sesión
          </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
