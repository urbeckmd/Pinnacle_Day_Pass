import React from 'react';
import "./Home_Screen.css";
import { Form } from 'react-bootstrap';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Button from 'react-bootstrap/Button';

function Login_Module( { handleLoginClick }) {
    return (
        <div className='login_module_container'>
            <ArrowBackRoundedIcon className='float-start login_module_back_arrow' onClick={handleLoginClick}/>
            <div className="login_module_form_container">
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className='login_module_input_field_title float-start'>Username</Form.Label>
                        <Form.Control type="email" className='login_module_input_field' />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className='login_module_input_field_title float-start'>Password</Form.Label>
                        <Form.Control className='login_module_input_field' type="password" />
                    </Form.Group>
                </Form>
                <Button className='float-end login_module_button' size='lg'>Login</Button>
            </div>
            <hr className='login_module_line_break' size="13"/>
            <div className="login_module_forgot_password">Forgot Password</div>
        </div>
    )
}

export default Login_Module
