import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Guhuza</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Enhance your job-seeking skills through an interactive and engaging
            game experience. Join our community of ambitious professionals and
            take your career to the next level!
          </p>
          <Link href="/game" passHref>
            <Button size="lg" className="text-lg px-8">
              Play Now
            </Button>
          </Link>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>How to Play</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              <li>Create your profile and customize your virtual job seeker</li>
              <li>
                Complete challenges related to resume writing, interview skills,
                and networking
              </li>
              <li>
                Earn points and badges as you progress through different career
                stages
              </li>
              <li>Compete with other players and climb the leaderboard</li>
              <li>
                Unlock new features and resources to boost your real-world job
                search
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Benefits of Playing</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Improve your job-seeking skills in a fun, low-pressure
                environment
              </li>
              <li>
                Network with other players and expand your professional
                connections
              </li>
              <li>
                Win prizes such as career coaching sessions, resume reviews, and
                more
              </li>
              <li>
                Gain confidence in your abilities through practice and feedback
              </li>
              <li>
                Stay motivated and track your progress in your job search
                journey
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/signup" passHref>
            <Button size="lg" className="text-lg px-8">
              Register Now
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Sarah M.",
                  text: "Guhuza helped me land my dream job! The interview practice was invaluable.",
                },
                {
                  name: "Michael L.",
                  text: "I've made great connections through the networking challenges. Highly recommended!",
                },
                {
                  name: "Emily R.",
                  text: "The resume writing tips I learned from Guhuza made a huge difference in my job applications.",
                },
              ].map((testimonial, index) => (
                <div key={index} className="bg-muted p-4 rounded-lg">
                  <p className="italic mb-2">"{testimonial.text}"</p>
                  <p className="font-semibold text-right">
                    - {testimonial.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
