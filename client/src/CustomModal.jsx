
import { Button } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import "react-datepicker/dist/react-datepicker.css";
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import Select from 'react-select';
import './Button.css';
import './FlexBox.css';

const CustomModal = ({ show, formParam, handleClose, setSaveObject, handleSaveChanges }) => {
  console.log(formParam);
  const [loading, setLoading] = useState(false);

  // Control change input value
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSaveObject(currentObject => ({ ...currentObject, [name]: value }));
    formParam.formData.find(item => {
      if (item.ItemName === name)
        item.ItemValue = value;
    });
  };
  // Control change datetime picker
  const handlePickerChange = (name, date) => {
    setSaveObject(currentObject => ({ ...currentObject, [name]: date.format() }));
    formParam.formData.find(item => {
      if (item.ItemName === name)
        item.ItemValue = date.format();
    });
  };
  // Control change select
  const handleSelectChange = (name, option) => {
    setSaveObject(currentObject => ({ ...currentObject, [name]: option.value }));
    var chosenItem = formParam.formData.find(item => {
      if (item.ItemField === name) {
        item.ItemValue = {
          value: option.value,
          label: option.label
        };
        return item;
      }
    });

    if (chosenItem.ItemNameToChange !== undefined) {
      formParam.formData.find(item => {
        if (item.ItemName === chosenItem.ItemNameToChange)
          item.ItemValue = chosenItem.ItemValueToChange.find(item => item.key === option.value).value;
      });
    }
  }

  const saveChanges = () => {
    setLoading(true);
    handleSaveChanges(formParam.formAction)
  }

  useEffect(() => {
    setLoading(false);
  }, [show])

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{formParam.formAction === 'add' ? 'Create' : `Edit ${formParam.formId}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formSubmission">
            {
              formParam.formData !== undefined
                ? formParam.formData.map(item => {
                  switch (item.ItemType) {
                    case 'input':
                      return (
                        <>
                          <Form.Label>{item.ItemName}</Form.Label>
                          <Form.Control type="text" disabled={item.ItemDisable} name={item.ItemName} value={item.ItemValue} onChange={handleInputChange} />
                        </>
                      )
                    case 'select':
                      return (
                        <>
                          <Form.Label>{item.ItemName}</Form.Label>
                          <input type='hidden' value={item.ItemField} />
                          <Select
                            className="basic-single"
                            classNamePrefix="select"
                            value={item.ItemValue}
                            name="color"
                            options={item.ItemOptions}
                            onChange={(option) => { handleSelectChange(item.ItemField, option) }}
                          />
                        </>
                      )
                    case 'picker':
                      return (
                        <>
                          <Form.Label>{item.ItemName}</Form.Label>
                          <DateTime
                            value={formParam.formAction === 'add' ? '' : moment(item.ItemValue)}
                            dateFormat="DD/MM/YYYY"
                            timeFormat="HH:mm"
                            timeConstraints={{
                              minutes: { step: 10 }
                            }}
                            isValidDate={(current) => {
                              return current.startOf('day').isSameOrAfter(moment().startOf('day'));
                            }}
                            onChange={(date) => handlePickerChange(item.ItemName, date)}
                          />
                        </>
                      )
                  }
                })
                : ''
            }
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type='text' onClick={handleClose}>
          Close
        </Button>
        <Button type='primary' loading={loading} id='btnSaveChanges' onClick={saveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CustomModal;