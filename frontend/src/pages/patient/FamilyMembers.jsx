import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { FaUserPlus, FaUsers, FaTrash, FaHeartbeat } from 'react-icons/fa';
import { toast } from 'sonner';

const FamilyMembers = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    aadhaar: '',
    relation: '',
    age: '',
    bloodGroup: '',
    allergies: ''
  });

  const fetchMembers = async () => {
    try {
      const res = await api.get('/patient/family');
      setMembers(res.data.familyMembers || []);
    } catch (err) {
      toast.error('Failed to load family members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/patient/family/add', formData);
      toast.success('Family member added successfully!');
      setShowAddForm(false);
      setFormData({ name: '', phone: '', aadhaar: '', relation: '', age: '', bloodGroup: '', allergies: '' });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Are you sure you want to remove this family member?')) return;
    try {
      await api.delete(`/patient/family/${id}`);
      toast.success('Member removed');
      fetchMembers();
    } catch (err) {
      toast.error('Failed to remove member');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="heading-gradient"><FaUsers style={{ marginRight: '10px' }}/> Family Management</h1>
        <button className="primary-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <FaUserPlus /> {showAddForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '2rem' }}>
            <div className="glass-panel" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-color)' }}>Link or Add New Dependent</h3>
              <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Full Name</label>
                  <input type="text" name="name" className="glass-input" required value={formData.name} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Relation</label>
                  <input type="text" name="relation" className="glass-input" required placeholder="e.g. Son, Mother" value={formData.relation} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Phone Number (Optional)</label>
                  <input type="text" name="phone" className="glass-input" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Aadhaar (Optional)</label>
                  <input type="text" name="aadhaar" className="glass-input" value={formData.aadhaar} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Age</label>
                  <input type="number" name="age" className="glass-input" value={formData.age} onChange={handleChange} />
                </div>
                <div className="input-group">
                  <label>Blood Group</label>
                  <input type="text" name="bloodGroup" className="glass-input" value={formData.bloodGroup} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Known Allergies</label>
                  <input type="text" name="allergies" className="glass-input" value={formData.allergies} onChange={handleChange} />
                </div>
                <button type="submit" className="primary-btn" disabled={loading} style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                  {loading ? 'Processing...' : 'Secure & Add Member'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !showAddForm ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>Loading family data...</div>
      ) : members.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem', color: 'var(--text-secondary)' }}>
          <FaUsers style={{ fontSize: '3rem', opacity: 0.5, marginBottom: '1rem' }} />
          <p>No family members linked to your profile yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {members.map((member) => (
            <motion.div key={member._id} className="glass-panel" whileHover={{ y: -5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{member.name}</h3>
                  <span style={{ fontSize: '0.8rem', background: 'rgba(0, 242, 254, 0.1)', color: 'var(--secondary-color)', padding: '2px 8px', borderRadius: '12px' }}>{member.relation}</span>
                </div>
                <button onClick={() => handleRemove(member._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', opacity: 0.7 }}>
                  <FaTrash />
                </button>
              </div>
              
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <p><strong>Arogyam ID:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--accent-pink)' }}>{member.healthId}</span></p>
                {member.bloodGroup && <p><strong>Blood Group:</strong> {member.bloodGroup}</p>}
                {member.allergies && <p><strong>Allergies:</strong> {member.allergies}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default FamilyMembers;
