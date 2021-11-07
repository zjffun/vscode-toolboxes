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
        <main>
          <p>Failed to load options.</p>
          <p>Error message: {this.state.errorMsg}</p>
        </main>
      );
    }

    return this.props.children;
  }
}
