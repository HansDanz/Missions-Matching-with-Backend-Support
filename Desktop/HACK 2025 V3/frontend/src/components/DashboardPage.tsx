import { LogIn, Plus, User } from 'lucide-react';
import { useState } from 'react';
import { Job, UserProfile } from '../types';
import { JobCard } from './JobCard';
import { Button } from './ui/button';
import { FilterBar } from './FilterBar';
import { skillOptions } from '../data/skills';

interface DashboardPageProps {
  jobs: Job[];
  currentUser: UserProfile | null;
  onJobClick: (job: Job) => void;
  onPostJob: () => void;
  onProfileClick: () => void;
  onLoginClick: () => void;
}

export function DashboardPage({ jobs, currentUser, onJobClick, onPostJob, onProfileClick, onLoginClick }: DashboardPageProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedOrganizations, setSelectedOrganizations] = useState<string[]>([]);
  const [selectedMissionTypes, setSelectedMissionTypes] = useState<string[]>([]);
  const [selectedMissionTerms, setSelectedMissionTerms] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Get unique values
  const uniqueLocations = Array.from(new Set(jobs.map(job => job.country))).sort();
  const uniqueOrganizations = Array.from(new Set(jobs.map(job => job.organizationName))).sort();
  const uniqueMissionTypes = Array.from(new Set(jobs.map(job => job.missionType))).sort();
  const uniqueMissionTerms = Array.from(new Set(jobs.map(job => job.missionTerm))).sort();
  const uniqueSkills = Array.from(new Set(jobs.flatMap(job => job.skills))).sort();

  // Filter jobs based on selections
  const filteredJobs = jobs.filter(job => {
    const locationMatch = selectedLocations.length === 0 || selectedLocations.includes(job.country);
    const orgMatch = selectedOrganizations.length === 0 || selectedOrganizations.includes(job.organizationName);
    const typeMatch = selectedMissionTypes.length === 0 || selectedMissionTypes.includes(job.missionType);
    const termMatch = selectedMissionTerms.length === 0 || selectedMissionTerms.includes(job.missionTerm);
    const skillMatch = selectedSkills.length === 0 || selectedSkills.some(skill => job.skills.includes(skill));
    return locationMatch && orgMatch && typeMatch && termMatch && skillMatch;
  });

  const handleClearFilters = () => {
    setSelectedLocations([]);
    setSelectedOrganizations([]);
    setSelectedMissionTypes([]);
    setSelectedMissionTerms([]);
    setSelectedSkills([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-1">Serve Opportunities</h1>
              <p className="text-muted-foreground">Find ways to serve and make a difference</p>
            </div>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  {currentUser.role === 'harvest organizer' && (
                    <Button onClick={onPostJob}>
                      <Plus className="w-4 h-4 mr-2" />
                      Post Job
                    </Button>
                  )}
                  <button
                    onClick={onProfileClick}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <User className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              ) : (
                <Button onClick={onLoginClick}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Cards */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <FilterBar
          locations={uniqueLocations}
          organizations={uniqueOrganizations}
          missionTypes={uniqueMissionTypes}
          missionTerms={uniqueMissionTerms}
          skills={skillOptions}
          selectedLocations={selectedLocations}
          selectedOrganizations={selectedOrganizations}
          selectedMissionTypes={selectedMissionTypes}
          selectedMissionTerms={selectedMissionTerms}
          selectedSkills={selectedSkills}
          onLocationChange={setSelectedLocations}
          onOrganizationChange={setSelectedOrganizations}
          onMissionTypeChange={setSelectedMissionTypes}
          onMissionTermChange={setSelectedMissionTerms}
          onSkillsChange={setSelectedSkills}
          onClearFilters={handleClearFilters}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id}>
              <JobCard job={job} onClick={() => onJobClick(job)} />
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {jobs.length === 0 
                ? 'No opportunities available at the moment.' 
                : 'No opportunities match your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
