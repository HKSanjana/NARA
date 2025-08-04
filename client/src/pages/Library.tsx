import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, ExternalLink, Calendar, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Library() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['/api/documents'],
  });

  // Mock publications data for demonstration
  const publications = [
    {
      id: "1",
      title: "Marine Biodiversity Assessment in Sri Lankan Waters",
      authors: ["Dr. Priya Wijeyaratne", "Dr. Sampath Kumar"],
      journal: "Journal of Marine Biology",
      year: "2024",
      abstract: "This comprehensive study examines the marine biodiversity in Sri Lankan coastal waters, documenting over 200 species and their ecological significance.",
      type: "journal",
      doi: "10.1234/jmb.2024.001",
      division: "Marine Biology Research Division"
    },
    {
      id: "2", 
      title: "Sustainable Fishing Practices for Small-Scale Fisheries",
      authors: ["Dr. Roshan Fernando", "Eng. Chaminda Silva"],
      journal: "Fisheries Technology Review",
      year: "2024",
      abstract: "An analysis of sustainable fishing technologies and their implementation in small-scale fisheries across Sri Lanka.",
      type: "journal",
      doi: "10.1234/ftr.2024.005",
      division: "Fishing Technology Division"
    },
    {
      id: "3",
      title: "Climate Change Impact on Coastal Ecosystems",
      authors: ["Dr. Menaka Gamage"],
      journal: "Environmental Monitoring Quarterly",
      year: "2023",
      abstract: "Long-term monitoring data reveals significant impacts of climate change on Sri Lankan coastal ecosystems.",
      type: "journal", 
      doi: "10.1234/emq.2023.012",
      division: "Monitoring and Evaluation Division"
    }
  ];

  const resources = [
    {
      id: "1",
      title: "Fish Species Identification Guide",
      type: "Guide",
      description: "Comprehensive field guide for identifying common fish species in Sri Lankan waters",
      downloadUrl: "#",
      division: "Marine Biology Research Division"
    },
    {
      id: "2",
      title: "Aquaculture Best Practices Manual",
      type: "Manual", 
      description: "Step-by-step guide for implementing sustainable aquaculture practices",
      downloadUrl: "#",
      division: "Aquaculture and Inland Fisheries"
    },
    {
      id: "3",
      title: "Water Quality Monitoring Protocols",
      type: "Protocol",
      description: "Standard operating procedures for water quality assessment and monitoring",
      downloadUrl: "#", 
      division: "Monitoring and Evaluation Division"
    }
  ];

  const filteredPublications = publications.filter((pub) => {
    const matchesSearch = pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         pub.abstract.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredDocuments = documents.filter((doc: any) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-nara-light to-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-nara-navy mb-6">Digital Library</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive collection of research publications, technical reports, and educational resources in aquatic sciences.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Library Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="publications" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Publications Tab */}
            <TabsContent value="publications" className="mt-8">
              {filteredPublications.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No publications found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search terms" : "No publications are currently available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPublications.map((publication) => (
                    <Card key={publication.id} className="card-hover">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{publication.title}</CardTitle>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {publication.authors.join(", ")}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {publication.year}
                              </div>
                            </div>
                            <p className="text-sm font-medium text-nara-navy">{publication.journal}</p>
                            <p className="text-sm text-gray-600">{publication.division}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{publication.abstract}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">DOI: {publication.doi}</span>
                          <span className="px-2 py-1 bg-nara-light text-nara-navy text-xs rounded-full">
                            {publication.type.toUpperCase()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-8">
              {filteredResources.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search terms" : "No resources are currently available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="card-hover">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <BookOpen className="text-nara-navy w-8 h-8 flex-shrink-0" />
                          <div className="ml-3 flex-1">
                            <CardTitle className="text-lg">{resource.title}</CardTitle>
                            <CardDescription>{resource.type}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 mb-4">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{resource.division}</span>
                          <Button size="sm" className="bg-nara-navy hover:bg-blue-800">
                            <ExternalLink className="w-4 h-4 mr-2" /> 
                            Access
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="mt-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
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
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No reports found</h3>
                  <p className="text-gray-500">
                    {searchTerm ? "Try adjusting your search terms" : "No reports are currently available"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((document: any) => (
                    <Card key={document.id} className="card-hover">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <BookOpen className="text-nara-navy w-8 h-8 flex-shrink-0" />
                          <div className="ml-3 flex-1">
                            <CardTitle className="text-lg line-clamp-2">{document.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {document.description || "No description available"}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 capitalize">
                            {document.category || "Report"}
                          </span>
                          <Button size="sm" className="bg-nara-navy hover:bg-blue-800">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
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
