import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import MobileSidebar from "./MobileSidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <MobileSidebar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
