import { ArrowLeft, Lock, LogOut, Mail, Plus, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import { UserProfile, Job, ExpertiseArea } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ExpertiseModal } from './ExpertiseModal';
import { SkillsModal } from './SkillsModal';

interface ProfilePageProps {
  user: UserProfile;
  allJobs: Job[];
  onBack: () => void;
  onCloseEvent: (jobId: string) => void;
  onPasswordChange: (newPassword: string) => void;
  onLogout: () => void;
  onExpertiseUpdate: (expertise: ExpertiseArea[]) => void;
  onSkillsUpdate: (skills: string[]) => void;
  onViewApplicants: (jobId: string) => void;
}

export function ProfilePage({ user, allJobs, onBack, onCloseEvent, onPasswordChange, onLogout, onExpertiseUpdate, onSkillsUpdate, onViewApplicants }: ProfilePageProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isExpertiseModalOpen, setIsExpertiseModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);

  const attendedMissions = allJobs.filter((job) => user.attendedMissions.includes(job.id));
  const postedMissions = allJobs.filter((job) => user.postedMissions.includes(job.id));

  const handlePasswordChange = () => {
    if (newPassword.trim()) {
      onPasswordChange(newPassword);
      setNewPassword('');
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
          <h1 className="text-gray-900">My Profile</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8 space-y-8">
        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <h2 className="text-gray-900">Profile Information</h2>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{user.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-gray-900">{user.email}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <div className="p-3 bg-gray-50 rounded-lg">
                <Badge>{user.role}</Badge>
              </div>
            </div>

            {user.age && (
              <div className="space-y-2">
                <Label>Age</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">{user.age}</span>
                </div>
              </div>
            )}
          </div>

          {/* Expertise Section - Only for Workers */}
          {user.role === 'harvest worker' && (
            <>
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Label>Expertise</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpertiseModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expertise
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.expertise && user.expertise.length > 0 ? (
                    user.expertise.map((exp) => (
                      <Badge key={exp} variant="secondary">
                        {exp}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No expertise added yet</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <Label>Skills</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSkillsModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.skills && user.skills.length > 0 ? (
                    user.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Change Password */}
          <div className="border-t pt-6">
            {!isChangingPassword ? (
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handlePasswordChange}>Save Password</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setNewPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Posted Missions (for organizers) */}
        {user.role === 'harvest organizer' && postedMissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-gray-900 mb-4">My Posted Opportunities</h2>
            <div className="space-y-4">
              {postedMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{mission.title}</h3>
                    <p className="text-sm text-muted-foreground">{mission.date} • {mission.country}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={mission.status === 'open' ? 'default' : 'secondary'}>
                      {mission.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewApplicants(mission.id)}
                    >
                      View Applicants
                    </Button>
                    {mission.status === 'open' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCloseEvent(mission.id)}
                      >
                        Close Event
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attended Missions (for workers) */}
        {user.role === 'harvest worker' && attendedMissions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-gray-900 mb-4">Missions I've Attended</h2>
            <div className="space-y-4">
              {attendedMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h3 className="text-gray-900 mb-1">{mission.title}</h3>
                    <p className="text-sm text-muted-foreground">{mission.date} • {mission.country}</p>
                  </div>
                  <Badge variant={mission.status === 'open' ? 'default' : 'secondary'}>
                    {mission.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {user.role === 'harvest organizer' && postedMissions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-muted-foreground">You haven't posted any opportunities yet.</p>
          </div>
        )}

        {user.role === 'harvest worker' && attendedMissions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-muted-foreground">You haven't attended any missions yet.</p>
          </div>
        )}
      </div>

      <ExpertiseModal
        isOpen={isExpertiseModalOpen}
        onClose={() => setIsExpertiseModalOpen(false)}
        currentExpertise={user.expertise || []}
        onSubmit={onExpertiseUpdate}
      />

      <SkillsModal
        isOpen={isSkillsModalOpen}
        onClose={() => setIsSkillsModalOpen(false)}
        currentSkills={user.skills || []}
        onSubmit={onSkillsUpdate}
      />
    </div>
  );
}
