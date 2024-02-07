import React, { useState, useEffect } from 'react'
import Nav_Bar from '../Universal_Components/Nav_Bar'
import Phone_Nav_Bar from '../Universal_Components/Phone_Nav_Bar';
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
import AddIcon from '@mui/icons-material/Add';
import moment from "moment";
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';


const cookies = new Cookies();
moment().format(); 

function Add_Guest_Screen() {
  const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [guestName, setGuestName] = useState("");
  const [guestNumber, setGuestNumber] = useState("(___) ___-____");
  const [guestDateOfVisit, setGuestDateOfVisit] = useState("");
  const [guestSaved, setGuestSaved] = useState(false);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [invitedGuestData, setInvitedGuestData] = useState([]);
  const [savedGuestData, setSavedGuestData] = useState([]);
  const [showAddedGuestNotification, setShowAddedGuestNotification] = useState(false);
  const [notificationName, setNotificationName] = useState("");
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

  const updateInvitedGuest = () => {
    // Update the local array of guests
    var updatedInvitedGuestData = [...invitedGuestData];
    const utcDate = (guestDateOfVisit)
    console.log('utcDate',utcDate);
    var now = moment().format('YYYY-MM-DD')
    console.log('moment', now);
    console.log(utcDate >= now);

    var dateFoundInArray = false;
    updatedInvitedGuestData.forEach((date, index) => {
      console.log('date',date.date);
      // Check if date already exists
      // If so, append guest to list of guests already invited
      if (date.date == utcDate) {
        dateFoundInArray = true;
        updatedInvitedGuestData[index]['invitedGuestsForDate'].push({ "invitedGuestName": guestName, "invitedGuestNumber": guestNumber, "invitedGuestPassScanned": false, "invitedGuestPassSent": false });
      }
    })
    // Create a new accordian header if date is not already made
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
        residentId: cookies.get("RESIDENT_ID"),
        residentEmail: cookies.get("RESIDENT_EMAIL"),
        residentFirstName: cookies.get("RESIDENT_FIRSTNAME"),
        residentLastName: cookies.get("RESIDENT_LASTNAME"),
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
  }


  const updateSavedGuest = () => {
    // Update Saved Guest array locally
    if (guestSaved) {
      var updatedSavedGuestData = [...savedGuestData];
      const newSavedGuest = { 'savedGuestName': guestName, 'savedGuestNumber': guestNumber };
      const newSavedGuestNumber = Object.values(newSavedGuest)[1]
      var numberAlreadySaved = false;
      updatedSavedGuestData.forEach((guest, index) => {
        if (Object.values(guest)[1] == newSavedGuestNumber) {
          numberAlreadySaved = true;
        }
      })
      if (!numberAlreadySaved) {
        updatedSavedGuestData.push(newSavedGuest);
        setSavedGuestData(updatedSavedGuestData)
      }
    }
    // Update the saved guest array in db
    if (guestSaved) {
      const configuration = {
        method: "post",
        url: "http://localhost:3000/saveGuest",
        data: {
          residentId: cookies.get("RESIDENT_ID"),
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


  const handleAddGuest = (e) => {
    e.preventDefault();

    // Make sure date is in future
    const today = moment().format('YYYY-MM-DD')
    if (today > guestDateOfVisit) {
      alert("select future date")
    } else {
      updateInvitedGuest()
      updateSavedGuest()
      setNotificationName(guestName)
      // Clear input fields
      setGuestName("");
      setGuestNumber("(___) ___-____");
      setShowAddedGuestNotification(true)
      const timer = setTimeout(() => {
        // setShowAddedGuestNotification(false)
      }, 3000);
      return () => clearTimeout(timer);
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


  const getInvitedGuests = (currentUser) => {
    // Get Array of Invited Guests for logged in user
    const invitedGuestConfiguration = {
      method: "get",
      params: {
        residentId: currentUser
      },
      url: "http://localhost:3000/getInvitedGuests",
    }
    axios(invitedGuestConfiguration)
      .then((result) => {
        var invitedGuestList = result.data.data;
        invitedGuestList = sortArrayByDate(invitedGuestList);
        setInvitedGuestData(invitedGuestList);
        setLoading(false);
      })
      .catch((error) => { console.log(error); })
  }




  const getSavedGuests = (currentUser) => {
    // Get array of saved guests
    const addedSavedConfiguration = {
      method: "get",
      params: {
        residentId: currentUser
      },
      url: "http://localhost:3000/getSavedGuests"
    }
    axios(addedSavedConfiguration)
      .then((result) => {
        var savedGuestList = result.data.data;
        setSavedGuestData(savedGuestList);
        // console.log(savedGuestData);
      })
      .catch((error) => {
        console.log(error);
      })
  }


  const handleGuestNumber = (e) => {
    const isNumber = /^[0-9]$/i.test(e.key);
    const rawNumber = guestNumber.replace(/[^0-9]/g, "");
    // Update number if key is a digit
    if ((isNumber) && (rawNumber.length < 10)) {
      const index_of_dash = guestNumber.indexOf('_');
      const firstPartOfNumber = guestNumber.substring(0, index_of_dash);
      const lastPartOfNumber = guestNumber.substring(index_of_dash+1);
      const newNumber = firstPartOfNumber + e.key + lastPartOfNumber;
      console.log(newNumber);
      setGuestNumber(newNumber)
    }
    // Update number if key is backspace
    if (e.key == 'Backspace' && (/[0-9]/.test(guestNumber))) {
      console.log('BACKSPACE ENTERED');
      const index_of_last_digit = guestNumber.lastIndexOf(rawNumber.slice(-1));
      const firstPartOfNumber = guestNumber.substring(0, index_of_last_digit);
      const lastPartOfNumber = guestNumber.substring(index_of_last_digit+1);
      const newNumber = firstPartOfNumber + "_" + lastPartOfNumber;
      setGuestNumber(newNumber);
    }
    
  }


  useEffect(() => {
    // Get logged in user from cookies and list of saved guests and invited guests
    const currentUser = cookies.get("RESIDENT_ID");
    getInvitedGuests(currentUser);
    getSavedGuests(currentUser);
  }, [])





  return (
    <div className='add_guest_screen_container'>
      <span className="laptop_nav_bar">
        <Nav_Bar loggedIn={true} />
      </span>
      <span className="phone_nav_bar">
        <Phone_Nav_Bar loggedIn={true} />
      </span>
      <div className="add_guest_screen_module_container">
        <div className="laptop_add_guest_module">
          <div className="laptop_add_guest_invites_container">
            <div className="laptop_add_guest_accordian_container">
              {(invitedGuestData.length != 0) ?
                <Accordion>
                  {(!loading) ? invitedGuestData.map((date, dateIndex) => {
                    const invitedDate = moment(date.date, 'YYYY-MM-DD').format("dddd, MMMM D, YYYY")
                    return (
                      <>
                        <Accordion.Item eventKey={dateIndex}>
                          <Accordion.Header>{invitedDate}</Accordion.Header>
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

                </Accordion> : <h1 className='laptop_add_guest_no_guest_added_label'>No guests have been invited yet.</h1>

              }

            </div>

            {/* <Button className='invite_new_guests_button'>Invite New Guests</Button> */}
          </div>
          <div className="laptop_add_guest_invites_guest_info_container">
            <Form className='laptop_add_guest_form'>
              <Form.Group className="mb-3">
                <Form.Label className='laptop_add_guest_input_label laptop_add_guest_input_label_name float-start'>First and Last Name</Form.Label>
                <Form.Control className='laptop_add_guest_input_field' spellCheck="false" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                <Dropdown className='laptop_add_guest_dropdown'>
                  <Dropdown.Toggle className='laptop_add_guest_dropdown_toggle' variant="outline-secondary" id="dropdown-basic">
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {savedGuestData.map((guest, index) => {
                      return (
                        <>
                          <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                            <div className="laptop_add_guest_dropdown_option_container">
                              <div className="laptop_add_guest_dropdown_option_name">{guest.savedGuestName}</div>
                              <div className="laptop_add_guest_dropdown_option_number">{guest.savedGuestNumber}</div>
                            </div>
                          </Dropdown.Item>
                          <NavDropdown.Divider />
                        </>
                      )
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className='laptop_add_guest_input_label float-start'>Phone Number</Form.Label>
                <Form.Control className='laptop_add_guest_input_field laptop_add_guest_number_input_field' type="text" value={guestNumber} onKeyDown={(e) => handleGuestNumber(e)} />
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
              <Button className='laptop_add_guest_button' type='submit' onClick={(e) => handleAddGuest(e)}><AddIcon className='laptop_add_guest_button_plus'/>Add</Button>
            </Form>
          </div>
        </div>




        <div className="mobile_add_guest_module">
          {/* <Button className='phone_logout_button' onClick={handleLogout}>
            <div className="phone_logout_button_container">
              <ArrowBackIosRoundedIcon className='phone_logout_arrow' />
              <p className="phone_logout_button_text">Logout</p>
            </div>
          </Button> */}
          <Form className='mobile_add_guest_form'>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label mobile_add_guest_input_label_name float-start'>First and Last Name</Form.Label>
              <Form.Control className='mobile_add_guest_input_field' spellCheck="false" type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
              <Dropdown className='mobile_add_guest_dropdown'>
                <Dropdown.Toggle className='mobile_add_guest_dropdown_toggle' variant="outline-secondary" id="dropdown-basic">
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {savedGuestData.map((guest, index) => {
                    return (
                      <>
                        <Dropdown.Item onClick={(e) => handleDropdownSelect(e)}>
                          <div className="mobile_add_guest_dropdown_option_container">
                            <div className="mobile_add_guest_dropdown_option_name">{guest.savedGuestName}</div>
                            <div className="mobile_add_guest_dropdown_option_number">{guest.savedGuestNumber}</div>
                          </div>
                        </Dropdown.Item>
                        <NavDropdown.Divider />
                      </>
                    )
                  })}
                </Dropdown.Menu>
              </Dropdown>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className='mobile_add_guest_input_label float-start'>Phone Number</Form.Label>
              <Form.Control className='mobile_add_guest_input_field mobile_add_guest_number_input_field' type="text" value={guestNumber} onKeyDown={(e) => handleGuestNumber(e)} />
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
            <Button className='mobile_add_guest_button float-end' type='submit' onClick={(e) => handleAddGuest(e)}><AddIcon className='mobile_add_guest_button_plus'/>Add </Button>
          </Form>
          {/* <Button variant="primary" onClick={handleShow} className='mobile_add_guest_button mobile_add_guest_offcanvas_button'>
            View Invited Guests
          </Button> */}

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
                        <Accordion.Header className='mobile_accordian_header'>{day + ", " + month + " " + dayNumber + ", " + year}</Accordion.Header>
                        <Accordion.Body className='mobile_accordian_body'>
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
              {/* <Button className='mobile_add_guest_button mobile_add_guest_send_new_invites_button'>Send New Invites</Button> */}
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </div>
        {(showAddedGuestNotification) &&
        <div className="mobile_view_guest_add_notification" onClick={handleShow}>
          {notificationName} has been added
        </div>
        }


      <div className="mobile_view_guests_button_container" onClick={handleShow}>
        View Invited Guests
      </div>
    </div>

  )
}

export default Add_Guest_Screen