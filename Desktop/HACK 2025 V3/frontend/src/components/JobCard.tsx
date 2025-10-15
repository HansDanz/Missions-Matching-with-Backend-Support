import { Flag, Users } from 'lucide-react';
import { Job } from '../types';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface JobCardProps {
  job: Job;
  onClick: () => void;
}

export function JobCard({ job, onClick }: JobCardProps) {
  const currentApplicants = job.applications?.length || 0;
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
    >
      {/* Image */}
      <div className="w-full h-48 overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={job.image}
          alt={job.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-gray-900 mb-2 line-clamp-2">{job.title}</h3>
        <p className="text-gray-600 mb-2">{job.organizationName}</p>

        {/* Add skills badges */}
        {job.skills && job.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {job.skills.map((skill) => (
              <Badge 
                key={skill}
                variant="secondary" 
                className="bg-blue-50 text-blue-700 border border-blue-200"
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-gray-600">
            <Flag className="w-4 h-4" />
            <span className="text-sm">{job.country}</span>
          </div>
          
          <div className="flex items-center gap-1 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="font-medium">{currentApplicants}</span> applied / <span className="font-medium">{job.maxPeople}</span> needed
          </div>
        </div>

        <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
          {job.status === 'open' ? 'Open' : 'Closed'}
        </Badge>
      </div>
    </div>
  );
}
