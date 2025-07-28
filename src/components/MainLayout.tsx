import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import MainNavbar from "@/components/MainNavbar";

const MainLayout = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nakuru-theme">
      <div className="flex min-h-screen bg-background text-foreground">
        {/* Sidebar on the left */}
        <MainNavbar />

        {/* Page content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;

