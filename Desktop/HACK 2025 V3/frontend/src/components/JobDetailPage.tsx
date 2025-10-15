import * as React from 'react';
import { ArrowLeft, Calendar, Flag, Globe, Users, MapPin, Clock, RefreshCw, Edit } from 'lucide-react';
import { useState } from 'react';
import { Job, UserProfile } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ApplicantCard } from './ApplicantCard';
import { EditJobModal } from './EditJobModal';

interface JobDetailPageProps {
  job: Job;
  currentUser: UserProfile | null;
  onBack: () => void;
  onApply: () => void;
  onSignInToApply: () => void;
  onEdit?: (jobId: string, updatedData: Partial<Job>) => Promise<void>;
  onReopen?: (jobId: string) => Promise<void>;
}

export function JobDetailPage({ 
  job, 
  currentUser, 
  onBack, 
  onApply, 
  onSignInToApply, 
  onEdit,
  onReopen 
}: JobDetailPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isOrganizer = currentUser?.role === 'harvest organizer';
  const isOwnMission = currentUser?.id === job.organizerId;
  const shouldShowApplicants = isOrganizer && isOwnMission;
  const shouldShowApplyButton = currentUser && currentUser.role === 'harvest worker' && job.status === 'open';
  const shouldShowSignInButton = !currentUser && job.status === 'open';
  const canEdit = currentUser?.id === job.organizerId;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-semibold">{job.title}</h1>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
          {/* Mission Image */}
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={job.image}
              alt={job.title}
              className="w-full h-48 object-cover"
            />
          </div>

          {/* Organization Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{job.organizationName}</h2>
              <p className="text-gray-600">{job.country}</p>
            </div>
            <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
              {job.status === 'open' ? 'Open' : 'Closed'}
            </Badge>
          </div>

          {/* Mission Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{job.date}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{job.maxPeople} people needed</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{job.missionType}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{job.missionTerm}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Mission Details</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{job.details}</p>
          </div>

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {canEdit && (
            <div className="pt-4 border-t">
              {job.status === 'closed' ? (
                <Button
                  onClick={() => onReopen?.(job.id)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reopen Mission
                </Button>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Mission
                </Button>
              )}
            </div>
          )}

          {/* Apply Button */}
          {shouldShowApplyButton && (
            <div className="pt-4 border-t">
              <Button onClick={onApply} className="w-full">
                Apply Now
              </Button>
            </div>
          )}

          {/* Sign In Button */}
          {shouldShowSignInButton && (
            <div className="pt-4 border-t">
              <Button onClick={onSignInToApply} className="w-full">
                Sign in to Apply
              </Button>
            </div>
          )}

          {/* Applicants Section */}
          {shouldShowApplicants && (
            <div className="pt-6 border-t">
              {job.applications && job.applications.length > 0 ? (
                <>
                  <h3 className="text-gray-900 mb-4">
                    Applicants ({job.applications.length})
                  </h3>
                  <div className="space-y-3">
                    {job.applications.map((application) => (
                      <ApplicantCard key={application.id} application={application} />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No applications yet
                </p>
              )}
            </div>
          )}

          {/* Edit Modal */}
          {isEditing && (
            <EditJobModal
              job={job}
              onSave={async (updatedData) => {
                await onEdit?.(job.id, updatedData);
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}