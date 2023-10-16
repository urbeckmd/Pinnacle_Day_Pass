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
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState("");
  const [guestDateOfVisit, setGuestDateOfVisit] = useState("");
  const [guestSaved, setGuestSaved] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invitedGuestData, setInvitedGuestData] = useState([]);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);


  const sortArrayByDate = (dateArray) => {
    // Sort Invited Guests Accordian Object by Date
    for (let i = 0; i < dateArray.length; i++) {
      for (let j = 0; j < dateArray.length - i - 1; j++) {
        if (dateArray[j + 1]['date'] < dateArray[j]['date']) {
          [dateArray[j + 1], dateArray[j]] = [dateArray[j], dateArray[j + 1]]
        }
      }
    }
    return dateArray;
  }

  const handleAddGuest = (e) => {
    e.preventDefault();
    // Update the local array of guests
    var updatedInvitedGuestData = [...invitedGuestData];
    const utcDate = (guestDateOfVisit + "T00:00:00.000Z");
    var dateFoundInArray = false;
    updatedInvitedGuestData.forEach((date, index) => {
      // Check if date already exists
      // If so, append guest to list of guests already invited
      if (date.date == utcDate) {
        dateFoundInArray = true;
        updatedInvitedGuestData[index]['invitedGuestsForDate'].push({ "invitedGuestName": guestName, "invitedGuestNumber": guestNumber, "invitedGuestPassScanned": false, "invitedGuestPassSent": false });
      }
    })
    // Create a new accoridan header if date is not already made
    if (!dateFoundInArray) {
      updatedInvitedGuestData.push({ 'date': utcDate, 'invitedGuestsForDate': [{ "invitedGuestName": guestName, "invitedGuestNumber": guestNumber, "invitedGuestPassScanned": false, "invitedGuestPassSent": false }] })
    }
    updatedInvitedGuestData = sortArrayByDate(updatedInvitedGuestData);
    setInvitedGuestData(updatedInvitedGuestData);

    // Update the add guest array in the database
    const configuration = {
      method: "put",
      url: "http://localhost:3000/addGuest",
      data: {
        residentName: cookies.get("EMAIL"),
        guestName: guestName,
        guestNumber: guestNumber,
        guestDateOfVisit: utcDate,
        dateExists: dateFoundInArray,
      }
    }
    axios(configuration)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        alert(error)
        console.log(error);
      })

    // Update the saved guest array in db
    if (guestSaved) {
      const configuration = {
        method: "post",
        url: "http://localhost:3000/saveGuest",
        data: {
          residentName: cookies.get("EMAIL"),
          guestName: guestName,
          guestNumber: guestNumber,
          guestSaved: guestSaved,
        }
      }
      axios(configuration)
        .then((result) => {
          console.log(result);
        })
        .catch((error) => {
          alert(error)
          console.log(error);
        })
    }


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
        var invitedGuestList = result.data.data;
        invitedGuestList = sortArrayByDate(invitedGuestList);
        setInvitedGuestData(invitedGuestList);
        setLoading(false);
        // console.log(invitedGuestList);
      })
      .catch((error) => { console.log(error); })
  }, [])





  return (
    <div className='add_guest_screen_container'>
      <Nav_Bar loggedIn={true} navHeader={'Pinnacle Lake Day Passes'} />
      <div className="add_guest_screen_module_container">
        <div className="laptop_add_guest_module">
          <div className="laptop_add_guest_invites_container">
            <div className="laptop_add_guest_accordian_container">
              <Accordion>
                {(!loading) ? invitedGuestData.map((date, dateIndex) => {
                  const dateObject = new Date(date.date);
                  const day = weekday[dateObject.getUTCDay()];
                  const month = months[dateObject.getMonth()];
                  const dayNumber = dateObject.getUTCDate();
                  const year = dateObject.getFullYear();
                  return (
                    <>
                      <Accordion.Item eventKey={dateIndex}>
                        <Accordion.Header>{day + ", " + month + " " + dayNumber + ", " + year}</Accordion.Header>
                        <Accordion.Body>
                          <Form className='added_guest_form_container'>
                            {date["invitedGuestsForDate"].map((guest, guestIndex) => {
                              const name = guest.invitedGuestName;
                              const invited = guest.invitedGuestPassSent;
                              return (
                                <>
                                  <Form.Check type='radio' className='radio_button laptop_radio_button' label={name} checked={invited} />
                                  <hr />
                                </>
                              )
                            })}
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>
                    </>)
                }) : <p>loading</p>}

              </Accordion>
            </div>

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
              <Button className='laptop_add_guest_button' type='submit' onClick={(e) => handleAddGuest(e)}>Add Guest</Button>
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
            <Button className='mobile_add_guest_button float-end' type='submit' onClick={(e) => handleAddGuest(e)}>Add Guest</Button>
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
                {(!loading) ? invitedGuestData.map((date, dateIndex) => {
                  const dateObject = new Date(date.date);
                  const day = weekday[dateObject.getUTCDay()];
                  const month = months[dateObject.getMonth()];
                  const dayNumber = dateObject.getUTCDate();
                  const year = dateObject.getFullYear();
                  return (
                    <>
                      <Accordion.Item eventKey={dateIndex}>
                        <Accordion.Header>{day + ", " + month + " " + dayNumber + ", " + year}</Accordion.Header>
                        <Accordion.Body>
                          <Form className='added_guest_form_container'>
                            {date["invitedGuestsForDate"].map((guest, guestIndex) => {
                              const name = guest.invitedGuestName;
                              const invited = guest.invitedGuestPassSent;
                              return (
                                <>
                                  <Form.Check type='radio' className='radio_button' label={name} checked={invited} />
                                  <hr />
                                </>
                              )
                            })}
                          </Form>
                        </Accordion.Body>
                      </Accordion.Item>
                    </>)
                }) : <p>loading</p>}

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