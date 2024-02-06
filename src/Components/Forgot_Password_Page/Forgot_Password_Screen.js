import React, { useState } from 'react'
import Nav_Bar from '../Universal_Components/Nav_Bar'
import "./Forgot_Password_Screen.css";
import "../../index.css"
import Phone_Nav_Bar from '../Universal_Components/Phone_Nav_Bar';

import { Form } from 'react-bootstrap';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Button from 'react-bootstrap/Button';
function Forgot_Password_Screen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    return (
        <div className='home_screen_container'>
            <div className="laptop_nav_bar">
                <Nav_Bar loggedIn={false} />
            </div>
            <span className="phone_nav_bar">
                <Phone_Nav_Bar loggedIn={false} />
            </span>

            <div className="home_screen_module_container">
                <div className='login_module_container' >
                    <ArrowBackRoundedIcon className='float-start login_module_back_arrow' />
                    <div className="login_module_form_container">
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label className='login_module_input_field_title float-start'>Email</Form.Label>
                                <Form.Control type="email" className='login_module_input_field' value={email} onChange={(e) => setEmail(e.target.value)} />
                            </Form.Group>
                        </Form>
                        <Button className='float-end login_module_button' size='lg' >Reset Password</Button>
                    </div>
                    <hr className='login_module_line_break' size="13" />
                </div>
            </div>
        </div>
    )
}

export default Forgot_Password_Screen
