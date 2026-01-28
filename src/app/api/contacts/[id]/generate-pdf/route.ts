import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateInviteCode } from '@/lib/invite-code'
import { generateWelcomePDF } from '@/lib/pdf-generator'

export async function GET (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch contact
    let contact = await prisma.contact.findUnique( {
      where: { id },
    } )

    if ( !contact ) {
      return NextResponse.json( { error: 'Contact not found' }, { status: 404 } )
    }

    // Generate invite code if doesn't exist
    if ( !contact.inviteCode ) {
      let inviteCode = generateInviteCode()

      // Ensure uniqueness
      let attempts = 0
      while ( attempts < 10 ) {
        const existing = await prisma.contact.findUnique( {
          where: { inviteCode },
        } )

        if ( !existing ) break
        inviteCode = generateInviteCode()
        attempts++
      }

      contact = await prisma.contact.update( {
        where: { id },
        data: { inviteCode },
      } )
    }

    // Generate PDF
    const pdfBuffer = await generateWelcomePDF( {
      name: contact.name,
      inviteCode: contact.inviteCode!,
    } )

    // Return PDF as download
    return new NextResponse( new Uint8Array( pdfBuffer ), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="welcome-${ contact.name.replace( /[^a-z0-9]/gi, '_' ) }.pdf"`,
      },
    } )
  } catch ( error ) {
    console.error( 'PDF generation error:', error )
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
