import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
// import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Pagination from 'react-bootstrap/Pagination';
import "react-datepicker/dist/react-datepicker.css";
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import './Button.css';
import './FlexBox.css';
//import { addInclude, addSort, build, param, reset } from './PagingParam.jsx';
import usePagingParam from './PagingParam.jsx';

const SubmissionPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  // Init variables for search
  const { addInclude, addSort, build, param } = usePagingParam();

  // State list submission
  const [submissions, setSubmissions] = useState([]);

  // Get all data first render
  useEffect(() => {
    addInclude({ Name: 'Form' });
    setTimeout(() => {
      build();
    }, 2000);

    // const requestOptions = {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': 'Bearer ' + token
    //   },
    //   body: JSON.stringify(param)
    // };
    // fetch('api/submission/search', requestOptions)
    //   .then(res => {
    //     if (res.ok) {
    //       return res.json();
    //     }
    //     else if (res.status === 401) navigate('/');
    //     else throw new Error(res.status);
    //   })
    //   .then(data => {
    //     setSubmissions(data);
    //     setCurrentPage(1);
    //   })
    //   .catch(err => console.log(err));
  }, []);

  // Control show/hide modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // State add or edit
  const [action, setAction] = useState([]);
  const emptyObject = {
    FormId: '',
    ParticipantId: '',
    LocationId: '',
    FromTime: '',
    ToTime: '',
    Status: '',
    Note: ''
  }
  const [saveObject, setSaveObject] = useState(emptyObject);

  // State item to edit
  const [editId, setEditId] = useState([]);
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
          setSaveObject(data);
          setSelectedForm(forms.find((item) => item.value === data.FormId));
        })
        .catch(err => console.log(err));
    }
  }, [editId]);

  // Open modal
  const handleOpenForm = (id) => {
    if (id === undefined) {
      setSaveObject([]);
      setAction('add');
    } else {
      setEditId(id);
      setAction('edit');
    }
    handleShow();
  }

  // Add or edit submission
  const handleAddOrEdit = () => {
    if (action === 'add') handleAdd();
    else handleEdit(editId);
  }

  const handleAdd = () => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(saveObject)
    };
    fetch(`api/submission`, requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        handleClose();
        setSubmissions([...submissions.slice(0, 0), data, ...submissions.slice(0)]);
      })
      .catch(err => console.log(err));
  }

  const handleEdit = (id) => {
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(saveObject)
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
          if (res.ok) setSubmissions(submissions.filter((item) => item.Id !== id));
          else if (res.status === 401) navigate('/');
          else throw new Error(res.status);
        })
        .catch(err => console.log(err));
    }
  }

  // Control change input value
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSaveObject(currentObject => ({ ...currentObject, [name]: value }));
  };

  // Control change datetime picker
  const handlePickerChange = (name, date) => {
    setSaveObject(currentObject => ({ ...currentObject, [name]: date.format() }));
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

  // State forms, participants and locations  
  const [forms, setForm] = useState([]);
  const [selectedForm, setSelectedForm] = useState([]);
  const [participants, setParticipant] = useState([]);
  const [locations, setLocation] = useState([]);

  const getForms = () => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    fetch('api/form', requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        let select = [];
        data.map((item) => {
          select.push({
            value: item.Id,
            label: item.Name
          });
        })
        setForm(select);
      })
      .catch(err => console.log(err));
  }

  const getParticipants = () => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    fetch('api/participant', requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        let select = [];
        data.map((item) => {
          select.push({
            value: item.Id,
            label: item.Name
          });
        })
        setParticipant(select);
      })
      .catch(err => console.log(err));
  }

  const getLocations = () => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    fetch('api/location', requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        let select = [];
        data.map((item) => {
          select.push({
            value: item.Id,
            label: item.Name
          });
        })
        setLocation(select);
      })
      .catch(err => console.log(err));
  }

  useEffect(() => {
    getForms();
    getParticipants();
    getLocations();
  }, [])

  const Checkbox = ({ children, ...props }) => (
    <label style={{ marginRight: '1em' }}>
      <input type="checkbox" {...props} />
      {children}
    </label>
  );

  const handleSelectChange = (name, option) => {
    setSaveObject(currentObject => ({ ...currentObject, [name]: option.value }));
  }

  return (
    <div className='container'>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <Button type='primary' onClick={() => handleOpenForm()}>Add</Button>
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
                          ? (<Button onClick={() => handleSubmitForm(item.Id)}>Submit</Button>)
                          : ''
                      }
                      {
                        item.Status === 'draft'
                          ? (<Button type='primary' onClick={() => handleOpenForm(item.Id)}>Edit</Button>)
                          : ''
                      }
                      {
                        item.Status === 'draft' || item.Status === 'confirm'
                          ? (<Button type='primary' danger onClick={() => handleDelete(item.Id)}>Delete</Button>)
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
                <Modal.Title>{action === 'add' ? 'Create' : `Edit ${editId}`}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group className="mb-3" controlId="formSubmission">
                    <Form.Label>Form name</Form.Label>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      value={forms.find((item) => item.value === saveObject.FormId)}
                      name="color"
                      options={forms}
                      onChange={(option) => { handleSelectChange('FormId', option) }}
                    />

                    <Form.Label>Participants</Form.Label>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      value={participants.find((item) => item.value === saveObject.ParticipantId)}
                      name="color"
                      options={participants}
                      onChange={(option) => { handleSelectChange('ParticipantId', option) }}
                    />

                    <Form.Label>Location</Form.Label>
                    <Select
                      className="basic-single"
                      classNamePrefix="select"
                      value={locations.find((item) => item.value === saveObject.LocationId)}
                      name="color"
                      options={locations}
                      onChange={(option) => { handleSelectChange('LocationId', option) }}
                    />

                    <Form.Label>Budget</Form.Label>
                    <Form.Control type="text" disabled={action === 'edit'} value={saveObject.Form?.Budget} />

                    <Form.Label>From</Form.Label>
                    <DateTime
                      value={action === 'add' ? '' : moment(saveObject.FromTime)}
                      dateFormat="DD/MM/YYYY"
                      timeFormat="HH:mm"
                      timeConstraints={{
                        minutes: { step: 10 }
                      }}
                      isValidDate={(current) => {
                        return current.startOf('day').isSameOrAfter(moment().startOf('day'));
                      }}
                      onChange={(date) => handlePickerChange('FromTime', date)}
                    />

                    <Form.Label>To</Form.Label>
                    <DateTime
                      value={action === 'add' ? '' : moment(saveObject.ToTime)}
                      dateFormat="DD/MM/YYYY"
                      timeFormat="HH:mm"
                      timeConstraints={{
                        minutes: { step: 10 }
                      }}
                      onChange={(date) => handlePickerChange('ToTime', date)}
                    />

                    <Form.Label>Note</Form.Label>
                    <Form.Control type="text" name='Note' value={saveObject.Note} onChange={handleInputChange} />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button type='text' onClick={handleClose}>
                  Close
                </Button>
                <Button type='primary' onClick={() => { handleAddOrEdit() }}>
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