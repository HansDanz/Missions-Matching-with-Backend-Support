import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface CreateOrgProfilePageProps {
  onBack: () => void;
  onComplete: (profileData: {
    name: string;
    email: string;
    password: string;
    role: 'harvest worker' | 'harvest organizer';
    age?: number;
  }) => void;
}

export function CreateOrgProfilePage({ onBack, onComplete }: CreateOrgProfilePageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as 'harvest worker' | 'harvest organizer' | '',
    age: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role as 'harvest worker' | 'harvest organizer',
      age: formData.role === 'harvest worker' && formData.age ? parseInt(formData.age) : undefined
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg mb-4 inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-gray-900 mb-2">Create Your Profile</h1>
          <p className="text-muted-foreground">Join the mission to reach the unreached</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">I am a...</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value as 'harvest worker' | 'harvest organizer' })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harvest worker">Harvest Worker</SelectItem>
                <SelectItem value="harvest organizer">Harvest Organizer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'harvest worker' && (
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Profile
          </Button>
        </form>
      </div>
    </div>
  );
}
