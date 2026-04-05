import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getInvitationByToken, acceptInvitation, Invitation, updateUserProfile, UserProfile, addDoctor } from '../services/firestoreService';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { CheckCircle2, AlertCircle, Loader2, Mail, Building2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const Invite: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const verifyInvite = async () => {
      if (!token) {
        setError('Invalid invitation link.');
        setLoading(false);
        return;
      }

      try {
        const invite = await getInvitationByToken(token);
        if (!invite) {
          setError('This invitation is invalid or has already been used.');
        } else {
          // Check expiry
          const expiry = invite.expiresAt?.toDate ? invite.expiresAt.toDate() : new Date(invite.expiresAt);
          if (expiry < new Date()) {
            setError('This invitation has expired.');
          } else {
            setInvitation(invite);
          }
        }
      } catch (err) {
        console.error('Error verifying invite:', err);
        setError('Failed to verify invitation. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!invitation) return;
    
    setIsProcessing(true);
    try {
      // 1. Sign in with Google
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email !== invitation.email) {
        toast.error(`This invitation was sent to ${invitation.email}. Please sign in with that account.`);
        setIsProcessing(false);
        return;
      }

      // 2. Update User Profile
      const profileData: Partial<UserProfile> = {
        tenantId: invitation.tenantId,
        role: invitation.role as any,
        status: 'approved',
        email: user.email!
      };

      // 3. Create Entity (Doctor)
      if (invitation.role === 'doctor') {
        const doctorRef = await addDoctor({
          name: user.displayName || 'New Doctor',
          email: user.email!,
          clinicName: 'Invited Clinic', // Placeholder
          phone: '',
          address: '',
          tenantId: invitation.tenantId
        });
        profileData.entityId = doctorRef.id;
      }

      await updateUserProfile(user.uid, profileData);

      // 4. Mark invitation as accepted
      await acceptInvitation(invitation.id!);

      toast.success('Invitation accepted! Welcome to the lab.');
      navigate('/');
    } catch (err) {
      console.error('Error accepting invite:', err);
      toast.error('Failed to accept invitation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="text-text-muted font-medium">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white dark:bg-dark-card max-w-md w-full p-8 rounded-3xl shadow-xl border border-border-light dark:border-dark-border text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-text-main dark:text-dark-text">Invitation Error</h1>
            <p className="text-text-muted dark:text-dark-muted">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-card max-w-md w-full p-8 rounded-3xl shadow-xl border border-border-light dark:border-dark-border space-y-8 animate-in fade-in zoom-in duration-300">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-text-main dark:text-dark-text">You're Invited!</h1>
          <p className="text-text-muted dark:text-dark-muted">
            You've been invited to join a dental lab as a <span className="text-primary font-bold capitalize">{invitation.role}</span>.
          </p>
        </div>

        <div className="space-y-4 p-6 bg-background-alt dark:bg-dark-bg rounded-2xl border border-border-light dark:border-dark-border">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-5 h-5 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-text-muted dark:text-dark-muted tracking-wider">Invited Email</p>
              <p className="text-text-main dark:text-dark-text font-medium truncate">{invitation.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="w-5 h-5 text-primary" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-text-muted dark:text-dark-muted tracking-wider">Lab ID</p>
              <p className="text-text-main dark:text-dark-text font-medium truncate">{invitation.tenantId}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-light transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5" />
            )}
            <span>{isProcessing ? 'Processing...' : 'Accept Invitation & Sign In'}</span>
          </button>
          <p className="text-[10px] text-text-muted dark:text-dark-muted text-center italic">
            By accepting, you'll be linked to this lab's workspace.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Invite;
