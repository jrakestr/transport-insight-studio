import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, Share2, TrendingUp, Users, Zap, Target, AlertCircle, Lightbulb } from "lucide-react";
import microtransitImage from "@/assets/microtransit-city.jpg";
import accessibleBusImage from "@/assets/accessible-bus.jpg";
import technologyImage from "@/assets/technology-dashboard.jpg";
import electricBusImage from "@/assets/electric-bus.jpg";
import autonomousImage from "@/assets/autonomous-vehicle.jpg";
import partnershipImage from "@/assets/transit-partnership.jpg";

const Report = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Report Header */}
        <section className="bg-gradient-to-b from-muted/50 to-background">
          <div className="section-container py-16 lg:py-24">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-6">
                <Badge className="text-sm font-semibold">Market Intelligence Report</Badge>
                <Badge variant="outline">October 2025</Badge>
              </div>
              
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                Transportation Industry Market Intelligence Report
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
                Comprehensive analysis of email intelligence covering key stories, RFPs, and competitive insights relevant to transit technology companies.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>October 2025</span>
                </div>
                <span className="text-muted-foreground/40">•</span>
                <span>42 min read</span>
                <span className="text-muted-foreground/40">•</span>
                <span>Based on 200+ industry sources</span>
              </div>

              <div className="flex gap-3">
                <Button size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-background">
          <div className="section-container py-12 lg:py-16">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Industry Sources</CardDescription>
                  <CardTitle className="text-4xl font-semibold">200+</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>RFP Opportunities</CardDescription>
                  <CardTitle className="text-4xl font-semibold">9</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Market Segments</CardDescription>
                  <CardTitle className="text-4xl font-semibold">6</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Key Partnerships</CardDescription>
                  <CardTitle className="text-4xl font-semibold">3</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="py-16 lg:py-20">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl">Executive Summary</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    October 2025 showed significant momentum in <strong>microtransit expansion</strong>, <strong>electric vehicle adoption</strong>, and <strong>technology integration</strong> across transit sectors. Key trends include app-based scheduling systems, increasing government funding for clean transportation, and industry consolidation. The government shutdown created uncertainty for federal contractors while local/state initiatives accelerated.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="pb-16 lg:pb-20">
          <div className="section-container">
            <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Microtransit */}
              <Card className="overflow-hidden">
                <div className="relative aspect-video lg:aspect-[21/9] overflow-hidden">
                  <img 
                    src={microtransitImage} 
                    alt="Modern city transit and microtransit services"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl">Microtransit & On-Demand Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Major Launches & Expansions</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">ABQ Ride (Albuquerque):</strong> Launched new "ABQ RIDE GO!" app to streamline microtransit services</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">New Braunfels, TX:</strong> "Ride the Rio!" microtransit launching Nov 18 (47-mile service area)</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Salisbury, NC:</strong> City Council approved $2.8M microtransit contract</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Sugar Land, TX:</strong> Announced 2nd microtransit service area expansion</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Newport News, VA:</strong> Hampton Roads Transit expanding regional microtransit program</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Sedona, AZ:</strong> Shuttle Connect celebrates 1-year anniversary</span></li>
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">Challenges</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-destructive">•</span><span><strong className="text-foreground">Houston Metro:</strong> $4 million microtransit pilot "gone off the rails" per opinion piece</span></li>
                      <li className="flex gap-2"><span className="text-destructive">•</span><span><strong className="text-foreground">Lexington, KY:</strong> Ongoing council discussions about microtransit implementation</span></li>
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm font-medium mb-1">Market Intelligence</p>
                      <p className="text-sm text-muted-foreground">
                        Microtransit continues rapid expansion at municipal level, with emphasis on mobile app interfaces and on-demand/flexible routing replacing traditional fixed-route service in underserved areas.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paratransit */}
              <Card className="overflow-hidden">
                <div className="relative aspect-video lg:aspect-[21/9] overflow-hidden">
                  <img 
                    src={accessibleBusImage} 
                    alt="Accessible paratransit bus services"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl">Paratransit & ADA Services</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Technology Adoptions</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">StarTran (Lincoln, NE):</strong> Expanded paratransit scheduling via VANLNK app - 7-day advance booking capability</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">LeeTran (FL):</strong> New app for ADA/TD trip booking</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">RideCo + RTC Southern Nevada:</strong> Major partnership to transform ADA paratransit in Las Vegas</span></li>
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">Funding & Policy</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">St. Lucie County, FL:</strong> Secured $5M FTA grant for paratransit enhancements</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Wisconsin lawmakers:</strong> Proposing one-time state grants for paratransit/rural transit expansion</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Lawrence Transit (KS):</strong> Proposing $3 fare for on-demand service</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Denver RTD:</strong> Proposal to charge $6.50 base fare for Access-on-Demand rides</span></li>
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">Fleet Modernization</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Schaumburg, IL:</strong> Launched new electric paratransit buses (Oct 1)</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Pace (Chicago suburbs):</strong> Breaking ground on Calumet City Paratransit Transfer Facility</span></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Technology */}
              <Card className="overflow-hidden">
                <div className="relative aspect-video lg:aspect-[21/9] overflow-hidden">
                  <img 
                    src={technologyImage} 
                    alt="Transportation data analytics and technology"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl">Technology & Data Analytics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI & Analytics</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">•</span><span>Feature article on "opening AI black box" for transportation decisions</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span>Growing emphasis on explainable AI for urban transportation planning</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span>Louisiana DOT adopts subsurface data analysis tool</span></li>
                    </ul>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-3">Software & Systems</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2"><span className="text-primary">•</span><span>Bureau of Transportation Statistics releasing multiple data reports</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span>Research on intercity travel mode recognition using data analytics</span></li>
                      <li className="flex gap-2"><span className="text-primary">•</span><span>Focus on real-time data management and passenger counting systems</span></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Two Column Layout for Partnerships and Autonomous */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Partnerships */}
                <Card className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={partnershipImage} 
                      alt="Transit industry partnerships and collaboration"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">Industry Partnerships & M&A</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold mb-3">Major Partnerships</h3>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div>
                          <p className="font-medium text-foreground mb-2">Autocab + zTrip</p>
                          <p className="mb-2">Landmark partnership powering 3,600 vehicles across 20 US states</p>
                          <ul className="space-y-1 ml-4">
                            <li className="flex gap-2"><span className="text-primary">-</span><span>4,000 drivers in 20 states</span></li>
                            <li className="flex gap-2"><span className="text-primary">-</span><span>Integration with Uber & iGo platforms</span></li>
                            <li className="flex gap-2"><span className="text-primary">-</span><span>NTEP-certified soft meter approved for U.S. use</span></li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-base font-semibold mb-3">Recognition</h3>
                      <p className="text-sm text-muted-foreground"><strong className="text-foreground">Provide A Ride:</strong> Named 2025 NEMTAC Broker Partner of the Year for NEMT excellence</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Autonomous */}
                <Card className="overflow-hidden">
                  <div className="relative aspect-video overflow-hidden">
                    <img 
                      src={autonomousImage} 
                      alt="Autonomous vehicles and future mobility"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">Autonomous & Future Mobility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="text-base font-semibold mb-3">Robotaxi Developments</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Waymo:</strong> Testing autonomous taxis in Bronx, NY; planning London launch</span></li>
                        <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Waymo:</strong> Relaunched fully automated robo-taxi service in Phoenix</span></li>
                        <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Lyft + Tensor:</strong> Agreement to roll out Tensor Robocars fleet in 2027</span></li>
                        <li className="flex gap-2"><span className="text-primary">•</span><span><strong className="text-foreground">Flying taxis:</strong> First U.S. public flight demonstration in Salinas, CA</span></li>
                      </ul>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="text-base font-semibold mb-3">Regulatory</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex gap-2"><span className="text-primary">•</span><span>Lawmakers calling out Waymo after school bus incident</span></li>
                        <li className="flex gap-2"><span className="text-primary">•</span><span>Ongoing discussions about national safety regulatory framework for AVs</span></li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RFPs */}
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl">Key RFPs & Procurement Opportunities</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Jefferson Parish, LA</p>
                        <p className="text-xs text-muted-foreground">Intelligent Transportation System for paratransit/transit</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Maryland Dept of Health</p>
                        <p className="text-xs text-muted-foreground">Statewide NEMT administrator (large contract)</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Douglas County, GA</p>
                        <p className="text-xs text-muted-foreground">3rd party operator for Connect Douglas transit system</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">San Mateo County Health, CA</p>
                        <p className="text-xs text-muted-foreground">Paratransit & non-medical transportation</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Indiana DOA</p>
                        <p className="text-xs text-muted-foreground">Mobility vans procurement (RFP 26-84944, due Dec 17)</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">WATA (Williamsburg, VA)</p>
                        <p className="text-xs text-muted-foreground">Factory bus line inspection services</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Southwest Ohio Regional Transit (SORTA)</p>
                        <p className="text-xs text-muted-foreground">Compensation study</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="font-semibold text-sm mb-1">Community Transit (WA)</p>
                        <p className="text-xs text-muted-foreground">Towing services</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trends and Insights */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <CardTitle className="text-2xl">Market Trends & Strategic Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Trends</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm mb-1">App-based booking replacing phone dispatch</p>
                        <p className="text-xs text-muted-foreground">Multi-day advance scheduling becoming standard</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Partnerships over competition</p>
                        <p className="text-xs text-muted-foreground">Traditional taxi/TNC integration (Uber-taxi partnerships)</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Electrification accelerating</p>
                        <p className="text-xs text-muted-foreground">Major funding pushing school bus and transit fleet conversion</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Labor as competitive differentiator</p>
                        <p className="text-xs text-muted-foreground">Driver recruitment/retention critical</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Data analytics essential</p>
                        <p className="text-xs text-muted-foreground">Real-time passenger counting, performance tracking</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Consolidation continuing</p>
                        <p className="text-xs text-muted-foreground">M&A activity in student transportation, NEMT sectors</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Opportunities for Transit Tech Companies
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Scheduling/dispatch software</p>
                        <p className="text-xs text-muted-foreground mt-1">For microtransit/paratransit expansion</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Mobile app development</p>
                        <p className="text-xs text-muted-foreground mt-1">Rider-facing booking systems</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Data analytics platforms</p>
                        <p className="text-xs text-muted-foreground mt-1">Performance monitoring</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Integration services</p>
                        <p className="text-xs text-muted-foreground mt-1">Connecting multiple mobility platforms</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">Workforce development</p>
                        <p className="text-xs text-muted-foreground mt-1">Solutions for driver shortage</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-sm font-medium">EV charging/fleet management</p>
                        <p className="text-xs text-muted-foreground mt-1">Systems for electric vehicles</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      Risks
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Government funding uncertainty during shutdowns</p>
                      </div>
                      <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Labor disputes and unionization movements</p>
                      </div>
                      <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Autonomous vehicle regulatory uncertainty</p>
                      </div>
                      <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-muted-foreground">Cybersecurity concerns for NEMT PHI data</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Recommendations</CardTitle>
                  <CardDescription>For transit technology companies serving this market</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-background rounded-lg border">
                      <span className="text-primary font-bold">1</span>
                      <div>
                        <p className="font-medium text-sm">Focus on mobile-first solutions</p>
                        <p className="text-xs text-muted-foreground">App-based booking is table stakes</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-background rounded-lg border">
                      <span className="text-primary font-bold">2</span>
                      <div>
                        <p className="font-medium text-sm">Emphasize data security</p>
                        <p className="text-xs text-muted-foreground">Especially for NEMT/healthcare transportation</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-background rounded-lg border">
                      <span className="text-primary font-bold">3</span>
                      <div>
                        <p className="font-medium text-sm">Build integration capabilities</p>
                        <p className="text-xs text-muted-foreground">Multi-modal and multi-provider integration is increasingly required</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-background rounded-lg border">
                      <span className="text-primary font-bold">4</span>
                      <div>
                        <p className="font-medium text-sm">Target microtransit expansion</p>
                        <p className="text-xs text-muted-foreground">Highest growth segment in October data</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-background rounded-lg border">
                      <span className="text-primary font-bold">5</span>
                      <div>
                        <p className="font-medium text-sm">Position for EV transition</p>
                        <p className="text-xs text-muted-foreground">Fleet management tools for electric vehicles</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-background rounded-lg border">
                      <span className="text-primary font-bold">6</span>
                      <div>
                        <p className="font-medium text-sm">Pursue partnership opportunities</p>
                        <p className="text-xs text-muted-foreground">Follow Autocab/zTrip model of technology+operations collaboration</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-background rounded-lg border">
                      <span className="text-primary font-bold">7</span>
                      <div>
                        <p className="font-medium text-sm">Monitor RFP opportunities</p>
                        <p className="text-xs text-muted-foreground">Key markets: Maryland NEMT, Indiana mobility vans, Jefferson Parish ITS</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sources */}
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Report compiled from:</strong> Google Alerts, TTA Industry News, APTA sources, Sweetspot procurement database, Transit Talent, Mass Transit Magazine, and transit-bids.com for October 2025.
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="border-t bg-gradient-to-b from-muted/30 to-muted/50">
          <div className="section-container py-16 lg:py-24">
            <div className="max-w-3xl mx-auto">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-3xl font-semibold">Get Monthly Market Intelligence</CardTitle>
                  <CardDescription className="text-base mt-3">
                    Subscribe to receive comprehensive market reports, RFP alerts, and competitive intelligence directly to your inbox.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    />
                    <Button size="lg">Subscribe</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Report;
