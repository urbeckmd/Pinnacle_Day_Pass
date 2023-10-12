import React from 'react'
import Nav_Bar from '../Universal_Components/Nav_Bar'
import "./Add_Guest_Screen.css"
import { Button, Form } from 'react-bootstrap';

function Add_Guest_Screen() {
  return (
    <div className='add_guest_screen_container'>
      <Nav_Bar loggedIn={true} navHeader={'Pinnacle Lake Day Passes'} />
      <div className="add_guest_screen_module_container">
        <div className="laptop_add_guest_module"></div>

        <div className="mobile_add_guest_module">
          <Form className='mobile_add_guest_form'>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>First and Last Name</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="text" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>Phone Number</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="text" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>Date of Visit</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="text" />
            </Form.Group>
          </Form>
          <Form.Check type="checkbox"
            id="default-checkbox"
            label="Save this guest"
          />
          <Button className='mobile_add_guest_button'>Add Guest</Button>
        </div>
      </div>
    </div>

  )
}

export default Add_Guest_Screen