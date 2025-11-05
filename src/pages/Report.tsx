import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Share2 } from "lucide-react";

const Report = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Report Header */}
        <section className="border-b bg-muted/30">
          <div className="section-container py-12 lg:py-16">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">Market Intelligence Report</Badge>
                <Badge variant="outline">October 2025</Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Transportation Industry Market Intelligence Report
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                Comprehensive analysis of email intelligence covering key stories, RFPs, and competitive insights relevant to transit technology companies.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>October 2025</span>
                </div>
                <span>•</span>
                <span>42 min read</span>
                <span>•</span>
                <span>Based on 200+ industry sources</span>
              </div>

              <div className="flex gap-3">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Report Content */}
        <section className="py-12 lg:py-20">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <div className="article-content">
                <h2 id="executive-summary">Executive Summary</h2>
                <p>
                  October 2025 showed significant momentum in <strong>microtransit expansion</strong>, <strong>electric vehicle adoption</strong>, and <strong>technology integration</strong> across transit sectors. Key trends include app-based scheduling systems, increasing government funding for clean transportation, and industry consolidation. The government shutdown created uncertainty for federal contractors while local/state initiatives accelerated.
                </p>

                <h2 id="microtransit">1. Microtransit & On-Demand Services</h2>
                
                <h3>Major Launches & Expansions</h3>
                <ul>
                  <li><strong>ABQ Ride (Albuquerque):</strong> Launched new "ABQ RIDE GO!" app to streamline microtransit services</li>
                  <li><strong>New Braunfels, TX:</strong> "Ride the Rio!" microtransit launching Nov 18 (47-mile service area)</li>
                  <li><strong>Salisbury, NC:</strong> City Council approved $2.8M microtransit contract</li>
                  <li><strong>Sugar Land, TX:</strong> Announced 2nd microtransit service area expansion</li>
                  <li><strong>Newport News, VA:</strong> Hampton Roads Transit expanding regional microtransit program</li>
                  <li><strong>Sedona, AZ:</strong> Shuttle Connect celebrates 1-year anniversary</li>
                </ul>

                <h3>Challenges</h3>
                <ul>
                  <li><strong>Houston Metro:</strong> $4 million microtransit pilot "gone off the rails" per opinion piece</li>
                  <li><strong>Lexington, KY:</strong> Ongoing council discussions about microtransit implementation</li>
                </ul>

                <h3>Market Intelligence</h3>
                <p>
                  Microtransit continues rapid expansion at municipal level, with emphasis on mobile app interfaces and on-demand/flexible routing replacing traditional fixed-route service in underserved areas.
                </p>

                <h2 id="paratransit">2. Paratransit & ADA Services</h2>
                
                <h3>Technology Adoptions</h3>
                <ul>
                  <li><strong>StarTran (Lincoln, NE):</strong> Expanded paratransit scheduling via VANLNK app - 7-day advance booking capability</li>
                  <li><strong>LeeTran (FL):</strong> New app for ADA/TD trip booking</li>
                  <li><strong>RideCo + RTC Southern Nevada:</strong> Major partnership to transform ADA paratransit in Las Vegas</li>
                </ul>

                <h3>Funding & Policy</h3>
                <ul>
                  <li><strong>St. Lucie County, FL:</strong> Secured $5M FTA grant for paratransit enhancements</li>
                  <li><strong>Wisconsin lawmakers:</strong> Proposing one-time state grants for paratransit/rural transit expansion</li>
                  <li><strong>Lawrence Transit (KS):</strong> Proposing $3 fare for on-demand service</li>
                  <li><strong>Denver RTD:</strong> Proposal to charge $6.50 base fare for Access-on-Demand rides</li>
                </ul>

                <h3>Fleet Modernization</h3>
                <ul>
                  <li><strong>Schaumburg, IL:</strong> Launched new electric paratransit buses (Oct 1)</li>
                  <li><strong>Pace (Chicago suburbs):</strong> Breaking ground on Calumet City Paratransit Transfer Facility</li>
                </ul>

                <h2 id="technology">4. Technology & Data Analytics</h2>
                
                <h3>AI & Analytics</h3>
                <ul>
                  <li>Feature article on "opening AI black box" for transportation decisions</li>
                  <li>Growing emphasis on explainable AI for urban transportation planning</li>
                  <li>Louisiana DOT adopts subsurface data analysis tool</li>
                </ul>

                <h3>Software & Systems</h3>
                <ul>
                  <li>Bureau of Transportation Statistics releasing multiple data reports</li>
                  <li>Research on intercity travel mode recognition using data analytics</li>
                  <li>Focus on real-time data management and passenger counting systems</li>
                </ul>

                <h2 id="partnerships">5. Industry Partnerships & M&A</h2>
                
                <h3>Major Partnerships</h3>
                <ul>
                  <li><strong>Autocab + zTrip:</strong> Landmark partnership powering 3,600 vehicles across 20 US states
                    <ul>
                      <li>4,000 drivers in 20 states</li>
                      <li>Integration with Uber & iGo platforms</li>
                      <li>NTEP-certified soft meter approved for U.S. use</li>
                    </ul>
                  </li>
                </ul>

                <h3>Recognition</h3>
                <ul>
                  <li><strong>Provide A Ride:</strong> Named 2025 NEMTAC Broker Partner of the Year for NEMT excellence</li>
                </ul>

                <h2 id="autonomous">6. Autonomous & Future Mobility</h2>
                
                <h3>Robotaxi Developments</h3>
                <ul>
                  <li><strong>Waymo:</strong> Testing autonomous taxis in Bronx, NY; planning London launch</li>
                  <li><strong>Waymo:</strong> Relaunched fully automated robo-taxi service in Phoenix</li>
                  <li><strong>Lyft + Tensor:</strong> Agreement to roll out Tensor Robocars fleet in 2027</li>
                  <li><strong>Flying taxis:</strong> First U.S. public flight demonstration in Salinas, CA</li>
                </ul>

                <h3>Regulatory</h3>
                <ul>
                  <li>Lawmakers calling out Waymo after school bus incident</li>
                  <li>Ongoing discussions about national safety regulatory framework for AVs</li>
                </ul>

                <h2 id="rfps">9. Key RFPs & Procurement Opportunities</h2>
                
                <h3>Major Contracts</h3>
                <ol>
                  <li><strong>Jefferson Parish, LA</strong> - Intelligent Transportation System for paratransit/transit</li>
                  <li><strong>Maryland Dept of Health</strong> - Statewide NEMT administrator (large contract)</li>
                  <li><strong>Douglas County, GA</strong> - 3rd party operator for Connect Douglas transit system</li>
                  <li><strong>San Mateo County Health, CA</strong> - Paratransit & non-medical transportation</li>
                  <li><strong>Indiana DOA</strong> - Mobility vans procurement (RFP 26-84944, due Dec 17)</li>
                  <li><strong>WATA (Williamsburg, VA)</strong> - Factory bus line inspection services</li>
                  <li><strong>Southwest Ohio Regional Transit (SORTA)</strong> - Compensation study</li>
                  <li><strong>Community Transit (WA)</strong> - Towing services</li>
                  <li><strong>BCD Council of Governments (SC)</strong> - APC on-board hardware maintenance</li>
                </ol>

                <h2 id="trends">12. Market Trends & Strategic Insights</h2>
                
                <h3>Key Trends</h3>
                <ol>
                  <li><strong>App-based booking replacing phone dispatch</strong> - Multi-day advance scheduling becoming standard</li>
                  <li><strong>Partnerships over competition</strong> - Traditional taxi/TNC integration (Uber-taxi partnerships)</li>
                  <li><strong>Electrification accelerating</strong> - Major funding pushing school bus and transit fleet conversion</li>
                  <li><strong>Labor as competitive differentiator</strong> - Driver recruitment/retention critical</li>
                  <li><strong>Data analytics essential</strong> - Real-time passenger counting, performance tracking</li>
                  <li><strong>Consolidation continuing</strong> - M&A activity in student transportation, NEMT sectors</li>
                  <li><strong>Autonomous vehicles advancing</strong> - Limited deployments expanding geographically</li>
                </ol>

                <h3>Opportunities for Transit Tech Companies</h3>
                <ul>
                  <li><strong>Scheduling/dispatch software</strong> for microtransit/paratransit expansion</li>
                  <li><strong>Mobile app development</strong> for rider-facing booking systems</li>
                  <li><strong>Data analytics platforms</strong> for performance monitoring</li>
                  <li><strong>Integration services</strong> connecting multiple mobility platforms</li>
                  <li><strong>Training/workforce development</strong> solutions for driver shortage</li>
                  <li><strong>EV charging/fleet management</strong> systems</li>
                </ul>

                <h3>Risks</h3>
                <ul>
                  <li>Government funding uncertainty during shutdowns</li>
                  <li>Labor disputes and unionization movements</li>
                  <li>Autonomous vehicle regulatory uncertainty</li>
                  <li>Cybersecurity concerns for NEMT PHI data</li>
                </ul>

                <h2 id="recommendations">Recommendations</h2>
                <p>For transit technology companies serving this market:</p>
                <ol>
                  <li><strong>Focus on mobile-first solutions</strong> - App-based booking is table stakes</li>
                  <li><strong>Emphasize data security</strong> - Especially for NEMT/healthcare transportation</li>
                  <li><strong>Build integration capabilities</strong> - Multi-modal and multi-provider integration is increasingly required</li>
                  <li><strong>Target microtransit expansion</strong> - Highest growth segment in October data</li>
                  <li><strong>Position for EV transition</strong> - Fleet management tools for electric vehicles</li>
                  <li><strong>Pursue partnership opportunities</strong> - Follow Autocab/zTrip model of technology+operations collaboration</li>
                  <li><strong>Monitor RFP opportunities</strong> in key markets (Maryland NEMT, Indiana mobility vans, Jefferson Parish ITS)</li>
                </ol>

                <div className="mt-12 p-6 bg-muted rounded-lg border">
                  <p className="text-sm text-muted-foreground">
                    <strong>Report compiled from:</strong> Google Alerts, TTA Industry News, APTA sources, Sweetspot procurement database, Transit Talent, Mass Transit Magazine, and transit-bids.com for October 2025.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="border-t bg-muted/30">
          <div className="section-container py-12 lg:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Get Monthly Market Intelligence
              </h2>
              <p className="text-muted-foreground mb-8">
                Subscribe to receive comprehensive market reports, RFP alerts, and competitive intelligence directly to your inbox.
              </p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm"
                />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Report;
