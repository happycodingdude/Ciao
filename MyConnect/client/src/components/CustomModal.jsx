import React, { useRef } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import Select from "react-select";

const CustomModal = ({ show, forms, onClose, onSubmit }) => {
  const refForm = useRef();

  const submit = () => {
    const formData = new FormData(refForm.current);

    var formDataObj = {};
    for (const key of forms.data.map((item) => item.name)) {
      const value = formData.getAll(key);
      formDataObj = {
        ...formDataObj,
        [key]: value,
        // [key]:
        //   value.length <= 1
        //     ? value[0].trim().length === 0
        //       ? null
        //       : value[0]
        //     : value,
      };
    }

    onSubmit(formDataObj);
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>{forms?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form ref={refForm}>
          <Form.Group className="mb-3" controlId="custom-modal">
            {forms?.data?.map((item) => {
              switch (item.type) {
                case "input":
                  return (
                    <>
                      <Form.Label>{item.label}</Form.Label>
                      <Form.Control
                        size="lg"
                        type="text"
                        name={item.name}
                        value={item.value}
                      />
                    </>
                  );
                case "multiple":
                  return (
                    <>
                      <Form.Label>{item.label}</Form.Label>
                      <Select
                        className="basic-multi-select"
                        classNamePrefix="select"
                        isMulti
                        isSearchable
                        closeMenuOnSelect={false}
                        // value={selectedOptions}
                        name={item.name}
                        options={item.options}
                      />
                    </>
                  );
                default:
                  break;
              }
            })}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button type="text" size="lg" onClick={handleClose}>
          Close
        </Button>
        <Button type="text" size="lg" onClick={submit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
