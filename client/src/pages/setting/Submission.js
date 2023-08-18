import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Button } from 'antd';
import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import { Link, useNavigate } from "react-router-dom";
import '../../assets/Button.css';
import '../../assets/FlexBox.css';
import CustomModal from '../../components/CustomModal.js';
import NavBar from '../../components/NavBar.js';
import usePagingParam from '../../hooks/usePagingParam.js';
import usePagingView from '../../hooks/usePagingView.js';

const Submission = ({ token }) => {
  const navigate = useNavigate();

  // Init variables for api request
  const { addSearch, addInclude, addSort, build, reset, param } = usePagingParam();

  // State list submission
  const [submissions, setSubmissions] = useState([]);

  // Get all data first render
  useEffect(() => {
    addInclude({ TableName: 'Form' });
    addInclude({ TableName: 'Location' });
    addSort({ FieldName: 'CreateTime', SortType: 'desc' });
    build();

    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const body = JSON.stringify(param.current);

    axios.post('api/submission/search',
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          reset();
          setSubmissions(res.data.data);
          setCurrentPage(1);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }, []);

  // State object to save
  const [saveObject, setSaveObject] = useState({});
  // State item to edit
  const [editId, setEditId] = useState(0);
  useEffect(() => {
    if (editId === 0) return;

    addInclude({ TableName: 'Form' });
    build();

    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const body = JSON.stringify(param.current);
    axios.post(`api/submission/${editId}`,
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          reset();
          setSaveObject(res.data.data);
          handleShowModal(res.data.data);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }, [editId]);

  // State form data to open modal
  const [formParam, setFormParam] = useState({});
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
          ItemName: 'Location',
          ItemField: 'LocationId',
          ItemValue: data === undefined ? '' : selectLocations.find((item) => item.value === data.LocationId),
          ItemType: 'select',
          ItemOptions: selectLocations
        },
        {
          ItemName: 'Participant',
          ItemField: 'Participants',
          ItemValue: data === undefined ? '' : selectParticipants.filter((item) => data.Participants?.includes(item.value)),
          ItemType: 'multiple',
          ItemOptions: selectParticipants
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
      setEditId(0);
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
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const body = JSON.stringify(saveObject);

    axios.post(`api/submission`,
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          handleClose();
          setSubmissions([...submissions.slice(0, 0), res.data.data, ...submissions.slice(0)]);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }
  // Edit
  const handleEdit = (id) => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    const body = JSON.stringify(saveObject);

    axios.put('api/submission',
      body,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          handleClose();
          const updated = submissions.map((item) => {
            if (item.Id === id)
              // Update the value for the specific item
              return res.data.data;
            return item;
          });
          // Update the state with the new table data
          setSubmissions(updated);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }
  // Delete
  const handleDelete = (id) => {
    if (window.confirm('Delete this item?') == true) {
      const cancelToken = axios.CancelToken.source();
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      };

      axios.delete(`api/submission/${id}`,
        { cancelToken: cancelToken.token, headers: headers })
        .then(res => {
          if (res.status === 200) {
            setSubmissions(submissions.filter((item) => item.Id !== id));
          }
          else throw new Error(res.status);
        })
        .catch(err => {
          console.log(err);
          if (err.response?.status === 401) navigate('/');
        });

      return () => {
        cancelToken.cancel();
      }
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
  const handleSubmitRequest = (id) => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };

    axios.post(`api/submission/${id}/submit`,
      {},
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          const updatedSubmissions = submissions.map((item) => {
            if (item.Id === id)
              // Update the value for the specific item
              return res.data.data;
            return item;
          });
          // Update the state with the new table data
          setSubmissions(updatedSubmissions);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }

  // State forms, participants and locations  
  const [forms, setForm] = useState([]);
  const [selectForms, setSelectForm] = useState([]);
  const [selectParticipants, setSelectParticipant] = useState([]);
  const [selectLocations, setSelectLocation] = useState([]);
  // Get forms
  const getForms = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    axios.get(`api/form`,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          let select = [];
          res.data.data.map((item) => {
            select.push({
              value: item.Id,
              label: item.Name
            });
          })
          setSelectForm(select);

          let arr = [];
          res.data.data.map((item) => {
            arr.push({
              key: item.Id,
              value: item.Budget
            });
          })
          setForm(arr);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }
  // Get participants
  const getParticipants = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    axios.get(`api/participant`,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          let select = [];
          res.data.data.map((item) => {
            select.push({
              value: item.Id,
              label: item.Name
            });
          })
          setSelectParticipant(select);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  }
  // Get locations
  const getLocations = () => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    axios.get(`api/location`,
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status === 200) {
          let select = [];
          res.data.data.map((item) => {
            select.push({
              value: item.Id,
              label: item.Name
            });
          })
          setSelectLocation(select);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
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
                <th>Location</th>
                <th>Participants</th>
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
                    <td>{item.Form?.Name}</td>
                    <td>{item.Location?.Name}</td>
                    <td>{item.Participants}</td>
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
                          ? (<Button onClick={() => handleSubmitRequest(item.Id)}>Submit</Button>)
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
          <NavBar
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

export default Submission;