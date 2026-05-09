import React, { useState, useEffect, useRef } from "react";
import { FaTicketAlt, FaEye, FaFilter, FaTimes, FaComments, FaPaperclip, FaCheck, FaBan, FaPaperPlane } from "react-icons/fa";
import { getAllComplaints, updateComplaintStatus, replyToComplaint } from "../../services/complaintService";
import { timeAgo, formatDate } from "../../utils/formatters";

const ComplaintManagement = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  
  // Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.replies?.length]);

  const fetchComplaints = async () => {
    try {
      const res = await getAllComplaints();
      setComplaints(res.data.complaints || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterPriority !== "all" && c.priority !== filterPriority) return false;
    return true;
  });

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsUpdating(true);
    try {
      const res = await replyToComplaint(selectedTicket._id, {
        message: replyMessage,
        senderModel: "Admin",
        senderName: "Arogyam Support",
      });
      setSelectedTicket(res.data.complaint);
      setComplaints(prev => prev.map(c => c._id === res.data.complaint._id ? res.data.complaint : c));
      setReplyMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setIsUpdating(true);
    try {
      const res = await updateComplaintStatus(selectedTicket._id, {
        status,
        resolutionNotes: status === "resolved" ? resolutionNotes : selectedTicket.resolutionNotes,
      });
      setSelectedTicket(res.data.complaint);
      setComplaints(prev => prev.map(c => c._id === res.data.complaint._id ? res.data.complaint : c));
      if (status === "resolved") setResolutionNotes("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
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

  if (loading) return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="skeleton h-8 w-48 rounded-lg" />
          <div className="skeleton h-4 w-72 rounded" />
        </div>
        <div className="flex gap-3">
          <div className="skeleton h-9 w-36 rounded-lg" />
          <div className="skeleton h-9 w-36 rounded-lg" />
        </div>
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="bg-white/5 p-4 flex gap-4">
          {['Ticket ID','User','Role','Category','Priority','Status','Created','Action'].map(h => (
            <div key={h} className="flex-1"><div className="skeleton h-4 w-3/4 rounded" /></div>
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border-t border-white/5">
            {[...Array(8)].map((__, j) => (
              <div key={j} className="flex-1"><div className="skeleton h-4 w-5/6 rounded" /></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FaTicketAlt className="text-[var(--accent-primary)]" />
            Support Tickets
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">Manage user complaints and platform issues.</p>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-[var(--border-subtle)]">
            <FaFilter className="text-[var(--text-tertiary)]" />
            <select
              className="bg-transparent text-sm focus:outline-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="awaiting_user_response">Awaiting Response</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-[var(--border-subtle)]">
            <FaFilter className="text-[var(--text-tertiary)]" />
            <select
              className="bg-transparent text-sm focus:outline-none capitalize"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-[var(--text-secondary)] uppercase text-xs">
            <tr>
              <th className="p-4 font-medium">Ticket ID</th>
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Priority</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Created</th>
              <th className="p-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-[var(--text-tertiary)]">
                  No tickets found matching criteria.
                </td>
              </tr>
            ) : (
              filteredComplaints.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-mono text-xs">{ticket.ticketNumber}</td>
                  <td className="p-4 font-medium">{ticket.userName}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-white/5 rounded text-xs">{ticket.userRole}</span></td>
                  <td className="p-4 capitalize text-[var(--text-secondary)]">{ticket.category.replace("_", " ")}</td>
                  <td className={`p-4 font-medium capitalize ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</td>
                  <td className="p-4">{getStatusBadge(ticket.status)}</td>
                  <td className="p-4 text-xs text-[var(--text-tertiary)]">{timeAgo(ticket.createdAt)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="text-[var(--accent-primary)] hover:text-white p-2 rounded-lg bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)] transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TICKET DETAILS MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex overflow-hidden">
            
            {/* LEFT SIDE: Thread */}
            <div className="flex-1 flex flex-col border-r border-[var(--border-subtle)]">
              {/* Header */}
              <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-lg">{selectedTicket.subject}</h3>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">
                    {selectedTicket.ticketNumber} • from {selectedTicket.userName} ({selectedTicket.userRole})
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-[var(--text-tertiary)] hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-black/10">
                {/* Initial Description */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2 gap-4">
                      <span className="font-medium text-xs text-[var(--text-secondary)]">{selectedTicket.userName}</span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">{formatDate(selectedTicket.createdAt)}</span>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{selectedTicket.description}</div>
                    
                    {/* Initial Attachments */}
                    {selectedTicket.attachments?.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-2">
                        {selectedTicket.attachments.map(att => (
                          <a 
                            key={att.publicId} 
                            href={att.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg text-xs hover:bg-[var(--accent-primary)]/20 transition-colors"
                          >
                            <FaPaperclip className="text-[var(--accent-primary)]" />
                            {att.type === "pdf" ? "Document.pdf" : "View Image"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {selectedTicket.replies?.map((reply, i) => {
                  const isAdmin = reply.senderModel === "Admin";
                  return (
                    <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-xl p-4 border ${
                        isAdmin 
                          ? "bg-blue-500/10 border-blue-500/20" 
                          : "bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
                      }`}>
                        <div className="flex justify-between items-center mb-2 gap-4">
                          <span className={`font-medium text-xs ${isAdmin ? "text-blue-400" : "text-[var(--text-secondary)]"}`}>
                            {isAdmin ? reply.senderName : selectedTicket.userName}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)]">{formatDate(reply.timestamp)}</span>
                        </div>
                        <div className="text-sm whitespace-pre-wrap">{reply.message}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              {["resolved", "closed"].includes(selectedTicket.status) ? (
                <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] text-center text-sm text-[var(--text-secondary)] shrink-0">
                  This ticket has been marked as {selectedTicket.status}.
                </div>
              ) : (
                <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] shrink-0">
                  <form onSubmit={handleReply} className="flex gap-2">
                    <textarea
                      required
                      rows={2}
                      placeholder="Type a reply to the user..."
                      className="flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      disabled={isUpdating}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <FaPaperPlane />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: Admin Actions */}
            <div className="w-80 bg-[var(--bg-elevated)] flex flex-col shrink-0 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase text-[var(--text-tertiary)] mb-4">Properties</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Status</span>
                      <span>{getStatusBadge(selectedTicket.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Priority</span>
                      <span className={`capitalize font-medium ${getPriorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Category</span>
                      <span className="capitalize">{selectedTicket.category.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border-subtle)]">
                  <h4 className="text-xs font-bold uppercase text-[var(--text-tertiary)] mb-4">Admin Actions</h4>
                  <div className="space-y-2">
                    {selectedTicket.status !== "in_review" && !["resolved", "closed"].includes(selectedTicket.status) && (
                      <button 
                        onClick={() => handleUpdateStatus("in_review")}
                        disabled={isUpdating}
                        className="w-full btn-outline btn-sm justify-center"
                      >
                        Mark as In Review
                      </button>
                    )}
                    
                    {!["resolved", "closed"].includes(selectedTicket.status) && (
                      <div className="pt-4 space-y-2">
                        <textarea
                          placeholder="Resolution Notes (visible to user)..."
                          className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-2 text-sm focus:border-green-500 focus:outline-none"
                          rows={3}
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                        />
                        <button 
                          onClick={() => handleUpdateStatus("resolved")}
                          disabled={isUpdating || !resolutionNotes.trim()}
                          className="w-full bg-green-600 hover:bg-green-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <FaCheck /> Mark Resolved
                        </button>
                      </div>
                    )}

                    {selectedTicket.status !== "closed" && (
                      <button 
                        onClick={() => handleUpdateStatus("closed")}
                        disabled={isUpdating}
                        className="w-full mt-4 bg-[var(--bg-card)] border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FaBan /> Close Ticket
                      </button>
                    )}
                  </div>
                </div>

                {selectedTicket.resolutionNotes && (
                  <div className="pt-6 border-t border-[var(--border-subtle)]">
                    <h4 className="text-xs font-bold uppercase text-[var(--text-tertiary)] mb-2">Saved Notes</h4>
                    <p className="text-sm bg-green-500/10 text-green-400 p-3 rounded-lg border border-green-500/20">
                      {selectedTicket.resolutionNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintManagement;
