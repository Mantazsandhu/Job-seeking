"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { getUserBadges } from "@/lib/badge";
import { Badge } from "./ui/badge";

// Define a type for badge
interface BadgeData {
  id: number;
  name: string;
}

interface BadgeProps {
  userId: string;
}

export const Badges = ({ userId }: BadgeProps) => {
  const [badgeData, setBadgeData] = useState<BadgeData[]>([]);

  useEffect(() => {
    const fetchBadgeData = async () => {
      try {
        const data = await getUserBadges(userId); // Get user badges
        setBadgeData(data); // Set the data to state
      } catch (error) {
        console.error("Error fetching badge data:", error);
      }
    };

    if (userId) {
      fetchBadgeData(); // Call the async function only if userId is available
    }
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>Your achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {badgeData.length > 0 ? (
            badgeData.map((badge) => (
              <Badge key={badge.id} variant="secondary" className="p-2">
                {badge.name}
              </Badge>
            ))
          ) : (
            <p>No badges yet! Keep going, you&apos;ll earn some soon!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Badges;
