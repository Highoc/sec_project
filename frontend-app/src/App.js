import React, { Component } from 'react';
import signIn from "./pages/login/signIn";
import register from "./pages/register/register";
import electionsTable from "./pages/electionsTable/electionsTable";
import electionPage from "./pages/electionPage/electionPage";
import createContract from "./pages/createContract/createContract";
import votePage from "./pages/votePage/votePage";
import testPage from "./pages/testPage/testPage";
import { connect } from 'react-redux';
import './App.css';
import {
  BrowserRouter as Router, Switch, Route, Redirect,
} from 'react-router-dom';


class App extends Component{
  render() {
    let routes = (
      <Switch>
        <Route exact path="/login" component={signIn}/>
        <Route exact path="/register" component={register}/>
        <Redirect to="/login" />
      </Switch>
    );
    if (!this.props.isAuthorized){
      routes = (
        <Switch>
          <Route exact path="/elections" component={electionsTable}/>
          <Route exact path="/electionPage/:id" component={electionPage}/>
          <Route exact path="/createContract" component={createContract}/>
          <Route exact path="/election/:id/candidate" component={votePage}/>
          <Route exact path="/test" component={testPage}/>
          <Redirect to="/elections" />
        </Switch>
      )
    }
    return (
      <div className="App">
        <Router>
          { routes }
        </Router>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthorized: state.authorization.isAuthorized,
});

export default connect(mapStateToProps)(App);
