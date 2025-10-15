import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db as firestoreDb } from './config/firebase_auth_config';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { CreateOrgProfilePage } from './components/CreateOrgProfilePage';
import { DashboardPage } from './components/DashboardPage';
import { PostJobPage } from './components/PostJobPage';
import { JobDetailPage } from './components/JobDetailPage';
import { ProfilePage } from './components/ProfilePage';
import { ApplyModal } from './components/ApplyModal';
import { mockJobs } from './data/mockJobs';
import { Job, UserProfile, ExpertiseArea, JobApplication } from './types';
import { skillOptions } from './data/skills';

type View = 'home' | 'login' | 'create-profile' | 'post-job' | 'mission' | 'profile';

const API_BASE_URL = 'http://127.0.0.1:5000';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // User is signed in, fetch their profile from Firestore
        try {
          // Try workers collection first
          let userDoc = await getDoc(doc(firestoreDb, 'workers', user.uid));
          
          // If not found, try organizations collection
          if (!userDoc.exists()) {
            userDoc = await getDoc(doc(firestoreDb, 'organizations', user.uid));
          }
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              id: user.uid,
              name: userData.name,
              email: user.email!,
              password: '', // Not needed with Firebase Auth
              role: userData.role,
              age: userData.age,
              expertise: userData.expertise || [],
              skills: userData.skills || [],
              phoneNumber: userData.phoneNumber,
              attendedMissions: userData.attendedMissions || [],
              postedMissions: userData.postedMissions || []
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      
      setAuthLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Fetch missions from Firebase
  useEffect(() => {
    if (!authLoading) {
      fetchMissions();
    }
  }, [authLoading]);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      console.log('🔵 Starting mission fetch...');

      const response = await fetch(`${API_BASE_URL}/missions`);
      console.log('🟡 Response status:', response.status);
      console.log('🟡 Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        throw new Error('Failed to fetch missions');
      }
      
      const missions = await response.json();
      console.log('🟢 Received missions:', missions);
      
      const transformedJobs: Job[] = missions.map((mission: any) => {
        console.log('🟣 Transforming mission:', mission);
        return {
          id: mission.id,
          title: mission.title || '',
          missionType: mission.missionType,
          missionTerm: mission.missionTerm,
          date: mission.date || '',
          dateStart: mission.dateStart,
          dateEnd: mission.dateEnd,
          country: mission.location || mission.country || '',
          countryCode: mission.countryCode || 'US',
          maxPeople: mission.maxPeople || 0,
          details: mission.details || mission.description || '',
          skills: mission.skills || [],
          languages: mission.languages || [],
          peopleGroups: mission.peopleGroups || [],
          image: mission.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
          supportingMedia: mission.supportingMedia || { images: [], video: undefined },
          status: mission.status || 'open',
          organizationName: mission.organization || mission.organizationName || 'Unknown',
          organizerId: mission.organizerId || '',
          applications: mission.applications?.map((app: any) => ({
            id: app.id || crypto.randomUUID(),
            applicantId: app.applicantId || '',
            name: app.name || '',
            email: app.email || '',
            age: app.age || null,
            expertise: app.expertise || [],
            skills: app.skills || [],
            phoneNumber: app.phoneNumber || '',
            details: app.details || '',
            timestamp: app.timestamp || new Date().toISOString(),
            jobId: mission.id
          })) || []
      };
    });

      console.log('🟢 Transformed jobs:', transformedJobs);
      setJobs(transformedJobs);

    } catch (error) {
      console.error('🔴 Error fetching missions:', error);
      console.log('🟠 Falling back to mock data');
      setJobs(mockJobs);
      alert('Could not connect to server. Using demo data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      // Firebase Authentication handles the login
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will automatically update the user state
      setCurrentView('home');
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to login. Please try again.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      alert(errorMessage);
    }
  };

  const handleCreateProfile = async (profileData: {
    name: string;
    email: string;
    password: string;
    role: 'harvest worker' | 'harvest organizer';
    age?: number;
  }) => {
    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        profileData.email, 
        profileData.password
      );
      
      const user = userCredential.user;
      
      // Step 2: Create user profile in appropriate collection based on role
      const collectionName = profileData.role === 'harvest worker' ? 'workers' : 'organizations';
      const userDocRef = doc(firestoreDb, collectionName, user.uid);
      
      // Create role-specific user data
      const userData = profileData.role === 'harvest worker' 
        ? {
            name: profileData.name,
            email: profileData.email,
            role: profileData.role,
            age: profileData.age || null,
            expertise: [],
            skills: [],
            phoneNumber: '',
            attendedMissions: [],
            createdAt: new Date().toISOString()
          }
        : {
            name: profileData.name,
            email: profileData.email,
            role: profileData.role,
            phoneNumber: '',
            postedMissions: [],
            createdAt: new Date().toISOString()
          };

      await setDoc(userDocRef, userData);
      
      // onAuthStateChanged will automatically update the user state
      setCurrentView('home');
      alert('Account created successfully!');
      
    } catch (error: any) {
      console.error('Create profile error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      alert(errorMessage);
    }
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setCurrentView('mission');
  };

  const handlePostJob = async (jobData: {
    title: string;
    missionType: any;
    missionTerm: any;
    date: string;
    dateStart?: string;
    dateEnd?: string;
    country: string;
    maxPeople: number;
    details: string;
    skills: string[];
    languages: string[];
    peopleGroups?: string[];
    image: string;
    supportingImages: string[];
    supportingVideo?: string;
  }) => {
    if (!currentUser || !firebaseUser) return;

    try {
      // Get Firebase Auth token for backend authentication
      const idToken = await firebaseUser?.getIdToken();
      
      // Process skills once, removing 'Others' and finding new skills
      const processedSkills = jobData.skills.filter(skill => skill !== 'Others');
      const newSkills = processedSkills.filter(skill => !skillOptions.includes(skill));

      // Add new skills to Firebase
      if (newSkills.length > 0) {
        await Promise.all(newSkills.map(async (skillName) => {
          await fetch(`${API_BASE_URL}/skills`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ name: skillName })
          });
        }));
      }
      
      const missionData = {
        title: jobData.title,
        missionType: jobData.missionType,
        missionTerm: jobData.missionTerm,
        date: jobData.date,
        dateStart: jobData.dateStart,
        dateEnd: jobData.dateEnd,
        location: jobData.country,
        country: jobData.country,
        countryCode: jobData.country.substring(0, 2).toUpperCase(),
        maxPeople: jobData.maxPeople,
        details: jobData.details,
        description: jobData.details,
        skills: processedSkills,
        languages: jobData.languages,
        peopleGroups: jobData.peopleGroups,
        image: jobData.image,
        supportingMedia: {
          images: jobData.supportingImages,
          video: jobData.supportingVideo
        },
        status: 'open',
        organization: currentUser.name,
        organizationName: currentUser.name,
        organizerId: currentUser.id,
        applications: [],
        createdAt: new Date().toISOString()
      };

      // Add new skills to Firebase
      if (newSkills.length > 0) {
        await Promise.all(newSkills.map(async (skillName) => {
          await fetch(`${API_BASE_URL}/skills`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ name: skillName })
          });
        }));
      }
      
      // Submit the mission
      const response = await fetch(`${API_BASE_URL}/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(missionData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to post mission');
      }

      const result = await response.json();
      
      // Create new job with all V3 features
      const newJob: Job = {
        id: result.id,
        title: jobData.title,
        missionType: jobData.missionType,
        missionTerm: jobData.missionTerm,
        date: jobData.date,
        dateStart: jobData.dateStart,
        dateEnd: jobData.dateEnd,
        country: jobData.country,
        countryCode: jobData.country.substring(0, 2).toUpperCase(),
        maxPeople: jobData.maxPeople,
        details: jobData.details,
        skills: jobData.skills,
        languages: jobData.languages,
        peopleGroups: jobData.peopleGroups,
        image: jobData.image,
        supportingMedia: {
          images: jobData.supportingImages,
          video: jobData.supportingVideo
        },
        status: 'open',
        organizationName: currentUser.name,
        organizerId: currentUser.id,
        applications: []
      };

      setJobs(prevJobs => [newJob, ...prevJobs]);
      
      // Update Firestore with posted mission
      try {
        const updatedPostedMissions = [...(currentUser.postedMissions || []), newJob.id];
        const userDocRef = doc(firestoreDb, 'organizations', currentUser.id);
        await updateDoc(userDocRef, {
          postedMissions: updatedPostedMissions
        });
        
        setCurrentUser({
          ...currentUser,
          postedMissions: updatedPostedMissions
        });
      } catch (firestoreError) {
        console.warn('Firestore update warning:', firestoreError);
        alert('Mission posted successfully! However, it may not appear in your profile immediately. Please refresh the page to see your new mission.');
        return;
      }

      setCurrentView('home');
      alert('Mission posted successfully!');

    } catch (error) {
      console.error('Error posting mission:', error);
      alert('Failed to post mission. Please try again.');
    }
  };

  // Add these new functions after handlePostJob
  const handleEditJob = async (jobId: string, updatedData: Partial<Job>) => {
    if (!currentUser || !firebaseUser) return;

    try {
      const idToken = await firebaseUser.getIdToken();

      // Process skills if they're being updated
      if (updatedData.skills) {
        const processedSkills = updatedData.skills.filter(skill => skill !== 'Others');
        const newSkills = processedSkills.filter(skill => !skillOptions.includes(skill));

        if (newSkills.length > 0) {
          await Promise.all(newSkills.map(async (skillName) => {
            await fetch(`${API_BASE_URL}/skills`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ name: skillName })
            });
          }));
        }
        updatedData.skills = processedSkills;
      }

      const response = await fetch(`${API_BASE_URL}/missions/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update mission');
      }

      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => job.id === jobId ? { ...job, ...updatedData } : job)
      );

      // Update selectedJob if it's the one being edited
      if (selectedJob?.id === jobId) {
        setSelectedJob(prev => prev ? { ...prev, ...updatedData } : null);
      }

      alert('Mission updated successfully!');
    } catch (error) {
      console.error('Error updating mission:', error);
      alert('Failed to update mission. Please try again.');
    }
  };

  const handleReopenJob = async (jobId: string) => {
    await handleEditJob(jobId, { status: 'open' });
  };

  const handleApply = () => {
    setIsApplyModalOpen(true);
  };

  // Update where you render JobDetailPage to include these handlers
  {currentView === 'mission' && selectedJob && (
    <JobDetailPage
      job={selectedJob}
      currentUser={currentUser}
      onBack={() => setCurrentView('home')}
      onApply={handleApply}
      onSignInToApply={() => setCurrentView('login')}
      onEdit={handleEditJob}
      onReopen={handleReopenJob}
    />
  )}

  const handleApplicationSubmit = async (data: { phoneNumber?: string; details: string }) => {
    if (!currentUser || !selectedJob || !firebaseUser) return;

    try {
      const idToken = await firebaseUser.getIdToken();

      // Create application object with V3 fields
      const applicationData = {
        applicantId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        age: currentUser.age || null,
        expertise: currentUser.expertise || [],
        skills: currentUser.skills || [],
        phoneNumber: data.phoneNumber || '',
        details: data.details,
        timestamp: new Date().toISOString(),
        jobId: selectedJob.id
      };
      
      // Send to Firebase via your API
      const response = await fetch(`${API_BASE_URL}/missions/${selectedJob.id}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(applicationData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Failed to submit application');
      }

      const result = await response.json();

      // Now create the complete application object WITH the id from the response
      const application: JobApplication = {
        id: result.id,
        ...applicationData
      };


      // Update worker's profile in Firestore
      try {
        const workerDocRef = doc(firestoreDb, 'workers', currentUser.id);
        const updateData: any = {};
        
        if (data.phoneNumber && data.phoneNumber !== currentUser.phoneNumber) {
          updateData.phoneNumber = data.phoneNumber;
        }
        
        if (!currentUser.attendedMissions.includes(selectedJob.id)) {
          updateData.attendedMissions = [...currentUser.attendedMissions, selectedJob.id];
        }

        if (Object.keys(updateData).length > 0) {
          await updateDoc(workerDocRef, updateData);
          setCurrentUser({ ...currentUser, ...updateData });
        }

        // Update local state with new application
        const application: JobApplication = {
          id: result.id,
          ...applicationData,
          jobId: selectedJob.id,
          timestamp: Date.now()
        };

        setJobs(prevJobs => prevJobs.map(job => 
          job.id === selectedJob.id 
            ? { ...job, applications: [...(job.applications || []), application] }
            : job
        ));

        if (selectedJob) {
          setSelectedJob({
            ...selectedJob,
            applications: [...(selectedJob.applications || []), application]
          });
        }

        setIsApplyModalOpen(false);
        alert('Application submitted successfully!');
      } catch (firestoreError) {
        console.error('Error updating worker profile:', firestoreError);
        setIsApplyModalOpen(false);
        alert('Application submitted successfully! However, some profile updates may not have been saved.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    }
  };

  const handleCloseEvent = async (jobId: string) => {
    if (!firebaseUser) return;

    try {
      const idToken = await firebaseUser.getIdToken();

      const response = await fetch(`${API_BASE_URL}/missions/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ status: 'closed' })
      });

      if (!response.ok) {
        throw new Error('Failed to close mission');
      }

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: 'closed' as const } : job
      ));

      alert('Mission closed successfully!');
      
    } catch (error) {
      console.error('Error closing mission:', error);
      alert('Failed to close mission. Please try again.');
    }
  };

  const handlePasswordChange = async (newPassword: string) => {
    alert('To change your password, please log out and use the "Forgot Password" feature on the login page.');
  };

  const handleExpertiseUpdate = async (expertise: ExpertiseArea[]) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(firestoreDb, 'workers', currentUser.id);
      await updateDoc(userDocRef, { expertise });

      setCurrentUser({ ...currentUser, expertise });
      
    } catch (error) {
      console.error('Error updating expertise:', error);
      alert('Failed to update expertise. Please try again.');
    }
  };

  const handleSkillsUpdate = async (skills: string[]) => {
    if (!currentUser) return;

    try {
      const userDocRef = doc(firestoreDb, 'workers', currentUser.id);
      await updateDoc(userDocRef, { skills });

      setCurrentUser({ ...currentUser, skills });
      
    } catch (error) {
      console.error('Error updating skills:', error);
      alert('Failed to update skills. Please try again.');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedJob(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentView('home');
      setSelectedJob(null);
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  const handleViewApplicants = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setCurrentView('mission');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {currentView === 'home' && (
        <DashboardPage
          jobs={jobs}
          currentUser={currentUser}
          onJobClick={handleJobClick}
          onPostJob={() => setCurrentView('post-job')}
          onProfileClick={() => setCurrentView('profile')}
          onLoginClick={() => setCurrentView('login')}
        />
      )}

      {currentView === 'login' && (
        <LoginPage
          onLogin={handleLogin}
          onCreateProfile={() => setCurrentView('create-profile')}
        />
      )}

      {currentView === 'create-profile' && (
        <CreateOrgProfilePage
          onBack={() => setCurrentView('login')}
          onComplete={handleCreateProfile}
        />
      )}

      {currentView === 'post-job' && currentUser && (
        <PostJobPage
          onBack={handleBackToHome}
          onPost={handlePostJob}
        />
      )}

      {currentView === 'mission' && selectedJob && (
        <JobDetailPage
          job={selectedJob}
          currentUser={currentUser}
          onBack={handleBackToHome}
          onApply={handleApply}
          onSignInToApply={() => setCurrentView('login')}
          onEdit={handleEditJob}
          onReopen={handleReopenJob}
        />
      )}

      {currentView === 'profile' && currentUser && (
        <ProfilePage
          user={currentUser}
          allJobs={jobs}
          onBack={handleBackToHome}
          onCloseEvent={handleCloseEvent}
          onPasswordChange={handlePasswordChange}
          onLogout={handleLogout}
          onExpertiseUpdate={handleExpertiseUpdate}
          onSkillsUpdate={handleSkillsUpdate}
          onViewApplicants={handleViewApplicants}
        />
      )}

      {currentUser && selectedJob && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          jobTitle={selectedJob.title}
          currentUser={currentUser}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
}