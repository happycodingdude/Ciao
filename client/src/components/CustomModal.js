
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import { Button } from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Modal from 'react-bootstrap/Modal';
import "react-datepicker/dist/react-datepicker.css";
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import Select from 'react-select';
import '../assets/Button.css';
import '../assets/FlexBox.css';
import '../assets/Form.css';
import '../assets/Slider.css';

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
  // Control change multi select
  const [selectedOptions, setSelectedOptions] = useState([]);
  useEffect(() => {
    if (formParam?.formData?.some(item => item.ItemType === 'multiple')) {
      console.log('Set selectedOptions');
      setSelectedOptions(formParam?.formData?.find(item => item.ItemType === 'multiple').ItemValue);
    }
  }, [formParam]);
  const handleMultiSelectChange = (name, option) => {
    setSelectedOptions(option);
    setSaveObject(currentObject => ({ ...currentObject, [name]: option.map(item => item.value).join(',') }));
  }

  const saveChanges = () => {
    setLoading(true);
    handleSaveChanges(formParam.formAction)
  }

  useEffect(() => {
    setLoading(false);
  }, [show])

  const [currentCarousel, setCurrentCarousel] = useState(0);
  const length = formParam?.formData?.find(item => item.ItemType === 'carousel').ItemValue.length;

  const nextSlide = () => {
    setCurrentCarousel(currentCarousel === length - 1 ? 0 : currentCarousel + 1);
  };

  const prevSlide = () => {
    setCurrentCarousel(currentCarousel === 0 ? length - 1 : currentCarousel - 1);
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName='modal-form'>
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
                    case 'multiple':
                      return (
                        <>
                          <Form.Label>{item.ItemName}</Form.Label>
                          <input type='hidden' value={item.ItemField} />
                          <Select
                            className="basic-multi-select"
                            classNamePrefix="select"
                            isMulti
                            closeMenuOnSelect={false}
                            value={selectedOptions}
                            name="colors"
                            options={item.ItemOptions}
                            onChange={(option) => { handleMultiSelectChange(item.ItemField, option) }}
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
                    case 'image':
                      return (
                        <div className='image-form'>
                          <Form.Label>{item.ItemName}</Form.Label>
                          <Image src={item.ItemValue} rounded alt='image-item' />
                        </div>
                      )
                    case 'carousel':
                      return (
                        <section className='slider'>
                          <Form.Label>{item.ItemName}</Form.Label>
                          <ArrowCircleLeftIcon className='left-arrow' onClick={prevSlide} />
                          <ArrowCircleRightIcon className='right-arrow' onClick={nextSlide} />
                          {
                            item.ItemValue.map((slide, index) => {
                              return (
                                <div
                                  className={index === currentCarousel ? 'slide active' : 'slide'}
                                  key={index}
                                >
                                  {index === currentCarousel && (<Image src={slide.image} rounded alt='carousel-item' />)}
                                </div>
                              )
                            })
                          }
                        </section>
                      )
                  }
                })
                : ''
            }
          </Form.Group >
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