import { z } from "zod"
import { logger } from "./logger.js"
import { type Result, ok, err } from "./result.js"

/** A meeting on today's calendar, reduced to what the status update needs. */
export type Meeting = {
  subject: string
  start: string | null
  isOnlineMeeting: boolean
}

const graphDateTimeSchema = z.object({
  dateTime: z.string(),
  timeZone: z.string(),
})

const graphEventSchema = z.object({
  subject: z.string().nullable().optional(),
  isAllDay: z.boolean().optional(),
  isCancelled: z.boolean().optional(),
  isOnlineMeeting: z.boolean().optional(),
  start: graphDateTimeSchema.optional(),
  responseStatus: z.object({ response: z.string() }).optional(),
})

const graphResponseSchema = z.object({
  value: z.array(graphEventSchema),
})

type GraphEvent = z.infer<typeof graphEventSchema>

/** Local-day window [midnight, next-midnight) as UTC instants Graph accepts. */
function todayWindow(): { startDateTime: string; endDateTime: string; timeZone: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return {
    startDateTime: start.toISOString(),
    endDateTime: end.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

/** Keep real meetings: not cancelled, not all-day, not declined. */
function isAttendableMeeting(event: GraphEvent): boolean {
  if (event.isCancelled === true) return false
  if (event.isAllDay === true) return false
  if (event.responseStatus?.response === "declined") return false
  return true
}

/**
 * Fetch today's calendar events from Microsoft Graph (calendarView, which expands
 * recurring series into per-day occurrences), validate the response with Zod, and
 * return the attendable meetings.
 */
export async function getTodaysMeetings(accessToken: string): Promise<Result<Meeting[]>> {
  const { startDateTime, endDateTime, timeZone } = todayWindow()
  logger.info("getTodaysMeetings: start", { startDateTime, endDateTime, timeZone })

  const url = new URL("https://graph.microsoft.com/v1.0/me/calendarView")
  url.searchParams.set("startDateTime", startDateTime)
  url.searchParams.set("endDateTime", endDateTime)
  url.searchParams.set("$select", "subject,start,end,isAllDay,isCancelled,isOnlineMeeting,responseStatus")
  url.searchParams.set("$orderby", "start/dateTime")
  url.searchParams.set("$top", "50")

  let response: Response
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Prefer: `outlook.timezone="${timeZone}"`,
      },
    })
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught)
    logger.error("getTodaysMeetings: network error", { error: message })
    return err(new Error(`Graph request failed: ${message}`))
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "")
    logger.error("getTodaysMeetings: http error", { status: response.status })
    return err(new Error(`Graph returned ${response.status} ${response.statusText}: ${body.slice(0, 200)}`))
  }

  const parsed = graphResponseSchema.safeParse(await response.json())
  if (!parsed.success) {
    logger.error("getTodaysMeetings: unexpected response shape", { issues: parsed.error.issues.length })
    return err(new Error("Unexpected Microsoft Graph response shape"))
  }

  const meetings: Meeting[] = parsed.data.value
    .filter(isAttendableMeeting)
    .map((event) => ({
      subject: event.subject?.trim() || "(no title)",
      start: event.start?.dateTime ?? null,
      isOnlineMeeting: event.isOnlineMeeting ?? false,
    }))

  logger.info("getTodaysMeetings: complete", { count: meetings.length })
  return ok(meetings)
}
