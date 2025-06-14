
import CountyHeader from "@/components/CountyHeader";
import MainNavbar from "@/components/MainNavbar";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      <div className="max-w-5xl mx-auto flex flex-col items-center justify-center pt-12 pb-24">
        <h2 className="text-3xl font-bold mb-2 text-[#be2251] text-center">
          Chief Nurse Officer Daily Activity Register
        </h2>
        <p className="text-lg mb-12 text-gray-600 text-center max-w-xl">
          Welcome to the Nakuru County Chief Nurse Officer's daily administrative portal. Log in to record activities, track reports, and generate exports with official branding.
        </p>
        
        {/* Central Login Button */}
        <div className="flex flex-col items-center gap-6 mb-16">
          <Link
            to="/login"
            className="bg-[#be2251] hover:bg-[#fd3572] text-white font-bold py-4 px-12 rounded-lg text-xl transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
          >
            🔑 Login
          </Link>
          
          {/* Register Link */}
          <Link
            to="/register"
            className="bg-white rounded-lg shadow border p-8 flex flex-col items-center hover:shadow-lg transition group"
          >
            <span className="text-5xl mb-3 text-[#be2251]">📝</span>
            <div className="text-lg font-bold mb-1 text-[#be2251] group-hover:underline">
              Register
            </div>
            <div className="text-gray-500 text-center text-sm">
              New here? Register for an account.
            </div>
          </Link>
        </div>
        
        <div className="text-center text-[#fd3572] font-bold tracking-wide text-lg mt-10">
          County of Unlimited Opportunities
        </div>
      </div>
    </div>
  );
}
