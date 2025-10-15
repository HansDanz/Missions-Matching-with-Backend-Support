import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { peopleGroups } from '../data/peopleGroups';

interface PeopleGroupsSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function PeopleGroupsSelect({ value, onChange }: PeopleGroupsSelectProps) {
  const [customGroup, setCustomGroup] = useState('');

  const handleToggle = (group: string) => {
    if (value.includes(group)) {
      onChange(value.filter(g => g !== group));
    } else {
      onChange([...value, group]);
    }
  };

  const handleCustomChange = (customValue: string) => {
    setCustomGroup(customValue);
    
    // Remove old "Others" entries and add new custom value
    const withoutOthers = value.filter(g => peopleGroups.includes(g));
    
    if (customValue.trim() && value.includes('Others')) {
      onChange([...withoutOthers, customValue.trim()]);
    } else if (!customValue.trim()) {
      onChange(withoutOthers.filter(g => g !== 'Others'));
    }
  };

  return (
    <div className="space-y-3">
      <ScrollArea className="h-64 border rounded-md p-4">
        <div className="space-y-3">
          {peopleGroups.map((group) => (
            <div key={group} className="flex items-start space-x-3">
              <Checkbox
                id={`group-${group}`}
                checked={value.includes(group) || (group === 'Others' && value.some(v => !peopleGroups.includes(v)))}
                onCheckedChange={() => handleToggle(group)}
              />
              <Label
                htmlFor={`group-${group}`}
                className="cursor-pointer select-none text-sm leading-tight"
              >
                {group}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>

      {(value.includes('Others') || value.some(v => !peopleGroups.includes(v))) && (
        <div className="space-y-2">
          <Label htmlFor="customGroup">Custom People Group</Label>
          <Input
            id="customGroup"
            placeholder="Enter custom people group"
            value={customGroup}
            onChange={(e) => handleCustomChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
