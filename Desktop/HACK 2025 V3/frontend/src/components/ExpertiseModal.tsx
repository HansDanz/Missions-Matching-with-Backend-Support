import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ExpertiseArea } from '../types';

interface ExpertiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExpertise: ExpertiseArea[];
  onSubmit: (expertise: ExpertiseArea[]) => void;
}

const expertiseOptions: ExpertiseArea[] = [
  'Family',
  'Religion',
  'Education',
  'Government',
  'Media',
  'Arts & Entertainment',
  'Business',
  'Healthcare'
];

export function ExpertiseModal({ isOpen, onClose, currentExpertise, onSubmit }: ExpertiseModalProps) {
  const [selectedExpertise, setSelectedExpertise] = useState<ExpertiseArea[]>(currentExpertise);

  const handleToggle = (area: ExpertiseArea) => {
    setSelectedExpertise(prev =>
      prev.includes(area)
        ? prev.filter(e => e !== area)
        : [...prev, area]
    );
  };

  const handleSubmit = () => {
    onSubmit(selectedExpertise);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Your Expertise</DialogTitle>
          <DialogDescription>
            Choose the areas where you have skills or experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {expertiseOptions.map((area) => (
            <div key={area} className="flex items-center space-x-3">
              <Checkbox
                id={area}
                checked={selectedExpertise.includes(area)}
                onCheckedChange={() => handleToggle(area)}
              />
              <Label
                htmlFor={area}
                className="cursor-pointer select-none"
              >
                {area}
              </Label>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1">
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
