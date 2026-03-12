import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sprout, 
  FlaskConical, 
  Syringe, 
  Bug, 
  Users, 
  Truck, 
  FileText, 
  UserCog, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Seeds Inventory', path: '/seeds', icon: Sprout },
  { name: 'Fertilizers Inventory', path: '/fertilizers', icon: FlaskConical },
  { name: 'Vet & Chemicals', path: '/vet-chemicals', icon: Syringe },
  { name: 'Pesticides', path: '/pesticides', icon: Bug },
  { name: 'Recipients', path: '/recipients', icon: Users },
  { name: 'Distribution', path: '/distribution', icon: Truck },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'User Management', path: '/users', icon: UserCog },
];

export const Sidebar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-green-800 text-white flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 flex items-center justify-center border-b border-green-700">
        <h1 className="text-2xl font-bold text-center tracking-wider">MAO RSBSA</h1>
      </div>
      
      <nav className="flex-1 py-6">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive 
                      ? 'bg-green-700 text-white font-medium shadow-sm' 
                      : 'text-green-100 hover:bg-green-700/50 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-green-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-green-100 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Log Out
        </button>
      </div>
    </div>
  );
};
