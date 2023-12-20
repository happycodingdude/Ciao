import React from "react";
import { Button, Modal } from "react-bootstrap";

function CustomModal({ show, handleClose, saveChanges }) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add member</Modal.Title>
      </Modal.Header>
      <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
      {/* <Modal.Body>
      <Form>
        <Form.Group className="mb-3" controlId="formSubmission">
          <Form.Label>Member</Form.Label>
          <Form.Control type="text" />
        </Form.Group>
      </Form>
    </Modal.Body> */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={saveChanges}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CustomModal;
