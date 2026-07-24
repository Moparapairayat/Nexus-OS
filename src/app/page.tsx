import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { USER_ROLES } from "@/constants/auth";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  // Check current authenticated user session
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Redirect based on authenticated user role
  if (user.role === USER_ROLES.ADMIN) {
    redirect("/admin");
  } else {
    redirect("/client");
  }
}
