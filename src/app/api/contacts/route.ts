import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET ( request: NextRequest ) {
  try {
    const { searchParams } = new URL( request.url )
    const page = parseInt( searchParams.get( 'page' ) || '1', 10 )
    const limit = parseInt( searchParams.get( 'limit' ) || '50', 10 )
    const contactedFilter = searchParams.get( 'contacted' )
    const search = searchParams.get( 'search' ) || ''

    const skip = ( page - 1 ) * limit

    // Build where clause
    const where: any = {}

    if ( contactedFilter === 'true' ) {
      where.contacted = true
    } else if ( contactedFilter === 'false' ) {
      where.contacted = false
    }

    if ( search ) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [ contacts, total ] = await Promise.all( [
      prisma.contact.findMany( {
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      } ),
      prisma.contact.count( { where } ),
    ] )

    return NextResponse.json( {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil( total / limit ),
      },
    } )
  } catch ( error ) {
    console.error( 'Get contacts error:', error )
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    )
  }
}

export async function PUT ( request: NextRequest ) {
  try {
    const body = await request.json()
    const { id, contacted } = body

    if ( !id || typeof contacted !== 'boolean' ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const contact = await prisma.contact.update( {
      where: { id },
      data: {
        contacted,
        contactedAt: contacted ? new Date() : null,
      },
    } )

    return NextResponse.json( { success: true, contact } )
  } catch ( error ) {
    console.error( 'Update contact error:', error )
    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 }
    )
  }
}
