import { Filter, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';

interface FilterBarProps {
  locations: string[];
  organizations: string[];
  missionTypes: string[];
  missionTerms: string[];
  skills: string[];
  selectedLocations: string[];
  selectedOrganizations: string[];
  selectedMissionTypes: string[];
  selectedMissionTerms: string[];
  selectedSkills: string[];
  onLocationChange: (locations: string[]) => void;
  onOrganizationChange: (organizations: string[]) => void;
  onMissionTypeChange: (types: string[]) => void;
  onMissionTermChange: (terms: string[]) => void;
  onSkillsChange: (skills: string[]) => void;
  onClearFilters: () => void;
}

export function FilterBar({
  locations,
  organizations,
  missionTypes,
  missionTerms,
  skills,
  selectedLocations,
  selectedOrganizations,
  selectedMissionTypes,
  selectedMissionTerms,
  selectedSkills,
  onLocationChange,
  onOrganizationChange,
  onMissionTypeChange,
  onMissionTermChange,
  onSkillsChange,
  onClearFilters
}: FilterBarProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isTermOpen, setIsTermOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);

  const handleLocationToggle = (location: string) => {
    if (selectedLocations.includes(location)) {
      onLocationChange(selectedLocations.filter(l => l !== location));
    } else {
      onLocationChange([...selectedLocations, location]);
    }
  };

  const handleOrganizationToggle = (org: string) => {
    if (selectedOrganizations.includes(org)) {
      onOrganizationChange(selectedOrganizations.filter(o => o !== org));
    } else {
      onOrganizationChange([...selectedOrganizations, org]);
    }
  };

  const handleMissionTypeToggle = (type: string) => {
    if (selectedMissionTypes.includes(type)) {
      onMissionTypeChange(selectedMissionTypes.filter(t => t !== type));
    } else {
      onMissionTypeChange([...selectedMissionTypes, type]);
    }
  };

  const handleMissionTermToggle = (term: string) => {
    if (selectedMissionTerms.includes(term)) {
      onMissionTermChange(selectedMissionTerms.filter(t => t !== term));
    } else {
      onMissionTermChange([...selectedMissionTerms, term]);
    }
  };

  const handleSkillsToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter(s => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const activeFiltersCount = selectedLocations.length + 
    selectedOrganizations.length + 
    selectedMissionTypes.length + 
    selectedMissionTerms.length + 
    selectedSkills.length;

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-600" />
        <span className="text-sm text-gray-600">Filters:</span>
      </div>

      <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Location
            {selectedLocations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedLocations.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-3">
            <h4 className="text-sm">Filter by Location</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locations.map((location) => (
                <div key={location} className="flex items-center space-x-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={selectedLocations.includes(location)}
                    onCheckedChange={() => handleLocationToggle(location)}
                  />
                  <Label
                    htmlFor={`location-${location}`}
                    className="text-sm cursor-pointer"
                  >
                    {location}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isOrgOpen} onOpenChange={setIsOrgOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Organization
            {selectedOrganizations.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedOrganizations.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <h4 className="text-sm">Filter by Organization</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {organizations.map((org) => (
                <div key={org} className="flex items-center space-x-2">
                  <Checkbox
                    id={`org-${org}`}
                    checked={selectedOrganizations.includes(org)}
                    onCheckedChange={() => handleOrganizationToggle(org)}
                  />
                  <Label
                    htmlFor={`org-${org}`}
                    className="text-sm cursor-pointer"
                  >
                    {org}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Mission Type
            {selectedMissionTypes.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedMissionTypes.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-3">
            <h4 className="text-sm">Filter by Mission Type</h4>
            <div className="space-y-2">
              {missionTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedMissionTypes.includes(type)}
                    onCheckedChange={() => handleMissionTypeToggle(type)}
                  />
                  <Label
                    htmlFor={`type-${type}`}
                    className="text-sm cursor-pointer"
                  >
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={isTermOpen} onOpenChange={setIsTermOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Mission Term
            {selectedMissionTerms.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedMissionTerms.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-3">
            <h4 className="text-sm">Filter by Mission Term</h4>
            <div className="space-y-2">
              {missionTerms.map((term) => (
                <div key={term} className="flex items-center space-x-2">
                  <Checkbox
                    id={`term-${term}`}
                    checked={selectedMissionTerms.includes(term)}
                    onCheckedChange={() => handleMissionTermToggle(term)}
                  />
                  <Label
                    htmlFor={`term-${term}`}
                    className="text-sm cursor-pointer"
                  >
                    {term}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Add this block after the Mission Term Popover */}
      <Popover open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Skills
            {selectedSkills.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedSkills.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <h4 className="text-sm">Filter by Skills</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {skills.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => handleSkillsToggle(skill)}
                  />
                  <Label
                    htmlFor={`skill-${skill}`}
                    className="text-sm cursor-pointer"
                  >
                    {skill}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-muted-foreground"
        >
          <X className="w-4 h-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
