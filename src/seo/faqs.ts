import type { PrimarySegment } from '../types/provider'

export interface FaqItem {
  question: string
  answer: string
}

export const SEGMENT_FAQS: Record<PrimarySegment, FaqItem[]> = {
  construction: [
    {
      question: 'How often are construction portable washrooms serviced in Alberta?',
      answer:
        'Cadence depends on crew headcount, tank sizing, and season — freeze-up and mud can change effective capacity fast. Most jobsite programs run weekly or bi-weekly servicing with spikes during peak occupancy; confirm pump access, staging, and winter chemistry with your operator before lock-in.',
    },
    {
      question: 'Can we rent portable washrooms long-term on a Calgary or Edmonton jobsite?',
      answer:
        'Yes — long-term rental is common for civil, vertical, and industrial builds. Pricing and service bundles usually track duration, distance from the operator’s route, and add-ons like handwash trailers or crane-lift frames. Ask what’s included in “serviced” versus dry rental.',
    },
    {
      question: 'What changes for washrooms during Alberta winter operations?',
      answer:
        'Winter operations often mean freeze-protection measures, different pumping assumptions, and slower truck routing during storms. If your site idles crews overnight or runs extended shifts, specify occupancy peaks so tank sizing and service windows stay realistic.',
    },
  ],
  event: [
    {
      question: 'How do luxury restroom trailers differ from standard portable toilets?',
      answer:
        'Trailers typically bring flush fixtures, improved ventilation, lighting, and layouts that reduce queues — important when guests are in formal attire or when the venue has limited indoor plumbing. They still require level staging, power assumptions, and pump service — planners should confirm delivery footprint early.',
    },
    {
      question: 'How should we estimate restroom capacity for a wedding or festival?',
      answer:
        'Think peak concurrency — speeches, intermissions, and bar service — not average attendance. Operators often size units using event duration, alcohol service, and male/female ratios; add handwash capacity if food service is heavy.',
    },
    {
      question: 'Are upscale trailers viable for mountain-adjacent venues near Canmore?',
      answer:
        'Often yes, but access roads, turnaround space, and staging windows matter more than in flat urban lots. Snow, freeze–thaw, and narrow approaches can constrain delivery — share gate dimensions and surface conditions when requesting quotes.',
    },
  ],
  oilfield: [
    {
      question: 'When do heated portable washrooms matter on remote Alberta sites?',
      answer:
        'Whenever plumbing lines, tanks, or users are exposed to sustained sub-zero conditions — especially overnight occupancy or camp rotations. “Heated” can mean different hardware packages; confirm what’s heated (bay air, tanks, lines) and what fuel or power is assumed on site.',
    },
    {
      question: 'How does remote servicing work on lease roads or winter access routes?',
      answer:
        'Dispatch windows, truck class, and fluid hauling constraints drive feasibility — not just distance. Operators may bucket routes by region; during freeze-up, routes slow down. Build slack into turnaround expectations and confirm who carries contingency tanks or backups.',
    },
    {
      question: 'What does camp logistics mean for sanitation vendors?',
      answer:
        'It’s occupancy schedules, hookup compatibility, greywater assumptions, and coordination with catering or lodging modules — not only dropping singles near a fence line. Strong camp vendors ask about peak shifts, gender splits, and servicing windows that avoid conflict with other truck traffic.',
    },
  ],
  general: [
    {
      question: 'How fast can portable washrooms be delivered in Calgary?',
      answer:
        'Same-week drops happen when inventory lines up and the lane is straightforward — HOAs, alleys, or lift logistics eat calendar fast. Nail delivery windows, surface constraints, and pickup expectations before you assume a weekend slot.',
    },
    {
      question: 'Are ADA-accessible portable washrooms available for short-term rentals?',
      answer:
        'Many operators carry accessible units, but availability fluctuates with season and event demand. Specify ramp geometry, pathway width, and anchoring needs — Alberta wind exposure can matter on open lots.',
    },
    {
      question: 'Do operators handle septic pumping or only unit rental?',
      answer:
        'It varies: some bundles include pumping partnerships; others rent units only. If your site lacks sewer ties, clarify tank servicing responsibility and whether greywater handling is included — ambiguity here causes preventable site delays.',
    },
  ],
}
