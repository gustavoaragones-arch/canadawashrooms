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
  /** Alberta climate / season realities — `{city}` substitution. */
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
      'Construction portable washrooms in {city} — crews, servicing & long-term rentals',
    metaDescriptionTemplate:
      'Operational portable sanitation for {city} construction: serviced routes, crew-scale capacity, and Alberta-season realities including freeze–thaw and mud seasons. Compare operators matched to jobsite logistics — not a generic directory.',
    h1Template: 'Construction portable washrooms built for {city} jobsites',
    introTemplate:
      'Crew throughput, gate access, and pump-truck cadence decide whether a washroom line works on an Alberta site — not brochure photos. This guide surfaces operators positioned for construction logistics in {city}: long-term rental posture, scheduled servicing, handwash and hygiene add-ons, and units that survive weather swings without shutting down your hygiene plan.',
    breadcrumbLabel: 'Construction washrooms',
    capabilityBadges: [
      'Scheduled jobsite servicing',
      'Long-term rental posture',
      'Alberta cold-weather ops',
      'Handwash & hygiene add-ons',
    ],
    operationalInsights: [
      'Gate width, mud lanes, and laydown space decide unit mix faster than brochure counts.',
      'Freeze–thaw swings around {city} stress tanks, lines, and handwash reliability — winter-capable inventory is not interchangeable with fair-weather singles.',
      'Crew-scale throughput matters: parallel stalls, pump-truck access, and scheduled routes beat “extra units on standby” once occupancy ramps.',
    ],
    climateContext:
      'Alberta construction hygiene fails quietly in shoulder seasons: thawing ground, icy pads, and wind-blown sites. Near {city}, plan for anchoring, tracked servicing where roads soften, and realistic chemistry/handwash assumptions when temperatures dip.',
    projectSuitability:
      'Choose construction-postured operators when timelines run weeks to years and servicing must align with site phases. For single weekends or private yard work, general rental posture may be sufficient — compare inventory depth and pump partnerships before you commit.',
    servicingExpectations:
      'Expect weekly or bi-weekly routes on active sites as a baseline; heavy crews or remote pads often negotiate tighter windows. Confirm call-out policies for freeze events and who handles access if the lane is tight after precipitation.',
  },
  event: {
    slug: 'luxury-restroom-trailers',
    titleTemplate: 'Luxury restroom trailers in {city} — weddings, venues & guest comfort',
    metaDescriptionTemplate:
      'Upscale portable restrooms for {city} events: trailer-grade finishes, flush systems, and layouts suited to weddings and mountain-adjacent venues. Practical notes on guest capacity, servicing windows, and winter considerations — curated for planners who care about guest experience.',
    h1Template: 'Luxury restroom trailers for {city} events and venues',
    introTemplate:
      'Guest comfort is operational: queueing, lighting, hand washing, and pump service timing. For {city} weddings, festivals, and private venues — especially in corridor communities where access and elevation matter — trailer-grade restrooms often outperform standard singles. Use this page to compare operators aligned to upscale events, flush systems, and planner-friendly servicing.',
    breadcrumbLabel: 'Luxury restroom trailers',
    capabilityBadges: [
      'Upscale trailer layouts',
      'Flush systems & guest comfort',
      'Wedding-friendly servicing',
      'Mountain venue logistics',
    ],
    operationalInsights: [
      'Guest comfort is queue math: stalls per peak hour, lighting for evening receptions, and handwash capacity off the dinner rush.',
      'Mountain-corridor venues near {city} often mean narrower drives, staging windows, and discrete pump servicing — trailer layouts beat stacked singles when planners care about photos and flow.',
      'Winter and shoulder-season events need realistic freeze planning for fresh-water lines and servicing access — “luxury” still has to survive the logistics.',
    ],
    climateContext:
      'Even high-season weekends near {city} can swing cold after sunset. Operators accustomed to Alberta events plan for overnight dips, wind exposure on terraces, and servicing that does not fight guest arrival windows.',
    projectSuitability:
      'Luxury trailers earn their place when guest experience, flush systems, and interior finishes matter — weddings, fundraisers, and premium private sites. For muddy festivals or bare construction compounds, verify trailer access and whether singles or hybrid mixes make more operational sense.',
    servicingExpectations:
      'Plan explicit pump and freshwater windows with your venue gate rules; many operators slot servicing outside peak photography or ceremony blocks. Confirm who manages generator power, leveling on uneven pads, and strike timing when guests are still nearby.',
  },
  oilfield: {
    slug: 'remote-site-sanitation',
    titleTemplate:
      'Remote site sanitation in {city} — camps, heated units & industrial servicing',
    metaDescriptionTemplate:
      'Industrial portable sanitation for {city}-area remote operations: winterized posture, camp support experience, and servicing assumptions for lease roads and winter access. Operators listed here are segmented for oilfield and remote logistics — verify heating, tank sizing, and dispatch SLAs directly before mobilization.',
    h1Template: 'Remote site sanitation for {city} industrial operations',
    introTemplate:
      '{city} corridors tie together remote camps, turnaround windows, and seasonal access constraints. Sanitation has to keep pace with occupancy swings, frozen lines, and routes that do not tolerate fragile gear. This landing focuses on operators equipped for remote and industrial contexts: winterized inventory where applicable, camp-aware logistics, and field servicing posture suited to Alberta’s operating environment.',
    breadcrumbLabel: 'Remote site sanitation',
    capabilityBadges: [
      'Winterized & heated inventory',
      'Camp & remote logistics',
      'Industrial servicing posture',
      'Dispatch-aware operations',
    ],
    operationalInsights: [
      'Occupancy swings matter more than stall counts: camps and turnaround crews change daily — sanitation plans have to track headcount, not a static spreadsheet.',
      'Heated units and winterized lines are operational promises, not labels; verify tank sizing, line heat trace where needed, and dispatch behavior when roads ice.',
      'Lease-road access and pad layout near {city} corridors decide whether pump trucks can keep cadence — fragile gear that works downtown rarely survives remote mobilizations.',
    ],
    climateContext:
      'Alberta remote operations run through deep cold, blowing snow, and thaw cycles that plug unprepared lines. Around {city}-area industrial corridors, assume winter road bans, delayed windows, and backup plans when servicing trucks cannot reach on schedule.',
    projectSuitability:
      'Industrial-postured operators fit camps, remote turnaround sites, and logistics-heavy pads — environments comparable to Fort McMurray–style remote intensity even when your anchor city differs. For single backyard rentals or light residential repairs, general rental routes are usually simpler and cheaper.',
    servicingExpectations:
      'Confirm SLAs in writing: typical route cadence, emergency call-outs, and who owns generator fuel or heated unit runtime costs. Winter often shifts from “weekly pump” to occupancy-driven servicing — negotiate thresholds before occupancy spikes.',
  },
  general: {
    slug: 'portable-washroom-rentals',
    titleTemplate:
      'Portable washroom rentals in {city} — short-term, residential-friendly & practical',
    metaDescriptionTemplate:
      'Straightforward portable washroom rentals in {city}: short-term drops, accessibility options, handwash stations, and septic partnerships where operators provide them. Built for practical Alberta projects where you need capacity fast — without wading through unrelated categories.',
    h1Template: 'Portable washroom rentals for everyday {city} projects',
    introTemplate:
      'Not every job is a megaproject — but timelines, property access, and basic compliance still matter. For {city}, this page highlights operators oriented to everyday portable washroom needs: quick mobilization, ADA-capable inventory where available, handwash add-ons, and septic or pumping partnerships when your scope requires them.',
    breadcrumbLabel: 'Portable washroom rentals',
    capabilityBadges: [
      'Short-term mobilization',
      'Accessibility-forward options',
      'Handwash station add-ons',
      'Septic & pumping partners',
    ],
    operationalInsights: [
      'Short-term rentals still need driveway or alley access, leveling, and a realistic pump path — “drop and go” assumes those are already true.',
      'Home renovations and small builds in {city} often share alleys with neighbors; confirm unit footprint and whether handwash stations need separate placement.',
      'When septic ties are uncertain, operators with pumping partners reduce rework — ask upfront rather than after the weekend.',
    ],
    climateContext:
      'Alberta yards freeze, thaw, and soften unpredictably. Near {city}, winter drops may need different anchoring or chemistry; spring mud can block pump access on residential lanes.',
    projectSuitability:
      'General rental posture fits weekends, residential projects, and fast coverage where you do not need camp-scale logistics or trailer-grade guest experience. If your scope looks like a multi-month crew site or a remote pad, switch segments before you compare operators.',
    servicingExpectations:
      'Most short-term scopes align to one or two scheduled pumps within the rental window — confirm weekend coverage, holiday surcharges, and who to call if the unit tips or lines freeze overnight.',
  },
}
