import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { skillOptions } from '../data/skills';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSkills: string[];
  onSubmit: (skills: string[]) => void;
}

export function SkillsModal({ isOpen, onClose, currentSkills, onSubmit }: SkillsModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkills, setCustomSkills] = useState('');

  useEffect(() => {
    // Separate predefined skills from custom ones
    const predefinedSkills = currentSkills.filter(skill => skillOptions.includes(skill));
    const customSkillsList = currentSkills.filter(skill => !skillOptions.includes(skill));
    
    setSelectedSkills(predefinedSkills.includes('Others') ? predefinedSkills : [...predefinedSkills, ...(customSkillsList.length > 0 ? ['Others'] : [])]);
    setCustomSkills(customSkillsList.join(', '));
  }, [currentSkills, isOpen]);

  const handleToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSubmit = () => {
    let finalSkills = selectedSkills.filter(s => s !== 'Others');
    
    // If "Others" is selected and there are custom skills, add them
    if (selectedSkills.includes('Others') && customSkills.trim()) {
      const customSkillsArray = customSkills.split(',').map(s => s.trim()).filter(s => s);
      finalSkills = [...finalSkills, ...customSkillsArray];
    }
    
    onSubmit(finalSkills);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Your Skills</DialogTitle>
          <DialogDescription>
            Choose the skills you have or add your own
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {skillOptions.map((skill) => (
              <div key={skill} className="flex items-start space-x-3">
                <Checkbox
                  id={skill}
                  checked={selectedSkills.includes(skill)}
                  onCheckedChange={() => handleToggle(skill)}
                />
                <Label
                  htmlFor={skill}
                  className="cursor-pointer select-none text-sm leading-tight"
                >
                  {skill}
                </Label>
              </div>
            ))}
          </div>

          {selectedSkills.includes('Others') && (
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="customSkills">Custom Skills (comma separated)</Label>
              <Input
                id="customSkills"
                placeholder="e.g., Cooking, Carpentry, Public Speaking"
                value={customSkills}
                onChange={(e) => setCustomSkills(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t">
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
