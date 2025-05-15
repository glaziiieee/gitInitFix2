// src/pages/admin/DocumentRequests.js - Enhanced with Full CRUD Operations
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Badge,
  Alert,
  Spinner,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import {
  FaEye,
  FaPrint,
  FaCheck,
  FaTimes,
  FaQrcode,
  FaEdit,
  FaTrash,
  FaCheckSquare,
  FaBan,
  FaFileAlt,
} from "react-icons/fa";
import { documentRequestService } from "../../services/api";
import { toast } from "react-toastify";
import QrCodeDisplay from "../../components/QrCodeDisplay";

const DocumentRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [processingNotes, setProcessingNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState(new Set());
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [editFormData, setEditFormData] = useState({
    documentType: "",
    purpose: "",
    additionalDetails: "",
    deliveryOption: "",
  });

  const documentTypes = [
    { value: "barangay-clearance", label: "Barangay Clearance" },
    { value: "residency", label: "Certificate of Residency" },
    { value: "indigency", label: "Certificate of Indigency" },
    { value: "good-conduct", label: "Good Conduct Clearance" },
    { value: "business-permit", label: "Business Permit Clearance" },
  ];

  const deliveryOptions = [
    { value: "pickup", label: "Pick up at Barangay Hall" },
    { value: "email", label: "Email (Digital Copy)" },
    { value: "delivery", label: "Home Delivery" },
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await documentRequestService.getAll();
      setRequests(response.data);
    } catch (err) {
      console.error("Error fetching document requests:", err);
      setError("Failed to load document requests");
      toast.error("Failed to load document requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedRequest) return;

    try {
      setUpdating(true);
      await documentRequestService.updateStatus(selectedRequest._id, {
        status,
        processingNotes,
      });
      toast.success(`Request ${status} successfully`);
      setShowModal(false);
      setProcessingNotes("");
      fetchRequests();
    } catch (err) {
      console.error("Error updating request status:", err);
      toast.error("Failed to update request status");
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setEditFormData({
      documentType: request.documentType,
      purpose: request.purpose,
      additionalDetails: request.additionalDetails || "",
      deliveryOption: request.deliveryOption,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await documentRequestService.update(selectedRequest._id, editFormData);
      toast.success("Document request updated successfully");
      setShowEditModal(false);
      fetchRequests();
    } catch (err) {
      console.error("Error updating document request:", err);
      toast.error("Failed to update document request");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (request) => {
    if (window.confirm("Are you sure you want to delete this document request?")) {
      try {
        await documentRequestService.delete(request._id);
        toast.success("Document request deleted successfully");
        fetchRequests();
      } catch (err) {
        console.error("Error deleting document request:", err);
        toast.error("Failed to delete document request");
      }
    }
  };

  const handleViewQr = async (request) => {
    if (request.status !== "approved" && request.status !== "completed") {
      toast.warning(
        "QR code is only available for approved or completed requests"
      );
      return;
    }

    setSelectedRequest(request);
    setShowQrModal(true);
    setLoadingQr(true);

    try {
      const response = await documentRequestService.getQrCode(request._id);
      setQrCode(response.data.qrCode);
    } catch (err) {
      console.error("Error fetching QR code:", err);
      toast.error("Failed to load QR code");
    } finally {
      setLoadingQr(false);
    }
  };

  const handleSelectRequest = (requestId) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId);
    } else {
      newSelected.add(requestId);
    }
    setSelectedRequests(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRequests.size === requests.length) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(requests.map(r => r._id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedRequests.size === 0) {
      toast.error("Please select requests to perform bulk action");
      return;
    }

    try {
      setUpdating(true);
      const requestIds = Array.from(selectedRequests);
      
      // This would require a bulk update endpoint in the API
      const promises = requestIds.map(id => 
        documentRequestService.updateStatus(id, { status: bulkAction })
      );
      
      await Promise.all(promises);
      toast.success(`Bulk action ${bulkAction} completed successfully`);
      setShowBulkActionModal(false);
      setSelectedRequests(new Set());
      fetchRequests();
    } catch (err) {
      console.error("Error performing bulk action:", err);
      toast.error("Failed to perform bulk action");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge bg="success">Completed</Badge>;
      case "approved":
        return <Badge bg="info">Approved</Badge>;
      case "rejected":
        return <Badge bg="danger">Rejected</Badge>;
      case "pending":
      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  const formatDocumentType = (type) => {
    const doc = documentTypes.find((d) => d.value === type);
    return doc ? doc.label : type;
  };

  const openStatusModal = (request) => {
    setSelectedRequest(request);
    setProcessingNotes(request.processingNotes || "");
    setShowModal(true);
  };

  const formatDeliveryOption = (option) => {
    const opt = deliveryOptions.find((o) => o.value === option);
    return opt ? opt.label : option;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading document requests...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Document Requests Management</h2>
        <div>
          {selectedRequests.size > 0 && (
            <ButtonGroup className="me-2">
              <Button
                variant="primary"
                onClick={() => {
                  setBulkAction("approved");
                  setShowBulkActionModal(true);
                }}
              >
                <FaCheckSquare className="me-2" /> Bulk Approve
              </Button>
              <Button
                variant="warning"
                onClick={() => {
                  setBulkAction("rejected");
                  setShowBulkActionModal(true);
                }}
              >
                <FaBan className="me-2" /> Bulk Reject
              </Button>
            </ButtonGroup>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>
                    <Form.Check
                      type="checkbox"
                      checked={selectedRequests.size === requests.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Request ID</th>
                  <th>Resident</th>
                  <th>Document Type</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Delivery Option</th>
                  <th>Request Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>
                      <Form.Check
                        type="checkbox"
                        checked={selectedRequests.has(request._id)}
                        onChange={() => handleSelectRequest(request._id)}
                      />
                    </td>
                    <td>{request.requestId}</td>
                    <td>{request.residentName}</td>
                    <td>{formatDocumentType(request.documentType)}</td>
                    <td>{request.purpose}</td>
                    <td>{getStatusBadge(request.status)}</td>
                    <td>{formatDeliveryOption(request.deliveryOption)}</td>
                    <td>
                      {new Date(request.requestDate).toLocaleDateString()}
                    </td>
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="outline-secondary"
                          size="sm"
                          id={`dropdown-${request._id}`}
                        >
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => openStatusModal(request)}>
                            <FaFileAlt className="me-2" /> Process Request
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEdit(request)}>
                            <FaEdit className="me-2" /> Edit
                          </Dropdown.Item>
                          {(request.status === "approved" ||
                            request.status === "completed") && (
                            <Dropdown.Item onClick={() => handleViewQr(request)}>
                              <FaQrcode className="me-2" /> View QR Code
                            </Dropdown.Item>
                          )}
                          <Dropdown.Divider />
                          <Dropdown.Item
                            onClick={() => handleDelete(request)}
                            className="text-danger"
                          >
                            <FaTrash className="me-2" /> Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No document requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => !updating && setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Process Document Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <div>
              <h6>Request Details</h6>
              <p>
                <strong>Request ID:</strong> {selectedRequest.requestId}
              </p>
              <p>
                <strong>Resident:</strong> {selectedRequest.residentName}
              </p>
              <p>
                <strong>Document Type:</strong>{" "}
                {formatDocumentType(selectedRequest.documentType)}
              </p>
              <p>
                <strong>Purpose:</strong> {selectedRequest.purpose}
              </p>
              {selectedRequest.additionalDetails && (
                <p>
                  <strong>Additional Details:</strong>{" "}
                  {selectedRequest.additionalDetails}
                </p>
              )}
              <p>
                <strong>Current Status:</strong>{" "}
                {getStatusBadge(selectedRequest.status)}
              </p>

              <Form.Group className="mt-3">
                <Form.Label>Processing Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={processingNotes}
                  onChange={(e) => setProcessingNotes(e.target.value)}
                  placeholder="Add any processing notes or instructions..."
                  disabled={updating}
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleStatusUpdate("rejected")}
            disabled={updating}
          >
            <FaTimes className="me-2" /> Reject
          </Button>
          <Button
            variant="success"
            onClick={() => handleStatusUpdate("approved")}
            disabled={updating}
          >
            <FaCheck className="me-2" /> Approve
          </Button>
          <Button
            variant="primary"
            onClick={() => handleStatusUpdate("completed")}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              <>
                <FaCheck className="me-2" /> Complete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Request Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Document Request</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Document Type</Form.Label>
              <Form.Select
                name="documentType"
                value={editFormData.documentType}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    documentType: e.target.value,
                  })
                }
                required
                disabled={updating}
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Delivery Option</Form.Label>
              <Form.Select
                name="deliveryOption"
                value={editFormData.deliveryOption}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    deliveryOption: e.target.value,
                  })
                }
                required
                disabled={updating}
              >
                {deliveryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Purpose of Request</Form.Label>
              <Form.Control
                type="text"
                name="purpose"
                value={editFormData.purpose}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    purpose: e.target.value,
                  })
                }
                required
                disabled={updating}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Additional Details</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="additionalDetails"
                value={editFormData.additionalDetails}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    additionalDetails: e.target.value,
                  })
                }
                disabled={updating}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEditSubmit}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Action Confirmation Modal */}
      <Modal
        show={showBulkActionModal}
        onHide={() => setShowBulkActionModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Bulk Action</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to {bulkAction} {selectedRequests.size} selected
          document request(s)?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBulkActionModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant={bulkAction === "approved" ? "success" : "warning"}
            onClick={handleBulkAction}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              `Confirm ${bulkAction}`
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        show={showQrModal}
        onHide={() => {
          setShowQrModal(false);
          setSelectedRequest(null);
          setQrCode(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Document Request QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingQr ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading QR Code...</p>
            </div>
          ) : qrCode ? (
            <QrCodeDisplay
              qrCodeData={qrCode}
              title={`${selectedRequest?.documentType} - ${selectedRequest?.requestId}`}
              description="Use this QR code to verify the authenticity of the document"
              size={300}
            />
          ) : (
            <Alert variant="danger">
              Failed to load QR code. Please try again later.
            </Alert>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DocumentRequests;