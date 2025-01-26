import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import Link from "next/link";

// Helper function to get a random avatar image
function getRandomAvatar(gender: "male" | "female") {
  const index = Math.floor(Math.random() * 10) + 1; // 1 to 10
  return `/avatars/${gender}${index}.png`;
}

export default function LeaderboardPage() {
  // Placeholder data for leaderboard
  const leaderboardData = [
    {
      name: "Alice Johnson",
      score: 1200,
      avatar: getRandomAvatar("female"),
      qualification: "MBA",
      badges: ["Resume Master", "Interview Ace"],
    },
    {
      name: "Bob Smith",
      score: 1100,
      avatar: getRandomAvatar("male"),
      qualification: "BSc Computer Science",
      badges: ["Networking Pro"],
    },
    {
      name: "Charlie Brown",
      score: 1000,
      avatar: getRandomAvatar("male"),
      qualification: "MA Economics",
      badges: ["Job Fair Star"],
    },
    {
      name: "Diana Ross",
      score: 950,
      avatar: getRandomAvatar("female"),
      qualification: "PhD Biology",
      badges: ["Research Guru"],
    },
    {
      name: "Ethan Hunt",
      score: 900,
      avatar: getRandomAvatar("male"),
      qualification: "BBA",
      badges: ["Startup Enthusiast"],
      },
      {
          name: "Mantaz sandhu",
          score: 900,
          avatar: getRandomAvatar("male"),
          qualification: "BBA",
          badges: ["Startup Enthusiast"],
      },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>
              See how you rank against other job seekers!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {leaderboardData.map((player, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-lg">{index + 1}</span>
                    <Avatar>
                      <AvatarImage src={player.avatar} alt={player.name} />
                      <AvatarFallback>{player.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Link
                        href={`/profile/${player.name
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        className="font-medium hover:underline"
                      >
                        {player.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {player.qualification}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {player.badges.map((badge, badgeIndex) => (
                          <Badge
                            key={badgeIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-lg">{player.score}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
