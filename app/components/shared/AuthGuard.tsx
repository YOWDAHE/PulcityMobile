import { useEffect } from "react";
import { Redirect, usePathname, useSegments } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import React from "react";

// Add your public routes here
const publicRoutes = ["/(auth)/welcome", "/(auth)/login", "/(auth)/signUp"];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const pathname = usePathname();

  useEffect(() => {
    const inAuthGroup = segments[0] === "(auth)";
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      <Redirect href="/(auth)/login" />;
      return;
    } else if (isAuthenticated && inAuthGroup) {
      <Redirect href="/(tabs)" />;
      return;
    }
  }, [isAuthenticated, segments, pathname]);

  return <>{children}</>;
}
export default AuthGuard;
