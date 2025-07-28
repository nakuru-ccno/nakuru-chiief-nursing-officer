import { Outlet } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";

const MainLayout = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="nakuru-theme">
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <MainNavbar />
        <CountyHeader />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;

