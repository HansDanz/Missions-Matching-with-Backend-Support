import { Plus } from 'lucide-react';
import { Job } from '../types';
import { JobCard } from './JobCard';
import { Button } from './ui/button';

interface HomePageProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
  onCreateProfile: () => void;
}

export function HomePage({ jobs, onJobClick, onCreateProfile }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-gray-900">Serve Opportunities</h1>
            <Button size="sm" onClick={onCreateProfile}>
              <Plus className="w-4 h-4 mr-1" />
              Org
            </Button>
          </div>
          <p className="text-muted-foreground">Find ways to serve and make a difference</p>
        </div>
      </div>

      {/* Job Cards */}
      <div className="px-4 py-4 space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onClick={() => onJobClick(job)} />
        ))}
      </div>
    </div>
  );
}
