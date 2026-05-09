import React from 'react';
import { timeAgo } from '../../../utils/formatters';
import { FaCheckCircle } from 'react-icons/fa';

const TicketList = ({ tickets, isLoading, onSelect, onOpenCreate, getStatusBadge }) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-white/5 rounded-lg">
            <div className="skeleton h-4 w-28 rounded" />
            <div className="skeleton h-4 flex-1 rounded" />
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="p-12 text-center flex flex-col items-center">
        <FaCheckCircle className="text-4xl text-[var(--text-tertiary)] mb-4" />
        <h3 className="text-lg font-medium">No active tickets</h3>
        <p className="text-[var(--text-secondary)] mb-6">Everything seems to be working fine.</p>
        <button onClick={onOpenCreate} className="btn-primary">Open a Ticket</button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-black/20 text-sm text-[var(--text-secondary)] uppercase">
          <tr>
            <th className="p-4 font-medium">Ticket ID</th>
            <th className="p-4 font-medium">Subject</th>
            <th className="p-4 font-medium">Category</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium">Last Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {tickets.map(ticket => (
            <tr 
              key={ticket._id} 
              onClick={() => onSelect(ticket._id)}
              className="hover:bg-white/5 cursor-pointer transition-colors"
            >
              <td className="p-4 font-mono text-xs">{ticket.ticketNumber}</td>
              <td className="p-4">
                <div className="font-medium text-sm text-white line-clamp-1">{ticket.subject}</div>
              </td>
              <td className="p-4 text-sm text-[var(--text-secondary)] capitalize">
                {ticket.category.replace("_", " ")}
              </td>
              <td className="p-4">{getStatusBadge(ticket.status)}</td>
              <td className="p-4 text-xs text-[var(--text-tertiary)]">{timeAgo(ticket.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketList;
