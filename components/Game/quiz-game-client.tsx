"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  AlertTriangle,
  CheckCircle,
  Trophy,
  Loader2,
  Lock,
} from "lucide-react";
import { launchConfetti } from "../ui/confetti";
import { toast } from "sonner";
import {
  getUserPoints,
  saveUserLevelProgress,
  submitUserAnswer,
  getUserCompletedLevels,
} from "@/lib/userActions";
import Spinner from "../ui/spinner/spinner";
import { updateLeaderboard } from "@/lib/leaderboardActions";
import { motion } from "framer-motion";
import checkAndAssignBadges from "@/lib/badgeActions";

interface QuizGameClientProps {
  initialLevel: number;
  initialQuestions: any[];
  initialLevelCompleted: boolean;
}

export default function QuizGameClient({
  initialLevel,
  initialQuestions,
  initialLevelCompleted,
}: QuizGameClientProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<
    | "loading"
    | "idle"
    | "playing"
    | "completed"
    | "timedOut"
    | "alreadyCompleted"
    | "selectDifficulty"
  >("selectDifficulty");
  const [currentLevel, setCurrentLevel] = useState(initialLevel);
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [confettiLaunched, setConfettiLaunched] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isCheckingProgress, setIsCheckingProgress] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  );
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  const difficultyRanges = {
    beginner: { min: 1, max: 10 },
    intermediate: { min: 11, max: 30 },
    advanced: { min: 31, max: 100 },
  };

  const maxPossibleScore = questions.length * 100;

  const scoreProgressPercentage =
    maxPossibleScore > 0 ? Math.min(100, (score / maxPossibleScore) * 100) : 0;

  useEffect(() => {
    const loadCompletedLevels = async () => {
      try {
        const levels = await getUserCompletedLevels();
        setCompletedLevels(levels || []);
      } catch (error) {
        console.error("Failed to load completed levels:", error);
      }
    };

    loadCompletedLevels();
  }, []);

  useEffect(() => {
    setCurrentLevel(initialLevel);
    setQuestions(initialQuestions);

    if (initialLevel !== 1 && initialLevel !== 11 && initialLevel !== 31) {
      setGameState(initialLevelCompleted ? "alreadyCompleted" : "idle");
    } else {
      setGameState("selectDifficulty");
    }

    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setConfettiLaunched(false);
    setAnsweredQuestions(new Set());
  }, [initialLevel, initialLevelCompleted]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 10) + 1;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            setGameState("timedOut");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === "completed" && !confettiLaunched) {
      launchConfetti();
      setConfettiLaunched(true);
    }
  }, [gameState, confettiLaunched]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const score = await getUserPoints();
        setScore(score ?? 0);
      } catch (error) {
        console.error("Failed to load user points:", error);
      }
    };
    loadGameData();
  }, [currentLevel]);

  const startGame = async () => {
    const isAllowed = isLevelAllowed(currentLevel);

    if (!isAllowed) {
      const requiredDifficulty = getDifficultyForLevel(currentLevel);
      const previousDifficulty = getPreviousDifficulty(requiredDifficulty);

      toast.error(`You need to complete ${previousDifficulty} levels first!`);
      return;
    }

    if (initialLevelCompleted) {
      setGameState("alreadyCompleted");
      return;
    }

    setQuestions(initialQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(90);
    setGameState("playing");
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setAnsweredQuestions(new Set());
  };

  const handleAnswerSelect = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedAnswer(index);
    }
  };

  const isDifficultyLocked = (difficultyName: string): boolean => {
    if (difficultyName === "beginner") return false;

    if (difficultyName === "intermediate") {
      return !completedLevels.some((level) => level >= 9);
    }

    if (difficultyName === "advanced") {
      return !completedLevels.some((level) => level >= 30);
    }

    return true;
  };

  const isLevelAllowed = (level: number): boolean => {
    const difficulty = getDifficultyForLevel(level);
    return !isDifficultyLocked(difficulty);
  };

  const getDifficultyForLevel = (level: number): string => {
    if (level >= 1 && level <= 10) return "beginner";
    if (level >= 11 && level <= 30) return "intermediate";
    return "advanced";
  };

  const getPreviousDifficulty = (difficulty: string): string => {
    if (difficulty === "intermediate") return "beginner";
    if (difficulty === "advanced") return "intermediate";
    return "beginner";
  };

  const selectDifficulty = (selectedDifficulty: string) => {
    if (isDifficultyLocked(selectedDifficulty)) {
      toast.error(
        `${
          selectedDifficulty.charAt(0).toUpperCase() +
          selectedDifficulty.slice(1)
        } difficulty is locked!`
      );
      return;
    }

    let newLevel;
    switch (selectedDifficulty) {
      case "beginner":
        newLevel = 1;
        break;
      case "intermediate":
        newLevel = 11;
        break;
      case "advanced":
        newLevel = 31;
        break;
      default:
        return;
    }

    setDifficulty(selectedDifficulty);
    setCurrentLevel(newLevel);
    router.push(`?level=${newLevel}`);
    setGameState("idle");
  };

  const handleAnswerSubmit = async () => {
    if (selectedAnswer === null || isSubmitting) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.test_answer;

    if (answeredQuestions.has(currentQuestionIndex)) {
      setIsAnswerSubmitted(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await submitUserAnswer(
        currentQuestion.answers[selectedAnswer],
        isCorrect
      );

      if (isCorrect) {
        setScore((prev) => prev + 100);
      }

      setAnsweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));
      setIsAnswerSubmitted(true);
    } catch (error) {
      console.error("Error saving answer:", error);
      toast.error("Failed to save your answer");

      if (isCorrect) {
        setScore((prev) => prev + 100);
      }
      setIsAnswerSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      completeLevel();
    }
  };

  const completeLevel = async () => {
    try {
      setGameState("completed");

      await saveUserLevelProgress(currentLevel);
      await updateLeaderboard(score);
      const earnedBadges = await checkAndAssignBadges();

      earnedBadges.map((badgeName) => {
        toast.success(`🏆 New Badge Earned: ${badgeName}!`, {
          duration: 4000,
        });
      });

      setCompletedLevels((prev) => {
        if (!prev.includes(currentLevel)) {
          return [...prev, currentLevel];
        }
        return prev;
      });
    } catch (error) {
      console.error("Error completing level:", error);
      toast.error("Error saving progress");
    }
  };

  const goToNextLevel = () => {
    setGameState("loading");
    const newLevel = currentLevel + 1;

    if (!isLevelAllowed(newLevel)) {
      const requiredDifficulty = getDifficultyForLevel(newLevel);
      const previousDifficulty = getPreviousDifficulty(requiredDifficulty);

      toast.error(`You need to complete ${previousDifficulty} levels first!`);
      setGameState("selectDifficulty");
      return;
    }

    router.push(`?level=${newLevel}`);

    setConfettiLaunched(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setAnsweredQuestions(new Set());
  };

  const playAgain = () => {
    setGameState("idle");
    setConfettiLaunched(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setAnsweredQuestions(new Set());
  };

  const goToMenu = () => {
    setGameState("selectDifficulty");
  };

  const renderContent = () => {
    switch (gameState) {
      case "selectDifficulty":
        return (
          <div className="text-center py-6">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Choose Your Challenge
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300 overflow-hidden group h-full">
                  <div className="absolute inset-0 bg-gradient-to-b from-green-100/30 to-transparent z-0"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                      <Trophy className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl text-center group-hover:text-primary transition-colors">
                      Beginner
                    </CardTitle>
                    <CardDescription className="text-center font-medium">
                      Levels 1-10
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm">Perfect for new players</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm">Basic knowledge questions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm">Earn your first badges</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10 pt-0">
                    <Button
                      onClick={() => selectDifficulty("beginner")}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      Start Challenge
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card
                  className={`border-2 ${
                    isDifficultyLocked("intermediate")
                      ? "opacity-90 grayscale-[30%]"
                      : "hover:border-primary hover:shadow-lg group"
                  } transition-all duration-300 overflow-hidden h-full`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-100/30 to-transparent z-0 pointer-events-none"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2 relative">
                      {isDifficultyLocked("intermediate") && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {!isDifficultyLocked("intermediate") && (
                        <motion.div
                          animate={{ rotate: [0, 5, 0, -5, 0] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 5,
                          }}
                        >
                          <Trophy className="h-8 w-8 text-blue-600" />
                        </motion.div>
                      )}
                    </div>
                    <CardTitle
                      className={`text-xl text-center ${
                        !isDifficultyLocked("intermediate") &&
                        "group-hover:text-primary"
                      } transition-colors`}
                    >
                      Intermediate
                    </CardTitle>
                    <CardDescription className="text-center font-medium">
                      Levels 11-30
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-5 w-5 ${
                            isDifficultyLocked("intermediate")
                              ? "text-gray-400"
                              : "text-blue-500"
                          } flex-shrink-0`}
                        />
                        <p className="text-sm">More challenging questions</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-5 w-5 ${
                            isDifficultyLocked("intermediate")
                              ? "text-gray-400"
                              : "text-blue-500"
                          } flex-shrink-0`}
                        />
                        <p className="text-sm">Test your growing knowledge</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-5 w-5 ${
                            isDifficultyLocked("intermediate")
                              ? "text-gray-400"
                              : "text-blue-500"
                          } flex-shrink-0`}
                        />
                        <p className="text-sm">Unlock advanced badges</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10 pt-0">
                    {isDifficultyLocked("intermediate") ? (
                      <Button
                        disabled
                        className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => selectDifficulty("intermediate")}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                      >
                        Start Challenge
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card
                  className={`border-2 ${
                    isDifficultyLocked("advanced")
                      ? "opacity-90 grayscale-[30%]"
                      : "hover:border-primary hover:shadow-lg group"
                  } transition-all duration-300 overflow-hidden h-full`}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-100/30 to-transparent z-0"></div>
                  <CardHeader className="relative z-10 pb-2">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-2 relative">
                      {isDifficultyLocked("advanced") && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      {!isDifficultyLocked("advanced") && (
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2,
                          }}
                        >
                          <Trophy className="h-8 w-8 text-purple-600" />
                        </motion.div>
                      )}
                    </div>
                    <CardTitle
                      className={`text-xl text-center ${
                        !isDifficultyLocked("advanced") &&
                        "group-hover:text-primary"
                      } transition-colors`}
                    >
                      Advanced
                    </CardTitle>
                    <CardDescription className="text-center font-medium">
                      Levels 31+
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative z-10 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-5 w-5 ${
                            isDifficultyLocked("advanced")
                              ? "text-gray-400"
                              : "text-purple-500"
                          } flex-shrink-0`}
                        />
                        <p className="text-sm">Expert-level challenges</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-5 w-5 ${
                            isDifficultyLocked("advanced")
                              ? "text-gray-400"
                              : "text-purple-500"
                          } flex-shrink-0`}
                        />
                        <p className="text-sm">Complex problem solving</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle
                          className={`h-5 w-5 ${
                            isDifficultyLocked("advanced")
                              ? "text-gray-400"
                              : "text-purple-500"
                          } flex-shrink-0`}
                        />
                        <p className="text-sm">Earn master-level badges</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="relative z-10 pt-0">
                    {isDifficultyLocked("advanced") ? (
                      <Button
                        disabled
                        className="w-full bg-gray-300 text-gray-600 cursor-not-allowed"
                      >
                        <Lock className="h-4 w-4 mr-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => selectDifficulty("advanced")}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                      >
                        Start Challenge
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 p-4 bg-gray-50 rounded-lg max-w-2xl mx-auto"
            >
              <h3 className="text-lg font-medium mb-2">How to Progress</h3>
              <p className="text-sm text-gray-600 mb-3">
                Complete every level in a tier to unlock the next tier. Each
                completed level earns you points and badges!
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !isDifficultyLocked("beginner")
                        ? "bg-green-500"
                        : "bg-gray-300"
                    } mr-1`}
                  ></div>
                  <span>Beginner</span>
                </div>
                <span>→</span>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !isDifficultyLocked("intermediate")
                        ? "bg-blue-500"
                        : "bg-gray-300"
                    } mr-1`}
                  ></div>
                  <span>Intermediate</span>
                </div>
                <span>→</span>
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      !isDifficultyLocked("advanced")
                        ? "bg-purple-500"
                        : "bg-gray-300"
                    } mr-1`}
                  ></div>
                  <span>Advanced</span>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case "loading":
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] py-16 px-4">
            <div className="w-full max-w-md flex flex-col items-center space-y-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                  className="text-primary"
                >
                  <Loader2 className="w-16 h-16 stroke-[1.5]" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0.8, 1.2, 0.8] }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-8 h-8 bg-primary/20 rounded-full backdrop-blur-sm" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-3"
              >
                <h3 className="text-xl font-bold text-primary">
                  Preparing Level !
                </h3>
                <p className="text-muted-foreground">
                  Get ready for new challenges...
                </p>
              </motion.div>
              <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-center text-muted-foreground italic"
              >
                <p>Tip: Collect power-ups to gain special abilities!</p>
              </motion.div>
            </div>
          </div>
        );

      case "idle":
        return (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Level {currentLevel}
            </h2>
            <p className="mb-6">
              Ready to test your knowledge? Answer 10 questions to complete this
              level!
            </p>
            <div className="flex justify-center gap-4">
              <Button
                size="lg"
                onClick={startGame}
                disabled={isCheckingProgress}
              >
                {isCheckingProgress
                  ? "Checking Progress..."
                  : "Start Challenge"}
              </Button>
              <Button variant="outline" onClick={goToMenu}>
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case "playing":
        const currentQuestion = questions[currentQuestionIndex];
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-800">
              {currentQuestion?.question || "Loading question..."}
            </h3>

            <div className="space-y-3">
              {currentQuestion?.answers?.map(
                (answer: string, index: number) => (
                  <Button
                    key={index}
                    variant={
                      isAnswerSubmitted
                        ? index === currentQuestion.test_answer
                          ? "success"
                          : selectedAnswer === index
                          ? "destructive"
                          : "outline"
                        : "outline"
                    }
                    className={`w-full justify-start h-auto py-4 px-6 text-left ${
                      isAnswerSubmitted
                        ? index === currentQuestion.test_answer
                          ? "bg-green-500 text-white hover:bg-green-500 hover:text-white"
                          : selectedAnswer === index
                          ? "bg-red-500 text-white hover:bg-red-500 hover:text-white"
                          : ""
                        : selectedAnswer === index
                        ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white"
                        : ""
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={isSubmitting || isAnswerSubmitted}
                  >
                    {answer}
                  </Button>
                )
              )}
            </div>

            <div className="pt-4 flex justify-between">
              {!isAnswerSubmitted ? (
                <Button
                  onClick={handleAnswerSubmit}
                  disabled={selectedAnswer === null || isSubmitting}
                  className="w-32"
                >
                  {isSubmitting ? <Spinner /> : "Submit Answer"}
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1
                    ? "Next Question"
                    : "Complete Level"}
                </Button>
              )}

              <Button variant="outline" onClick={goToMenu}>
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case "completed":
        return (
          <div className="text-center py-10">
            <div className="flex justify-center mb-6">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Level Complete!</h2>
            <p className="text-xl mb-8">Your Score: {score}</p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={goToNextLevel}
                className="bg-black hover:bg-black/80 text-white px-6"
              >
                Next Level
              </Button>
              <Button
                onClick={playAgain}
                className="bg-black hover:bg-black/80 text-white px-6"
              >
                Play Again
              </Button>
              <Button onClick={goToMenu} variant="outline">
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case "timedOut":
        return (
          <div className="text-center py-10">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-red-500">
              Time&apos;s Up!
            </h2>
            <p className="text-xl mb-8">Your Final Score: {score}</p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={playAgain}
                className="bg-black hover:bg-black/80 text-white px-6"
              >
                Play Again
              </Button>
              <Button onClick={goToMenu} variant="outline">
                Back to Menu
              </Button>
            </div>
          </div>
        );

      case "alreadyCompleted":
        return (
          <div className="text-center py-10">
            <div className="flex justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-6 text-green-500">
              Level Already Completed!
            </h2>
            <p className="text-lg mb-8">
              You&apos;ve already completed this level. Would you like to play
              again or move to the next level?
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={goToNextLevel}
                className="bg-black hover:bg-black/80 text-white px-6"
              >
                Next Level
              </Button>
              <Button
                onClick={playAgain}
                className="bg-black hover:bg-black/80 text-white px-6"
              >
                Play Again
              </Button>
              <Button onClick={goToMenu} variant="outline">
                Back to Menu
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            {gameState === "selectDifficulty"
              ? "Quiz Challenge"
              : `Level ${currentLevel}`}
          </div>
          {gameState === "playing" && (
            <div
              className={`flex items-center gap-1 text-lg font-medium ${
                timeLeft < 30 ? "text-red-500" : "text-gray-500"
              }`}
            >
              <Clock className="h-5 w-5" />
              {formatTime(timeLeft)}
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {gameState === "selectDifficulty" && "Choose your difficulty level"}
          {gameState === "idle" && "Welcome to the Job Application Challenge!"}
          {gameState === "playing" &&
            `Question ${currentQuestionIndex + 1} of ${questions.length}`}
          {gameState === "completed" &&
            "Congratulations on completing this level!"}
          {gameState === "timedOut" && "You ran out of time!"}
          {gameState === "alreadyCompleted" &&
            "You've already mastered this level!"}
        </CardDescription>
      </CardHeader>

      <CardContent>{renderContent()}</CardContent>

      <CardFooter className="flex flex-col">
        {gameState === "playing" && (
          <div className="w-full space-y-2">
            <div className="flex justify-between items-center">
              <div className="font-medium text-gray-700">Score: {score}</div>
              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
            <Progress
              value={(currentQuestionIndex / (questions.length - 1)) * 100}
              className="h-2"
            />
          </div>
        )}

        {gameState === "completed" && (
          <div className="w-full mt-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-gray-700">
                Final Score: {score}
              </div>
              <div className="text-sm text-gray-500">
                {score} / {maxPossibleScore}
              </div>
            </div>
            <Progress value={scoreProgressPercentage} className="h-2" />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
