import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";

// Pages
import MainPage from "./pages/index";
import RegisterPage from "./pages/investigators/register";
import LoginPage from "./pages/investigators/login";
import InvestigatorPage from "./pages/investigators/investigator_page";
import Profile from "./pages/investigators/profile";
import AdminLoginPage from "./pages/admins/admin_login";
import AdminPage from "./pages/admins/admin_page";
import AdminContentPage from "./pages/admins/admin_content";
import ShowDocumentUserPage from "./pages/users/show_document";
import ShowDocumentInvPage from "./pages/investigators/show_document";
import ShowDocumentAdminPage from "./pages/admins/show_document";
import UsersPage from "./pages/users/users_template";
import NotFoundPage from "./pages/404";

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={MainPage}/>
          <Route exact path="/register" component={RegisterPage}/>
          <Route exact path="/login" component={LoginPage}/>
          <Route exact path="/investigator/:username" component={InvestigatorPage}/>
          <Route exact path="/investigator/:username/document/:filename" component={ShowDocumentInvPage}/>
          <Route exact path="/investigator/:username/profile" component={Profile}/>
          <Route exact path="/admin" component={AdminLoginPage}/>
          <Route exact path="/admin/:username" component={AdminPage}/>
          <Route exact path="/admin/:username/content" component={AdminContentPage}/>
          <Route exact path="/admin/:username/content/document/:filename" component={ShowDocumentAdminPage}/>
          <Route exact path="/users" component={UsersPage}/>
          <Route exact path="/users/document/:filename" component={ShowDocumentUserPage}/>
          <Route exact path="/404" component={NotFoundPage}/>
          <Redirect to="/404"/>
        </Switch>
      </Router>
    )
  }
}

export default App;
