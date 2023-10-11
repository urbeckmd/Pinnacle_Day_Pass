import React from 'react'
import Button from 'react-bootstrap/Button';
import "./Home_Screen.css";

function Home_Page_Module( { handleLoginClick }) {
    return (
        <div className='home_page_module_container'>
            <h1 className="home_page_module_text">Invite your guests to Pinnacle Lake.</h1>
            <Button className='float-end home_page_module_button' size='lg' onClick={handleLoginClick}>Invite</Button>
        </div>
    )
}

export default Home_Page_Module
