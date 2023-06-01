import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import "react-datepicker/dist/react-datepicker.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './Button.css';
import './FlexBox.css';

const SubmissionPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    fetch('api/submission', requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        setSubmissions(data);
      })
      .catch(err => console.log(err));
  }, []);

  const handleOpenEditForm = (id) => {
    handleShow();
    setEditId(id);
  }

  const handleDelete = (id) => {
    console.log(id);
  }

  const handleEdit = (id) => {
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(editObject)
    };
    fetch(`api/submission`, requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        handleClose();
        const updatedSubmissions = submissions.map((row) => {
          if (row.Id === id) {
            // update the value for the specific row
            return data;
          }
          return row;
        });
        // update the state with the new table data
        setSubmissions(updatedSubmissions);
      })
      .catch(err => console.log(err));
  }

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [editId, setEditId] = useState([]);
  const [editObject, setEditObject] = useState([]);
  useEffect(() => {
    if (editId.length !== 0) {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      };
      fetch(`api/submission/${editId}`, requestOptions)
        .then(res => {
          if (res.ok) return res.json();
          else if (res.status === 401) navigate('/');
          else throw new Error(res.status);
        })
        .then(data => {
          setEditObject(data);
        })
        .catch(err => console.log(err));
    }
  }, [editId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditObject(prevUser => ({ ...prevUser, [name]: value }));
  };

  return (
    <>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <div className='row'>
        <div className='col-md-12'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>FormId</th>
                <th>ParticipantId</th>
                <th>LocationId</th>
                <th>FromTime</th>
                <th>ToTime</th>
                <th>Status</th>
                <th>Note</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                submissions.map((item) => (
                  <tr key={item.Id}>
                    <td>{item.FormId}</td>
                    <td>{item.ParticipantId}</td>
                    <td>{item.LocationId}</td>
                    <td>{moment(item.FromTime).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td>{moment(item.ToTime).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td>{item.Status}</td>
                    <td>{item.Note}</td>
                    <td colSpan={2}>
                      <button className='btn btn-primary' onClick={() => handleOpenEditForm(item.Id)}>Edit</button>
                      <button className='btn btn-danger' onClick={() => handleDelete(item.Id)}>Delete</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          {
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Edit submission {editId}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formSubmission">
                    <Form.Label>Form name</Form.Label>
                    <Form.Control type="text" disabled value={editObject.Form?.Name} />
                    <Form.Label>Participants</Form.Label>
                    <Form.Control type="text" disabled value={editObject.Participant?.Name} />
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" disabled value={editObject.Location?.Name + ' (' + editObject.Location?.Address + ')'} />
                    <Form.Label>Budget</Form.Label>
                    <Form.Control type="text" disabled value={editObject.Form?.Budget} />
                    <Form.Label>From</Form.Label>
                    {/* <Form.Control type="date" name='FromTime' value={moment(editObject.FromTime).format('DD/MM/YYYY HH:mm:ss')} /> */}
                    <DateTimePicker value={editObject.FromTime} />
                    <Form.Label>To</Form.Label>
                    <Form.Control type="text" name='ToTime' value={moment(editObject.ToTime).format('DD/MM/YYYY HH:mm:ss')} />
                    <Form.Label>Note</Form.Label>
                    <Form.Control type="text" name='Note' value={editObject.Note} onChange={handleInputChange} />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => { handleEdit(editId) }}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>
          }
        </div>
      </div>
    </>
  )
}

export default SubmissionPage;