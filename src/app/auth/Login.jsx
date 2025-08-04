import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Helmet } from "react-helmet";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { Link, useHistory } from "react-router-dom";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

import LocaleToggle from "./../locale/LocaleToggle";

const loginValidationSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Invalid email"),
  password: yup.string().required("Password is required"),
});

let messages;

const Login = () => {
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory(); // ✅ Correct for React Router v5

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const submitLogin = async (data) => {
    setSubmitting(true);
    messages.clear();

    try {
      const result = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Firebase auth state will be handled by onAuthStateChanged in App.jsx
      // No need to manually set localStorage here

      messages.show({
        severity: "success",
        detail: "Login successful!",
        sticky: true,
      });

      reset();

      setTimeout(() => {
        history.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Login Error:", error.message);
      messages.show({
        severity: "error",
        detail: error.message || "Login failed. Try again.",
        sticky: true,
      });
    }

    setSubmitting(false);
  };

  



  return (
    <div>
      <Helmet title="Login" />
      <div
        className="p-grid p-nogutter p-align-center p-justify-center"
        style={{ height: "95vh" }}
      >
        <Card
          className="p-sm-12 p-md-6 p-lg-4"
          style={{ borderRadius: 5, minHeight: 65 }}
        >
          <div className="p-col-12 p-fluid">
            <Messages ref={(el) => (messages = el)} />
          </div>
          <div className="p-col-12">
            <div className="p-card-title p-grid p-nogutter p-justify-between">
              Login
              <LocaleToggle />
            </div>
            <div className="p-card-subtitle">Enter your credentials</div>
          </div>

          <form onSubmit={handleSubmit(submitLogin)}>
            <div className="p-col-12 p-fluid">
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-envelope" />
                </span>
                <input
                  type="text"
                  placeholder="Email"
                  {...register("email")}
                  className="p-inputtext p-component"
                />
              </div>
              <p className="text-error">{errors.email?.message}</p>
            </div>

            <div className="p-col-12 p-fluid">
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-key" />
                </span>
                <input
                  type="password"
                  placeholder="Password"
                  {...register("password")}
                  className="p-inputtext p-component"
                />
              </div>
              <p className="text-error">{errors.password?.message}</p>
            </div>

            <div className="p-col-12 p-fluid">
              <Button
                disabled={submitting}
                type="submit"
                label="Login"
                icon="pi pi-sign-in"
                className="p-button-raised"
              />
            </div>

            <div className="p-grid p-nogutter p-col-12 p-justify-center">
              <Link to="/register">Don't have an account? Register</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(Login);
