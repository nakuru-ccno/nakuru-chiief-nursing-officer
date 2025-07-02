
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Shield, Clock } from "lucide-react";

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

interface UserCardProps {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
}

const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
  const getRoleColor = (role: string) => {
    const colors = {
      'System Administrator': 'bg-red-100 text-red-800',
      'admin': 'bg-red-100 text-red-800',
      'Chief Nurse Officer': 'bg-purple-100 text-purple-800',
      'Nurse Officer': 'bg-blue-100 text-blue-800',
      'Senior Nurse': 'bg-green-100 text-green-800',
      'Staff Nurse': 'bg-yellow-100 text-yellow-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-[#fd3572] text-white rounded-full flex items-center justify-center font-bold">
          {user.full_name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {user.full_name || user.email}
          </h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={`text-xs ${getRoleColor(user.role)}`}>
              {user.role}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(user.status)}`}>
              {user.status}
            </Badge>
            {user.email_verified && (
              <Badge className="text-xs bg-blue-100 text-blue-800">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right text-sm text-gray-500 mr-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Created: {formatDate(user.created_at)}</span>
          </div>
          {user.last_sign_in_at && (
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              <span>Last login: {formatDate(user.last_sign_in_at)}</span>
            </div>
          )}
        </div>
        <Button
          onClick={() => onEdit(user)}
          size="sm"
          variant="outline"
          className="border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <Edit size={16} />
        </Button>
        <Button
          onClick={() => onDelete(user)}
          size="sm"
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
