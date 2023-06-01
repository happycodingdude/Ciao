import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './Button.css';
import './FlexBox.css';

const ParticipantPage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  const [participants, setParticipants] = useState([]);

  useEffect(() => {
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
        setParticipants(data);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <>
      <Link to="/home" state={{ token: token }}>Home</Link>
      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {
            participants.map((item) => (
              <tr key={item.Id}>
                <td>{item.Name}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  )
}

export default ParticipantPage;