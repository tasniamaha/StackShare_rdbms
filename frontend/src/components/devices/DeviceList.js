// src/components/devices/DeviceList.js
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Grid, List, AlertCircle, Loader2 
} from 'lucide-react';

import BorrowRequestForm from './BorrowRequestForm';  // ← Shared reusable form

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

  // Borrow modal state
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedDeviceForBorrow, setSelectedDeviceForBorrow] = useState(null);

  // Expanded mock data – 25+ devices
  const mockDevices = [
    { id: 1, name: 'MacBook Pro 16" M2 Pro', category: 'Laptop', pricePerDay: 0, status: 'available', ownerName: 'Rahim Ahmed', image: 'https://images.unsplash.com/photo-1517336714731-48910b828f85?w=600' },
    { id: 2, name: 'Canon EOS R6 + 24-70mm Lens', category: 'Camera', pricePerDay: 850, status: 'borrowed', ownerName: 'Sadia Khan', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600' },
    { id: 3, name: 'DJI Mini 4 Pro Drone + Extra Battery', category: 'Drone', pricePerDay: 0, status: 'available', ownerName: 'Karim Hossain', image: 'https://images.unsplash.com/photo-1506947411487-4a9d9a9d8e5f?w=600' },
    { id: 4, name: 'iPad Pro 12.9" M2 (2022)', category: 'Tablet', pricePerDay: 700, status: 'available', ownerName: 'Nusrat Jahan', image: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600' },
    { id: 5, name: 'Rode VideoMic Pro+', category: 'Audio', pricePerDay: 0, status: 'available', ownerName: 'Prithvi Das', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 6, name: 'Godox AD600Pro Flash + Softbox', category: 'Lighting', pricePerDay: 600, status: 'borrowed', ownerName: 'Ayesha Siddiqua', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 7, name: 'Sony A7 IV + 35mm f/1.4', category: 'Camera', pricePerDay: 0, status: 'available', ownerName: 'Fahim Chowdhury', image: 'https://images.unsplash.com/photo-1516035069373-2c1c2b6d3b38?w=600' },
    { id: 8, name: 'Dell XPS 15 OLED (2023)', category: 'Laptop', pricePerDay: 0, status: 'available', ownerName: 'Sumaiya Akter', image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600' },
    { id: 9, name: 'GoPro HERO12 Black', category: 'Action Camera', pricePerDay: 100, status: 'borrowed', ownerName: 'Rafiul Islam', image: 'https://images.unsplash.com/photo-1563281578-5c4d6d2d2c6e?w=600' },
    { id: 10, name: 'Rode NT1-A Microphone Kit', category: 'Audio', pricePerDay: 0, status: 'available', ownerName: 'Tahmid Hasan', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 11, name: 'Logitech C922 Pro Webcam', category: 'Webcam', pricePerDay: 0, status: 'available', ownerName: 'Faria Islam', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 12, name: 'Blue Yeti USB Microphone', category: 'Audio', pricePerDay: 0, status: 'available', ownerName: 'Zubair Rahman', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 13, name: 'Apple AirPods Max', category: 'Audio', pricePerDay: 400, status: 'available', ownerName: 'Nusrat Jahan', image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600' },
    { id: 14, name: 'Nikon Z6 II + 24-70mm', category: 'Camera', pricePerDay: 950, status: 'borrowed', ownerName: 'Prithvi Das', image: 'https://images.unsplash.com/photo-1516035069373-2c1c2b6d3b38?w=600' },
    { id: 15, name: 'Samsung Galaxy Tab S8 Ultra', category: 'Tablet', pricePerDay: 600, status: 'available', ownerName: 'Karim Hossain', image: 'https://images.unsplash.com/photo-1611078489935-0cb4c2497a00?w=600' },
    { id: 16, name: 'DJI Osmo Pocket 3', category: 'Gimbal', pricePerDay: 0, status: 'available', ownerName: 'Sadia Khan', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 17, name: 'Elgato Stream Deck MK.2', category: 'Streaming', pricePerDay: 250, status: 'available', ownerName: 'Tahmid Hasan', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 18, name: 'Insta360 X3', category: 'Action Camera', pricePerDay: 450, status: 'borrowed', ownerName: 'Ayesha Siddiqua', image: 'https://images.unsplash.com/photo-1563281578-5c4d6d2d2c6e?w=600' },
    { id: 19, name: 'Shure SM7B Microphone', category: 'Audio', pricePerDay: 0, status: 'available', ownerName: 'Fahim Chowdhury', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 20, name: 'ASUS ROG Zephyrus G14', category: 'Laptop', pricePerDay: 1100, status: 'available', ownerName: 'Sumaiya Akter', image: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?w=600' },
    { id: 21, name: 'Sony WH-1000XM5 Headphones', category: 'Audio', pricePerDay: 350, status: 'available', ownerName: 'Rakib Hossain', image: 'https://images.unsplash.com/photo-1505740106531-4243f3831145?w=600' },
    { id: 22, name: 'Fujifilm X-T5 + 18-55mm', category: 'Camera', pricePerDay: 800, status: 'borrowed', ownerName: 'Sumaiya Akter', image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600' },
    { id: 23, name: 'Microsoft Surface Laptop Studio', category: 'Laptop', pricePerDay: 900, status: 'available', ownerName: 'Faria Islam', image: 'https://images.unsplash.com/photo-1622770340772-98e4fb7a920a?w=600' },
    { id: 24, name: 'DJI Ronin-SC Gimbal', category: 'Gimbal', pricePerDay: 400, status: 'available', ownerName: 'Tahmid Hasan', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
    { id: 25, name: 'HyperX QuadCast S Microphone', category: 'Audio', pricePerDay: 0, status: 'available', ownerName: 'Zubair Rahman', image: 'https://images.unsplash.com/photo-1588104388727-1d4e8f0e5d5e?w=600' },
  ];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDevices(mockDevices);
      setLoading(false);
    }, 800);
  }, []);

  // Filtered & paginated devices
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

  // ── Borrow request handlers ──
  const openBorrowModal = (device) => {
    if (device.status !== 'available') {
      alert('This device is currently unavailable.');
      return;
    }
    setSelectedDeviceForBorrow(device);
    setShowBorrowModal(true);
  };

  const handleBorrowSubmit = (requestData) => {
    console.log("Borrow request submitted:", requestData);
    alert("Request has been sent — you will be notified of any update!");
    setShowBorrowModal(false);
    setSelectedDeviceForBorrow(null);
  };

  const closeBorrowModal = () => {
    setShowBorrowModal(false);
    setSelectedDeviceForBorrow(null);
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
                >
                  <div className="device-image-container" onClick={() => goToDevice(device.id)}>
                    <img
                      src={device.image}
                      alt={device.name}
                      className="device-image"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'}
                    />
                    <div className={`status-overlay ${device.status}`}>
                      {device.status === 'available' ? 'Available' : 'Borrowed'}
                    </div>

                    {device.pricePerDay === 0 && (
                      <div className="free-badge">FREE!</div>
                    )}
                  </div>

                  <div className="device-info">
                    <h3 className="device-name" onClick={() => goToDevice(device.id)}>
                      {device.name}
                    </h3>
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

                    <div className="device-actions">
                      {device.status === 'available' ? (
                        <button
                          className="borrow-btn"
                          onClick={() => openBorrowModal(device)}
                        >
                          Borrow Device
                        </button>
                      ) : (
                        <button
                          className="notify-btn"
                          onClick={() => alert("Notify feature coming soon!")}
                        >
                          Notify When Available
                        </button>
                      )}
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

      {/* Borrow Request Modal – using shared component */}
      <AnimatePresence>
        {showBorrowModal && selectedDeviceForBorrow && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBorrowModal}
          >
            <BorrowRequestForm
              device={selectedDeviceForBorrow}
              onSubmit={handleBorrowSubmit}
              onClose={closeBorrowModal}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DeviceList;