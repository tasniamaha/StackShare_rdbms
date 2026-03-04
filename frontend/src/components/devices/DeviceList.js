// src/components/devices/DeviceList.js
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
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

  // Filters & view
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('available');
  const [viewMode, setViewMode] = useState('grid');

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // Mock data with some FREE devices
  const mockDevices = [
    {
      id: 1,
      name: 'MacBook Pro 16" M2 Pro',
      category: 'Laptop',
      pricePerDay: 0,
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
      pricePerDay: 0,
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
      pricePerDay: 0,
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
      pricePerDay: 0,
      status: 'available',
      ownerName: 'Fahim Chowdhury',
      image: 'https://images.unsplash.com/photo-1516035069373-2c1c2b6d3b38?w=600&auto=format&fit=crop',
    },
    {
      id: 8,
      name: 'Dell XPS 15 OLED (2023)',
      category: 'Laptop',
      pricePerDay: 0,
      status: 'available',
      ownerName: 'Sumaiya Akter',
      image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop',
    },
    {
      id: 9,
      name: 'GoPro HERO12 Black',
      category: 'Action Camera',
      pricePerDay: 100,
      status: 'borrowed',
      ownerName: 'Rafiul Islam',
      image: 'https://images.unsplash.com/photo-1563281578-5c4d6d2d2c6e?w=600&auto=format&fit=crop',
    },
    {
      id: 10,
      name: 'Rode NT1-A Microphone Kit',
      category: 'Audio',
      pricePerDay: 0,
      status: 'available',
      ownerName: 'Tahmid Hasan',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
    {
      id: 11,
      name: 'Logitech C922 Pro Webcam',
      category: 'Webcam',
      pricePerDay: 0,
      status: 'available',
      ownerName: 'Faria Islam',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
    {
      id: 12,
      name: 'Blue Yeti USB Microphone',
      category: 'Audio',
      pricePerDay: 0,
      status: 'available',
      ownerName: 'Zubair Rahman',
      image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600&auto=format&fit=crop',
    },
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // reset pagination on search
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        setDevices(mockDevices);
      } catch (err) {
        setError('Failed to load devices. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  // Filtered & paginated devices (memoized)
  const displayedDevices = useMemo(() => {
    let filtered = [...mockDevices];

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(d => 
        d.name.toLowerCase().includes(term) || 
        d.category.toLowerCase().includes(term) ||
        d.ownerName?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(d => d.category === categoryFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    const start = (page - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [debouncedSearch, categoryFilter, statusFilter, page]);

  const totalPages = Math.ceil(
    mockDevices.filter(d => {
      if (debouncedSearch) {
        const term = debouncedSearch.toLowerCase();
        return (
          d.name.toLowerCase().includes(term) || 
          d.category.toLowerCase().includes(term) ||
          d.ownerName?.toLowerCase().includes(term)
        );
      }
      if (categoryFilter && d.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      return true;
    }).length / itemsPerPage
  );

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
      <div className="bg-grid-lines"></div>

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
            {/* Search */}
            <form className="search-form" onSubmit={(e) => e.preventDefault()}>
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name, category, owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            {/* Filters */}
            <div className="filter-controls">
              <div className="filter-group">
                <label>Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All Categories</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Camera">Camera</option>
                  <option value="Drone">Drone</option>
                  <option value="Audio">Audio</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Lighting">Lighting</option>
                  <option value="Action Camera">Action Camera</option>
                  <option value="Webcam">Webcam</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                >
                  <option value="available">Available Only</option>
                  <option value="all">All Devices</option>
                  <option value="borrowed">Borrowed</option>
                </select>
              </div>

              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters
              </button>

              {/* View Toggle */}
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid size={20} />
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
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
        ) : displayedDevices.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} />
            <h3>No devices found</h3>
            <p>Try adjusting your search or filters</p>
            <button onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <motion.div 
              className={`devices-display ${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {displayedDevices.map(device => (
                <motion.div
                  key={device.id}
                  className="device-item"
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,240,255,0.18)' }}
                  onClick={() => goToDevice(device.id)}
                >
                  <div className="device-image-container">
                    <img
                      src={device.image}
                      alt={device.name}
                      className="device-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                      }}
                    />
                    <div className={`status-overlay ${device.status}`}>
                      {device.status === 'available' ? 'Available' : 'Borrowed'}
                    </div>

                    {device.pricePerDay === 0 && (
                      <div className="free-badge">FREE!</div>
                    )}
                  </div>

                  <div className="device-info">
                    <h3 className="device-name">{device.name}</h3>
                    <div className="device-category">{device.category}</div>
                    <div className="device-price">
                      {device.pricePerDay === 0 ? (
                        <span className="free-price">Free to Borrow</span>
                      ) : (
                        <>৳{device.pricePerDay.toLocaleString()} <small>/day</small></>
                      )}
                    </div>
                    <div className="device-owner">
                      Owner: <span>{device.ownerName}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  ← Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DeviceList;
