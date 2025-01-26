import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

// Helper function to get a random avatar image
function getRandomAvatar(gender: "male" | "female") {
  const index = Math.floor(Math.random() * 10) + 1; // 1 to 10
  return `/avatars/${gender}${index}.png`;
}

export default function ProfilePage() {
  // Placeholder data for the profile
  const profile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: getRandomAvatar("male"),
    score: 1250,
    gamesPlayed: 15,
    qualification: "MSc in Computer Science",
    skills: ["JavaScript", "React", "Node.js", "Python"],
    badges: [
      { name: "Resume Master", description: "Created a perfect resume" },
      { name: "Interview Ace", description: "Passed 10 interview simulations" },
      {
        name: "Networking Pro",
        description: "Connected with 50 professionals",
      },
    ],
    recentGames: [
      { date: "2025-01-20", score: 65 },
      { date: "2025-01-18", score: 70 },
      { date: "2025-01-15", score: 55 },
    ],
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-muted-foreground">{profile.email}</p>
                  <p className="text-sm">{profile.qualification}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Total Score:</strong> {profile.score}
                </p>
                <p>
                  <strong>Games Played:</strong> {profile.gamesPlayed}
                </p>
                <div>
                  <strong>Skills:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>Achievements you've earned</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.badges.map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Badge variant="secondary" className="p-2">
                      {badge.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {badge.description}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Games</CardTitle>
            <CardDescription>Your latest game performances</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {profile.recentGames.map((game, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-secondary rounded-lg"
                >
                  <span>{game.date}</span>
                  <span className="font-bold">Score: {game.score}</span>
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
