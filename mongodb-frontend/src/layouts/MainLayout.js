// src/layouts/MainLayout.js - Updated with Horizontal Navigation
import Logo from "../components/Logo";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, Button, Dropdown } from "react-bootstrap";
import {
  FaChartBar,
  FaUsers,
  FaUserFriends,
  FaFileAlt,
  FaBullhorn,
  FaCalendarAlt,
  FaIdCard,
  FaUser,
  FaSignOutAlt,
  FaQrcode,
  FaCog,
  FaUserCircle,
  FaUserCog,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Render different navigation items based on user role
  const renderNavItems = () => {
    // Admin navigation
    if (currentUser?.role === "admin") {
      return (
        <>
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={`nav-link-custom ${
              isActive("/dashboard") && location.pathname === "/dashboard"
                ? "active"
                : ""
            }`}
          >
            <FaChartBar className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/family-heads"
            className={`nav-link-custom ${
              isActive("/dashboard/family-heads") ? "active" : ""
            }`}
          >
            <FaUserFriends className="nav-icon" />
            <span className="nav-text">4Ps Member</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/residents"
            className={`nav-link-custom ${
              isActive("/dashboard/residents") ? "active" : ""
            }`}
          >
            <FaUsers className="nav-icon" />
            <span className="nav-text">Residents</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/documents"
            className={`nav-link-custom ${
              isActive("/dashboard/documents") ? "active" : ""
            }`}
          >
            <FaFileAlt className="nav-icon" />
            <span className="nav-text">Documents</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/announcements"
            className={`nav-link-custom ${
              isActive("/dashboard/announcements") ? "active" : ""
            }`}
          >
            <FaBullhorn className="nav-icon" />
            <span className="nav-text">Announcements</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/events-management"
            className={`nav-link-custom ${
              isActive("/dashboard/events-management") ? "active" : ""
            }`}
          >
            <FaCalendarAlt className="nav-icon" />
            <span className="nav-text">Events</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/system-tools"
            className={`nav-link-custom ${
              isActive("/dashboard/system-tools") ? "active" : ""
            }`}
          >
            <FaCog className="nav-icon" />
            <span className="nav-text">Tools</span>
          </Nav.Link>
        </>
      );
    }
    // Resident navigation
    else if (currentUser?.role === "resident") {
      return (
        <>
          <Nav.Link
            as={Link}
            to="/dashboard"
            className={`nav-link-custom ${
              isActive("/dashboard") && location.pathname === "/dashboard"
                ? "active"
                : ""
            }`}
          >
            <FaChartBar className="nav-icon" />
            <span className="nav-text">Dashboard</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to={`/dashboard/residents/view/${currentUser.residentId}`}
            className={`nav-link-custom ${
              isActive(`/dashboard/residents/view/${currentUser.residentId}`)
                ? "active"
                : ""
            }`}
          >
            <FaIdCard className="nav-icon" />
            <span className="nav-text">My Profile</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/certificates"
            className={`nav-link-custom ${
              isActive("/dashboard/certificates") ? "active" : ""
            }`}
          >
            <FaFileAlt className="nav-icon" />
            <span className="nav-text">Certificates</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/announcements"
            className={`nav-link-custom ${
              isActive("/dashboard/announcements") ? "active" : ""
            }`}
          >
            <FaBullhorn className="nav-icon" />
            <span className="nav-text">Announcements</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to="/dashboard/events"
            className={`nav-link-custom ${
              isActive("/dashboard/events") ? "active" : ""
            }`}
          >
            <FaCalendarAlt className="nav-icon" />
            <span className="nav-text">Events</span>
          </Nav.Link>

          <Nav.Link
            as={Link}
            to={`/dashboard/residents/view/${currentUser.residentId}?tab=qrcode`}
            className={`nav-link-custom ${
              isActive(`/dashboard/residents/view/${currentUser.residentId}`) &&
              location.search.includes("tab=qrcode")
                ? "active"
                : ""
            }`}
          >
            <FaQrcode className="nav-icon" />
            <span className="nav-text">My QR Code</span>
          </Nav.Link>
        </>
      );
    }

    // Default navigation for any other roles
    return (
      <Nav.Link
        as={Link}
        to="/dashboard"
        className={`nav-link-custom ${
          isActive("/dashboard") ? "active" : ""
        }`}
      >
        <FaChartBar className="nav-icon" />
        <span className="nav-text">Dashboard</span>
      </Nav.Link>
    );
  };

  return (
    <div className="main-layout">
      {/* Top Navigation Bar - Horizontal */}
      <Navbar bg="matcha-green" variant="dark" expand="lg" className="top-navbar" fixed="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard" className="brand-container">
            <Logo width={32} height={32} />
            <span className="brand-text ms-2">Barangay Santiago

            
            </span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="navbar-nav" onClick={() => setExpanded(!expanded)} />
          
          <Navbar.Collapse id="navbar-nav" className={expanded ? "show" : ""}>
            <Nav className="me-auto main-nav">
              {renderNavItems()}
            </Nav>
            
            <Nav className="ms-auto">
              <Dropdown align="end">
                <Dropdown.Toggle as={Button} variant="link" className="user-menu-toggle">
                  <div className="user-avatar">
                    <FaUserCircle size={24} />
                  </div>
                </Dropdown.Toggle>
                
                <Dropdown.Menu>
                  <Dropdown.Header>
                    <strong>{currentUser?.name}</strong>
                    <div className="text-muted small">{currentUser?.role}</div>
                  </Dropdown.Header>
                  <Dropdown.Item as={Link} to="/dashboard/profile">
                    <FaUser className="me-2" /> Profile
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-2" /> Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main content with top padding */}
      <div className="main-content-wrapper">
        <Container fluid>
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default MainLayout;