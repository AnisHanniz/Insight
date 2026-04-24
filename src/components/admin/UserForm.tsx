"use client";

import { useState, useEffect } from "react";

export default function UserForm({ user, onSave, onCancel }: { user?: any, onSave: (user: any) => void, onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    elo: 1000,
    role: "user",
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : parseInt(value, 10)) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-96">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Name</label>
        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500" required />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500" required />
      </div>
      <div>
        <label htmlFor="elo" className="block text-sm font-medium text-gray-300">ELO</label>
        <input type="number" name="elo" id="elo" value={formData.elo} onChange={handleChange} className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500" required />
      </div>
      <div>
        <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role</label>
        <select name="role" id="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full p-2 rounded bg-gray-600 text-white border border-gray-500">
          <option value="user">User</option>
          <option value="reviewer">Reviewer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-4 border-t border-white/10 mt-6">
        <button type="button" onClick={onCancel} className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-sm py-2 px-4 rounded-lg transition-colors">Cancel</button>
        <button type="submit" className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-2 px-4 rounded-lg shadow-md shadow-primary/20 transition-colors">Save User</button>
      </div>
    </form>
  );
}
