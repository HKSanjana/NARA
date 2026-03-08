import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@ui/toaster";
import { TooltipProvider } from "@ui/tooltip";
import NotFound from "@core/not-found";
import Layout from "@core/Layout";

// Home Module
import Home from "@modules/home/Home";

// Info Module
import About from "@modules/info/About";
import Contact from "@modules/info/Contact";
import Services from "@modules/info/Services";
import RTI from "@modules/info/RTI";
import Library from "@modules/info/Library";

// Ocean Data Module
import SeaLevel from "@modules/ocean-data/SeaLevel";
import HistoricalDataVisualize from "@modules/ocean-data/HistoricalDataVisualize";
import Dondra from "@modules/ocean-data/Dondra";
import MirissaData from "@modules/ocean-data/MirissaData";
// MJData legacy import removed

// Calendar Module
import Calendar from "@modules/calendar/Calendar";

// Admin Module
import AdminLogin from "@modules/admin/AdminLogin";
import AdminDashboard from "@modules/admin/AdminDashboard";
import UserProfiles from "@modules/admin/UserProfiles";

// Dashboard Module
import Dashboard from "@modules/dashboard/Dashboard";
import Stations from "@modules/dashboard/Stations";
import StationDetail from "@modules/dashboard/StationDetail";
import Analysis from "@modules/dashboard/Analysis";

// Shared Components
import MapComponent from "@shared/MapComponent";
import DataVisualization from "@shared/DataVisualization";

function Router() {
    return (
        <Switch>
            <Route path="/" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/services" component={Services} />
            <Route path="/library" component={Library} />
            <Route path="/rti" component={RTI} />
            <Route path="/sea-level" component={SeaLevel} />
            <Route path="/hdVisualize" component={HistoricalDataVisualize} />
            <Route path="/contact" component={Contact} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/admin/login" component={AdminLogin} />
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/users" component={UserProfiles} />
            <Route path="/map" component={MapComponent} />
            <Route path="/data-visualization" component={DataVisualization} />
            <Route path="/mirissa-data" component={MirissaData} />
            <Route path="/dondra" component={Dondra} />

            {/* MSSQL Dashboard Routes */}
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/stations/:id" component={StationDetail} />
            <Route path="/stations" component={Stations} />
            <Route path="/analysis" component={Analysis} />

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
