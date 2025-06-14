
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

interface AddUserDialogProps {
  onAddUser: () => void;
}

const AddUserDialog = ({ onAddUser }: AddUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    // Password validation
    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('Creating user with signup (no email verification)...');
      
      // Create user without email confirmation by using the admin auth methods
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined, // Disable email verification
          data: {
            full_name: formData.name,
            role: formData.role,
            email_confirmed: true // Mark email as confirmed
          }
        }
      });

      if (authError) {
        console.error('Signup error:', authError);
        
        // Handle specific error cases
        if (authError.message.includes('rate limit') || authError.message.includes('429')) {
          toast({
            title: "Error",
            description: "Too many signup attempts. Please wait a moment and try again.",
            variant: "destructive"
          });
        } else if (authError.message.includes('already registered')) {
          toast({
            title: "Error", 
            description: "This email is already registered. Please use a different email.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: `Failed to create user: ${authError.message}`,
            variant: "destructive"
          });
        }
        return;
      }

      if (authData.user) {
        console.log('User created successfully:', authData.user.id);
        
        // Create/update profile in the profiles table
        console.log('Creating user profile...');
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.name,
            role: formData.role,
            created_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          toast({
            title: "Warning",
            description: "User created but profile setup may be incomplete. Please refresh the page to see the user.",
            variant: "default"
          });
        } else {
          console.log('Profile created successfully');
          toast({
            title: "Success",
            description: "User created successfully! They can log in immediately without email verification."
          });
        }

        // Call the parent handler to refresh the list
        onAddUser();
        setFormData({ name: "", email: "", role: "", password: "" });
        setOpen(false);
      }

    } catch (error) {
      console.error('Unexpected error creating user:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white flex items-center gap-2">
          <UserPlus size={16} />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#be2251]">Add New User</DialogTitle>
          <p className="text-sm text-gray-600">Create a new user account (no email verification required)</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter password (min 6 characters)"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleInputChange("role", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chief Nurse Officer">Chief Nurse Officer</SelectItem>
                <SelectItem value="Nurse Officer">Nurse Officer</SelectItem>
                <SelectItem value="Senior Nurse">Senior Nurse</SelectItem>
                <SelectItem value="Staff Nurse">Staff Nurse</SelectItem>
                <SelectItem value="System Administrator">System Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#fd3572] hover:bg-[#be2251] text-white"
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Add User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
