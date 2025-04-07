import { Fragment } from 'react';
import { Outlet, Link } from 'react-router-dom';
import {ReactComponent as AmpLogo} from '../../assets/AMP_Logo.svg';

import './navigation.styles.scss';

const Navigation = () => {

    return (
        <Fragment>
            <div className="navigation">
                <Link className="logo-container" to="/">
                    <AmpLogo className='logo' />
                </Link>
            </div>
            <Outlet />
        </Fragment>
    )
}
export default Navigation;