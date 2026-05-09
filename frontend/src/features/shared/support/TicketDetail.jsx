import React from 'react';
import { FaPaperclip, FaSpinner, FaPaperPlane } from 'react-icons/fa';
import { timeAgo, formatDate } from '../../../utils/formatters';

const TicketDetail = ({ 
  ticket, 
  user, 
  replyMessage, 
  setReplyMessage, 
  isReplying, 
  onReply, 
  messagesEndRef,
  getStatusBadge,
  getPriorityColor 
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Thread View */}
      <div className="lg:col-span-2 flex flex-col h-[600px] bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">{ticket.subject}</h2>
            <div className="flex gap-3 text-xs text-[var(--text-tertiary)] mt-1">
              <span>Ticket: {ticket.ticketNumber}</span>
              <span>•</span>
              <span>Created {formatDate(ticket.createdAt)}</span>
            </div>
          </div>
          {getStatusBadge(ticket.status)}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Initial Complaint Block */}
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="font-medium text-sm text-[var(--accent-primary)]">You</div>
              <span className="text-xs text-[var(--text-tertiary)]">{timeAgo(ticket.createdAt)}</span>
            </div>
            <div className="text-sm whitespace-pre-wrap">{ticket.description}</div>
            
            {/* Initial Attachments */}
            {ticket.attachments?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap gap-2">
                {ticket.attachments.map(att => (
                  <a 
                    key={att.publicId} 
                    href={att.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-lg text-xs hover:bg-black/40 transition-colors"
                  >
                    <FaPaperclip className="text-[var(--accent-primary)]" />
                    {att.type === "pdf" ? "Document.pdf" : "Image File"}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Replies */}
          {ticket.replies?.map((reply, i) => {
            const isMe = reply.sender === user.id;
            const isAdmin = reply.senderModel === "Admin";
            return (
              <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl p-4 border ${
                  isMe 
                    ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20" 
                    : isAdmin 
                      ? "bg-blue-500/10 border-blue-500/20" 
                      : "bg-[var(--bg-elevated)] border-[var(--border-subtle)]"
                }`}>
                  <div className="flex justify-between items-center mb-2 gap-4">
                    <span className={`font-medium text-xs ${isAdmin ? "text-blue-400" : isMe ? "text-[var(--accent-primary)]" : ""}`}>
                      {isAdmin ? "Arogyam Support" : "You"}
                    </span>
                    <span className="text-[10px] opacity-50">{timeAgo(reply.timestamp)}</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{reply.message}</div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input */}
        {["resolved", "closed"].includes(ticket.status) ? (
          <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)] text-center text-sm text-[var(--text-secondary)]">
            This ticket has been marked as {ticket.status}.
          </div>
        ) : (
          <div className="p-4 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
            <form onSubmit={onReply} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Type a reply..."
                className="flex-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent-primary)]"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isReplying}
                className="bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {isReplying ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Ticket Info Sidebar */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6 h-fit space-y-6">
        <div>
          <h3 className="text-xs uppercase font-bold text-[var(--text-tertiary)] mb-4">Ticket Information</h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Status</span>
              <span>{getStatusBadge(ticket.status)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Priority</span>
              <span className={`font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Category</span>
              <span className="capitalize">{ticket.category.replace("_", " ")}</span>
            </div>
          </div>
        </div>

        {ticket.resolutionNotes && (
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs uppercase font-bold text-[var(--text-tertiary)] mb-2">Resolution Notes</h3>
            <p className="text-sm text-[var(--text-secondary)] bg-green-500/5 p-3 rounded-lg border border-green-500/10">
              {ticket.resolutionNotes}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TicketDetail;
