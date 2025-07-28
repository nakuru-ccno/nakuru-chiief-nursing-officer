import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import MainNavbar from "@/components/MainNavbar";

const MainLayout = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nakuru-theme">
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MainNavbar />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;
