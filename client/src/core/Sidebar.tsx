import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Radio, BarChart3, Settings, HelpCircle, Activity } from 'lucide-react';

export default function Sidebar() {
    const [location] = useLocation();

    const links = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Stations', href: '/stations', icon: Radio },
        { name: 'Analysis', href: '/analysis', icon: BarChart3 },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Link href="/">
                    <a className="nav-link" style={{ padding: 0 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', border: '1px solid #e5e7eb' }}>
                            <Activity className="text-blue-600" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: '#000000' }}>NARA</span>
                    </a>
                </Link>
            </div>

            <nav className="sidebar-nav">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.href === '/'
                        ? location === '/'
                        : location.startsWith(link.href);
                    return (
                        <Link key={link.name} href={link.href}>
                            <a className={`nav-link ${isActive ? 'active' : ''}`}>
                                <Icon size={20} />
                                <span>{link.name}</span>
                            </a>
                        </Link>
                    );
                })}

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link href="/settings">
                        <a className={`nav-link ${location === '/settings' ? 'active' : ''}`}>
                            <Settings size={20} />
                            <span>Settings</span>
                        </a>
                    </Link>
                    <Link href="/help">
                        <a className={`nav-link ${location === '/help' ? 'active' : ''}`}>
                            <HelpCircle size={20} />
                            <span>Help Center</span>
                        </a>
                    </Link>
                </div>
            </nav>
        </aside>
    );
}
