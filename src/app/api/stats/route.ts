import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET () {
  try {
    const [ total, contacted, notContacted ] = await Promise.all( [
      prisma.contact.count(),
      prisma.contact.count( { where: { contacted: true } } ),
      prisma.contact.count( { where: { contacted: false } } ),
    ] )

    return NextResponse.json( {
      total,
      contacted,
      notContacted,
    } )
  } catch ( error ) {
    console.error( 'Get stats error:', error )
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
