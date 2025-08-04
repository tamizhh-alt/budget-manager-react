import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Helmet } from "react-helmet";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Messages } from "primereact/messages";
import { Link } from "react-router-dom";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./../../firebase";

import LocaleToggle from "./../locale/LocaleToggle";

const schema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(4, "Minimum 4 characters"),
  email: yup.string().required("Email is required").email("Invalid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Minimum 6 characters"),
  confirm_password: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

const Register = () => {
  const [submitting, setSubmitting] = useState(false);
  const messagesRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // You can optionally save name to Firebase DB or profile later
      messagesRef.current.clear();
      messagesRef.current.show({
        severity: "success",
        detail: "Registration successful. Go to login.",
        sticky: true,
      });
      reset();
    } catch (error) {
      console.error(error);
      messagesRef.current.show({
        severity: "error",
        detail: error.message || "Something went wrong",
        sticky: true,
      });
    }
    setSubmitting(false);
  };

  return (
    <div>
      <Helmet title="Register" />
      <div
        className="p-grid p-nogutter p-align-center p-justify-center"
        style={{ height: "95vh" }}
      >
        <Card
          className="p-sm-12 p-md-6 p-lg-4"
          style={{ borderRadius: 5, minHeight: 65 }}
        >
          <div className="p-col-12 p-fluid">
            <Messages ref={messagesRef} />
          </div>
          <div className="p-col-12">
            <div className="p-card-title p-grid p-nogutter p-justify-between">
              Register
              <LocaleToggle />
            </div>
            <div className="p-card-subtitle">Enter your info to register</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-col-12 p-fluid">
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-user" />
                </span>
                <input
                  type="text"
                  placeholder="Name"
                  {...register("name")}
                  className="p-inputtext p-component p-filled"
                />
              </div>
              <p className="text-error">{errors.name?.message}</p>
            </div>
            <div className="p-col-12 p-fluid">
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-envelope" />
                </span>
                <input
                  type="text"
                  placeholder="Email"
                  {...register("email")}
                  className="p-inputtext p-component p-filled"
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
                  className="p-inputtext p-component p-filled"
                />
              </div>
              <p className="text-error">{errors.password?.message}</p>
            </div>
            <div className="p-col-12 p-fluid">
              <div className="p-inputgroup">
                <span className="p-inputgroup-addon">
                  <i className="pi pi-key" />
                </span>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  {...register("confirm_password")}
                  className="p-inputtext p-component p-filled"
                />
              </div>
              <p className="text-error">{errors.confirm_password?.message}</p>
            </div>
            <div className="p-col-12 p-fluid">
              <Button
                disabled={submitting}
                type="submit"
                label="Register"
                icon="pi pi-sign-in"
                className="p-button-raised"
              />
            </div>
            <div className="p-grid p-nogutter p-col-12 p-justify-center">
              <Link to="/login">Login</Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(Register);
