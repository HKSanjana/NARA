// src/App.tsx

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Divisions from "@/pages/Divisions";
import Downloads from "@/pages/Downloads";
import Library from "@/pages/Library";
import Mail from "@/pages/Mail";
import RTI from "@/pages/RTI";
import SeaLevel from "@/pages/SeaLevel";
import Contact from "@/pages/Contact";
import Calendar from "@/pages/Calendar";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserProfiles from "@/pages/admin/UserProfiles";
import HistoricalDataVisualize from "@/pages/HistoricalDataVisualize";
import MapComponent from "@/components/MapComponent";

function Router() {
    return (
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/services" component={Services} />
            <Route path="/divisions" component={Divisions} />
            <Route path="/downloads" component={Downloads} />
            <Route path="/library" component={Library} />
            <Route path="/mail" component={Mail} />
            <Route path="/rti" component={RTI} />
            <Route path="/sea-level" component={SeaLevel} />
            <Route path="/hdVisualize" component={HistoricalDataVisualize} />
            <Route path="/contact" component={Contact} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/users" component={UserProfiles} />
            <Route path="/map" component={MapComponent} />
            <Route component={NotFound} />
        </Switch>
    );
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <Layout>
                    <Router />
                </Layout>
                <Toaster />
            </TooltipProvider>
        </QueryClientProvider>
    );
}

export default App;