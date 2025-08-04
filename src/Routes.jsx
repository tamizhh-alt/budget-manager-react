import React from "react";
import {
  BrowserRouter as Router, // <-- changed from HashRouter
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { useTracked } from "./Store";
import { auth } from "./firebase";

import Website from "./app/landing/Website";
import Login from "./app/auth/Login";
import Register from "./app/auth/Register";
import DashboardLayout from "./app/layouts/DashboardLayout";

export const PrivateRoute = ({ component: Component, ...rest }) => {
  const [state] = useTracked();
  
  return (
    <Route
      {...rest}
      render={(props) => {
        // Check both Firebase auth state and global state
        const isAuthenticated = state.isAuthenticated && (auth.currentUser || state.user);
        
        return isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        );
      }}
    />
  );
};

export const GuestRoute = ({ component: Component, ...rest }) => {
  const [state] = useTracked();
  
  return (
    <Route
      {...rest}
      render={(props) => {
        // Check both Firebase auth state and global state
        const isAuthenticated = state.isAuthenticated && (auth.currentUser || state.user);
        
        return !isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/dashboard",
              state: { from: props.location },
            }}
          />
        );
      }}
    />
  );
};

const Routes = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Website} />
      <GuestRoute exact path="/login" component={Login} />
      <GuestRoute exact path="/register" component={Register} />
      <PrivateRoute strict path="/" component={DashboardLayout} />
    </Switch>
  </Router>
);

export default React.memo(Routes);
