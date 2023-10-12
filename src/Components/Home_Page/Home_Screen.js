import React, { useState } from 'react'
import Nav_Bar from '../Universal_Components/Nav_Bar'
import "./Home_Screen.css";
import "../../index.css"
import Home_Page_Module from './Home_Page_Module';
import Login_Module from './Login_Module';


function Home_Screen() {
    const [loginScreen, setLoginScreen] = useState(false);


    const handleLoginClick = () => {
        setLoginScreen(!loginScreen)
    }

    return (
        <div className='home_screen_container'>
            <Nav_Bar loggedIn={false} navHeader={'Pinnacle Lake Day Passes'} />
            <div className="home_screen_module_container">
                {(loginScreen) 
                    ? <Login_Module className="home_screen_home_module" handleLoginClick={handleLoginClick} /> 
                    : <Home_Page_Module className="home_screen_login_module" handleLoginClick={handleLoginClick}/>}
            </div>
        </div>
    )
}

export default Home_Screen
