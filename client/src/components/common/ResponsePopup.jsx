import "react-toastify/dist/ReactToastify.css";

const ResponsePopup = (props) => {
  const { container } = props;

  return (
    <Slide in={true} direction="right" container={container}>
      <Alert variant="filled" severity="success">
        This is a success Alert.
      </Alert>
    </Slide>
  );
};
export default ResponsePopup;
