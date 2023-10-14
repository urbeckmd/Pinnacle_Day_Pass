import React, { useState } from 'react'
import Nav_Bar from '../Universal_Components/Nav_Bar'
import "./Add_Guest_Screen.css"
import { Button, Form } from 'react-bootstrap';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Accordion from 'react-bootstrap/Accordion';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { useNavigate } from 'react-router-dom';


function Add_Guest_Screen() {
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState("");
  const [guestDateOfVisit, setGuestDateOfVisit] = useState("");
  const [guestSaved, setGuestSaved] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(guestName, guestNumber, guestDateOfVisit, guestSaved);
  }

  const handleLogout = () => {
    console.log("logout out of phone");
    navigate("/");
  }


  return (
    <div className='add_guest_screen_container'>
      <Nav_Bar loggedIn={true} navHeader={'Pinnacle Lake Day Passes'} />
      <div className="add_guest_screen_module_container">
        
        <div className="laptop_add_guest_module"></div>

        <div className="mobile_add_guest_module">
          <Button className='phone_logout_button' onClick={handleLogout}>
            <div className="phone_logout_button_container">
            <ArrowBackIosRoundedIcon className='phone_logout_arrow'/>
            <p className="phone_logout_button_text">Logout</p>
            </div>
          </Button>
          <Form className='mobile_add_guest_form'>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>First and Last Name</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>Phone Number</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="number" value={guestNumber} onChange={(e) => setGuestNumber(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>Date of Visit</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="date" value={guestDateOfVisit} onChange={(e) => setGuestDateOfVisit(e.target.value)} />
            </Form.Group>
            <Form.Check type="checkbox"
              className='mobile_add_guest_checkbox'
              id="default-checkbox"
              label="Save this guest"
              onClick={(e) => setGuestSaved(e.target.checked)}
              checked={guestSaved}
            />
            <Button className='mobile_add_guest_button float-end' type='submit' onClick={(e) => handleSubmit(e)}>Add Guest</Button>
          </Form>
          <Button variant="primary" onClick={handleShow} className='mobile_add_guest_button mobile_add_guest_offcanvas_button'>
            View Invited Guests
          </Button>

          <Offcanvas show={show} onHide={handleClose} placement='bottom' className='mobile_add_guest_offcanvas'>
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Invited Guests</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Saturday, June 6, 2023</Accordion.Header>
                  <Accordion.Body>
                    <Form>
                      <Form.Check type='radio' className='radio_button' label="Matt Urbeck" defaultChecked />
                      <hr />
                      <Form.Check type='radio' className='radio_button' label="Tim Mehegan" defaultChecked />
                      <hr />
                      <Form.Check disabled type='radio' className='radio_button' label="Adam Osvath" value={true} />
                    </Form>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Sunday, June 14, 2024</Accordion.Header>
                  <Accordion.Body>
                    <Form>
                      <Form.Check type='radio' className='radio_button' label="Dave Urbeck" defaultChecked />
                    </Form>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <Button className='mobile_add_guest_button mobile_add_guest_send_new_invites_button'>Send New Invites</Button>
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </div>
    </div>

  )
}

export default Add_Guest_Screen