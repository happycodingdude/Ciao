import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './Button.css';
import './FlexBox.css';

const FormPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

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
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className='container'>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Name</th>
            <th>Budget</th>
          </tr>
        </thead>
        <tbody>
          {
            forms.map((item) => (
              <tr key={item.Id}>
                <td>{item.Name}</td>
                <td>{item.Budget}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  )
}

export default FormPage;