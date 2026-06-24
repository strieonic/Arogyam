import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { checkSymptoms, getSymptomHistory } from '../../services/aiService';
import { FaHeartbeat, FaSearch, FaHistory, FaExclamationTriangle, FaUserMd, FaArrowRight, FaTimes, FaRobot, FaExclamationCircle, FaSpinner } from 'react-icons/fa';

const COMMON_SYMPTOMS = [
  "Fever", "Headache", "Cough", "Sore throat", "Fatigue", 
  "Nausea", "Vomiting", "Diarrhea", "Stomach ache", "Body ache",
  "Chest pain", "Shortness of breath", "Dizziness", "Rash", "Joint pain"
];

const URGENCY_COLORS = {
  low: "bg-green-500/10 text-green-500 border-green-500/20",
  moderate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  emergency: "bg-red-500/10 text-red-500 border-red-500/20",
};

const SymptomCheckerPage = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getSymptomHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Failed to fetch symptom history", err);
    }
  };

  const toggleSymptom = (symp) => {
    if (selectedSymptoms.includes(symp)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symp));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symp]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await checkSymptoms({ symptoms: selectedSymptoms });
      setResult(res.data.data);
      setStep(2);
      fetchHistory(); // refresh history
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze symptoms.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setSelectedSymptoms([]);
    setResult(null);
    setError("");
  };

  return (
    <div className="page-wrapper relative">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-end">
        <div>
          <Link to="/patient/dashboard" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors mb-3 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="heading-gradient text-3xl font-bold flex items-center gap-3">
            <FaRobot /> AI Symptom Checker
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Enter your symptoms for an initial AI triage and specialist recommendation.</p>
        </div>
        
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="secondary-btn !py-2 !px-4 text-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <FaHistory /> {showHistory ? "Hide History" : "View History"}
        </button>
      </motion.div>

      {/* Safety Banner */}
      <div className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <FaExclamationCircle className="text-blue-400 mt-1 flex-shrink-0" />
        <p className="text-sm text-blue-100">
          <strong>Medical Disclaimer:</strong> This tool is informational only and is <strong>NOT a medical diagnosis</strong>. 
          If you are experiencing a medical emergency, please call your local emergency services immediately.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {showHistory ? (
          <motion.div 
            key="history"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="glass-panel"
          >
            <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Past Checkups</h2>
            {history.length === 0 ? (
              <p className="text-[var(--text-secondary)] text-center py-8">No history found.</p>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item._id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${URGENCY_COLORS[item.urgencyLevel]}`}>
                        {item.urgencyLevel}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.symptoms.map(s => (
                        <span key={s} className="bg-white/10 px-2 py-1 rounded text-xs text-[var(--text-secondary)]">{s}</span>
                      ))}
                    </div>
                    <div className="text-sm">
                      <span className="text-[var(--text-tertiary)]">Recommended: </span>
                      <strong className="text-[var(--text-primary)]">{item.recommendedSpecialist}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="glass-panel"
          >
            <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)]">Step 1: What are you feeling?</h2>
            
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}

            <form onSubmit={handleAddCustom} className="mb-8 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input 
                type="text" 
                placeholder="Type a symptom and press Enter..." 
                className="form-input !pl-10"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
              />
            </form>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Common Symptoms</h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map(symp => {
                  const isSelected = selectedSymptoms.includes(symp);
                  return (
                    <button
                      key={symp}
                      onClick={() => toggleSymptom(symp)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        isSelected 
                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]' 
                          : 'bg-white/5 text-[var(--text-secondary)] border-white/10 hover:border-white/30'
                      }`}
                    >
                      {symp}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSymptoms.length > 0 && (
              <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">Selected Symptoms</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map(symp => (
                    <span key={symp} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 text-sm flex items-center gap-2">
                      {symp}
                      <FaTimes className="cursor-pointer hover:text-white" onClick={() => toggleSymptom(symp)} />
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button 
                onClick={handleAnalyze} 
                disabled={selectedSymptoms.length === 0 || loading}
                className="primary-btn flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : "Analyze Symptoms"}
                {!loading && <FaArrowRight />}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Triage Result Card */}
            <div className="glass-panel border-t-4" style={{ borderColor: result?.urgencyLevel === 'emergency' ? '#ef4444' : result?.urgencyLevel === 'high' ? '#f97316' : result?.urgencyLevel === 'moderate' ? '#eab308' : '#22c55e' }}>
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">Triage Results</h2>
                  <p className="text-sm text-[var(--text-tertiary)] mt-1">Based on {selectedSymptoms.length} reported symptoms</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-bold uppercase tracking-wide border ${URGENCY_COLORS[result?.urgencyLevel] || URGENCY_COLORS.low}`}>
                  {result?.urgencyLevel} Urgency
                </div>
              </div>

              {result?.urgencyLevel === 'emergency' && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 flex items-start gap-3">
                  <FaExclamationTriangle className="text-3xl mt-1 text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold text-red-400 mb-1">Emergency Attention Required</h3>
                    <p>Your symptoms match critical indicators. Please proceed to the nearest emergency room or call an ambulance immediately.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-sm uppercase font-bold tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center gap-2">
                    <FaHeartbeat className="text-pink-400" /> Possible Causes
                  </h3>
                  <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
                    {result?.possibleCauses?.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm uppercase font-bold tracking-wider text-[var(--text-tertiary)] mb-3 flex items-center gap-2">
                    <FaUserMd className="text-blue-400" /> Recommended Action
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="text-xs text-[var(--text-tertiary)] mb-1">Consult a:</div>
                    <div className="text-xl font-bold text-[var(--accent-primary)] mb-4">{result?.recommendedSpecialist}</div>
                    
                    <div className="text-xs text-[var(--text-tertiary)] mb-2">General Advice:</div>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-[var(--text-secondary)]">
                      {result?.recommendations?.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-white/10">
                <button onClick={handleReset} className="secondary-btn">Check Again</button>
                <Link to="/patient/appointments">
                  <button className="primary-btn bg-blue-600 hover:bg-blue-500">Book Appointment</button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SymptomCheckerPage;
