import { ArrowLeft, Upload, X, Calendar as CalendarIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { PeopleGroupsSelect } from './PeopleGroupsSelect';
import { MissionType, MissionTerm } from '../types';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { skillOptions } from '../data/skills';

interface PostJobPageProps {
  onBack: () => void;
  onPost: (jobData: {
    title: string;
    missionType: MissionType;
    missionTerm: MissionTerm;
    date: string;
    dateStart?: string;
    dateEnd?: string;
    country: string;
    maxPeople: number;
    details: string;
    skills: string[];
    languages: string[];
    peopleGroups?: string[];
    image: string;
    supportingImages: string[];
    supportingVideo?: string;
  }) => void;
}

export function PostJobPage({ onBack, onPost }: PostJobPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    missionType: '' as MissionType | '',
    missionTerm: '' as MissionTerm | '',
    date: '',
    details: '',
    skills: '',
    languages: '',
    maxPeople: '',
    country: '',
    image: null as File | null,
    peopleGroups: [] as string[]
  });

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [supportingImages, setSupportingImages] = useState<string[]>([]);
  const [supportingVideo, setSupportingVideo] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [customSkill, setCustomSkill] = useState('');

  const handleSkillsToggle = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSupportingImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const imageFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 4);
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupportingImages(prev => [...prev, reader.result as string].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSupportingVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSupportingVideo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSupportingImage = (index: number) => {
    setSupportingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let dateValue = formData.date;
    let startDate, endDate;
    
    if (formData.missionTerm === 'Short Term' && dateRange?.from && dateRange?.to) {
      startDate = format(dateRange.from, 'MMM dd, yyyy');
      endDate = format(dateRange.to, 'MMM dd, yyyy');
      dateValue = `${startDate} - ${endDate}`;
    }
    
    onPost({
      title: formData.title,
      missionType: formData.missionType as MissionType,
      missionTerm: formData.missionTerm as MissionTerm,
      date: dateValue,
      dateStart: startDate,
      dateEnd: endDate,
      country: formData.country,
      maxPeople: parseInt(formData.maxPeople),
      details: formData.details,
      skills: selectedSkills,
      languages: formData.languages.split(',').map(l => l.trim()),
      peopleGroups: formData.peopleGroups.length > 0 ? formData.peopleGroups : undefined,
      image: imagePreview,
      supportingImages,
      supportingVideo
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <button onClick={onBack} className="inline-flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg mb-4">
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <h1 className="text-gray-900 mb-1">Post Opportunity</h1>
          <p className="text-muted-foreground">Create a new serve opportunity</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Opportunity Title</Label>
            <Input
              id="title"
              type="text"
              placeholder="Community Outreach Volunteers"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="missionType">Mission Type</Label>
              <Select
                value={formData.missionType}
                onValueChange={(value) => setFormData({ ...formData, missionType: value as MissionType })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Remote">Remote</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Onsite">Onsite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="missionTerm">Mission Term</Label>
              <Select
                value={formData.missionTerm}
                onValueChange={(value) => setFormData({ ...formData, missionTerm: value as MissionTerm })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short Term">Short Term</SelectItem>
                  <SelectItem value="Long Term">Long Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            {formData.missionTerm === 'Short Term' ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'MMM dd, yyyy')} - {format(dateRange.to, 'MMM dd, yyyy')}
                        </>
                      ) : (
                        format(dateRange.from, 'MMM dd, yyyy')
                      )
                    ) : (
                      <span>Select date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <Input
                id="date"
                type="text"
                placeholder="e.g., Starting January 2026"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              type="text"
              placeholder="Kenya"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPeople">Maximum Number of People</Label>
            <Input
              id="maxPeople"
              type="number"
              placeholder="15"
              value={formData.maxPeople}
              onChange={(e) => setFormData({ ...formData, maxPeople: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              placeholder="Describe the opportunity, what volunteers will do, and what to expect..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              rows={5}
              required
            />
          </div>

          <div className="mb-4">
          <Label>Required Skills</Label>
          <Popover open={isSkillsOpen} onOpenChange={setIsSkillsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start"
                type="button"
              >
                {selectedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "Select required skills..."
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {skillOptions.map((skill) => (
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

                {/* Custom skill input */}
                <div className="pt-2 border-t">
                  <Label className="text-sm mb-2">Add Custom Skill</Label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      className="flex-1 px-3 py-1 border rounded-md text-sm"
                      placeholder="Enter new skill..."
                    />
                    <Button
                      type="button"
                      onClick={handleAddCustomSkill}
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

          <div className="space-y-2">
            <Label htmlFor="languages">Languages (comma separated)</Label>
            <Input
              id="languages"
              type="text"
              placeholder="English, Swahili"
              value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="peopleGroups">People Groups (Optional)</Label>
            <PeopleGroupsSelect
              value={formData.peopleGroups}
              onChange={(groups) => setFormData({ ...formData, peopleGroups: groups })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Banner Image (Required)</Label>
            <div className="flex flex-col gap-3">
              <label
                htmlFor="image"
                className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">
                  {formData.image ? formData.image.name : 'Upload banner image'}
                </span>
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
              {imagePreview && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Supporting Images/Videos</Label>
            <div className="space-y-3">
              <div className="flex flex-col gap-3">
                <label
                  htmlFor="supportingImages"
                  className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Upload images (max 4)
                  </span>
                </label>
                <input
                  id="supportingImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSupportingImagesChange}
                  className="hidden"
                  disabled={supportingImages.length >= 4}
                />
              </div>

              {supportingImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {supportingImages.map((img, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden">
                      <img
                        src={img}
                        alt={`Supporting ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeSupportingImage(index)}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!supportingVideo && (
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="supportingVideo"
                    className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      Upload video (max 1)
                    </span>
                  </label>
                  <input
                    id="supportingVideo"
                    type="file"
                    accept="video/*"
                    onChange={handleSupportingVideoChange}
                    className="hidden"
                  />
                </div>
              )}

              {supportingVideo && (
                <div className="relative rounded-lg overflow-hidden">
                  <video
                    src={supportingVideo}
                    controls
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setSupportingVideo('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

            <Button type="submit" className="w-full">
              Post Opportunity
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
