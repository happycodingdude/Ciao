import React, { useEffect, useRef, useState } from "react";
import { Button, CloseButton, Form, Modal } from "react-bootstrap";
import Select from "react-select";

const CustomModal = ({ show, forms, onClose, onSubmit }) => {
  const refForm = useRef();
  const [form, setForm] = useState();

  useEffect(() => {
    setForm(forms);
  }, [forms]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({
      ...current,
      data: current.data.map((item) => {
        if (item.name === name) item.value = value;
        return item;
      }),
    }));
  };

  const submit = () => {
    const formData = new FormData(refForm.current);

    var formDataObj = {};
    for (const key of form.data.map((item) => item.name)) {
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
      <Modal.Header>
        <Modal.Title>{form?.title}</Modal.Title>
        <CloseButton
          className="close-button"
          onClick={handleClose}
        ></CloseButton>
      </Modal.Header>
      <Modal.Body>
        <Form ref={refForm}>
          <Form.Group className="mb-3" controlId="custom-modal">
            {form?.data?.map((item) => {
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
                        onChange={handleInputChange}
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
