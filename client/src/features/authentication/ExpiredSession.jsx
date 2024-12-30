import React from "react";
import BackgroundPortal from "../../../components/BackgroundPortal";
import CustomButton from "../../../components/CustomButton";

const ExpiredSession = (props) => {
  console.log("ExpiredSession calling");
  const { backToLogin } = props;
  return (
    <BackgroundPortal
      open={true}
      className="!w-[40rem]"
      title="Expired session"
    >
      <div>
        <p>Your session has expired. Try login again</p>
        <CustomButton
          title="Login"
          className="!w-1/2"
          onClick={() => backToLogin(true)}
        />
      </div>
    </BackgroundPortal>
  );
};

export default ExpiredSession;
