import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";

const contactFormSchema = insertContactMessageSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  // Division options for routing messages
  const divisions = [
    { value: "marine-biology", label: "Marine Biology Research Division" },
    { value: "fishing-tech", label: "Fishing Technology Division" },
    { value: "monitoring", label: "Monitoring and Evaluation Division" },
    { value: "aquaculture", label: "Aquaculture and Inland Fisheries" },
    { value: "hydrographic", label: "National Hydrographic Office" },
    { value: "tech-transfer", label: "Technology Transfer Division" },
    { value: "library", label: "Library & Information Center" },
    { value: "general", label: "General Inquiry" },
  ];

  const submitMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      return apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      reset();
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We will get back to you within 2-3 business days.",
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

  const onSubmit = (data: ContactFormData) => {
    submitMutation.mutate(data);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Contact NARA</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for research collaborations, information requests, or general inquiries about our services.
          </p>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="text-center card-hover">
              <CardHeader>
                <div className="bg-nara-light p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-nara-navy w-8 h-8" />
                </div>
                <CardTitle className="text-xl text-nara-navy">Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  NARA Headquarters<br />
                  Crow Island, Colombo 15<br />
                  Sri Lanka
                </p>
                <Button variant="outline" size="sm">
                  Get Directions
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardHeader>
                <div className="bg-nara-light p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-nara-navy w-8 h-8" />
                </div>
                <CardTitle className="text-xl text-nara-navy">Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  +94 11 2521000<br />
                  +94 11 2521001<br />
                  Fax: +94 11 2521002
                </p>
                <Button variant="outline" size="sm">
                  <a href="tel:+94112521000">Call Now</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardHeader>
                <div className="bg-nara-light p-4 rounded-lg w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-nara-navy w-8 h-8" />
                </div>
                <CardTitle className="text-xl text-nara-navy">Office Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Monday – Friday<br />
                  8:30 AM – 4:30 PM<br />
                  (Closed on weekends & public holidays)
                </p>
                <div className="text-sm text-gray-600">
                  Emergency: 24/7
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-nara-navy">Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <Label htmlFor="division">Send To Division</Label>
                      <Select onValueChange={(value) => setValue("division", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a division" />
                        </SelectTrigger>
                        <SelectContent>
                          {divisions.map((division) => (
                            <SelectItem key={division.value} value={division.value}>
                              {division.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          {...register("name")}
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">Your Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        {...register("subject")}
                        className={errors.subject ? "border-red-500" : ""}
                      />
                      {errors.subject && (
                        <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        rows={6}
                        className={errors.message ? "border-red-500" : ""}
                        placeholder="Please provide details about your inquiry..."
                      />
                      {errors.message && (
                        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting || submitMutation.isPending}
                      className="w-full bg-nara-navy hover:bg-blue-800"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting || submitMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Map</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3163.123456789012!2d79.85736031519035!3d6.915280123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593f9f1a1234%3A0x1234567890abcdef!2sCrow%20Island%2C%20Colombo!5e0!3m2!1sen!2slk!4v1590000000000!5m2!1sen!2slk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="NARA Location Map"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-nara-navy" />
                    <div>
                      <p className="font-medium">General Inquiries</p>
                      <p className="text-sm text-gray-600">info@nara.ac.lk</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-nara-navy" />
                    <div>
                      <p className="font-medium">Research Collaboration</p>
                      <p className="text-sm text-gray-600">research@nara.ac.lk</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-nara-navy" />
                    <div>
                      <p className="font-medium">Emergency Hotline</p>
                      <p className="text-sm text-gray-600">+94 11 2521999</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card>
                <CardHeader>
                  <CardTitle>Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">
                      <a href="https://www.facebook.com/narasrilanka" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        Facebook
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      <a href="https://twitter.com/narasrilanka" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        Twitter
                      </a>
                    </Button>
                    <Button variant="outline" size="sm">
                      <a href="https://www.linkedin.com/company/nara-sri-lanka" target="_blank" rel="noopener noreferrer" className="flex items-center">
                        LinkedIn
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
