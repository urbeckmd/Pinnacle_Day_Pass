import React, { useState } from 'react';
import "./Nav_Bar.css";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { useNavigate } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';

function Nav_Bar({ loggedIn }) {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);

    const handleShow = () => {setShow(true)};
    const handleClose = () => {setShow(false)};

    const handleLogout = () => {
        console.log("logout requested");
        navigate("/")
    }

    return (
        <>
            <Navbar className="bg-body-tertiary nav_bar_container">
                <Container>
                    <Navbar.Brand href="/" className='nav_bar_title'>Pinnacle Lake Day Passes</Navbar.Brand>
                    <Navbar.Text className='nav_bar_link'>
                        <div className='nav_bar_about' onClick={handleShow}>About</div>
                        <div className='nav_bar_divider'>|</div>
                        {(loggedIn)
                            ? <div className="nav_bar_logout_container" onClick={handleLogout}>
                                <HomeRoundedIcon className='nav_bar_home_icon' />
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
            <Offcanvas className="nav_bar_offcanvas" show={show} onHide={handleClose} placement="top">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>About Pinnacle Day Passes</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    This website allows you to send a QR code day pass to your guest's phone, which they can scan at the gate to enter the property.
                    Here's how it works:
                    <ul>
                        <li>Login in using the temporary password sent to your email.</li>
                        <li>Enter the name and phone number of your guest, as well as, the date they will be coming.</li>
                        <li>Click "Add" to add them to your list of invited guests.</li>
                        <li>Your guest will receive a text message with a QR code that they can scan at the gate to let them in.</li>
                        <li>NOTE: Each pass can only be scanned once. If they leave the property they will not be able to reenter with the same pass.</li>
                    </ul>
                    When will the passes be sent to your guests?
                    <ul>
                        <li>Any guests that are added the day of their visit will receive the invite at the next quarter of the hour.</li>
                        <li>Any guests that are added for a future date will receive their invite at either 12PM, 6PM or 11:55PM the day before their visit.</li>
                    </ul>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    )
}

export default Nav_Bar
