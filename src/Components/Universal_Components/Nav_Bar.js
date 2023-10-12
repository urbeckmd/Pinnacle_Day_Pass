import React from 'react';
import "./Nav_Bar.css";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { useNavigate } from 'react-router-dom';

function Nav_Bar({ loggedIn }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("logout requested");
        navigate("/")
    }

    return (
        <Navbar className="bg-body-tertiary nav_bar_container">
            <Container>
                <Navbar.Brand href="/" className='nav_bar_title'>Pinnacle Lake Day Passes</Navbar.Brand>
                <Navbar.Text className='nav_bar_link'>
                    {(loggedIn)
                        ? <div className="nav_bar_logout_container" onClick={handleLogout}>
                            <HomeRoundedIcon className='nav_bar_home_icon'/>
                            <div className='nav_bar_logout_text'>Logout</div>
                          </div>
                        : <div>
                            <a href="https://www.pinnaclelake.com/" className='pinnacle_web_link'>pinnaclelake.com</a>
                            <ArrowForwardRoundedIcon className='nav_bar_arrow' />
                        </div>
                    }
                </Navbar.Text>
            </Container>
        </Navbar >
    )
}

export default Nav_Bar
