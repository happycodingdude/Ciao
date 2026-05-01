import "../styles/Home.css";

const Home = () => {
  return (
    <section className="h-full w-full">
      <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
        Welcome to home page
      </p>
      <div id="portal"></div>
    </section>
  );
};

export default Home;
