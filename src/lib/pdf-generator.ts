import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import * as fs from 'fs/promises'
import * as path from 'path'

interface WelcomePDFOptions {
  name: string
  inviteCode: string
}

export async function generateWelcomePDF ( {
  name,
  inviteCode,
}: WelcomePDFOptions ): Promise<Buffer> {
  // Create PDF document
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage( [ 595, 842 ] ) // A4 size

  // Load background image (random selection)
  const backgrounds = [
    'kitesurf_action_1_1769593973436.png',
    'kitesurf_sunset_1769594156393.png',
    'kitesurf_beach_1769594278195.png',
    'kitesurf_wave_1769594472193.png',
  ]
  const randomBg = backgrounds[ Math.floor( Math.random() * backgrounds.length ) ]
  const bgPath = path.join(
    process.cwd(),
    'public',
    'backgrounds',
    randomBg
  )

  try {
    const bgImageBytes = await fs.readFile( bgPath )
    const bgImage = await pdfDoc.embedJpg( bgImageBytes )

    // Scale and position background
    const { width, height } = page.getSize()
    const imgDims = bgImage.scale( 1 )
    const scale = Math.max( width / imgDims.width, height / imgDims.height )

    page.drawImage( bgImage, {
      x: 0,
      y: 0,
      width: imgDims.width * scale,
      height: imgDims.height * scale,
      opacity: 0.3,
    } )
  } catch ( error ) {
    console.error( 'Error loading background image:', error )
  }

  // Load fonts
  const boldFont = await pdfDoc.embedFont( StandardFonts.HelveticaBold )
  const regularFont = await pdfDoc.embedFont( StandardFonts.Helvetica )

  const { width, height } = page.getSize()

  // Title
  page.drawText( 'Welcome to Our', {
    x: 50,
    y: height - 150,
    size: 32,
    font: regularFont,
    color: rgb( 0.1, 0.1, 0.1 ),
  } )

  page.drawText( 'Kitesurfing Community!', {
    x: 50,
    y: height - 200,
    size: 42,
    font: boldFont,
    color: rgb( 0, 0.4, 0.8 ),
  } )

  // Personalized greeting
  page.drawText( `Dear ${ name },`, {
    x: 50,
    y: height - 280,
    size: 20,
    font: regularFont,
    color: rgb( 0.1, 0.1, 0.1 ),
  } )

  // Welcome message
  const welcomeText = [
    'We\'re thrilled to have you join our kitesurfing',
    'community! Get ready for incredible adventures,',
    'new friendships, and unforgettable experiences',
    'on the water.',
  ]

  let yOffset = height - 330
  welcomeText.forEach( ( line ) => {
    page.drawText( line, {
      x: 50,
      y: yOffset,
      size: 14,
      font: regularFont,
      color: rgb( 0.2, 0.2, 0.2 ),
    } )
    yOffset -= 25
  } )

  // Invite code section
  page.drawText( 'Your Personal Invite Code:', {
    x: 50,
    y: yOffset - 40,
    size: 16,
    font: boldFont,
    color: rgb( 0.1, 0.1, 0.1 ),
  } )

  // Draw rounded rectangle for invite code
  const codeBoxX = 50
  const codeBoxY = yOffset - 120
  const codeBoxWidth = 250
  const codeBoxHeight = 60

  page.drawRectangle( {
    x: codeBoxX,
    y: codeBoxY,
    width: codeBoxWidth,
    height: codeBoxHeight,
    borderColor: rgb( 0, 0.4, 0.8 ),
    borderWidth: 3,
    color: rgb( 0.95, 0.97, 1 ),
  } )

  page.drawText( inviteCode, {
    x: codeBoxX + 20,
    y: codeBoxY + 18,
    size: 28,
    font: boldFont,
    color: rgb( 0, 0.4, 0.8 ),
  } )

  // Footer
  page.drawText( 'See you on the water!', {
    x: 50,
    y: 80,
    size: 14,
    font: regularFont,
    color: rgb( 0.3, 0.3, 0.3 ),
  } )

  // Serialize PDF
  const pdfBytes = await pdfDoc.save()
  return Buffer.from( pdfBytes )
}
