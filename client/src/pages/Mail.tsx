import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Search, Filter, Calendar, User, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MailPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/contact/messages'],
  });

  const { data: divisions = [] } = useQuery({
    queryKey: ['/api/divisions'],
  });

  const replyMutation = useMutation({
    mutationFn: async ({ messageId, replyText }: { messageId: string; replyText: string }) => {
      return apiRequest('PUT', `/api/contact/messages/${messageId}`, {
        status: 'replied',
        replyText,
        repliedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact/messages'] });
      setReplyingTo(null);
      setReplyText("");
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest('PUT', `/api/contact/messages/${messageId}`, {
        status: 'read'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contact/messages'] });
    },
  });

  const filteredMessages = messages.filter((message: any) => {
    const matchesSearch = message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || message.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'replied':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReply = async (messageId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    replyMutation.mutate({ messageId, replyText });
  };

  const handleMarkAsRead = (messageId: string) => {
    markAsReadMutation.mutate(messageId);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Mail Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage and respond to inquiries, contact messages, and communications from stakeholders and the public.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="w-full lg:w-64">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Messages</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Messages Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No messages found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedStatus !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "No messages have been received yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredMessages.map((message: any) => (
                <Card key={message.id} className={`card-hover ${message.status === 'unread' ? 'border-l-4 border-l-nara-blue' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-lg">{message.subject}</CardTitle>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(message.status)}`}>
                            {message.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {message.name} ({message.email})
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(message.submittedAt)}
                          </div>
                          {message.division && (
                            <div className="text-nara-navy font-medium">
                              Division: {message.division}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Message:</h4>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">{message.message}</p>
                      </div>

                      {message.replyText && (
                        <div>
                          <h4 className="font-semibold text-green-800 mb-2">Reply:</h4>
                          <p className="text-gray-600 bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                            {message.replyText}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            Replied on: {formatDate(message.repliedAt)}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center space-x-3 pt-4 border-t">
                        {message.status === 'unread' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsRead(message.id)}
                            disabled={markAsReadMutation.isPending}
                          >
                            Mark as Read
                          </Button>
                        )}
                        
                        {message.status !== 'replied' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyingTo(replyingTo === message.id ? null : message.id)}
                          >
                            {replyingTo === message.id ? 'Cancel Reply' : 'Reply'}
                          </Button>
                        )}
                      </div>

                      {replyingTo === message.id && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
                          <Label htmlFor="reply" className="text-sm font-semibold text-gray-700 mb-2 block">
                            Your Reply:
                          </Label>
                          <Textarea
                            id="reply"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply here..."
                            className="mb-3"
                            rows={4}
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleReply(message.id)}
                              disabled={replyMutation.isPending}
                              size="sm"
                              className="bg-nara-navy hover:bg-blue-800"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
