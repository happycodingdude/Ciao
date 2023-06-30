import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import { Link, useNavigate } from "react-router-dom";
import './Button.css';
import CustomModal from './CustomModal';
import './FlexBox.css';
import PaginationBar from './PaginationBar.jsx';
import usePagingView from './Paging.jsx';
import usePagingParam from './PagingParam.jsx';

const SubmissionPage = ({ token }) => {
  const navigate = useNavigate();

  // Init variables for api request
  const { addSearch, addInclude, addSort, build, reset, param } = usePagingParam();

  // State list submission
  const [submissions, setSubmissions] = useState([]);

  // Get all data first render
  useEffect(() => {
    addInclude({ TableName: 'Form' });
    addInclude({ TableName: 'Participant' });
    addInclude({ TableName: 'Location' });
    addSort({ FieldName: 'CreateTime', SortType: 'desc' });
    build();

    let requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(param.current)
    };

    fetch('api/submission/search', requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        reset();
        setSubmissions(data);
        setCurrentPage(1);
      })
      .catch(err => console.log(err));
  }, []);

  // State object to save, data to open modal
  const [saveObject, setSaveObject] = useState({});
  const [formParam, setFormParam] = useState({});

  // State item to edit
  const [editId, setEditId] = useState(0);
  useEffect(() => {
    if (editId !== 0) {
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
          handleShowModal(data);
        })
        .catch(err => console.log(err));
    }
  }, [editId]);

  // Prepare param and show modal
  const handleShowModal = (data) => {
    let formParam = {
      formAction: data === undefined ? 'add' : 'edit',
      formId: editId,
      formData: [
        {
          ItemName: 'Form',
          ItemField: 'FormId',
          ItemValue: data === undefined ? '' : selectForms.find((item) => item.value === data.FormId),
          ItemType: 'select',
          ItemOptions: selectForms,
          ItemNameToChange: 'Budget',
          ItemValueToChange: forms
        },
        {
          ItemName: 'Participant',
          ItemField: 'ParticipantId',
          ItemValue: data === undefined ? '' : selectParticipants.find((item) => item.value === data.ParticipantId),
          ItemType: 'select',
          ItemOptions: selectParticipants
        },
        {
          ItemName: 'Location',
          ItemField: 'LocationId',
          ItemValue: data === undefined ? '' : selectLocations.find((item) => item.value === data.LocationId),
          ItemType: 'select',
          ItemOptions: selectLocations
        },
        {
          ItemName: 'Budget',
          ItemValue: data === undefined ? '' : data['Form']['Budget'],
          ItemType: 'input',
          ItemDisable: true
        },
        {
          ItemName: 'FromTime',
          ItemValue: data === undefined ? '' : data['FromTime'],
          ItemType: 'picker'
        },
        {
          ItemName: 'ToTime',
          ItemValue: data === undefined ? '' : data['ToTime'],
          ItemType: 'picker'
        },
        {
          ItemName: 'Note',
          ItemValue: data === undefined ? '' : data['Note'],
          ItemType: 'input'
        }
      ],
    }
    setFormParam(formParam);
    handleShow();
  }

  // Control show/hide modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Open modal
  const handleOpenForm = (id) => {
    if (id === undefined) {
      setSaveObject({});
      handleShowModal();
    } else {
      setEditId(prev => {
        if (id !== prev) {
          return id;
        }
        handleShowModal(saveObject);
        return prev;
      });
    }
  }

  // Add or edit
  const handleSaveChanges = (action) => {
    if (action === 'add')
      handleAdd();
    else
      handleEdit(editId);
  }
  // Add
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
  // Edit
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
        const updated = submissions.map((item) => {
          if (item.Id === id)
            // Update the value for the specific item
            return data;
          return item;
        });
        // Update the state with the new table data
        setSubmissions(updated);
      })
      .catch(err => console.log(err));
  }
  // Delete
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

  // State paging
  const [pagingData, setPagingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  // Controll pagination
  const { pagingView, paging } = usePagingView();
  useEffect(() => {
    paging(submissions, currentPage);
    setPagingData(pagingView.current);
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
  const [selectForms, setSelectForm] = useState([]);
  const [participants, setParticipant] = useState([]);
  const [selectParticipants, setSelectParticipant] = useState([]);
  const [locations, setLocation] = useState([]);
  const [selectLocations, setSelectLocation] = useState([]);
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
        let select = [];
        data.map((item) => {
          select.push({
            value: item.Id,
            label: item.Name
          });
        })
        setSelectForm(select);

        let arr = [];
        data.map((item) => {
          arr.push({
            key: item.Id,
            value: item.Budget
          });
        })
        setForm(arr);
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
        let select = [];
        data.map((item) => {
          select.push({
            value: item.Id,
            label: item.Name
          });
        })
        setSelectParticipant(select);

        let arr = [];
        data.map((item) => {
          arr.push({
            key: item.Id,
            value: item.Budget
          });
        })
        setParticipant(arr);
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
        let select = [];
        data.map((item) => {
          select.push({
            value: item.Id,
            label: item.Name
          });
        })
        setSelectLocation(select);

        let arr = [];
        data.map((item) => {
          arr.push({
            key: item.Id,
            value: item.Budget
          });
        })
        setLocation(arr);
      })
      .catch(err => console.log(err));
  }
  // Default call when render
  useEffect(() => {
    getForms();
    getParticipants();
    getLocations();
  }, [])

  return (
    <div className='container'>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <Button type='primary' onClick={() => handleOpenForm()}>Add</Button>
      <div className='row'>
        <div className='col-md-12'>
          <table className='table table-striped'>
            <thead>
              <tr>
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
                pagingData.map((item) => (
                  <tr key={item.Id}>
                    <td>{item.Form.Name}</td>
                    <td>{item.Participant.Name}</td>
                    <td>{item.Location.Name}</td>
                    <td>{moment(item.FromTime).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td>{moment(item.ToTime).format('DD/MM/YYYY HH:mm:ss')}</td>
                    <td>
                      {
                        item.Status === 'draft'
                          ? (<Stack direction="row" alignItems="center" gap={1}>
                            <InfoOutlinedIcon fontSize='small' color='info' />
                            <Typography variant="body1">{item.Status}</Typography>
                          </Stack>)
                          : item.Status === 'confirm'
                            ? (<Stack direction="row" alignItems="center" gap={1}>
                              <CircularProgress size='1em' color='primary' />
                              <Typography variant="body1" >{item.Status}</Typography>
                            </Stack>)
                            : item.Status === 'approve'
                              ? (<Stack direction="row" alignItems="center" gap={1}>
                                <CheckCircleOutlinedIcon fontSize='small' color='success' />
                                <Typography variant="body1" >{item.Status}</Typography>
                              </Stack>)
                              : item.Status === 'reject'
                                ? (<Stack direction="row" alignItems="center" gap={1}>
                                  <CancelOutlinedIcon fontSize='small' color='error' />
                                  <Typography variant="body1" >{item.Status}</Typography>
                                </Stack>)
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
          <PaginationBar
            data={submissions}
            triggerView={setCurrentPage}
          />
          <CustomModal
            show={show}
            formParam={formParam}
            handleClose={handleClose}
            setSaveObject={setSaveObject}
            handleSaveChanges={handleSaveChanges}
          />
        </div>
      </div>
    </div>
  )
}

export default SubmissionPage;