import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface AddUserFormProps {
  onSubmit: (userData: { full_name: string; email: string; role: string; password: string }) => void;
  onCancel: () => void;
  predefinedRoles: string[];
  isLoading?: boolean;
}

const AddUserForm = ({
  onSubmit,
  onCancel,
  predefinedRoles,
  isLoading = false,
}: AddUserFormProps) => {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    customRole: "",
    password: "",
    confirmPassword: "",
    useGeneratedPassword: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");

  // Ensure unique roles and filter out empty strings and 'custom'
  const uniqueRoles = Array.from(
    new Set(predefinedRoles.filter((role) => role && role !== "custom"))
  );

  // Generate a secure password
  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  React.useEffect(() => {
    if (formData.useGeneratedPassword) {
      const newPassword = generatePassword();
      setGeneratedPassword(newPassword);
      setFormData((prev) => ({
        ...prev,
        password: newPassword,
        confirmPassword: newPassword,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.useGeneratedPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (value: string) => {
    if (value === "custom") {
      setShowCustomRole(true);
      setFormData((prev) => ({ ...prev, role: "", customRole: "" }));
    } else {
      setShowCustomRole(false);
      setFormData((prev) => ({ ...prev, role: value, customRole: "" }));
    }
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Full name validation
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = "Full name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    // Role validation
    const finalRole = showCustomRole ? formData.customRole : formData.role;
    if (!finalRole || !finalRole.trim()) {
      newErrors.role = "Role is required";
    }

    // Password validation
    if (!formData.useGeneratedPassword) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (!generatedPassword) {
      newErrors.password = "Generated password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const finalRole = showCustomRole
      ? formData.customRole.trim()
      : formData.role;
    const finalPassword = formData.useGeneratedPassword
      ? generatedPassword
      : formData.password;

    // Extra validation for final data
    if (!finalPassword || finalPassword.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }

    const userData = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: finalRole,
      password: finalPassword,
    };

    onSubmit(userData);
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            className={errors.full_name ? "border-red-500" : ""}
            disabled={isLoading}
            required
          />
          {errors.full_name && (
            <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
            disabled={isLoading}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="role">Role *</Label>
          <Select
            value={showCustomRole ? "custom" : formData.role}
            onValueChange={handleRoleChange}
            disabled={isLoading}
            required
          >
            <SelectTrigger className={errors.role ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {uniqueRoles.map((role, idx) => (
                <SelectItem key={role || `role-${idx}`} value={role}>
                  {role}
                </SelectItem>
              ))}
              <SelectItem key="custom" value="custom">
                Custom Role...
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-red-500 text-xs mt-1">{errors.role}</p>
          )}
        </div>

        {showCustomRole && (
          <div>
            <Label htmlFor="customRole">Custom Role *</Label>
            <Input
              id="customRole"
              name="customRole"
              type="text"
              value={formData.customRole}
              onChange={handleInputChange}
              placeholder="Enter custom role title"
              className={errors.role ? "border-red-500" : ""}
              disabled={isLoading}
              required
            />
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role}</p>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              id="useGeneratedPassword"
              name="useGeneratedPassword"
              checked={formData.useGeneratedPassword}
              onChange={handleInputChange}
              disabled={isLoading}
              className="rounded border-gray-300"
            />
            <Label htmlFor="useGeneratedPassword" className="text-sm">
              Use auto-generated secure password (recommended)
            </Label>
          </div>

          {formData.useGeneratedPassword && generatedPassword && (
            <div className="bg-gray-50 p-3 rounded border mb-2">
              <Label className="text-sm font-medium text-gray-700">
                Generated Password:
              </Label>
              <div className="mt-1 font-mono text-sm bg-white p-2 rounded border break-all">
                {generatedPassword}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Please save this password securely. The user will need to change
                it on first login.
              </p>
            </div>
          )}
        </div>

        {!formData.useGeneratedPassword && (
          <>
            <div>
              <Label htmlFor="password">Initial Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password (min 8 characters)"
                className={errors.password ? "border-red-500" : ""}
                disabled={isLoading}
                required
                minLength={8}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className={errors.confirmPassword ? "border-red-500" : ""}
                disabled={isLoading}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1 bg-[#be2251] hover:bg-[#fd3572] text-white"
            disabled={isLoading}
          >
            {isLoading ? "Adding User..." : "Add User"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;
