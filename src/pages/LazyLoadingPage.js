import React from 'react'
import axios from "axios";
import AnimateHeight from "react-animate-height";

import LoadingBar from "../shared/loadingbar/LoadingBar";
import ErrorMessage from "../shared/errormessage/ErrorMessage";
import BASE_URL from "../shared/BaseUrl";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class LazyLoadingPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.initialState();
    this.state["pageStatus"] = "LOADING";
    this.interval = null;
  }

  // These are the methods that subclasses must overload

  className() {
    return ""
  }

  pollTime() {
    return -1
  }

  initialState() {
    return {}
  };

  transiterUrl() {
    return ""
  };

  transiterErrorMessage(response) {
    return "error retrieving data"
  };

  getStateFromTransiterResponse(response) {
    return {}
  };

  header() {
    return <div/>;
  };

  body() {
    return <div/>
  };

  componentDidMount() {
    window.addEventListener("focus", this.startPollingTransiter);
    window.addEventListener("blur", this.stopPollingTransiter);
    this.startPollingTransiter()
  }

  componentWillUnmount() {
    window.removeEventListener("focus", this.startPollingTransiter);
    window.removeEventListener("blur", this.stopPollingTransiter);
    this.stopPollingTransiter()
  }

  startPollingTransiter = () => {
    this.stopPollingTransiter();
    this.pollTransiter();
    if (this.pollTime() > 0) {
      this.interval = setInterval(() => this.pollTransiter(), this.pollTime());
    }
  };

  stopPollingTransiter = () => {
    if (this.interval != null) {
      clearInterval(this.interval);
    }
  };

  async pollTransiter() {
    if (this.state.pageStatus === "ERROR") {
      this.setState({
        pageStatus: "LOADING"
      })
    }
    await sleep(0);
    axios.get(BASE_URL + this.transiterUrl())
      .then(this.handleHttpSuccess)
      .catch(this.handleHttpError)
  };

  handleHttpSuccess = (response) => {
    let state = this.getStateFromTransiterResponse(response.data);
    state["pageStatus"] = "LOADED";
    this.setState(state)
  };

  handleHttpError = (error) => {
    let errorMessage = "";
    if (error.response) {
      errorMessage = this.transiterErrorMessage(error.response)
    } else {
      errorMessage = "no internet connection"
    }
    this.setState({
      pageStatus: "ERROR",
      errorMessage: errorMessage
    });
  };

  render() {
    let elements = [];
    // elements.push(<div key="noInternet" className="noInternet">no  internet</div>);
    elements.push(<div key="header">{this.header()}</div>);

    if (this.state.pageStatus === "ERROR") {
      elements.push(
        <ErrorMessage tryAgainFunction={() => this.pollTransiter()}>{this.state.errorMessage}</ErrorMessage>
      )
    } else if (this.state.pageStatus === "LOADING") {
      elements.push(<LoadingBar key="loadingBar "/>)
    }

    elements.push(
      <AnimateHeight
        animateOpacity={true}
        key="bodyContainer"
        height={this.state.pageStatus === "LOADED" ? "auto" : 0}
        duration={500}>
        {this.state.pageStatus === "LOADED" ? this.body() : ""}
      </AnimateHeight>
    );

    return (
      <div className={this.className()}>
        {elements}
      </div>
    )
  }

}

export default LazyLoadingPage
