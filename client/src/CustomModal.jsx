
import { Button } from 'antd';
import React from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import './Button.css';
import './FlexBox.css';

const CustomModal = ({ show, formModal }) => {
  console.log(show);
  console.log(formModal);
  // Control show/hide modal
  // const [show, setShow] = useState(false);
  // const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);

  // Control change input value
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    //formModal.setSaveObject(currentObject => ({ ...currentObject, [name]: value }));
  };
  // Control change datetime picker
  const handlePickerChange = (name, date) => {
    //formModal.setSaveObject(currentObject => ({ ...currentObject, [name]: date.format() })); ``
  };
  // Control change select
  const handleSelectChange = (name, option) => {
    //formModal.setSaveObject(currentObject => ({ ...currentObject, [name]: option.value }));

    // if (name === "FormId") {
    //   let budget = dataForms.find((item) => item.Id === option.value).Budget;
    //   setSaveObject(currentObject => ({ ...currentObject, "Form": { "Budget": budget } }));
    // }
  }

  return (
    // <Modal show={show} onHide={}>
    <Modal show={show}>
      <Modal.Header closeButton>
        <Modal.Title>{formModal.action === 'add' ? 'Create' : `Edit ${formModal.editId}`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formSubmission">
            {/* {              
              formModal.ModalItems.map(item => {
                <Form.Label>{item.ItemName}</Form.Label>
                switch (item.ItemType) {
                  case 'input':
                    return (
                      <>
                        <Form.Control type="text" name={item.ItemName} value={formModal.saveObject[item.ItemName]} onChange={handleInputChange} />
                      </>
                    )
                  case 'select':
                    return (
                      <>
                        <Select
                          className="basic-single"
                          classNamePrefix="select"
                          //value={forms.find((item) => item.value === saveObject.FormId)}
                          name="color"
                          //options={forms}
                          onChange={(option) => { handleSelectChange('FormId', option) }}
                        />
                      </>
                    )
                  case 'picker':
                    return (
                      <>
                        <DateTime
                          value={formModal.action === 'add' ? '' : moment(formModal.saveObject[item.ItemName])}
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
                      </>
                    )
                }
              })
            } */}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {/* <Button type='text' onClick={ }> */}
        <Button>
          Close
        </Button>
        {/* <Button type='primary' onClick={() => { handleAddOrEdit() }}>
          Save Changes
        </Button> */}
      </Modal.Footer>
    </Modal>
  )
}

export default CustomModal;