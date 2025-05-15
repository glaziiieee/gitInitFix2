// src/pages/auth/AuthLayout.js
import React from "react";
import { Outlet } from "react-router-dom";
import { Container } from "react-bootstrap";

const AuthLayout = () => {
  return (
    <div className="auth-wrapper">
      <Container className="px-3">
        <Outlet />
      </Container>
    </div>
  );
};

export default AuthLayout;