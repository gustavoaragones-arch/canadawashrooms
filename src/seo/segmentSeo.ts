import type { PrimarySegment } from '../types/provider'

/** Replace `{city}` in templates. */
export function fillCity(template: string, city: string): string {
  return template.replace(/\{city\}/g, city)
}

export interface SegmentSeoDefinition {
  /** URL slug segment (matches landingRoutes). */
  slug: string
  /** Meta title pattern — brand appended separately. */
  titleTemplate: string
  metaDescriptionTemplate: string
  h1Template: string
  introTemplate: string
  /** Short segment name for breadcrumbs / links. */
  breadcrumbLabel: string
  /** Editorial capability lines for landing hero chips. */
  capabilityBadges: string[]
  /** Operational signals buyers actually verify — `{city}` substitution. */
  operationalInsights: string[]
  /** Climate and season realities — `{city}` substitution. */
  climateContext: string
  /** When this segment is the wrong tool vs adjacent categories — `{city}` substitution. */
  projectSuitability: string
  /** Realistic servicing cadence and assumptions — `{city}` substitution. */
  servicingExpectations: string
}

export const SEGMENT_SEO: Record<PrimarySegment, SegmentSeoDefinition> = {
  construction: {
    slug: 'construction-portable-washrooms',
    titleTemplate:
      'Portable washroom & portable toilet rentals in {city} — construction jobsites',
    metaDescriptionTemplate:
      'Compare portable washroom, portable toilet, and porta-potty providers for {city} construction sites, crew programs, and temporary worksites.',
    h1Template: 'Construction portable washrooms built for {city} jobsites',
    introTemplate:
      'Construction sites often require portable toilets, portable washrooms, handwashing stations, and temporary sanitation facilities. Crew throughput, gate access, and pump-truck cadence decide whether a washroom line works on a jobsite — not brochure photos. This guide surfaces operators positioned for construction logistics in {city}: long-term rental posture, scheduled servicing, handwash and hygiene add-ons, and units that hold up through weather without shutting down your hygiene plan.',
    breadcrumbLabel: 'Construction & jobsites',
    capabilityBadges: [
      'Scheduled jobsite servicing',
      'Long-term rental posture',
      'Cold-weather ops',
      'Handwash & hygiene add-ons',
    ],
    operationalInsights: [
      'Gate width, mud lanes, and laydown space decide unit mix faster than brochure counts.',
      'Freeze–thaw swings stress tanks, lines, and handwash reliability — winter-capable inventory is not interchangeable with fair-weather singles.',
      'Crew-scale throughput matters: parallel stalls, pump-truck access, and scheduled routes beat "extra units on standby" once occupancy ramps.',
    ],
    climateContext:
      'Construction hygiene fails quietly in shoulder seasons: thawing ground, icy pads, and wind-blown sites near {city} can affect servicing cadence. Plan for anchoring, tracked servicing where roads soften, and realistic chemistry and handwash assumptions when temperatures dip.',
    projectSuitability:
      'Choose construction-postured operators when timelines run weeks to years and servicing must align with site phases. For single weekends or private yard work, general rental posture may be sufficient — compare inventory depth and pump partnerships before you commit.',
    servicingExpectations:
      'Expect weekly or bi-weekly routes on active sites as a baseline; heavy crews or remote pads often negotiate tighter windows. Confirm call-out policies for freeze events and who handles access if the lane is tight after precipitation.',
  },
  event: {
    slug: 'luxury-restroom-trailers',
    titleTemplate:
      'Portable restroom & washroom rentals in {city} — events & weddings',
    metaDescriptionTemplate:
      'Compare portable restroom, portable washroom, and porta-potty providers for {city} weddings, festivals, and outdoor events — trailer and standard units.',
    h1Template: 'Luxury restroom trailers for {city} events and venues',
    introTemplate:
      'Event planners may search for portable restrooms, portable washrooms, or porta-potties depending on the type of gathering. Guest comfort is operational: queueing, lighting, hand washing, and pump service timing. For {city} weddings, festivals, and private venues — especially where access and elevation matter — trailer-grade restrooms often outperform standard singles. Use this page to compare operators aligned to upscale events, flush systems, and planner-friendly servicing.',
    breadcrumbLabel: 'Luxury restroom trailers',
    capabilityBadges: [
      'Upscale trailer layouts',
      'Flush systems & guest comfort',
      'Wedding-friendly servicing',
      'Venue access logistics',
    ],
    operationalInsights: [
      'Guest comfort is queue math: stalls per peak hour, lighting for evening receptions, and handwash capacity off the dinner rush.',
      'Venues with narrow drives, staging windows, or elevated pads often need discrete pump servicing — trailer layouts beat stacked singles when planners care about photos and flow.',
      'Shoulder-season and cold-weather events need realistic freeze planning for fresh-water lines and servicing access — "luxury" still has to survive the logistics.',
    ],
    climateContext:
      'Evening and outdoor events near {city} can swing cold after sunset depending on season and elevation. Operators accustomed to event servicing plan for overnight dips, wind exposure, and pump windows that do not fight guest arrival.',
    projectSuitability:
      'Luxury trailers earn their place when guest experience, flush systems, and interior finishes matter — weddings, fundraisers, and premium private sites. For muddy outdoor festivals or bare construction compounds, verify trailer access and whether singles or hybrid mixes make more operational sense.',
    servicingExpectations:
      'Plan explicit pump and freshwater windows aligned to your venue schedule; many operators slot servicing outside peak photography or ceremony blocks. Confirm who manages power, leveling on uneven pads, and strike timing.',
  },
  oilfield: {
    slug: 'remote-site-sanitation',
    titleTemplate:
      'Portable toilet & washroom rentals in {city} — remote & oilfield sites',
    metaDescriptionTemplate:
      'Compare portable toilet and winter-ready portable washroom providers for {city}-area remote camps, lease roads, and industrial operations.',
    h1Template: 'Remote site sanitation for {city} industrial operations',
    introTemplate:
      'Remote projects frequently require portable toilets and winter-ready sanitation equipment. {city} corridors can tie together remote camps, turnaround windows, and seasonal access constraints. Sanitation has to keep pace with occupancy swings, frozen lines, and routes that do not tolerate fragile gear. This landing focuses on operators equipped for remote and industrial contexts: winterized inventory where applicable, camp-aware logistics, and field servicing posture suited to demanding operating environments.',
    breadcrumbLabel: 'Remote & oilfield operations',
    capabilityBadges: [
      'Winterized & heated inventory',
      'Camp & remote logistics',
      'Industrial servicing posture',
      'Dispatch-aware operations',
    ],
    operationalInsights: [
      'Occupancy swings matter more than stall counts: camps and turnaround crews change daily — sanitation plans have to track headcount, not a static spreadsheet.',
      'Heated units and winterized lines are operational promises, not labels; verify tank sizing, line heat trace where needed, and dispatch behavior when roads ice.',
      'Lease-road access and pad layout near {city} corridors decide whether pump trucks can keep cadence — fragile gear that works in town rarely survives remote mobilizations.',
    ],
    climateContext:
      'Remote operations in cold-climate regions run through deep cold, blowing snow, and thaw cycles that plug unprepared lines. Plan for potential road bans, delayed windows, and backup plans when servicing trucks cannot reach on schedule in shoulder and winter seasons.',
    projectSuitability:
      'Industrial-postured operators fit camps, remote turnaround sites, and logistics-heavy pads — environments requiring high durability and reliable dispatch. For single backyard rentals or light residential repairs, general rental routes are usually simpler and cheaper.',
    servicingExpectations:
      'Confirm SLAs in writing: typical route cadence, emergency call-outs, and who owns generator fuel or heated unit runtime costs. Cold seasons often shift from weekly pump cadence to occupancy-driven servicing — negotiate thresholds before occupancy spikes.',
  },
  general: {
    slug: 'portable-washroom-rentals',
    titleTemplate:
      'Portable washroom & portable toilet rentals in {city}',
    metaDescriptionTemplate:
      'Compare portable washroom, portable toilet, and porta-potty providers for everyday {city} rental projects — short-term drops and practical coverage.',
    h1Template: 'Portable washroom rentals for everyday {city} projects',
    introTemplate:
      'Everyday projects often start with a search for portable toilets, porta-potties, or portable washrooms — the equipment is the same category of rental. Not every job is a megaproject — but timelines, property access, and basic compliance still matter. For {city}, this page highlights operators oriented to everyday portable washroom needs: quick mobilization, ADA-capable inventory where available, handwash add-ons, and septic or pumping partnerships when your scope requires them.',
    breadcrumbLabel: 'Portable washroom rentals',
    capabilityBadges: [
      'Short-term mobilization',
      'Accessibility-forward options',
      'Handwash station add-ons',
      'Septic & pumping partners',
    ],
    operationalInsights: [
      'Short-term rentals still need driveway or alley access, leveling, and a realistic pump path — "drop and go" assumes those conditions are already met.',
      'Home renovations and small builds in {city} often share lanes with neighbours; confirm unit footprint and whether handwash stations need separate placement.',
      'When septic ties are uncertain, operators with pumping partners reduce rework — ask upfront rather than after the weekend.',
    ],
    climateContext:
      'Residential and commercial sites near {city} can face ground frost, soft spring soil, or tight lane access depending on season. Winter drops may need different anchoring or chemistry; spring conditions can block pump access on residential lanes.',
    projectSuitability:
      'General rental posture fits weekends, residential projects, and fast coverage where you do not need camp-scale logistics or trailer-grade guest experience. If your scope looks like a multi-month crew site or a remote pad, switch segments before you compare operators.',
    servicingExpectations:
      'Most short-term scopes align to one or two scheduled pumps within the rental window — confirm weekend coverage, holiday surcharges, and who to call if the unit needs emergency service.',
  },
  site_services: {
    slug: 'waste-site-services',
    titleTemplate:
      'Waste & site services in {city} — septic, roll-off & portable sanitation',
    metaDescriptionTemplate:
      'Compare integrated portable sanitation, septic, roll-off, and site-service providers serving {city} construction and infrastructure projects.',
    h1Template: 'Waste & site services for {city} construction and infrastructure work',
    introTemplate:
      'Integrated site programs may combine portable toilets, septic service, and broader temporary sanitation support. Many operators are not pure portable-toilet companies — they run septic routes, roll-off programs, disposal partnerships, and broader site support. For {city} projects that need integrated servicing, this guide surfaces operators positioned for waste handling and temporary site logistics alongside washroom capacity.',
    breadcrumbLabel: 'Waste & site services',
    capabilityBadges: [
      'Septic & fluid handling',
      'Roll-off & disposal posture',
      'Construction site support',
      'Multi-service operators',
    ],
    operationalInsights: [
      'Clarify whether your scope needs portable units only, septic pumping, roll-off bins, or a bundled site-services program — operators differ sharply.',
      'Infrastructure and civil work near {city} often share lanes with pump trucks and disposal routes — coordinate access before mobilization.',
      'Integrated firms may subcontract disposal — ask who owns the haul and what documentation you need for compliance.',
    ],
    climateContext:
      'Ground conditions, freeze–thaw cycles, and seasonal access affect pump truck routing and bin placement in and around {city}. Plan for potential delays in winter and spring; septic lines need realistic chemistry assumptions during cold snaps.',
    projectSuitability:
      'Choose waste & site services when septic, roll-off, disposal, or multi-trade site support matters as much as restrooms. For a single weekend rental with no fluid handling, general portable washrooms are simpler.',
    servicingExpectations:
      'Expect separate SLAs for restroom routes, septic pumps, and roll-off swaps — bundled brands still schedule trades independently. Confirm emergency call-outs and who handles contamination or overflow events.',
  },
}
