const delay = (delay: number) => {
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export default delay;
