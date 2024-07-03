import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Get the path to the suggestions.hbs file
    const filePath = path.join(process.cwd(), 'suggestions.hbs')
    
    // Read the file contents
    const fileContents = fs.readFileSync(filePath, 'utf8')
    
    // Return the file contents
    return new NextResponse(fileContents, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  } catch (error) {
    console.error('Error reading file:', error)
    return new NextResponse('Error reading file', { status: 500 })
  }
}