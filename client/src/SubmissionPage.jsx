import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
// import Button from 'react-bootstrap/Button';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import { Link, useNavigate } from "react-router-dom";
import './Button.css';
import CustomModal from './CustomModal';
import CustomPagination from './CustomPagination.jsx';
import './FlexBox.css';
import usePagingView from './Paging.jsx';
import usePagingParam from './PagingParam.jsx';

const SubmissionPage = ({ data, token }) => {
  const navigate = useNavigate();

  // Init variables for api request
  const { addSearch, addInclude, addSort, build, reset, param } = usePagingParam();

  // State list submission
  const [submissions, setSubmissions] = useState([]);

  // Get all data first render
  useEffect(() => {
    setSubmissions(data);
    setCurrentPage(1);
  }, [data]);

  // State action (add or edit) and object to save
  const [action, setAction] = useState([]);
  const [saveObject, setSaveObject] = useState({});
  const [formModal, setFormModal] = useState({});

  // State item to edit
  const [editId, setEditId] = useState([]);
  useEffect(() => {
    if (editId.length !== 0) {
      addInclude({ TableName: 'Form' });
      build();
      const requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(param.current)
      };
      fetch(`api/submission/${editId}`, requestOptions)
        .then(res => {
          if (res.ok) return res.json();
          else if (res.status === 401) navigate('/');
          else throw new Error(res.status);
        })
        .then(data => {
          reset();
          setSaveObject(data);
          setFormModal({
            action: 'edit',
            editedId: editId,
            saveObject: data,
          });
          handleShow();
        })
        .catch(err => console.log(err));
    }
  }, [editId]);

  // Control show/hide modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Open modal
  const handleOpenForm = (id) => {
    if (id === undefined) {
      setAction('add');
      setSaveObject([]);
    } else {
      setAction('edit');
      setEditId(id);
    }
  }

  // Add or edit submission
  const handleAddOrEdit = () => {
    if (action === 'add')
      handleAdd();
    else
      handleEdit(editId);
  }
  // Add submission
  const handleAdd = () => {
    console.log(saveObject);
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
  // Edit submission
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

  // // Control change input value
  // const handleInputChange = (event) => {
  //   const { name, value } = event.target;
  //   setSaveObject(currentObject => ({ ...currentObject, [name]: value }));
  // };
  // // Control change datetime picker
  // const handlePickerChange = (name, date) => {
  //   setSaveObject(currentObject => ({ ...currentObject, [name]: date.format() }));
  // };
  // // Control change select
  // const handleSelectChange = (name, option) => {
  //   setSaveObject(currentObject => ({ ...currentObject, [name]: option.value }));

  //   if (name === "FormId") {
  //     let budget = dataForms.find((item) => item.Id === option.value).Budget;
  //     setSaveObject(currentObject => ({ ...currentObject, "Form": { "Budget": budget } }));
  //   }
  // }

  // State paging
  const [pagingSubmissions, setPagingSubmissions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  // Controll pagination
  const { pagingView, paging } = usePagingView();
  useEffect(() => {
    paging(submissions, currentPage);
    setPagingSubmissions(pagingView.current);
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
  const [dataForms, setDataForms] = useState([]);
  const [participants, setParticipant] = useState([]);
  const [dataParticipants, setDataParticipants] = useState([]);
  const [locations, setLocation] = useState([]);
  const [dataLocations, setDataLocations] = useState([]);
  // Get forms
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
        setDataForms(data);
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
  // Get participants
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
        setDataParticipants(data);
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
  // Get locations
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
        setDataLocations(data);
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
  // Default call when render
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
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <CustomPagination data={submissions} triggerView={setCurrentPage} />
          <CustomModal show={show} formModal={formModal} />
          {/* {
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
                    <Form.Control type="text" disabled value={saveObject.Form?.Budget} />

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
                      isValidDate={(current) => {
                        return current.startOf('day').isSameOrAfter(moment().startOf('day'));
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
          } */}
        </div>
      </div>
    </div>
  )
}

export default SubmissionPage;