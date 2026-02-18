import useInfo from "../hooks/useInfo";
import "../styles/Home.css";

const Notification = () => {
  console.log("Rendering NotificationComponent");
  const { data: info } = useInfo();
  return (
    <section className="h-full w-full">
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
        Welcome to notification page
      </p>
      <div id="portal"></div>
    </section>
  );
};

export default Notification;
