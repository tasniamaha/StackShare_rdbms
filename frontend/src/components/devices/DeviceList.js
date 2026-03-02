// src/components/devices/DeviceList.js
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

import './DeviceList.css';

const DeviceList = () => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');
  const [viewMode, setViewMode] = useState('grid');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Mock data — some devices are now FREE (pricePerDay = 0)
  const mockDevices = [
    {
      id: 1,
      name: 'MacBook Pro 16" M2 Pro',
      category: 'Laptop',
      pricePerDay: 1200,
      status: 'available',
      ownerName: 'Rahim Ahmed',
      image: 'https://images.unsplash.com/photo-1517336714731-48910b828f85?w=600&auto=format&fit=crop',
    },
    {
      id: 2,
      name: 'Canon EOS R6 + 24-70mm Lens',
      category: 'Camera',
      pricePerDay: 850,
      status: 'borrowed',
      ownerName: 'Sadia Khan',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop',
    },
    {
      id: 3,
      name: 'DJI Mini 4 Pro Drone + Extra Battery',
      category: 'Drone',
      pricePerDay: 0, // ← FREE
      status: 'available',
      ownerName: 'Karim Hossain',
      image: 'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?w=600&auto=format&fit=crop',
    },
    {
      id: 4,
      name: 'iPad Pro 12.9" M2 (2022)',
      category: 'Tablet',
      pricePerDay: 700,
      status: 'available',
      ownerName: 'Nusrat Jahan',
      image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format&fit=crop',
    },
    {
      id: 5,
      name: 'Rode VideoMic Pro+',
      category: 'Audio',
      pricePerDay: 0, // ← FREE
      status: 'available',
      ownerName: 'Prithvi Das',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
    {
      id: 6,
      name: 'Godox AD600Pro Flash + Softbox',
      category: 'Lighting',
      pricePerDay: 600,
      status: 'borrowed',
      ownerName: 'Ayesha Siddiqua',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
    {
      id: 7,
      name: 'Sony A7 IV + 35mm f/1.4',
      category: 'Camera',
      pricePerDay: 1100,
      status: 'available',
      ownerName: 'Fahim Chowdhury',
      image: 'https://images.unsplash.com/photo-1516035069373-2c1c2b6d3b38?w=600&auto=format&fit=crop',
    },
    {
      id: 8,
      name: 'Dell XPS 15 OLED (2023)',
      category: 'Laptop',
      pricePerDay: 0, // ← FREE
      status: 'available',
      ownerName: 'Sumaiya Akter',
      image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop',
    },
    {
      id: 9,
      name: 'GoPro HERO12 Black',
      category: 'Action Camera',
      pricePerDay: 650,
      status: 'borrowed',
      ownerName: 'Rafiul Islam',
      image: 'https://images.unsplash.com/photo-1563281578-5c4d6d2d2c6e?w=600&auto=format&fit=crop',
    },
    {
      id: 10,
      name: 'Rode NT1-A Microphone Kit',
      category: 'Audio',
      pricePerDay: 350,
      status: 'available',
      ownerName: 'Tahmid Hasan',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
    {
      id: 11,
      name: 'Logitech C922 Pro Webcam',
      category: 'Webcam',
      pricePerDay: 0, // ← FREE
      status: 'available',
      ownerName: 'Faria Islam',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
    {
      id: 12,
      name: 'Blue Yeti USB Microphone',
      category: 'Audio',
      pricePerDay: 400,
      status: 'available',
      ownerName: 'Zubair Rahman',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
  ];

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock filtering (client-side)
        let filtered = [...mockDevices];

        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filtered = filtered.filter(d => 
            d.name.toLowerCase().includes(term) || 
            d.category.toLowerCase().includes(term)
          );
        }

        if (categoryFilter) {
          filtered = filtered.filter(d => d.category === categoryFilter);
        }

        if (statusFilter !== 'all') {
          filtered = filtered.filter(d => d.status === statusFilter);
        }

        // Simple pagination
        const start = (page - 1) * itemsPerPage;
        const paginated = filtered.slice(start, start + itemsPerPage);

        setDevices(paginated);

      } catch (err) {
        setError(err.message || 'Failed to load devices');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [searchTerm, categoryFilter, statusFilter, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('available');
    setPage(1);
  };

  const goToDevice = (deviceId) => {
    navigate(`/devices/${deviceId}`);
  };

  return (
    <div className="device-list-page">

      {/* Background layers */}
      <div className="bg-layer"></div>
      <div className="overlay-gradient"></div>

      <div className="container list-content">

        {/* Header + Search + Filters */}
        <motion.header 
          className="list-header"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="header-title">
            <h1>Browse Devices</h1>
            <p>Discover laptops, cameras, drones, audio gear and more — some are even free!</p>
          </div>

          <div className="header-controls">
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button type="submit" className="search-btn">
                Search
              </button>
            </form>

            <div className="filter-controls">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Camera">Camera</option>
                  <option value="Drone">Drone</option>
                  <option value="Audio">Audio</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="available">Available Only</option>
                  <option value="all">All Devices</option>
                </select>
              </div>

              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Device Grid / List */}
        {loading ? (
          <div className="loading-state">
            <Loader2 size={48} className="spin" />
            <p>Loading devices...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <AlertCircle size={48} />
            <h3>{error}</h3>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        ) : devices.length === 0 ? (
          <div className="empty-state">
            <h3>No devices found</h3>
            <p>Try adjusting your filters or search term</p>
            <button onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <motion.div 
            className={`devices-display ${viewMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {devices.map((device) => (
              <motion.div
                key={device.id}
                className="device-item"
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,240,255,0.18)' }}
                onClick={() => goToDevice(device.id)}
              >
                <div className="device-image-container">
                  <img
                    src={device.image || 'https://via.placeholder.com/400x300?text=Device'}
                    alt={device.name}
                    className="device-image"
                  />
                  <div className={`status-overlay ${device.status?.toLowerCase()}`}>
                    {device.status === 'available' ? 'Available' : 'Borrowed'}
                  </div>
                  {/* Free badge */}
                  {device.pricePerDay === 0 && (
                    <div className="free-badge">
                      FREE!
                    </div>
                  )}
                </div>

                <div className="device-info">
                  <h3 className="device-name">{device.name}</h3>
                  <div className="device-category">{device.category}</div>
                  <div className="device-price">
                    {device.pricePerDay === 0 ? (
                      <span className="free-price">Free</span>
                    ) : (
                      <>৳{device.pricePerDay?.toLocaleString() || 'N/A'} <span>/day</span></>
                    )}
                  </div>
                  <div className="device-owner">
                    Owner: <span>{device.ownerName || 'Anonymous'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Simple pagination */}
        {!loading && devices.length > 0 && (
          <div className="pagination">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceList;