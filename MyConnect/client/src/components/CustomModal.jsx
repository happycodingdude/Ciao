import React, { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Select from "react-select";

function CustomModal({ reference }) {
  const [selected, setSelected] = useState([]);
  const handleMultiSelectChange = (options) => {
    setSelected(options);
  };
  const saveChanges = () => {
    if (selected.length === 0) {
      reference.handleClose();
      return;
    }
    reference.saveChanges(selected);
    setSelected([]);
  };
  const handleClose = () => {
    reference.handleClose();
    setSelected([]);
  };

  return (
    <Modal show={reference.show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add member</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="custom-modal">
            <Form.Label>Members</Form.Label>
            {/* <input type="hidden" value={item.ItemField} /> */}
            <Select
              className="basic-multi-select"
              classNamePrefix="select"
              isMulti
              isSearchable
              closeMenuOnSelect={false}
              // value={selectedOptions}
              name="colors"
              options={reference.options}
              onChange={(option) => {
                handleMultiSelectChange(option);
              }}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="text" onClick={handleClose}>
          Close
        </Button>
        <Button type="primary" onClick={saveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomModal;
