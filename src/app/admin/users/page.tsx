"use client";

import { useState, useEffect } from "react";
import UserForm from "@/components/admin/UserForm";

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleOpenModal = (user: any = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSave = async (userData: any) => {
    if (selectedUser) {
      // Update existing user
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const updatedUser = await res.json();
      setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    } else {
      // Add new user
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const newUser = await res.json();
      setUsers([...users, newUser]);
    }
    handleCloseModal();
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Users</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary hover:bg-primary/90 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Add New User
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <table className="min-w-full text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">ELO</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-gray-700">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.elo}</td>
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => handleOpenModal(user)} className="text-blue-400 hover:text-blue-300 font-semibold text-sm px-3 py-1.5 rounded-md hover:bg-blue-500/10 transition-colors mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300 font-semibold text-sm px-3 py-1.5 rounded-md hover:bg-red-500/10 transition-colors">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-gray-700 p-8 rounded-lg shadow-2xl max-w-lg w-full">
            <h2 className="text-2xl font-bold mb-6 text-white">{selectedUser ? "Edit User" : "Add New User"}</h2>
            <UserForm user={selectedUser} onSave={handleSave} onCancel={handleCloseModal} />
          </div>
        </div>
      )}
    </div>
  );
}
