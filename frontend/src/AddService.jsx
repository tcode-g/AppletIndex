import React, { useState } from 'react';

const AddService = ({ onServiceAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    imageUrl: '',
    password: ''
  });

  const backendUrl = 'http://localhost:3001';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${backendUrl}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Service added successfully!');
        onServiceAdded();
        setFormData({ name: '', url: '', description: '', imageUrl: '', password: '' });
      } else {
        alert('Failed to add service.');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      alert('An error occurred while adding the service.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add New Service</h2>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">URL</label>
        <input
          type="url"
          name="url"
          value={formData.url}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Image URL</label>
        <input
          type="text"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
        Add Service
      </button>
    </form>
  );
};

export default AddService;
