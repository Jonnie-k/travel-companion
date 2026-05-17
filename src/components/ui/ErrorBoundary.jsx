import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: "red", padding: "1rem" }}>
          <p>Something went wrong: {this.state.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;