import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Pagination from 'react-bootstrap/Pagination';
import "react-datepicker/dist/react-datepicker.css";
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './Button.css';
import './FlexBox.css';

const SubmissionPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  // State list submission
  const [submissions, setSubmissions] = useState([]);

  // Get all data first render
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
        setCurrentPage(1);
      })
      .catch(err => console.log(err));
  }, []);

  // Delete submission
  const handleDelete = (id) => {
    if (window.confirm('Delete this item?') == true) {
      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      };
      fetch(`api/submission/${id}`, requestOptions)
        .then(res => {
          if (res.ok) {
            const remainSubmissions = submissions.filter((item) => item.Id !== id);
            console.log(remainSubmissions);
            setSubmissions(remainSubmissions);
          }
          else if (res.status === 401) navigate('/');
          else throw new Error(res.status);
        })
        .catch(err => console.log(err));
    }
  }

  // Control show/hide modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Open modal
  const handleOpenEditForm = (id) => {
    handleShow();
    setEditId(id);
  }

  // Edit submission
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
        const updatedSubmissions = submissions.map((item) => {
          if (item.Id === id)
            // Update the value for the specific item
            return data;
          return item;
        });
        // Update the state with the new table data
        setSubmissions(updatedSubmissions);
      })
      .catch(err => console.log(err));
  }

  // State item to edit
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

  // Control change input value
  const handleInputChange = (event) => {
    console.log(event);
    const { name, value } = event.target;
    setEditObject(prevUser => ({ ...prevUser, [name]: value }));
  };

  // Control change datetime picker
  const handlePickerChange = (name, date) => {
    setEditObject(prevUser => ({ ...prevUser, [name]: date.format() }));
  };

  // Paging variables
  const itemsPerPage = 4;

  // State paging
  const [pagingSubmissions, setPagingSubmissions] = useState([]);
  const [pageNumbers, setPageNumbers] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pageNumbers[pageNumbers.length - 1])
      setCurrentPage(pageNumber);
  };

  // Controll pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPagingSubmissions(submissions.slice(startIndex, endIndex));

    const pageCount = Math.ceil(submissions.length / itemsPerPage);
    setPageNumbers([...Array(pageCount).keys()].map((n) => n + 1));
  }, [currentPage, submissions]);

  // Submit form
  const handleSubmitForm = (id) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    fetch(`api/submission/${id}/submit`, requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        const updatedSubmissions = submissions.map((item) => {
          if (item.Id === id)
            // Update the value for the specific item
            return data;
          return item;
        });
        // Update the state with the new table data
        setSubmissions(updatedSubmissions);
      })
      .catch(err => console.log(err));
  }

  return (
    <div className='container'>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <div className='row'>
        <div className='col-md-12'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>Id</th>
                <th>Form name</th>
                <th>Participants</th>
                <th>Location</th>
                <th>FromTime</th>
                <th>ToTime</th>
                <th>Status</th>
                <th>Note</th>
                <th colSpan={3}>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                pagingSubmissions.map((item) => (
                  <tr key={item.Id}>
                    <td>{item.Id}</td>
                    <td>{item.Form.Name}</td>
                    <td>{item.Participant.Name}</td>
                    <td>{item.Location.Name}</td>
                    <td>{moment(item.FromTime).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td>{moment(item.ToTime).format('DD/MM/YYYY HH:mm:ss')}</td>
                    {/* <td>{item.Status}</td> */}
                    <td>
                      {
                        item.Status === 'draft'
                          ? (<Tag icon={<ExclamationCircleOutlined />} color="default">{item.Status}</Tag>)
                          : item.Status === 'confirm'
                            ? (<Tag icon={<SyncOutlined spin />} color="processing">{item.Status}</Tag>)
                            : item.Status === 'approve'
                              ? (<Tag icon={<CheckCircleOutlined />} color="success">{item.Status}</Tag>)
                              : item.Status === 'reject'
                                ? (<Tag icon={<CloseCircleOutlined />} color="error">{item.Status}</Tag>)
                                : ''
                      }
                    </td>
                    <td>{item.Note}</td>
                    <td colSpan={3}>
                      {
                        item.Status === 'draft'
                          ? (<Button variant='success' onClick={() => handleSubmitForm(item.Id)}>Submit</Button>)
                          : ''
                      }
                      {
                        item.Status === 'draft'
                          ? (<Button variant='primary' onClick={() => handleOpenEditForm(item.Id)}>Edit</Button>)
                          : ''
                      }
                      {
                        item.Status === 'draft' || item.Status === 'confirm'
                          ? (<Button variant='danger' onClick={() => handleDelete(item.Id)}>Delete</Button>)
                          : ''
                      }
                      {/* {
                        item.Status === 'approve'
                          ? (<CheckCircleTwoTone twoToneColor="#52c41a" />)
                          : ''
                      }
                      {
                        item.Status === 'reject'
                          ? (<CloseCircleTwoTone twoToneColor="#f5222d" />)
                          : ''
                      } */}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <div className="pagination">
            <Pagination>
              {
                currentPage > 1
                  ? (
                    <>
                      <Pagination.First onClick={() => handlePageChange(1)} />
                      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} />
                      <Pagination.Item onClick={() => handlePageChange(1)}>{1}</Pagination.Item>
                      <Pagination.Ellipsis />
                    </>
                  )
                  : (
                    ''
                  )
              }
              {
                pageNumbers.map((pageNumber) => {
                  if (currentPage == pageNumber == 1
                    || currentPage == pageNumber == pageNumbers[pageNumbers.length - 1]
                    || (pageNumber > 1 && pageNumber < pageNumbers[pageNumbers.length - 1])) {
                    return (
                      <Pagination.Item
                        key={pageNumber}
                        active={pageNumber === currentPage}
                        onClick={() => handlePageChange(pageNumber)}>
                        {pageNumber}
                      </Pagination.Item>
                    );
                  }
                })
              }
              {
                currentPage < pageNumbers[pageNumbers.length - 1]
                  ? (
                    <>
                      <Pagination.Ellipsis />
                      <Pagination.Item onClick={() => handlePageChange(pageNumbers[pageNumbers.length - 1])}>{pageNumbers[pageNumbers.length - 1]}</Pagination.Item>
                      <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} />
                      <Pagination.Last onClick={() => handlePageChange(pageNumbers[pageNumbers.length - 1])} />
                    </>
                  )
                  : (
                    ''
                  )
              }
            </Pagination>
          </div>
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
                    <DateTime
                      value={moment(editObject.FromTime)}
                      dateFormat="DD/MM/YYYY"
                      timeFormat="HH:mm"
                      timeConstraints={{
                        minutes: { step: 10 }
                      }}
                      onChange={(date) => handlePickerChange('FromTime', date)}
                    />
                    <Form.Label>To</Form.Label>
                    <DateTime
                      value={moment(editObject.ToTime)}
                      dateFormat="DD/MM/YYYY"
                      timeFormat="HH:mm"
                      timeConstraints={{
                        minutes: { step: 10 }
                      }}
                      onChange={(date) => handlePickerChange('ToTime', date)}
                    />
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
    </div>
  )
}

export default SubmissionPage;