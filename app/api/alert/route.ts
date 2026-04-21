import { getSessionUserId } from '@/lib/auth'
import { getUserById } from '@/lib/db'
import { sendTelegramAlert } from '@/lib/telegram'

export async function POST(req: Request) {
  // Must be authenticated
  const userId = await getSessionUserId()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { objects } = await req.json()
  if (!Array.isArray(objects) || objects.length === 0) {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  let userInfo: { email?: string; name?: string } | undefined
  try {
    const user = getUserById(userId)
    if (user) userInfo = { email: user.email, name: user.display_name || undefined }
  } catch {}

  const timestamp = new Date().toLocaleString('en-BD', { timeZone: 'Asia/Dhaka' })
  const objectList = (objects as string[]).join(', ')

  const msg = [
    '🚨 <b>BONDHU SAFETY ALERT</b> 🚨',
    '',
    `👤 <b>User:</b> ${userInfo?.name || userInfo?.email || 'Unknown'}${userInfo?.email && userInfo.name ? ` (${userInfo.email})` : ''}`,
    `🕐 <b>Time:</b> ${timestamp}`,
    `📷 <b>Source:</b> Live Camera (AI Object Detection)`,
    '',
    `🔪 <b>Dangerous object detected:</b> ${objectList}`,
    '',
    '🆘 Immediate attention may be required. Please check on this user.',
  ].join('\n')

  await sendTelegramAlert(msg)

  return Response.json({ ok: true })
}
