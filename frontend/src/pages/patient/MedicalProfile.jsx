import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { FaHeartbeat, FaNotesMedical, FaSave, FaUserNurse } from 'react-icons/fa';
import { toast } from 'sonner';

const MedicalProfile = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    allergies: '',
    emergencyContact: '',
    address: '',
    phone: '',
    aadhaar: ''
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patient/profile');
      const profile = res.data;
      setFormData({
        bloodGroup: profile.bloodGroup || '',
        allergies: Array.isArray(profile.allergies) ? profile.allergies.join(', ') : (profile.allergies || ''),
        emergencyContact: profile.emergencyContact?.name ? `${profile.emergencyContact.name}${profile.emergencyContact.phone ? ' - ' + profile.emergencyContact.phone : ''}` : (profile.emergencyContact || ''),
        address: profile.address || '',
        phone: profile.phone || '',
        aadhaar: profile.aadhaar || ''
      });
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Structure data for backend (allergies to array, emergencyContact to object)
      const submissionData = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [],
        emergencyContact: {
          phone: formData.emergencyContact,
          name: 'Primary Emergency Contact',
          relation: 'Contact'
        }
      };
      
      await api.put('/patient/profile/update-medical', submissionData);
      toast.success('Medical profile updated successfully');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update medical profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="text-center" style={{ padding: '4rem', color: 'var(--text-secondary)' }}>Loading Profile...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 className="heading-gradient text-center" style={{ marginBottom: '2rem' }}>
        <FaHeartbeat style={{ marginRight: '10px' }} />
        Medical Profile
      </h1>

      <div className="glass-panel">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
          Update your medical profile so that hospitals can quickly provide better care in emergency situations.
        </p>
        
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaNotesMedical color="var(--primary-color)"/> Aadhaar Card Number
            </label>
            <input type="text" name="aadhaar" className="glass-input" placeholder="XXXX XXXX XXXX" value={formData.aadhaar} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaNotesMedical color="var(--primary-color)"/> Blood Group
            </label>
            <input type="text" name="bloodGroup" className="glass-input" placeholder="e.g. O+, A-, AB+" value={formData.bloodGroup} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaNotesMedical color="var(--accent-pink)"/> Known Allergies
            </label>
            <textarea name="allergies" className="glass-input" rows="2" placeholder="List any known allergies to medication, food, etc." value={formData.allergies} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUserNurse color="var(--secondary-color)"/> Primary Phone
              </label>
              <input type="text" name="phone" className="glass-input" placeholder="+91 XXXXXXXXXX" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaUserNurse color="var(--secondary-color)"/> Emergency Contact
              </label>
              <input type="text" name="emergencyContact" className="glass-input" placeholder="+91 XXXXXXXXXX" value={formData.emergencyContact} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaNotesMedical color="var(--success)"/> Permanent Address
            </label>
            <textarea name="address" className="glass-input" rows="3" placeholder="Enter your full residential address" value={formData.address} onChange={handleChange} />
          </div>

          <button type="submit" className="primary-btn" disabled={saving} style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {saving ? 'Updating...' : <><FaSave /> Save Medical Profile</>}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default MedicalProfile;
