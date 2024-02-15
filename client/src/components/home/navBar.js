import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/">
                <button className='submit-button'>Create</button>
            </Link>
            <Link to="/list">
                <button className='clear-button'>List</button>
            </Link>
        </div>
    );
}

export default NavBar;
