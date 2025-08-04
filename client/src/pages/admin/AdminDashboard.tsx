import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Download,
  Eye,
  Plus
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AdminDashboard() {
  // Fetch dashboard data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  const { data: rtiRequests = [], isLoading: rtiLoading } = useQuery({
    queryKey: ['/api/rti/requests'],
  });

  const { data: contactMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/contact/messages'],
  });

  const { data: calendarEvents = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/calendar/events'],
  });

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((user: any) => user.isActive).length,
    totalDocuments: documents.length,
    totalDownloads: documents.reduce((sum: number, doc: any) => sum + (doc.downloadCount || 0), 0),
    pendingRTI: rtiRequests.filter((req: any) => req.status === 'pending').length,
    totalRTI: rtiRequests.length,
    unreadMessages: contactMessages.filter((msg: any) => msg.status === 'unread').length,
    totalMessages: contactMessages.length,
    upcomingEvents: calendarEvents.filter((event: any) => new Date(event.date) > new Date()).length,
    totalEvents: calendarEvents.length,
  };

  // Mock chart data for demonstration
  const activityData = [
    { month: 'Jan', users: 120, documents: 45, events: 12 },
    { month: 'Feb', users: 132, documents: 52, events: 15 },
    { month: 'Mar', users: 145, documents: 48, events: 18 },
    { month: 'Apr', users: 138, documents: 61, events: 14 },
    { month: 'May', users: 155, documents: 58, events: 20 },
    { month: 'Jun', users: 162, documents: 64, events: 16 },
  ];

  const rtiStatusData = [
    { status: 'Pending', count: rtiRequests.filter((req: any) => req.status === 'pending').length },
    { status: 'Processing', count: rtiRequests.filter((req: any) => req.status === 'processing').length },
    { status: 'Completed', count: rtiRequests.filter((req: any) => req.status === 'completed').length },
    { status: 'Rejected', count: rtiRequests.filter((req: any) => req.status === 'rejected').length },
  ];

  if (usersLoading || documentsLoading || rtiLoading || messagesLoading || eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-nara-navy">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Manage users, content, and monitor system activity
              </p>
            </div>
            <div className="flex space-x-3">
              <Link href="/admin/users">
                <Button className="bg-nara-navy hover:bg-blue-800">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users Stats */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-nara-navy" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nara-navy">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers} active users
                </p>
              </CardContent>
            </Card>

            {/* Documents Stats */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents</CardTitle>
                <FileText className="h-4 w-4 text-nara-navy" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nara-navy">{stats.totalDocuments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalDownloads} total downloads
                </p>
              </CardContent>
            </Card>

            {/* RTI Stats */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">RTI Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-nara-navy" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nara-navy">{stats.totalRTI}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingRTI} pending review
                </p>
              </CardContent>
            </Card>

            {/* Messages Stats */}
            <Card className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-nara-navy" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-nara-navy">{stats.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.unreadMessages} unread messages
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Activity Trends</CardTitle>
                    <CardDescription>Monthly activity across the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="#002c6d" strokeWidth={2} />
                        <Line type="monotone" dataKey="documents" stroke="#00b4ff" strokeWidth={2} />
                        <Line type="monotone" dataKey="events" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* RTI Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>RTI Request Status</CardTitle>
                    <CardDescription>Distribution of RTI request statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={rtiStatusData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#002c6d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/users">
                      <Button variant="outline" className="w-full h-20 flex flex-col">
                        <Users className="w-6 h-6 mb-2" />
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/downloads">
                      <Button variant="outline" className="w-full h-20 flex flex-col">
                        <FileText className="w-6 h-6 mb-2" />
                        Manage Documents
                      </Button>
                    </Link>
                    <Link href="/calendar">
                      <Button variant="outline" className="w-full h-20 flex flex-col">
                        <Calendar className="w-6 h-6 mb-2" />
                        View Calendar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Documents</CardTitle>
                    <CardDescription>Latest uploaded documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documents.slice(0, 5).map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-nara-navy" />
                            <div>
                              <p className="font-medium text-sm">{doc.title}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{doc.category}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Popular Downloads</CardTitle>
                    <CardDescription>Most downloaded documents</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {documents
                        .sort((a: any, b: any) => (b.downloadCount || 0) - (a.downloadCount || 0))
                        .slice(0, 5)
                        .map((doc: any) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Download className="w-5 h-5 text-green-600" />
                              <div>
                                <p className="font-medium text-sm">{doc.title}</p>
                                <p className="text-xs text-gray-600">
                                  {doc.downloadCount || 0} downloads
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending RTI Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pending RTI Requests</CardTitle>
                    <CardDescription>Requests awaiting review</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rtiRequests
                        .filter((req: any) => req.status === 'pending')
                        .slice(0, 5)
                        .map((request: any) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Clock className="w-5 h-5 text-yellow-600" />
                              <div>
                                <p className="font-medium text-sm">{request.requesterName}</p>
                                <p className="text-xs text-gray-600">
                                  {new Date(request.submittedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Unread Messages */}
                <Card>
                  <CardHeader>
                    <CardTitle>Unread Messages</CardTitle>
                    <CardDescription>New contact messages</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {contactMessages
                        .filter((msg: any) => msg.status === 'unread')
                        .slice(0, 5)
                        .map((message: any) => (
                          <div key={message.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <MessageSquare className="w-5 h-5 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">{message.name}</p>
                                <p className="text-xs text-gray-600">{message.subject}</p>
                              </div>
                            </div>
                            <Badge variant="secondary">New</Badge>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              {/* System Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Database</span>
                        <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">API Services</span>
                        <Badge className="bg-green-100 text-green-800">Online</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">File Storage</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-nara-navy">{stats.activeUsers}</div>
                    <p className="text-sm text-gray-600">Users currently online</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-nara-navy">{stats.upcomingEvents}</div>
                    <p className="text-sm text-gray-600">Scheduled this month</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
