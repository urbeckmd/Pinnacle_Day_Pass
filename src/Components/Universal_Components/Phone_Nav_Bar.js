import React from 'react';
import "./Phone_Nav_Bar.css";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import Dropdown from 'react-bootstrap/Dropdown';

function Phone_Nav_Bar({ loggedIn }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("logout requested");
        navigate("/")
    }

    return (
        <Navbar className="bg-body-tertiary nav_bar_container">
            <Container>
                <Navbar.Brand href="/" className='phone_nav_bar_title'>Pinnacle Lake Day Passes</Navbar.Brand>
                <Dropdown className="phone_nav_bar_dropdown" align="end">
                    <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                        <MenuIcon />
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item href="#/action-1">
                            About
                        </Dropdown.Item>
                        {(loggedIn) &&
                            <Dropdown.Item href="#/action-2">
                                <Navbar.Text className='phone_nav_bar_link'>
                                    <>
                                        <div className="nav_bar_logout_container" onClick={handleLogout}>
                                            <div className='phone_nav_bar_logout_text'>Logout</div>
                                        </div>
                                    </>
                                </Navbar.Text>
                            </Dropdown.Item>
                        }
                    </Dropdown.Menu>
                </Dropdown>

            </Container>
        </Navbar >
    )
}

export default Phone_Nav_Bar
