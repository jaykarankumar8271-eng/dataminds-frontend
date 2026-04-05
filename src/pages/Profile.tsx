import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Phone, MapPin, Briefcase, Save, CheckCircle2, AlertCircle, Trash2, X } from 'lucide-react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth as firebaseAuth } from '../firebase';
import { updateProfile } from '../services/firestoreService';
import { deleteUser, signOut } from 'firebase/auth';

interface ProfileProps {
  tenantId?: string;
  userRole?: string;
  userEmail: string;
  userId: string; // This is entityId if approved, or authUid if pending
  authUid: string; // Always the auth UID
}

const Profile: React.FC<ProfileProps> = ({ tenantId, userRole, userEmail, userId, authUid }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // First check in 'users' collection for the base profile using the original authUid
        const userDocRef = doc(db, 'users', authUid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const baseData = userDocSnap.data();
          setProfileData(baseData);
        } else {
          // Fallback
          setProfileData({
            uid: authUid,
            name: userRole === 'admin' ? 'Administrator' : '',
            email: userEmail,
            role: userRole || 'doctor',
            status: 'pending'
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userRole, authUid, userEmail]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 1. Update the base user profile in 'users' collection using authUid
      const userDocRef = doc(db, 'users', authUid);
      
      // If rejected and requesting access again, set status to pending
      const isReRequesting = profileData.status === 'rejected';
      const newStatus = isReRequesting ? 'pending' : profileData.status;
      
      const updateData = {
        ...profileData,
        status: newStatus,
        requestedAt: newStatus === 'pending' ? new Date().toISOString() : (profileData.requestedAt || new Date().toISOString())
      };
      
      await updateDoc(userDocRef, updateData);

      // Update local state to reflect the change
      setProfileData(updateData);

      // 2. If approved, also update the linked doctor document
      if (newStatus === 'approved' && profileData.entityId) {
        const collectionName = 'doctors';
        const entityDocRef = doc(db, collectionName, profileData.entityId);
        
        const entityData: any = {
          email: profileData.email,
          phone: profileData.phone || '',
          clinicName: profileData.clinicName || '',
          address: profileData.address || '',
          name: profileData.name || profileData.clinicName || '', // Ensure name is present
        };

        await updateDoc(entityDocRef, entityData);
      }
      
      setMessage({ 
        type: 'success', 
        text: isReRequesting || newStatus === 'pending' ? 'Access request submitted successfully!' : 'Profile updated successfully!' 
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDeleteAccount = async () => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) return;

    setDeleting(true);
    try {
      // 1. Delete from 'users' collection
      await deleteDoc(doc(db, 'users', authUid));

      // 2. Delete from 'doctors' if exists
      if (profileData?.entityId) {
        const collectionName = 'doctors';
        await deleteDoc(doc(db, collectionName, profileData.entityId));
      }

      // 3. Delete the auth user
      await deleteUser(currentUser);
      
      // 4. Sign out
      await signOut(firebaseAuth);
      
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/requires-recent-login') {
        setMessage({ type: 'error', text: 'Please log out and log in again to delete your account for security reasons.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
      }
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isPending = profileData?.status === 'pending';
  const isApproved = profileData?.status === 'approved';
  const isRejected = profileData?.status === 'rejected';

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="bg-white dark:bg-dark-card rounded-3xl shadow-xl overflow-hidden border border-border-light dark:border-dark-border transition-colors duration-200">
        <div className="bg-primary dark:bg-primary/90 p-8 text-white relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-sm shadow-inner">
              <User size={48} className="text-white" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold tracking-tight">
                {profileData?.name || profileData?.clinicName || 'Complete Your Profile'}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                <p className="text-white/80 flex items-center gap-2 font-medium">
                  <Briefcase size={16} />
                  <span className="capitalize">{profileData?.role}</span>
                </p>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                  isApproved ? 'bg-green-500/30 text-green-100' : 
                  isRejected ? 'bg-red-500/30 text-red-100' : 
                  'bg-yellow-500/30 text-yellow-100'
                }`}>
                  {profileData?.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {isPending && !message && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/30 p-6 rounded-2xl mb-8 flex items-start gap-4">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-1 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Access Request Pending</h3>
                <p className="text-yellow-700 dark:text-yellow-300/70 text-sm mt-1">
                  Please fill in your details and click "Request Access". The Lab Administrator will review your profile and grant you access to the system.
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl mb-8 flex items-start gap-4">
              <AlertCircle className="text-red-600 dark:text-red-400 mt-1 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-200">Access Request Rejected</h3>
                <p className="text-red-700 dark:text-red-300/70 text-sm mt-1">
                  Your access request was not approved. Please contact the administrator for more information. You can update your details and click "Request Access" again to resubmit.
                </p>
              </div>
            </div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl mb-8 flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-900/30' : 
                message.type === 'info' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30' :
                'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/30'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="font-medium">{message.text}</p>
            </motion.div>
          )}

          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-text-main dark:text-dark-text border-b border-border-light dark:border-dark-border pb-2">Account Information</h3>
              
              {!isApproved && userRole !== 'admin' && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-muted dark:text-dark-muted flex items-center gap-2">
                    <Briefcase size={14} /> I am a...
                  </label>
                  <select
                    name="role"
                    value={profileData?.role}
                    onChange={handleChange}
                    className="w-full p-4 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main dark:text-dark-text"
                    required
                  >
                    <option value="doctor">Doctor (Client)</option>
                    <option value="admin">Lab Admin</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted dark:text-dark-muted flex items-center gap-2">
                  <User size={14} /> Clinic / Lab Name
                </label>
                <input
                  type="text"
                  name="clinicName"
                  value={profileData?.clinicName}
                  onChange={handleChange}
                  className="w-full p-4 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main dark:text-dark-text"
                  required
                  placeholder="e.g. Smile Dental Lab"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted dark:text-dark-muted flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData?.email}
                  disabled
                  className="w-full p-4 bg-gray-100 dark:bg-dark-bg/50 border border-border-light dark:border-dark-border rounded-2xl text-text-muted dark:text-dark-muted cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-text-main dark:text-dark-text border-b border-border-light dark:border-dark-border pb-2">Contact & Details</h3>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted dark:text-dark-muted flex items-center gap-2">
                  <Phone size={14} /> Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profileData?.phone || ''}
                  onChange={handleChange}
                  className="w-full p-4 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-text-main dark:text-dark-text"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {(profileData?.role === 'doctor' || profileData?.role === 'admin') && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-muted dark:text-dark-muted flex items-center gap-2">
                    <MapPin size={14} /> {profileData?.role === 'admin' ? 'Lab Address' : 'Clinic Address'}
                  </label>
                  <textarea
                    name="address"
                    value={profileData?.address || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-4 bg-background-alt dark:bg-dark-bg border border-border-light dark:border-dark-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-text-main dark:text-dark-text"
                    placeholder={profileData?.role === 'admin' ? "Enter lab address" : "Enter clinic address"}
                    required
                  />
                </div>
              )}

              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-70 ${
                    isApproved ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-accent hover:bg-accent/90 text-white'
                  }`}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {isApproved ? <Save size={20} /> : <CheckCircle2 size={20} />}
                      {isApproved ? 'Save Changes' : 'Request Access'}
                    </>
                  )}
                </button>

                {(profileData?.role === 'admin' || profileData?.role === 'doctor') && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full font-bold py-4 px-6 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-3"
                  >
                    <Trash2 size={20} />
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-dark-card rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-border-light dark:border-dark-border"
            >
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <Trash2 size={40} />
              </div>
              <h2 className="text-3xl font-bold text-text-main dark:text-dark-text text-center mb-4">Delete Account?</h2>
              <p className="text-text-muted dark:text-dark-muted text-center leading-relaxed mb-10">
                This action is permanent and cannot be undone. All your data, including cases and profile information, will be permanently deleted.
              </p>
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Trash2 size={20} />
                      Yes, Delete My Account
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="w-full bg-background-alt dark:bg-dark-bg text-text-main dark:text-dark-text py-5 rounded-2xl font-bold hover:bg-border-light dark:hover:bg-dark-border transition-all border border-border-light dark:border-dark-border"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
