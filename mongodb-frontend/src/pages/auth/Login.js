// src/pages/auth/Login.js
import React, { useState } from "react";
import { Modal, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaUser, FaLock } from "react-icons/fa";
import Logo from "../../components/Logo";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const result = await login(formData);

      if (result.success) {
        navigate("/dashboard"); // Redirect after successful login
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={true}
      onHide={() => {}}
      backdrop="static" // Prevent closing by clicking outside
      keyboard={false}  // Prevent closing with ESC key
      centered
    >
      <Modal.Header>
        <Modal.Title className="w-100 text-center">
          <Logo width={40} height={40} className="mb-2" />
          <div className="mt-2">
            <h5 className="mb-0">Barangay Santiago</h5>
            <small className="text-muted">Management System</small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <h5 className="text-center mb-3">Login to Your Account</h5>

        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
            className="py-2 px-3 mb-3"
          >
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <FaUser />
              </span>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <div className="input-group">
              <span className="input-group-text">
                <FaLock />
              </span>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </Form.Group>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="py-2"
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </div>
        </Form>

        <div className="text-center mt-3">
          <p className="mb-0">
            Don't have an account? <a href="/register">Register here</a>
          </p>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Login;
