export function generateInviteCode (): string {
  const prefix = 'SURF'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed similar looking chars
  let code = ''

  for ( let i = 0; i < 6; i++ ) {
    code += chars.charAt( Math.floor( Math.random() * chars.length ) )
  }

  return `${ prefix }-${ code }`
}
