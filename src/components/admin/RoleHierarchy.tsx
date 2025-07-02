
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RoleHierarchy = () => {
  const roles = [
    "System Administrator",
    "Nakuru County Chief Nursing Officer",
    "Nakuru County Deputy Chief Nursing Officer",
    "Chief Nurse Officer", 
    "Nurse Officer",
    "Senior Nurse",
    "Staff Nurse",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#be2251]">
          Nakuru County Role Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {roles.map((role, index) => (
            <div
              key={role}
              className="flex items-center justify-between p-2 bg-gray-50 rounded"
            >
              <span className="font-medium">{role}</span>
              <Badge variant="outline">Level {roles.length - index}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleHierarchy;
