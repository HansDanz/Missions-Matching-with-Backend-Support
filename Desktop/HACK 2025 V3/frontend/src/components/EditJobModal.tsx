import { useState } from 'react';
import * as React from 'react';
import { Job, MissionType, MissionTerm } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { skillOptions } from '../data/skills';

interface EditJobModalProps {
  job: Job;
  onSave: (updatedData: Partial<Job>) => Promise<void>;
  onCancel: () => void;
}

export function EditJobModal({ job, onSave, onCancel }: EditJobModalProps) {
  const [formData, setFormData] = useState({
    title: job.title,
    missionType: job.missionType,
    missionTerm: job.missionTerm,
    maxPeople: job.maxPeople,
    details: job.details,
    skills: job.skills,
    languages: job.languages.join(', '),
    peopleGroups: job.peopleGroups?.join(', ') || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      languages: formData.languages.split(',').map(l => l.trim()),
      peopleGroups: formData.peopleGroups ? formData.peopleGroups.split(',').map(g => g.trim()) : undefined
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mission</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="missionType">Mission Type</Label>
              <select
                id="missionType"
                value={formData.missionType}
                onChange={e => setFormData(prev => ({ ...prev, missionType: e.target.value as MissionType }))}
                className="w-full rounded-md border border-input"
                required
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>

            <div>
              <Label htmlFor="missionTerm">Mission Term</Label>
              <select
                id="missionTerm"
                value={formData.missionTerm}
                onChange={e => setFormData(prev => ({ ...prev, missionTerm: e.target.value as MissionTerm }))}
                className="w-full rounded-md border border-input"
                required
              >
                <option value="Short Term">Short Term</option>
                <option value="Long Term">Long Term</option>
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="maxPeople">Team Size Needed</Label>
            <Input
              id="maxPeople"
              type="number"
              min={1}
              value={formData.maxPeople}
              onChange={e => setFormData(prev => ({ ...prev, maxPeople: parseInt(e.target.value) }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={formData.details}
              onChange={e => setFormData(prev => ({ ...prev, details: e.target.value }))}
              required
              rows={5}
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <div className="border rounded-md mt-1 p-1">
              <div 
                className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                style={{
                  scrollbarWidth: 'thin',
                  msOverflowStyle: 'none'
                }}
              >
                {skillOptions.map(skill => (
                  <label 
                    key={skill} 
                    className="flex items-center gap-2 text-sm py-1 px-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={e => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            skills: [...prev.skills, skill]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            skills: prev.skills.filter(s => s !== skill)
                          }));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="truncate">{skill}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
