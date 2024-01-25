import React, { useRef, useState } from "react";
import { Button, CloseButton, Modal } from "react-bootstrap";

const DeleteConfirmation = ({ title, message, onSubmit }) => {
  const [show, setShow] = useState(false);
  const handleOpen = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setLoading(false);
  };

  const refSubmitBtn = useRef();
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    refSubmitBtn.current.classList.toggle("w-[6rem]");
    refSubmitBtn.current.classList.toggle("w-[4rem]");
    setLoading(!loading);
    onSubmit();
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="fa fa-trash cursor-pointer text-base font-normal text-red-500"
      >
        &ensp;{title}
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
          <CloseButton
            className="close-button"
            onClick={handleClose}
          ></CloseButton>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-danger">{message}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="text" size="lg" onClick={handleClose}>
            Close
          </Button>
          <Button
            ref={refSubmitBtn}
            type="text"
            variant="danger"
            size="lg"
            className="w-[6rem] transition-all duration-200"
            onClick={handleSubmit}
          >
            {loading ? <div className="fa fa-spinner fa-spin"></div> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DeleteConfirmation;
