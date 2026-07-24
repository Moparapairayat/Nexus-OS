"use server";

export async function demoLoginAction(_role: string) {
  return {
    success: false,
    error: "Demo login system has been disabled. Public registration and demo sessions are disabled in this Private Client Portal.",
  };
}
