import React, { useState, useEffect, useCallback } from 'react';
import AddService from './AddService';

const App = () => {
  // Use state variables for the services and passwords
  const [services, setServices] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [passwords, setPasswords] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Default fallback image URL with a question mark
  const defaultPlaceholderUrl = 'https://placehold.co/100x100/1e293b/d1d5db?text=?';
  const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  const backendApiUrl = `${backendUrl}/api`;

  // Function to check the status of a single service
  const checkServiceStatus = async (serviceUrl, serviceName) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(serviceUrl, { mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeoutId);

      setStatuses(prevStatuses => ({
        ...prevStatuses,
        [serviceName]: 'online'
      }));
    } catch (error) {
      if (error.name === 'AbortError') {
        setStatuses(prevStatuses => ({
          ...prevStatuses,
          [serviceName]: 'offline'
        }));
      } else {
        setStatuses(prevStatuses => ({
          ...prevStatuses,
          [serviceName]: 'offline'
        }));
      }
    }
  };

  // --- Fetch data from JSON file ---
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch(`${backendApiUrl}/services`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const servicesData = await response.json();

      // Sort services: non-password-protected first, then password-protected
      const sortedServices = servicesData.sort((a, b) => {
        if (a.password && !b.password) return 1;
        if (!a.password && b.password) return -1;
        return 0;
      });

      setServices(sortedServices);

      // When services are fetched, run the status checks
      sortedServices.forEach(service => {
        checkServiceStatus(service.url, service.name);
      });
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, []); // Empty dependency array ensures this runs only once

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleServiceClick = (e, service) => {
    if (service.password && !passwords[service.name]) {
      e.preventDefault();
      setSelectedService(service);
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const password = e.target.password.value;
    
    if (selectedService && password === selectedService.password) {
      setPasswords(prev => ({
        ...prev,
        [selectedService.name]: password
      }));
      setShowPasswordModal(false);
      window.open(selectedService.clickUrl || selectedService.url, '_blank');
    } else {
      alert('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 font-sans">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            My Services Dashboard
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
            A simple, clean interface to access all your self-hosted applications and services.
          </p>
        </header>

        {/* AddService component integrated here */}
        <AddService onServiceAdded={fetchServices} />

        {/* Loading state or empty state */}
        {services.length === 0 && (
          <p className="text-center text-lg text-gray-400">
            {services ? "No services found in services.json." : "Loading services..."}
          </p>
        )}

        {/* Grid of service cards */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {services.map((service) => (
              <a
                key={service.name}
                href={service.clickUrl || service.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleServiceClick(e, service)}
                className="relative bg-gray-800 rounded-2xl shadow-xl p-6 transition-transform transform hover:scale-105 hover:shadow-2xl flex items-center space-x-6"
              >
                {/* Status indicator */}
                <div
                  className={`absolute top-4 right-4 w-4 h-4 rounded-full ${getStatusColor(statuses[service.name])}`}
                  title={statuses[service.name] ? `Status: ${statuses[service.name]}` : 'Status: Checking...'}
                ></div>

                {/* Lock icon for password-protected services */}
                {service.password && (
                  <div className="absolute top-10 right-4 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-4 h-4">
                      <path fill="#ffffff" d="M256 160L256 224L384 224L384 160C384 124.7 355.3 96 320 96C284.7 96 256 124.7 256 160zM192 224L192 160C192 89.3 249.3 32 320 32C390.7 32 448 89.3 448 160L448 224C483.3 224 512 252.7 512 288L512 512C512 547.3 483.3 576 448 576L192 576C156.7 576 128 547.3 128 512L128 288C128 252.7 156.7 224 192 224z" />
                    </svg>
                  </div>
                )}

                <div className="flex-shrink-0">
                  <img
                    src={service.imageUrl || defaultPlaceholderUrl}
                    alt={`${service.name} icon`}
                    className="w-16 h-16 rounded-full bg-gray-700 object-cover border-2 border-gray-600"
                    onError={(e) => { e.target.src = defaultPlaceholderUrl; }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {service.name}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {service.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4">Enter Password</h3>
              <form onSubmit={handlePasswordSubmit}>
                <input
                  type="password"
                  name="password"
                  className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
                  placeholder="Enter password"
                  autoFocus
                />
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
