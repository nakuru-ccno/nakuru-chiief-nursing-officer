
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddUserDialogProps {
  onAddUser: (user: {
    name: string;
    email: string;
    role: string;
    password: string;
  }) => void;
}

const AddUserDialog = ({ onAddUser }: AddUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    password: ""
  });
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

    try {
      // Create user through Supabase Auth Admin API with auto-confirmation
      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // This bypasses email confirmation
        user_metadata: {
          full_name: formData.name,
          role: formData.role
        }
      });

      if (error) {
        console.error('Supabase auth admin error:', error);
        
        // Fallback: Use regular signUp method
        const { data: fallbackData, error: fallbackError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.name,
              role: formData.role
            }
          }
        });

        if (fallbackError) {
          toast({
            title: "Error",
            description: fallbackError.message,
            variant: "destructive"
          });
          return;
        }

        // Try to auto-confirm through profiles table insert
        if (fallbackData.user) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: fallbackData.user.id,
                email: formData.email,
                full_name: formData.name,
                role: formData.role,
                created_at: new Date().toISOString()
              }]);

            if (profileError) {
              console.error('Profile insert error:', profileError);
            }
          } catch (insertError) {
            console.error('Insert error:', insertError);
          }
        }

        toast({
          title: "User Created",
          description: "User created but may need email verification for full access."
        });
      } else {
        // Success with admin API - user is auto-confirmed
        if (data.user) {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: data.user.id,
                email: formData.email,
                full_name: formData.name,
                role: formData.role,
                created_at: new Date().toISOString()
              }]);

            if (profileError) {
              console.error('Profile insert error:', profileError);
            }
          } catch (insertError) {
            console.error('Insert error:', insertError);
          }
        }

        toast({
          title: "Success",
          description: "User created successfully and can login immediately!"
        });
      }

      // Call the parent handler for local state management
      onAddUser(formData);
      setFormData({ name: "", email: "", role: "", password: "" });
      setOpen(false);

    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user account",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#fd3572] hover:bg-[#be2251] text-white">
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#be2251]">Add New User</DialogTitle>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
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
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#fd3572] hover:bg-[#be2251] text-white"
            >
              Add User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
