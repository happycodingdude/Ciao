import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import '../../assets/Button.css';
import '../../assets/FlexBox.css';

const Location = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  const [locations, setLocations] = useState([]);

  useEffect(() => {
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
        setLocations(data);
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
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {
            locations.map((item) => (
              <tr key={item.Id}>
                <td>{item.Name}</td>
                <td>{item.Address}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  )
}

export default Location;