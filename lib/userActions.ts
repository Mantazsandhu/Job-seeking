"use server";

import { signOut } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function saveUserAnswer(
  userId: string,
  questionId: number,
  answer: number,
  levelId: number,
  subcategoryId: number
) {
  const isCorrect = await checkAnswerCorrectness(questionId, answer);

  return prisma.userAnswerSubmission.create({
    data: {
      userId,
      questionId,
      answer: answer.toString(),
      isCorrect,
      levelId,
      subcategoryId,
    },
  });
}

async function checkAnswerCorrectness(questionId: number, userAnswer: number) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { correctAnswer: true },
  });

  return question ? userAnswer === question.correctAnswer : false;
}

export async function checkUserLevelProgress(
  userId: string,
  categoryId: number
) {
  try {
    const progress = await prisma.userLevelProgress.findMany({
      where: {
        userId: userId,
        subcategory: {
          categoryId: categoryId,
        },
      },
      include: {
        level: true,
        subcategory: true,
      },
    });

    return progress;
  } catch (error) {
    console.error("Failed to fetch user progress", error);
    return [];
  }
}

export async function saveUserLevelProgress(
  userId: string,
  levelId: number,
  subcategoryId: number
) {
  try {
    const existingProgress = await prisma.userLevelProgress.findUnique({
      where: {
        userId_levelId_subcategoryId: {
          userId,
          levelId,
          subcategoryId,
        },
      },
    });

    if (!existingProgress) {
      return await prisma.userLevelProgress.create({
        data: {
          userId,
          levelId,
          subcategoryId,
        },
      });
    }

    return existingProgress;
  } catch (error) {
    console.error("Failed to save user level progress", error);
    throw error;
  }
}

export async function getPreviousAnswers(
  userId: string,
  subcategoryId: number,
  levelId: number
) {
  try {
    const answers = await prisma.userAnswerSubmission.findMany({
      where: {
        userId,
        subcategoryId,
        levelId,
        isCorrect: true,
      },
      select: {
        questionId: true,
        isCorrect: true,
      },
    });
    return answers;
  } catch (error) {
    console.error("Failed to fetch previous answers:", error);
    return [];
  }
}

export const logoutAction = async () => {
  await signOut();
};
