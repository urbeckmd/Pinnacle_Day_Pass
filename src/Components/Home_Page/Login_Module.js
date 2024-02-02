import React from 'react';
import "./Home_Screen.css";
import { Form } from 'react-bootstrap';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { useState } from 'react';
import Cookies from "universal-cookie";
const cookies = new Cookies();

function Login_Module( { handleLoginClick, setUserLoggedIn }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")

    const handleLoginRedirect = () => {

        const configuration = {
            method: "post",
            url: "http://localhost:3000/",
            data: {
                email,
                password,
            },
        };
        axios(configuration)
            .then((result) => {
                console.log(result);
                cookies.set("TOKEN", result.data.token, {
                    path: "/",
                })
                cookies.set("EMAIL", result.data.email, {
                    path: "/",
                })
                cookies.set("RESIDENT_ID",result.data.residentId ,{
                    path: "/"
                })
                navigate("/add_guest")
            })
            .catch((error) => {
                console.log(error);
                alert(error.response.data.message)
            })
    }

    return (
        <div className='login_module_container' >
            <ArrowBackRoundedIcon className='float-start login_module_back_arrow' onClick={handleLoginClick}/>
            <div className="login_module_form_container">
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label className='login_module_input_field_title float-start'>Username</Form.Label>
                        <Form.Control type="email" className='login_module_input_field' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className='login_module_input_field_title float-start'>Password</Form.Label>
                        <Form.Control className='login_module_input_field' type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </Form.Group>
                </Form>
                <Button className='float-end login_module_button' size='lg' onClick={handleLoginRedirect}>Login</Button>
            </div>
            <hr className='login_module_line_break' size="13"/>
            <div className="login_module_forgot_password">Forgot Password</div>
        </div>
    )
}

export default Login_Module
