// src/features/doctor/PrescriptionGenerator.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { FaPrescriptionBottleAlt, FaPlus, FaTrash, FaCheckCircle, FaTimes, FaCamera, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../api/axios';
import { extractPrescription } from '../../services/aiService';

const PrescriptionGenerator = ({ appointment, onClose, onGenerated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: '',
    notes: '',
    testsRecommended: '',
    followUpDate: ''
  });
  
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', timing: '', duration: '', instructions: '' }
  ]);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showOcrWarning, setShowOcrWarning] = useState(false);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', timing: '', duration: '', instructions: '' }]);
  };

  const updateMedicine = (index, field, value) => {
    const newMeds = [...medicines];
    newMeds[index][field] = value;
    setMedicines(newMeds);
  };

  const removeMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleOcrUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setOcrLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await extractPrescription(formData);
      const extractedMeds = res.data.data?.medicines;
      
      if (extractedMeds && extractedMeds.length > 0) {
        // Map keys in case Groq didn't match perfectly
        const mapped = extractedMeds.map(m => ({
          name: m.medicine || m.name || '',
          dosage: m.dosage || '',
          timing: m.timing || '',
          duration: m.duration || '',
          instructions: m.instructions || ''
        }));
        
        // If there is only one empty med, replace it. Otherwise append.
        if (medicines.length === 1 && !medicines[0].name) {
          setMedicines(mapped);
        } else {
          setMedicines([...medicines, ...mapped]);
        }
        setShowOcrWarning(true);
        toast.success("Prescription scanned successfully. Please review the AI output.");
      } else {
        toast.error("No medicines found in the image.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extract text from image');
    } finally {
      setOcrLoading(false);
      e.target.value = null; // reset input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.diagnosis) return toast.error("Diagnosis is required");
    if (medicines.some(m => !m.name || !m.dosage || !m.duration || !m.timing)) {
      return toast.error("Please complete all required medicine fields");
    }

    setLoading(true);
    try {
      const payload = {
        appointmentId: appointment._id,
        patientId: appointment.patient._id,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        testsRecommended: formData.testsRecommended ? formData.testsRecommended.split(',').map(s => s.trim()) : [],
        followUpDate: formData.followUpDate || null,
        medicines
      };

      await api.post('/doctor/prescriptions', payload);
      toast.success('Prescription generated successfully! It has been added to the patient timeline.');
      if (onGenerated) onGenerated();
      if (onClose) onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="glass-panel w-full max-w-4xl p-0 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-blue-600/20 border-b border-white/10 p-6 flex justify-between items-center sticky top-0 z-10 backdrop-blur-xl">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FaPrescriptionBottleAlt className="text-blue-400" /> Digital Prescription
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                For: <span className="font-bold text-white">{appointment.patient.name}</span> | Token: {appointment.tokenNumber || 'N/A'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-[var(--text-secondary)] transition-colors">
              <FaTimes />
            </button>
          </div>

          {/* Scrollable Form Area */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
            
            {/* Clinical Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group md:col-span-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Primary Diagnosis <span className="text-red-400">*</span></label>
                <input type="text" className="form-input" placeholder="e.g. Acute Viral Pharyngitis" required 
                  value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
              </div>

              <div className="form-group md:col-span-2">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Clinical Notes / Findings</label>
                <textarea className="form-input min-h-[80px]" placeholder="Patient presents with..."
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
            </div>

            <div className="w-full h-px bg-white/10 my-2"></div>

            {/* Medicines List */}
            <div>
              {showOcrWarning && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                  <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-yellow-200">
                    <strong>AI Scan Alert:</strong> Extracted medicines may contain mistakes from handwritten notes. 
                    <strong> You MUST review, edit, and confirm each entry before saving.</strong>
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                <h3 className="font-bold text-[var(--text-primary)] text-lg">Rx Medicines</h3>
                
                <div className="flex gap-3">
                  <label className="secondary-btn !py-1.5 !px-3 text-xs flex items-center gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/30 cursor-pointer">
                    {ocrLoading ? <FaSpinner className="animate-spin" /> : <FaCamera />}
                    {ocrLoading ? "Scanning..." : "Scan Prescription"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleOcrUpload} disabled={ocrLoading} />
                  </label>

                  <button type="button" onClick={addMedicine} className="secondary-btn !py-1.5 !px-3 text-xs flex items-center gap-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30">
                    <FaPlus /> Add Medicine
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {medicines.map((med, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-4 relative group">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">Medicine Name</label>
                      <input type="text" placeholder="e.g. Paracetamol 500mg" className="form-input !py-1 text-sm bg-black/20 mt-1" 
                        value={med.name} onChange={e => updateMedicine(index, 'name', e.target.value)} required />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">Dosage</label>
                      <input type="text" placeholder="1 Tab" className="form-input !py-1 text-sm bg-black/20 mt-1" 
                        value={med.dosage} onChange={e => updateMedicine(index, 'dosage', e.target.value)} required />
                    </div>
                    <div className="w-32">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">Timing</label>
                      <input type="text" placeholder="1-0-1 (After Food)" className="form-input !py-1 text-sm bg-black/20 mt-1" 
                        value={med.timing} onChange={e => updateMedicine(index, 'timing', e.target.value)} required />
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">Duration</label>
                      <input type="text" placeholder="5 Days" className="form-input !py-1 text-sm bg-black/20 mt-1" 
                        value={med.duration} onChange={e => updateMedicine(index, 'duration', e.target.value)} required />
                    </div>
                    <div className="w-full">
                      <label className="text-[10px] uppercase font-bold text-[var(--text-tertiary)] tracking-wider">Special Instructions (Optional)</label>
                      <input type="text" placeholder="Take with warm water" className="form-input !py-1 text-sm bg-black/20 mt-1" 
                        value={med.instructions} onChange={e => updateMedicine(index, 'instructions', e.target.value)} />
                    </div>
                    
                    {medicines.length > 1 && (
                      <button type="button" onClick={() => removeMedicine(index)} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-red-400/10 p-2 rounded-full hover:bg-red-400/20">
                        <FaTrash size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-white/10 my-2"></div>

            {/* Post-Consultation Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Recommended Lab Tests</label>
                <input type="text" className="form-input" placeholder="e.g. CBC, Lipid Profile (comma separated)" 
                  value={formData.testsRecommended} onChange={e => setFormData({...formData, testsRecommended: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="text-sm font-bold text-[var(--text-secondary)]">Follow-up Date</label>
                <input type="date" className="form-input" 
                  value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="bg-black/40 border-t border-white/10 p-6 flex justify-end gap-4 sticky bottom-0 z-10 backdrop-blur-xl">
            <button type="button" onClick={onClose} className="secondary-btn !py-3">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="primary-btn !bg-blue-600 hover:!bg-blue-500 !py-3 flex items-center gap-2">
              {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></span> : <><FaCheckCircle /> Sign & Issue Prescription</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PrescriptionGenerator;
