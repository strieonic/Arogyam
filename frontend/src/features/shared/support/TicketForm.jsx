import React, { useRef } from 'react';
import { FaComments, FaPaperclip, FaTimes, FaSpinner } from 'react-icons/fa';

const TicketForm = ({ 
  formData, 
  setFormData, 
  files, 
  setFiles, 
  error, 
  setError, 
  isSubmitting, 
  onSubmit,
  categories,
  priorities
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    if (files.length + selectedFiles.length > 3) {
      setError("Maximum 3 attachments allowed.");
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      const isValidType = ["image/jpeg", "image/png", "application/pdf"].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      setError("Some files were rejected. Only JPG, PNG, PDF under 5MB allowed.");
    } else {
      setError("");
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-subtle)] max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <FaComments className="text-[var(--accent-primary)]" /> New Support Request
      </h2>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded-lg text-sm mb-6">{error}</div>}
      
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Category</label>
            <select 
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent-primary)]"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Priority</label>
            <select 
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent-primary)]"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Subject</label>
          <input 
            type="text" 
            required
            placeholder="Brief summary of the issue"
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent-primary)]"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Description</label>
          <textarea 
            required
            rows={5}
            placeholder="Provide detailed information about your issue..."
            className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--accent-primary)] resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)] flex items-center justify-between">
            <span>Attachments (Optional, max 3)</span>
            <span className="text-xs text-[var(--text-tertiary)]">JPG, PNG, PDF &lt; 5MB</span>
          </label>
          
          <div className="flex flex-wrap gap-3">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-2 bg-[var(--bg-elevated)] px-3 py-2 rounded-lg border border-[var(--border-subtle)] text-sm">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300">
                  <FaTimes />
                </button>
              </div>
            ))}
            
            {files.length < 3 && (
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-[var(--bg-elevated)] hover:bg-white/5 border border-dashed border-[var(--border-subtle)] px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] transition-colors"
              >
                <FaPaperclip /> Add File
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              accept=".jpg,.jpeg,.png,.pdf" 
              onChange={handleFileChange} 
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="btn-primary flex items-center gap-2"
          >
            {isSubmitting ? <><FaSpinner className="animate-spin"/> Submitting...</> : "Submit Ticket"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
