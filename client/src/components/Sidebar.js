import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

// Import icons
import { 
    RiDashboardLine, 
    RiExchangeDollarLine,
    RiStockLine,
    RiTargetLine,
    RiLogoutBoxLine 
} from 'react-icons/ri';

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    
    const menuItems = [
        { path: '/dashboard', name: 'Dashboard', icon: <RiDashboardLine className="nav-icon" /> },
        { path: '/transactions', name: 'Transactions', icon: <RiExchangeDollarLine className="nav-icon" /> },
        { path: '/investments', name: 'Investments', icon: <RiStockLine className="nav-icon" /> },
        { path: '/goals', name: 'Goals', icon: <RiTargetLine className="nav-icon" /> }
    ];

    const handleLogout = () => {
        logout();
    };

    // Get user initials for avatar
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <nav className="sidebar">
            <div className="logo-container">
                <h1 className="logo">AI Money Mentor</h1>
            </div>

            <ul className="nav-menu">
                {menuItems.map((item, index) => (
                    <li key={item.path} className="nav-item" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                        <Link
                            to={item.path}
                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    </li>
                ))}
            </ul>

            <div className="user-section">
                <div className="user-info">
                    <div className="user-avatar">
                        {user?.name ? getInitials(user.name) : 'U'}
                    </div>
                    <div className="user-details">
                        <div className="user-name">{user?.name || 'User'}</div>
                        <div className="user-email">{user?.email || 'user@example.com'}</div>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <RiLogoutBoxLine className="logout-icon" />
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Sidebar;