import { useState, useEffect } from 'react';
import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { CheckCircle2 } from 'lucide-react';
import { UserProfile } from '../types';

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  currentUser: UserProfile;
  onSubmit?: (data: { phoneNumber?: string; details: string }) => void;
}

export function ApplyModal({ isOpen, onClose, jobTitle, currentUser, onSubmit }: ApplyModalProps) {
  const [formData, setFormData] = useState({
    phoneNumber: currentUser.phoneNumber || '',
    details: ''
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        phoneNumber: currentUser.phoneNumber || '',
        details: ''
      });
      setIsConfirmed(false);
    }
  }, [isOpen, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        phoneNumber: formData.phoneNumber,
        details: formData.details
      });
    }
    setIsConfirmed(true);
  };

  const handleClose = () => {
    setIsConfirmed(false);
    setFormData({ phoneNumber: currentUser.phoneNumber || '', details: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-lg">
        {!isConfirmed ? (
          <>
            <DialogHeader>
              <DialogTitle>Apply for Opportunity</DialogTitle>
              <DialogDescription>
                Submit your application for {jobTitle}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apply-name">Your Name</Label>
                <Input
                  id="apply-name"
                  type="text"
                  value={currentUser.name}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apply-email">Email Address</Label>
                <Input
                  id="apply-email"
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apply-phone">Phone Number (Optional)</Label>
                <Input
                  id="apply-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apply-details">Additional Details</Label>
                <Textarea
                  id="apply-details"
                  placeholder="Tell us about yourself and why you'd like to serve in this capacity..."
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Submit Application
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-center">Application Submitted!</DialogTitle>
              <DialogDescription className="text-center">
                Your application has been submitted to the harvest organizer. They will be in touch with you soon.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
