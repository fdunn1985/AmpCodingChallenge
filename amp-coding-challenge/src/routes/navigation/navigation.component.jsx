import { Fragment, useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {ReactComponent as AmpLogo} from '../../assets/AMP_Logo.svg';

import './navigation.styles.scss';

const Navigation = () => {

    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <Fragment>
            <div className="navigation">
                <div className="navbar-content">
                    <div className="navbar-logo">
                        <Link to="/dashboard">
                            <AmpLogo className='logo' />
                        </Link>
                    </div>

                    {/* Hamburger menu button (shows only on mobile) */}
                    <button 
                        className="menu-toggle" 
                        onClick={toggleMenu}
                        aria-label="Toggle navigation menu"
                    >
                        {menuOpen ? 'X' : '☰' }
                    </button>

                    <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
                        <Link to="/dashboard" className="nav-item">Dashboard</Link>
                        <Link to="/userList" className="nav-item">Users</Link>
                    </div>
                    <div className="navbar-user">
                        <div className="user-info">
                            <span className="user-name">Freddie Dunn (Agent)</span>
                        </div>
                    </div>
                </div>
            </div>
            <Outlet />
        </Fragment>
    )
};

export default Navigation;