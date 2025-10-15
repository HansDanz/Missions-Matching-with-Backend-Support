import { ChevronDown, ChevronUp, Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { JobApplication } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface ApplicantCardProps {
  application: JobApplication;
}

export function ApplicantCard({ application }: ApplicantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-900">{application.name}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{application.email}</span>
          </div>


          {application.expertise.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-gray-500">Expertise:</p>
              <div className="flex flex-wrap gap-2">
                {application.expertise.map((exp) => (
                  <Badge key={exp} variant="secondary">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {application.skills.length > 0 && (
            <div className="space-y-2 mt-2">
              <p className="text-xs text-gray-500">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {application.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              See Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              See More
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="pt-3 border-t border-gray-200 space-y-4">
          {/* Contact Details */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact Information:</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {application.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{application.phoneNumber}</span>
                </div>
              )}
              {application.age && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Age:</span>
                  <span>{application.age}</span>
                </div>
              )}
            </div>
          </div>

          {/* Application Details */}
          {application.details && (
            <div>
              <h4 className="text-sm font-medium mb-2">Application Details:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {application.details}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
