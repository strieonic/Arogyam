import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  replyToComplaint,
} from "../../services/complaintService";
import { FaPlus } from "react-icons/fa";

// Sub-components
import TicketList from "./support/TicketList";
import TicketForm from "./support/TicketForm";
import TicketDetail from "./support/TicketDetail";

const CATEGORIES = [
  { value: "technical_issue", label: "Technical Issue" },
  { value: "hospital_issue", label: "Hospital Issue" },
  { value: "doctor_issue", label: "Doctor Issue" },
  { value: "account_problem", label: "Account Problem" },
  { value: "appointment_issue", label: "Appointment Issue" },
  { value: "report_issue", label: "Report Issue" },
  { value: "billing_issue", label: "Billing Issue" },
  { value: "other", label: "Other" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const SupportCenter = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState("my-tickets"); // 'my-tickets', 'create-ticket', 'ticket-detail'
  
  // List State
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Detail State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    category: "technical_issue",
    priority: "medium",
    subject: "",
    description: "",
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeTab === "my-tickets") {
      fetchMyTickets();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "ticket-detail" && selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket, activeTab]);

  const fetchMyTickets = async () => {
    setIsLoading(true);
    try {
      const res = await getMyComplaints();
      setTickets(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetails = async (id) => {
    setIsLoading(true);
    try {
      const res = await getComplaintById(id);
      setSelectedTicket(res.data.complaint);
      setActiveTab("ticket-detail");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      setError("Subject and description are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const submission = new FormData();
      submission.append("category", formData.category);
      submission.append("priority", formData.priority);
      submission.append("subject", formData.subject);
      submission.append("description", formData.description);
      const roleMap = {
        patient: "Patient",
        hospital: "Hospital",
        doctor: "Doctor",
        admin: "Admin"
      };
      const formattedRole = roleMap[role] || "Patient";

      submission.append("userRole", formattedRole);
      submission.append("userName", user.name || user.hospitalName || "User");

      files.forEach((file) => {
        submission.append("attachments", file);
      });

      await createComplaint(submission);
      
      // Reset & Redirect
      setFormData({
        category: "technical_issue",
        priority: "medium",
        subject: "",
        description: "",
      });
      setFiles([]);
      setActiveTab("my-tickets");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsReplying(true);
    try {
      const roleMap = {
        patient: "Patient",
        hospital: "Hospital",
        doctor: "Doctor",
        admin: "Admin"
      };
      const formattedRole = roleMap[role] || "Patient";

      const res = await replyToComplaint(selectedTicket._id, {
        message: replyMessage,
        senderModel: formattedRole,
        senderName: user.name || user.hospitalName || "User",
      });
      setSelectedTicket(res.data.complaint);
      setReplyMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "open": return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-md text-xs font-medium">Open</span>;
      case "in_review": return <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded-md text-xs font-medium">In Review</span>;
      case "awaiting_user_response": return <span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded-md text-xs font-medium">Action Required</span>;
      case "resolved": return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-md text-xs font-medium">Resolved</span>;
      case "closed": return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-md text-xs font-medium">Closed</span>;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low": return "text-blue-500";
      case "medium": return "text-yellow-500";
      case "high": return "text-orange-500";
      case "urgent": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Support Center</h1>
          <p className="text-[var(--text-secondary)] text-sm">Need help? We're here for you.</p>
        </div>
        
        {activeTab === "ticket-detail" ? (
          <button onClick={() => setActiveTab("my-tickets")} className="btn-outline btn-sm">
            &larr; Back to Tickets
          </button>
        ) : (
          <div className="flex bg-[var(--bg-card)] p-1 rounded-lg border border-[var(--border-subtle)]">
            <button
              onClick={() => setActiveTab("my-tickets")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "my-tickets" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              My Tickets
            </button>
            <button
              onClick={() => setActiveTab("create-ticket")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === "create-ticket" ? "bg-[var(--accent-primary)] text-white shadow-sm" : "text-[var(--text-secondary)] hover:text-white"
              }`}
            >
              <FaPlus /> Create Ticket
            </button>
          </div>
        )}
      </div>

      {activeTab === "my-tickets" && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <TicketList 
            tickets={tickets} 
            isLoading={isLoading} 
            onSelect={fetchTicketDetails} 
            onOpenCreate={() => setActiveTab("create-ticket")}
            getStatusBadge={getStatusBadge}
          />
        </div>
      )}

      {activeTab === "create-ticket" && (
        <TicketForm 
          formData={formData}
          setFormData={setFormData}
          files={files}
          setFiles={setFiles}
          error={error}
          setError={setError}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          categories={CATEGORIES}
          priorities={PRIORITIES}
        />
      )}

      {activeTab === "ticket-detail" && selectedTicket && (
        <TicketDetail 
          ticket={selectedTicket}
          user={user}
          replyMessage={replyMessage}
          setReplyMessage={setReplyMessage}
          isReplying={isReplying}
          onReply={handleReply}
          messagesEndRef={messagesEndRef}
          getStatusBadge={getStatusBadge}
          getPriorityColor={getPriorityColor}
        />
      )}
    </div>
  );
};

export default SupportCenter;
