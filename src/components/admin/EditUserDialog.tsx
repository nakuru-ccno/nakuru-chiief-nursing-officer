
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  last_sign_in_at: string;
  email_verified: boolean;
}

interface EditUserDialogProps {
  user: UserProfile;
  open: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserProfile) => void;
}

const EditUserDialog = ({ user, open, onClose, onUserUpdated }: EditUserDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    email: user.email,
    role: user.role || "",
    status: user.status || "active",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const defaultRoles = [
    "System Administrator",
    "Nakuru County Chief Nursing Officer", 
    "Nakuru County Deputy Chief Nursing Officer",
    "Chief Nurse Officer",
    "Nurse Officer",
    "Senior Nurse",
    "Staff Nurse"
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "inactive", label: "Inactive" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.role.trim()) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('📝 Updating user:', user.id, formData);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ User updated successfully:', data);
      onUserUpdated(data);
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#be2251]">Edit User - Nakuru County</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className={errors.full_name ? "border-red-500" : ""}
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {defaultRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#be2251] hover:bg-[#fd3572] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update User"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
