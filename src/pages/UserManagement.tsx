import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Shield, ShieldAlert, User as UserIcon } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      if (!user) return;
      
      // Check if current user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profile?.role === 'admin') {
        setIsAdmin(true);
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        setProfiles(data || []);
      }
      setLoading(false);
    };

    checkAdminAndFetch();
  }, [user]);

  const toggleRole = async (profileId: string, currentRole: string) => {
    if (!isAdmin) return;
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', profileId);
        
      if (!error) {
        setProfiles(profiles.map(p => p.id === profileId ? { ...p, role: newRole } : p));
      } else {
        alert('Error updating role: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div>Loading user management...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <div className="bg-red-100 p-4 rounded-full">
          <ShieldAlert className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 max-w-md">
          You do not have permission to view this page. Only administrators can manage users.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <p className="text-sm text-gray-600">
            Note: New users must sign up via the Supabase Auth UI or API. Here you can manage their roles.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <UserIcon className="w-5 h-5 text-gray-500" />
                      </div>
                      <span className="font-medium text-gray-900">{profile.full_name || 'No Name Set'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{profile.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      profile.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.role === 'admin' && <Shield className="w-3 h-3" />}
                      {profile.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => toggleRole(profile.id, profile.role)}
                      disabled={profile.id === user?.id}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {profile.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
