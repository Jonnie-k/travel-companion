function Loading({ message = "Loading..." }) {
  return (
    <div className="dashboard-loading">
      <p>{message}</p>
    </div>
  );
}

export default Loading;