import React, { Fragment } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Landing from "./components/layout/Landing";
import Register from "./components/Register";
import Login from "./components/Login";
import "./App.css";

const App = () => {
  return (
    <Router>
      <Fragment>
        <Navbar />
        <Route exact path="/" component={Landing}></Route>
        <section className="container">
          <Switch>
            <Route exact path="/login" component={Login}></Route>
            <Route path="/register" component={Register}></Route>
          </Switch>
        </section>
      </Fragment>
    </Router>
  );
};

export default App;
