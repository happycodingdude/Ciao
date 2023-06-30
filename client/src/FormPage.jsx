import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import './Button.css';
import CustomModal from './CustomModal';
import './FlexBox.css';
import PaginationBar from './PaginationBar.jsx';
import usePagingView from './Paging.jsx';

const FormPage = ({ token }) => {
  const navigate = useNavigate();

  const [forms, setForms] = useState([]);

  useEffect(() => {
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
        setForms(data);
        setCurrentPage(1);
      })
      .catch(err => console.log(err));
  }, []);

  // State object to save, data to open modal
  const [saveObject, setSaveObject] = useState({});
  const [formParam, setFormParam] = useState({});

  // Prepare param and show modal
  const handleShowModal = (data) => {
    let formParam = {
      formAction: data === undefined ? 'add' : 'edit',
      formId: editId,
      formData: [
        {
          ItemName: 'Name',
          ItemValue: data === undefined ? '' : data['Name'],
          ItemType: 'input'
        },
        {
          ItemName: 'Budget',
          ItemValue: data === undefined ? '' : data['Budget'],
          ItemType: 'input'
        }
      ],
    }
    setFormParam(formParam);
    handleShow();
  }
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

  // Control show/hide modal
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
    fetch(`api/form`, requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        handleClose();
        setForms([...forms.slice(0, 0), data, ...forms.slice(0)]);
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
    fetch(`api/form`, requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .then(data => {
        handleClose();
        const updated = forms.map((item) => {
          if (item.Id === id)
            // Update the value for the specific item
            return data;
          return item;
        });
        // Update the state with the new table data
        setForms(updated);
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
      fetch(`api/form/${id}`, requestOptions)
        .then(res => {
          if (res.ok) setForms(forms.filter((item) => item.Id !== id));
          else if (res.status === 401) navigate('/');
          else throw new Error(res.status);
        })
        .catch(err => console.log(err));
    }
  }

  // State item to edit
  const [editId, setEditId] = useState(0);
  useEffect(() => {
    if (editId !== 0) {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
      };
      fetch(`api/form/${editId}`, requestOptions)
        .then(res => {
          if (res.ok) return res.json();
          else if (res.status === 401) navigate('/');
          else throw new Error(res.status);
        })
        .then(data => {
          setSaveObject(data);
          handleShowModal(data);
        })
        .catch(err => console.log(err));
    }
  }, [editId]);

  // State paging
  const [pagingData, setPagingData] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  // Controll pagination
  const { pagingView, paging } = usePagingView();
  useEffect(() => {
    paging(forms, currentPage);
    setPagingData(pagingView.current);
  }, [currentPage, forms]);

  return (
    <div className='container'>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <Button type='primary' onClick={() => handleOpenForm()}>Add</Button>
      <div className='row'>
        <div className='col-md-12'>
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Budget</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                pagingData.map((item) => (
                  <tr key={item.Id}>
                    <td>{item.Name}</td>
                    <td>{item.Budget}</td>
                    <td colSpan={2}>
                      {
                        <>
                          <Button type='primary' onClick={() => handleOpenForm(item.Id)}>Edit</Button>
                          <Button type='primary' danger onClick={() => handleDelete(item.Id)}>Delete</Button>
                        </>
                      }
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <PaginationBar
            data={forms}
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

export default FormPage;