import { Fragment } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {ReactComponent as AmpLogo} from '../../assets/AMP_Logo.svg';

import './navigation.styles.scss';

const Navigation = () => {

    return (
        <Fragment>
            <div className="navigation">
                <div className="navbar-logo">
                    <Link to="/dashboard">
                        <AmpLogo className='logo' />
                    </Link>
                </div>
                <div className="navbar-menu">
                    <Link to="/dashboard" className="nav-item">Dashboard</Link>
                    <Link to="/users" className="nav-item">Users</Link>
                    <Link to="/subscriptions" className="nav-item">Subscriptions</Link>
                    <Link to="/reports" className="nav-item">Reports</Link>
                </div>
                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-name">CSR Agent</span>
                    </div>
                </div>
            </div>
            <Outlet />
        </Fragment>
    )
}
export default Navigation;