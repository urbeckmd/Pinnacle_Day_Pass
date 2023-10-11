import React from 'react';
import "./Nav_Bar.css";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

function Nav_Bar({ logginIn }) {
    return (
        <Navbar className="bg-body-tertiary nav_bar_container">
            <Container>
                <Navbar.Brand href="https://www.pinnaclelake.com/" className='nav_bar_title'>
                    {(logginIn) 
                        ? 'Pinnacle Lake Day Passes' 
                        : 'Day Passes'
                    }
                </Navbar.Brand>
                <Navbar.Text className='nav_bar_link'>
                    {(logginIn) 
                        ? <div>
                            <a href="https://www.pinnaclelake.com/" className='pinnacle_web_link'>pinnaclelake.com</a>
                            <ArrowForwardRoundedIcon className='nav_bar_arrow'/>
                          </div>
                        : <a href="/">Logout</a>
                    }
                </Navbar.Text>
            </Container>
        </Navbar >
    )
}

export default Nav_Bar
