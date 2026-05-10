import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { emitProductionAnalytics } from '../../lib/analytics/productionAnalytics'
import type { InquirySurfaceOrigin, OperationalInquiryDraft } from '../../types/inquiry'
import type { PrimarySegment, Provider } from '../../types/provider'

export type OperationalInquiryOpenArgs = {
  segment: PrimarySegment
  city: string
  provider?: Provider | null
  activeCapabilityLabels?: string[]
  ctaOrigin?: InquirySurfaceOrigin
}

function emptyDraft(segment: PrimarySegment, city: string): OperationalInquiryDraft {
  return {
    segment,
    cityOrLocation: city,
    winterRequirements: 'none',
    campSupportNeeded: null,
    adaNeeded: null,
    handwashStationsNeeded: null,
  }
}

type OperationalInquiryContextValue = {
  open: boolean
  openArgs: OperationalInquiryOpenArgs | null
  draft: OperationalInquiryDraft | null
  setDraft: React.Dispatch<React.SetStateAction<OperationalInquiryDraft | null>>
  openInquiry: (args: OperationalInquiryOpenArgs) => void
  closeInquiry: () => void
}

const OperationalInquiryContext = createContext<OperationalInquiryContextValue | null>(null)

export function OperationalInquiryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [openArgs, setOpenArgs] = useState<OperationalInquiryOpenArgs | null>(null)
  const [draft, setDraft] = useState<OperationalInquiryDraft | null>(null)

  const openInquiry = useCallback((args: OperationalInquiryOpenArgs) => {
    emitProductionAnalytics('inquiry_opened', {
      segment: args.segment,
      city: args.city,
      origin: args.ctaOrigin ?? null,
      has_provider: Boolean(args.provider?.id),
    })
    setOpenArgs(args)
    setDraft(emptyDraft(args.segment, args.city))
    setOpen(true)
  }, [])

  const closeInquiry = useCallback(() => {
    setOpen((wasOpen) => {
      if (wasOpen) emitProductionAnalytics('inquiry_closed', {})
      return false
    })
    setOpenArgs(null)
    setDraft(null)
  }, [])

  const value = useMemo(
    () => ({
      open,
      openArgs,
      draft,
      setDraft,
      openInquiry,
      closeInquiry,
    }),
    [open, openArgs, draft, openInquiry, closeInquiry],
  )

  return (
    <OperationalInquiryContext.Provider value={value}>{children}</OperationalInquiryContext.Provider>
  )
}

/** Context modules conventionally export both provider and hook; Fast Refresh allows this pattern with an explicit exemption. */
// eslint-disable-next-line react-refresh/only-export-components -- paired Provider + consumer hook
export function useOperationalInquiry(): OperationalInquiryContextValue {
  const ctx = useContext(OperationalInquiryContext)
  if (!ctx) {
    throw new Error('useOperationalInquiry must be used within OperationalInquiryProvider')
  }
  return ctx
}
