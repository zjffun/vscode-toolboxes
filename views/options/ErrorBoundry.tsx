import React from "react";

export class ErrorBoundary extends React.Component<
  {},
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, errorMsg: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ display: "flex", justifyContent: "center" }}>
          Failed to load options.
          <p>Error message: {this.state.errorMsg}</p>
        </main>
      );
    }

    return this.props.children;
  }
}
