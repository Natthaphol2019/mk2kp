import Tesseract from 'tesseract.js'

export async function extractAmountFromSlip(file: File): Promise<number | null> {
  let imageUrl = ''
  try {
    // Convert File to an object URL to prevent Tesseract worker serialization issues
    imageUrl = URL.createObjectURL(file)

    // We only need English for numbers. It's fast and accurate.
    const result = await Tesseract.recognize(
      imageUrl,
      'eng',
      {
        logger: m => console.log('OCR Progress:', m),
      }
    )

    const text = result.data.text
    console.log('OCR Raw Text:', text)

    // Regex to find numbers with 2 decimal places: e.g., 280.00, 1,200.50
    const regex = /\b\d{1,3}(?:,\d{3})*\.\d{2}\b/g
    const matches = text.match(regex)

    if (!matches || matches.length === 0) {
      return null
    }

    // Convert all matches to numbers
    const amounts = matches.map(m => parseFloat(m.replace(/,/g, '')))

    // Filter out 0.00 (usually fees)
    const validAmounts = amounts.filter(amt => amt > 0)

    if (validAmounts.length === 0) return null

    // The transfer amount is usually the largest valid number on a standard Thai bank slip
    // (since remaining balances are not typically shown on the shareable slip)
    const maxAmount = Math.max(...validAmounts)
    
    return maxAmount
  } catch (error) {
    console.error('OCR Error:', error)
    return null
  } finally {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
    }
  }
}
