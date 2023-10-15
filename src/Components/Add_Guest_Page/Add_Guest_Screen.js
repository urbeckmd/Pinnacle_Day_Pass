import React, { useState, useEffect } from 'react'
import Nav_Bar from '../Universal_Components/Nav_Bar'
import "./Add_Guest_Screen.css"
import { Button, Form } from 'react-bootstrap';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Accordion from 'react-bootstrap/Accordion';
import ArrowBackIosRoundedIcon from '@mui/icons-material/ArrowBackIosRounded';
import { useNavigate } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import NavDropdown from 'react-bootstrap/NavDropdown';
import axios from 'axios';
import Cookies from "universal-cookie";
const cookies = new Cookies();

function Add_Guest_Screen() {
  const weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState("");
  const [guestDateOfVisit, setGuestDateOfVisit] = useState("");
  const [guestSaved, setGuestSaved] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  var accordianData = {};
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

  const handleDropdownSelect = (e) => {
    setGuestName(e.target.childNodes[0].innerHTML)
    setGuestNumber(e.target.childNodes[1].innerHTML)
  }




  useEffect(() => {
    // Get logged in user from cookies
    const currentUser = cookies.get("EMAIL");
    console.log(currentUser);
    // Get Array of Invited Guests for logged in user
    const configuration = {
      method: "get",
      params: {
        email: currentUser
      },
      url: "http://localhost:3000/getInvitedGuests",
    }
    axios(configuration)
      .then((result) => {
        const invitedGuests = result.data.data;
        const dateOfVisit = new Date(invitedGuests[0].invitedGuestDateOfVisit);
        const day = weekday[dateOfVisit.getUTCDay()];
        const month = months[dateOfVisit.getMonth()];
        const date  = dateOfVisit.getUTCDate();
        const year = dateOfVisit.getFullYear();
        const formattedDate = day+", "+month+" "+date+", "+year;
        console.log(formattedDate);
        if (formattedDate in accordianData) {
          console.log("in data")
        } else {
          accordianData[formattedDate] = invitedGuests[0].invitedGuestName;
        }
        console.log(accordianData);
      })
      .catch((error) => {console.log(error);})
  },[])





  return (
    <div className='add_guest_screen_container'>
      <Nav_Bar loggedIn={true} navHeader={'Pinnacle Lake Day Passes'} />
      <div className="add_guest_screen_module_container">

        <div className="laptop_add_guest_module">
          <div className="laptop_add_guest_invites_container">
            <Accordion>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Saturday, June 6, 2023</Accordion.Header>
                <Accordion.Body>
                  <Form>
                    <Form.Check type='radio' className='radio_button laptop_radio_button'  label="Matt Urbeck" defaultChecked />
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
            <Button className='invite_new_guests_button'>Invite New Guests</Button>
          </div>
          <div className="laptop_add_guest_invites_guest_info_container">
            <Form className='laptop_add_guest_form'>
              <Form.Group className="mb-3">
                <Form.Label className='laptop_add_guest_input_label laptop_add_guest_input_label_name float-start'>First and Last Name</Form.Label>
                <Form.Control className='laptop_add_guest_input_field' type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                <Dropdown className='laptop_add_guest_dropdown'>
                  <Dropdown.Toggle className='laptop_add_guest_dropdown_toggle' variant="outline-secondary" id="dropdown-basic">
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                      <div className="laptop_add_guest_dropdown_option_container">
                        <div className="laptop_add_guest_dropdown_option_name">Matt Urbeck</div>
                        <div className="laptop_add_guest_dropdown_option_number">(636) 439-9972</div>
                      </div>
                    </Dropdown.Item>
                    <NavDropdown.Divider />
                    <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                      <div className="laptop_add_guest_dropdown_option_container">
                        <div className="laptop_add_guest_dropdown_option_name">Adam Osvath</div>
                        <div className="laptop_add_guest_dropdown_option_number">(636) 240-5332</div>
                      </div>
                    </Dropdown.Item>
                    <NavDropdown.Divider />
                    <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                      <div className="laptop_add_guest_dropdown_option_container">
                        <div className="laptop_add_guest_dropdown_option_name">Tim Mehegan</div>
                        <div className="laptop_add_guest_dropdown_option_number">(314) 640-0239</div>
                      </div>
                    </Dropdown.Item>
                    <NavDropdown.Divider />
                    <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                      <div className="laptop_add_guest_dropdown_option_container">
                        <div className="laptop_add_guest_dropdown_option_name">Adam Osvath</div>
                        <div className="laptop_add_guest_dropdown_option_number">(636) 240-5332</div>
                      </div>
                    </Dropdown.Item>
                    <NavDropdown.Divider />
                    <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                      <div className="laptop_add_guest_dropdown_option_container">
                        <div className="laptop_add_guest_dropdown_option_name">Adam Osvath</div>
                        <div className="laptop_add_guest_dropdown_option_number">(636) 240-5332</div>
                      </div>
                    </Dropdown.Item>
                    <NavDropdown.Divider />
                    <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                      <div className="laptop_add_guest_dropdown_option_container">
                        <div className="laptop_add_guest_dropdown_option_name">Adam Osvath</div>
                        <div className="laptop_add_guest_dropdown_option_number">(636) 240-5332</div>
                      </div>
                    </Dropdown.Item>
                    <NavDropdown.Divider />
                    <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                      <div className="laptop_add_guest_dropdown_option_container">
                        <div className="laptop_add_guest_dropdown_option_name">Adam Osvath</div>
                        <div className="laptop_add_guest_dropdown_option_number">(636) 240-5332</div>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className='laptop_add_guest_input_label float-start'>Phone Number</Form.Label>
                <Form.Control className='laptop_add_guest_input_field' type="text" value={guestNumber} onChange={(e) => setGuestNumber(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className='laptop_add_guest_input_label float-start'>Date of Visit</Form.Label>
                <Form.Control className='laptop_add_guest_input_field' type="date" value={guestDateOfVisit} onChange={(e) => setGuestDateOfVisit(e.target.value)} />
              </Form.Group>
              <Form.Check type="checkbox"
                className='laptop_add_guest_checkbox'
                id="default-checkbox"
                label="Save this guest"
                onClick={(e) => setGuestSaved(e.target.checked)}
                checked={guestSaved}
              />
              <Button className='laptop_add_guest_button' type='submit' onClick={(e) => handleSubmit(e)}>Add Guest</Button>
            </Form>
          </div>
        </div>




        <div className="mobile_add_guest_module">
          <Button className='phone_logout_button' onClick={handleLogout}>
            <div className="phone_logout_button_container">
              <ArrowBackIosRoundedIcon className='phone_logout_arrow' />
              <p className="phone_logout_button_text">Logout</p>
            </div>
          </Button>
          <Form className='mobile_add_guest_form'>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label mobile_add_guest_input_label_name float-start'>First and Last Name</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              <Dropdown className='mobile_add_guest_dropdown'>
                <Dropdown.Toggle className='mobile_add_guest_dropdown_toggle' variant="outline-secondary" id="dropdown-basic">
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                    <div className="mobile_add_guest_dropdown_option_container">
                      <div className="mobile_add_guest_dropdown_option_name">Matt Urbeck</div>
                      <div className="mobile_add_guest_dropdown_option_number">(636) 439-9972</div>
                    </div>
                  </Dropdown.Item>
                  <NavDropdown.Divider />
                  <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                    <div className="mobile_add_guest_dropdown_option_container">
                      <div className="mobile_add_guest_dropdown_option_name">Adam Osvath</div>
                      <div className="mobile_add_guest_dropdown_option_number">(636) 240-5332</div>
                    </div>
                  </Dropdown.Item>
                  <NavDropdown.Divider />
                  <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                    <div className="mobile_add_guest_dropdown_option_container">
                      <div className="mobile_add_guest_dropdown_option_name">Tim Mehegan</div>
                      <div className="mobile_add_guest_dropdown_option_number">(314) 640-0239</div>
                    </div>
                  </Dropdown.Item>
                  <NavDropdown.Divider />
                  <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                    <div className="mobile_add_guest_dropdown_option_container">
                      <div className="mobile_add_guest_dropdown_option_name">Adam Osvath</div>
                      <div className="mobile_add_guest_dropdown_option_number">(636) 240-5332</div>
                    </div>
                  </Dropdown.Item>
                  <NavDropdown.Divider />
                  <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                    <div className="mobile_add_guest_dropdown_option_container">
                      <div className="mobile_add_guest_dropdown_option_name">Adam Osvath</div>
                      <div className="mobile_add_guest_dropdown_option_number">(636) 240-5332</div>
                    </div>
                  </Dropdown.Item>
                  <NavDropdown.Divider />
                  <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                    <div className="mobile_add_guest_dropdown_option_container">
                      <div className="mobile_add_guest_dropdown_option_name">Adam Osvath</div>
                      <div className="mobile_add_guest_dropdown_option_number">(636) 240-5332</div>
                    </div>
                  </Dropdown.Item>
                  <NavDropdown.Divider />
                  <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                    <div className="mobile_add_guest_dropdown_option_container">
                      <div className="mobile_add_guest_dropdown_option_name">Adam Osvath</div>
                      <div className="mobile_add_guest_dropdown_option_number">(636) 240-5332</div>
                    </div>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
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