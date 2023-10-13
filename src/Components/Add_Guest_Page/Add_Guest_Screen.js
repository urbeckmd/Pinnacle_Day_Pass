import React, { useState } from 'react'
import Nav_Bar from '../Universal_Components/Nav_Bar'
import "./Add_Guest_Screen.css"
import { Button, Form } from 'react-bootstrap';

function Add_Guest_Screen() {
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState("");
  const [guestDateOfVisit, setGuestDateOfVisit] = useState("");
  const [guestSaved, setGuestSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(guestName, guestNumber, guestDateOfVisit, guestSaved);
  }


  return (
    <div className='add_guest_screen_container'>
      <Nav_Bar loggedIn={true} navHeader={'Pinnacle Lake Day Passes'} />
      <div className="add_guest_screen_module_container">
        <div className="laptop_add_guest_module"></div>

        <div className="mobile_add_guest_module">
          <Form className='mobile_add_guest_form'>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>First and Last Name</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>Phone Number</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="text" value={guestNumber} onChange={(e) => setGuestNumber(e.target.value)} />
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
        </div>
      </div>
    </div>

  )
}

export default Add_Guest_Screen