"use server";

import { auth, signOut } from "@/auth";
import { PrismaClient, Status } from "@prisma/client";
import { hash } from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export async function submitUserAnswer(answer: string, isCorrect: boolean) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("You must be logged in to submit answers");
    }

    const userId = session.user.id;

    const submission = await prisma.userAnswerSubmission.create({
      data: {
        userId,
        answer,
        isCorrect,
      },
    });

    revalidatePath("/quiz");

    return { success: true, submission };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

export async function saveUserLevelProgress(levelId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { completed: false };
    }
    const userId = session.user.id;
    const existingProgress = await prisma.userLevelProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId,
        },
      },
    });

    if (!existingProgress) {
      return await prisma.userLevelProgress.create({
        data: {
          userId,
          levelId,
        },
      });
    }

    return existingProgress;
  } catch (error) {
    console.error("Failed to save user level progress", error);
    throw error;
  }
}

export async function checkLevelCompletion(levelId: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { completed: false };
    }

    const userId = session.user.id;
    const progress = await prisma.userLevelProgress.findUnique({
      where: {
        userId_levelId: {
          userId,
          levelId,
        },
      },
    });

    return { completed: !!progress };
  } catch (error) {
    console.error("Error checking level completion:", error);
    return { completed: false };
  }
}

export async function getUserReferralCode(
  userId: string
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        referralCode: true,
      },
    });

    return user?.referralCode || null;
  } catch (error) {
    console.error("Failed to fetch user referral code:", error);
    return null;
  }
}

export async function getUserReferrals(referralCode: string) {
  try {
    const userReferrals = await prisma.user.count({
      where: {
        referredBy: referralCode,
      },
    });
    return userReferrals;
  } catch (err) {
    console.log(err);
  }
}

export const logoutAction = async () => {
  await signOut({ redirect: false });
  redirect("/");
};

export async function resetPassword(token: string, newPassword: string) {
  if (!token || !newPassword) {
    return { status: "fail", message: "Invalid request" };
  }

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gte: new Date() },
    },
  });

  if (!user) {
    return { status: "fail", message: "Invalid or expired token" };
  }

  const hashedPassword = await hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { status: "success", message: "Password reset successful" };
}

export async function sendResetPasswordEmail(email: string) {
  try {
    if (!email) {
      return { success: false, message: "Email is required" };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "Invalid Email address !" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="margin: 20px 0;">
            <a href="${resetUrl}" 
               style="background-color: #000; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">
            This is an automated email. Please do not reply to this message.
          </p>
        </body>
      </html>
      `,
    });

    return { success: true, message: "Reset link sent to email" };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: "Failed to send reset email",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function submitApplication(
  userId: string,
  jobId: string,
  status: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    if (!job) {
      throw new Error("Job not found");
    }

    const existingApplication = await prisma.application.findFirst({
      where: {
        userId,
        jobId,
      },
    });

    if (existingApplication) {
      return {
        success: false,
        message: "You have already applied to this job",
      };
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: status as Status,
      },
    });

    return { success: true, application };
  } catch (error) {
    throw new Error(`Error submitting application: ${error}`);
  }
}

export async function getUserPoints(): Promise<number | null> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("No logged iun user found !");
    }

    const userId = session.user.id;
    const user = await prisma.leaderboard.findUnique({
      where: { userId },
      select: { totalPoint: true },
    });

    return user ? user.totalPoint : null;
  } catch (error) {
    console.error("Error fetching user points:", error);
    throw new Error("Failed to fetch user points");
  }
}
