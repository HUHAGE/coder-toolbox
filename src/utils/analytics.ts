import { track } from '@vercel/analytics'

export const trackToolUsage = (toolName: string, path: string) => {
  track('tool_usage', {
    tool: toolName,
    path: path,
    timestamp: new Date().toISOString()
  })
} 