import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Send, Search, Calendar, User, AlertCircle, Info, CheckCircle, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRtiRequestSchema } from "@shared/schema";
import { z } from "zod";

const rtiFormSchema = insertRtiRequestSchema.extend({
  requesterName: z.string().min(2, "Name must be at least 2 characters"),
  requesterEmail: z.string().email("Please enter a valid email address"),
  informationRequested: z.string().min(10, "Please provide more details about the information requested"),
});

type RTIFormData = z.infer<typeof rtiFormSchema>;

export default function RTI() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/rti/requests'],
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RTIFormData>({
    resolver: zodResolver(rtiFormSchema),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: RTIFormData) => {
      return apiRequest('POST', '/api/rti/requests', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rti/requests'] });
      reset();
      toast({
        title: "Success",
        description: "Your RTI request has been submitted successfully. You will receive updates via email.",
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

  const onSubmit = (data: RTIFormData) => {
    submitMutation.mutate(data);
  };

  const filteredRequests = requests.filter((request: any) => {
    const matchesSearch = request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.informationRequested.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'processing':
        return <AlertCircle className="w-4 h-4" />;
      case 'approved':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Right to Information</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Submit requests for public information and track your applications through our transparent RTI system.
          </p>
        </div>
      </section>

      {/* RTI Information */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Info className="w-12 h-12 text-nara-navy mx-auto mb-4" />
                <CardTitle>What is RTI?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The Right to Information Act gives citizens the right to access information held by public authorities, promoting transparency and accountability.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="w-12 h-12 text-nara-navy mx-auto mb-4" />
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We aim to respond to all RTI requests within 14 working days from the date of receipt, as per the RTI Act guidelines.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className="w-12 h-12 text-nara-navy mx-auto mb-4" />
                <CardTitle>Required Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Provide clear details about the information you seek, including specific documents, time periods, or data required.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="request" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="request">Submit Request</TabsTrigger>
              <TabsTrigger value="track">Track Requests</TabsTrigger>
            </TabsList>

            {/* Submit Request Tab */}
            <TabsContent value="request" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-nara-navy">Submit RTI Request</CardTitle>
                  <CardDescription>
                    Please fill out the form below to submit your Right to Information request.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="requesterName">Full Name *</Label>
                        <Input
                          id="requesterName"
                          {...register("requesterName")}
                          className={errors.requesterName ? "border-red-500" : ""}
                        />
                        {errors.requesterName && (
                          <p className="text-red-500 text-sm mt-1">{errors.requesterName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="requesterEmail">Email Address *</Label>
                        <Input
                          id="requesterEmail"
                          type="email"
                          {...register("requesterEmail")}
                          className={errors.requesterEmail ? "border-red-500" : ""}
                        />
                        {errors.requesterEmail && (
                          <p className="text-red-500 text-sm mt-1">{errors.requesterEmail.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="requesterPhone">Phone Number</Label>
                        <Input
                          id="requesterPhone"
                          {...register("requesterPhone")}
                        />
                      </div>

                      <div>
                        <Label htmlFor="preferredFormat">Preferred Response Format</Label>
                        <Select onValueChange={(value) => register("preferredFormat").onChange({ target: { value } })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="post">Postal Mail</SelectItem>
                            <SelectItem value="pickup">Pickup from Office</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="requesterAddress">Address</Label>
                      <Textarea
                        id="requesterAddress"
                        {...register("requesterAddress")}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="informationRequested">Information Requested *</Label>
                      <Textarea
                        id="informationRequested"
                        {...register("informationRequested")}
                        placeholder="Please provide specific details about the information you are seeking..."
                        rows={5}
                        className={errors.informationRequested ? "border-red-500" : ""}
                      />
                      {errors.informationRequested && (
                        <p className="text-red-500 text-sm mt-1">{errors.informationRequested.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="purpose">Purpose of Request</Label>
                      <Textarea
                        id="purpose"
                        {...register("purpose")}
                        placeholder="Please explain the purpose for which you need this information (optional)"
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || submitMutation.isPending}
                      className="w-full bg-nara-navy hover:bg-blue-800"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting || submitMutation.isPending ? 'Submitting...' : 'Submit RTI Request'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Track Requests Tab */}
            <TabsContent value="track" className="mt-8">
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search requests..."
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
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
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
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No RTI requests found</h3>
                  <p className="text-gray-500">
                    {searchTerm || selectedStatus !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No RTI requests have been submitted yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredRequests.map((request: any) => (
                    <Card key={request.id} className="card-hover">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <CardTitle className="text-lg">RTI Request #{request.id.slice(-8).toUpperCase()}</CardTitle>
                              <span className={`flex items-center space-x-1 px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                <span>{request.status.toUpperCase()}</span>
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {request.requesterName}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Submitted: {formatDate(request.submittedAt)}
                              </div>
                              {request.responseDate && (
                                <div className="flex items-center">
                                  Response: {formatDate(request.responseDate)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Information Requested:</h4>
                            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                              {request.informationRequested}
                            </p>
                          </div>

                          {request.purpose && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">Purpose:</h4>
                              <p className="text-gray-600">{request.purpose}</p>
                            </div>
                          )}

                          {request.responseText && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">Response:</h4>
                              <p className="text-gray-600 bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                                {request.responseText}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
