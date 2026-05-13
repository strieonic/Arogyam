// src/pages/patient/MyRecords.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getPatientRecords } from '../../services/patientService';
import { getMedicalSummary } from '../../services/aiService';
import { FaFilePdf, FaImage, FaStethoscope, FaFilter, FaDownload, FaExternalLinkAlt, FaRobot, FaTimes, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';

const MyRecords = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [filter, setFilter] = useState('all');

  // AI Summary State
  const [summarizingId, setSummarizingId] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryError, setSummaryError] = useState("");

  const fetchRecords = () => {
    setLoading(true);
    setFetchError(false);
    getPatientRecords()
      .then(res => setRecords(res.data.records || []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, []);

  const getIcon = (type) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('report') || t.includes('lab')) return <FaFilePdf className="text-blue-400" />;
    if (t.includes('prescription')) return <FaStethoscope className="text-emerald-400" />;
    if (t.includes('xray') || t.includes('imaging')) return <FaImage className="text-purple-400" />;
    return <FaFilePdf className="text-[var(--secondary-color)]" />;
  };

  const filtered = filter === 'all' 
    ? records 
    : records.filter(r => r.recordType?.toLowerCase().includes(filter.toLowerCase()));

  const handleSummarize = async (recordId) => {
    setSummarizingId(recordId);
    setSummaryError("");
    try {
      const res = await getMedicalSummary(recordId);
      setSummaryData(res.data.result);
    } catch (err) {
      setSummaryError(err.response?.data?.message || "Failed to generate AI summary.");
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link to="/patient/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors mb-3 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="heading-gradient text-3xl font-bold">Medical Report Center</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">All your prescriptions, lab reports, and imaging in one place</p>
        </div>
      </motion.div>

      {/* Filter Pills */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {['all', 'prescription', 'lab', 'imaging', 'report'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
              filter === f
                ? 'bg-[var(--accent-primary)] text-white border-transparent'
                : 'border-white/10 text-[var(--text-secondary)] hover:border-white/20'
            }`}
          >
            <FaFilter className="inline mr-1 opacity-60" />
            {f === 'all' ? 'All Records' : f}
            {f !== 'all' && (
              <span className="ml-1.5 opacity-70">
                ({records.filter(r => r.recordType?.toLowerCase().includes(f.toLowerCase())).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : fetchError ? (
        <ErrorState
          title="Failed to load records"
          message="We couldn't fetch your medical records. Please check your connection and try again."
          onRetry={fetchRecords}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          emoji="📂"
          title={filter === 'all' ? 'No records yet' : `No ${filter} records found`}
          description={filter === 'all' ? 'Your hospitals will upload reports here after each visit.' : `Try switching to 'All Records' to see everything.`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filtered.map((record, index) => {
              const fileUrl = record.fileUrl?.startsWith('http') 
                ? record.fileUrl 
                : `${import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || ''}${record.fileUrl}`;
                
              return (
                <motion.div 
                  key={record._id || index}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-panel flex flex-col hover:border-white/20 group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner">
                      {getIcon(record.recordType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[var(--text-primary)] truncate">{record.recordType || 'Medical Record'}</h3>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {new Date(record.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 italic">"{record.notes}"</p>
                    </div>
                  )}

                  <div className="mt-auto border-t border-white/10 pt-4 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-[var(--text-tertiary)] block mb-0.5">Uploaded by</span>
                      <span className="font-semibold text-[var(--text-secondary)] truncate max-w-[150px] inline-block">
                        {record.hospital?.hospitalName || 'Unknown Hospital'}
                      </span>
                    </div>
                    
                    
                    <div className="flex gap-2">
                      {record.recordType?.toLowerCase().includes('report') && (
                        <button
                          onClick={() => handleSummarize(record._id)}
                          disabled={summarizingId === record._id}
                          className="px-3 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-colors flex items-center gap-2 text-xs font-medium disabled:opacity-50"
                          title="Summarize with AI"
                        >
                          {summarizingId === record._id ? <FaSpinner className="animate-spin" /> : <FaRobot />}
                          <span className="hidden sm:inline">AI Summary</span>
                        </button>
                      )}
                      <a 
                        href={fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="w-8 h-8 rounded-lg bg-white/5 text-[var(--text-secondary)] flex items-center justify-center hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)] transition-colors border border-white/10"
                        title="View Document"
                      >
                        <FaExternalLinkAlt className="text-xs" />
                      </a>
                      <a 
                        href={fileUrl.includes('/upload/') ? fileUrl.replace('/upload/', '/upload/fl_attachment/') : fileUrl} 
                        download
                        className="w-8 h-8 rounded-lg bg-white/5 text-[var(--text-secondary)] flex items-center justify-center hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors border border-white/10"
                        title="Download PDF"
                      >
                        <FaDownload className="text-xs" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* AI Summary Modal (Clean & Clinical) */}
      <AnimatePresence>
        {(summaryData || summaryError) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white text-gray-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold flex items-center gap-2 text-blue-700">
                  <FaRobot /> Medical Report Summary
                </h3>
                <button 
                  onClick={() => { setSummaryData(null); setSummaryError(""); }}
                  className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {summaryError ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-start gap-3">
                    <FaExclamationTriangle className="mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold">Analysis Failed</h4>
                      <p className="text-sm mt-1">{summaryError}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-900 leading-relaxed">
                      {summaryData.summary}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Abnormal Findings */}
                      {summaryData.abnormalFindings && summaryData.abnormalFindings.length > 0 && (
                        <div>
                          <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <FaExclamationTriangle /> Needs Attention
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            {summaryData.abnormalFindings.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}

                      {/* Normal Findings */}
                      {summaryData.normalFindings && summaryData.normalFindings.length > 0 && (
                        <div>
                          <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2 text-sm uppercase tracking-wide">
                            <FaCheckCircle /> Normal Results
                          </h4>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            {summaryData.normalFindings.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Possible Concerns */}
                    {summaryData.possibleConcerns && summaryData.possibleConcerns.length > 0 && (
                      <div className="border-t border-gray-100 pt-4">
                        <h4 className="font-bold text-orange-700 mb-2 text-sm uppercase tracking-wide">What this means</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                          {summaryData.possibleConcerns.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                      </div>
                    )}

                    {/* Action Plan */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Suggested Next Steps</h4>
                      
                      <div className="mb-4">
                        <div className="text-xs text-gray-500 font-semibold mb-1 uppercase">Recommended Specialist</div>
                        <div className="text-sm font-medium text-gray-900">{summaryData.recommendedSpecialist || "General Physician"}</div>
                      </div>

                      {summaryData.followUpSuggestions && summaryData.followUpSuggestions.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-500 font-semibold mb-1 uppercase">Lifestyle & Advice</div>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                            {summaryData.followUpSuggestions.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex items-start gap-2 shrink-0">
                <FaInfoCircle className="mt-0.5 flex-shrink-0 text-blue-500" />
                <p>This summary is generated by AI to help you understand your reports. It is <strong>not a medical diagnosis</strong>. Always consult your doctor before making health decisions.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyRecords;
