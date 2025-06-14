
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface EditUserDialogProps {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
  };
  onUpdateUser: (userData: { full_name: string; email: string; role: string; password?: string }) => void;
  onCancel: () => void;
  predefinedRoles?: string[];
}

const EditUserDialog = ({ user, onUpdateUser, onCancel, predefinedRoles = [] }: EditUserDialogProps) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    customRole: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCustomRole, setShowCustomRole] = useState(!predefinedRoles.includes(user.role));

  const defaultRoles = predefinedRoles.length > 0 ? predefinedRoles : [
    "System Administrator",
    "Nakuru County Chief Nursing Officer", 
    "Nakuru County Deputy Chief Nursing Officer",
    "Chief Nurse Officer",
    "Nurse Officer",
    "Senior Nurse",
    "Staff Nurse"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (value: string) => {
    if (value === "custom") {
      setShowCustomRole(true);
      setFormData(prev => ({ ...prev, role: "", customRole: user.role }));
    } else {
      setShowCustomRole(false);
      setFormData(prev => ({ ...prev, role: value, customRole: "" }));
    }
    if (errors.role) {
      setErrors(prev => ({ ...prev, role: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    const finalRole = showCustomRole ? formData.customRole : formData.role;
    if (!finalRole.trim()) {
      newErrors.role = "Role is required";
    }

    if (formData.password || formData.confirmPassword) {
      if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const finalRole = showCustomRole ? formData.customRole.trim() : formData.role;

    const updateData = {
      full_name: formData.name.trim(),
      email: formData.email.trim(),
      role: finalRole,
      ...(formData.password && { password: formData.password })
    };

    console.log("Updating user with data:", updateData);
    onUpdateUser(updateData);
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#be2251]">Edit User - Nakuru County</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
              value={showCustomRole ? "custom" : formData.role} 
              onValueChange={handleRoleChange}
            >
              <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {defaultRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
                <SelectItem value="custom">Custom Role...</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          {showCustomRole && (
            <div>
              <Label htmlFor="customRole">Custom Role</Label>
              <Input
                id="customRole"
                name="customRole"
                type="text"
                value={formData.customRole}
                onChange={handleInputChange}
                placeholder="Enter custom role title"
                className={errors.role ? "border-red-500" : ""}
              />
            </div>
          )}

          <div>
            <Label htmlFor="password">New Password (optional)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
              className={errors.confirmPassword ? "border-red-500" : ""}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-[#be2251] hover:bg-[#fd3572] text-white"
            >
              Update User
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
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
