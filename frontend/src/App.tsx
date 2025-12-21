import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!prompt || !file) {
      setMessage('Please provide both a prompt and an image')
      return
    }

    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('prompt', prompt)
    formData.append('image', file)

    try {
      const response = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setMessage(`Successfully uploaded! ID: ${data.id}`)
      setPrompt('')
      setFile(null)
      
      // Reset file input
      const fileInput = document.getElementById('image') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setMessage('Error: ' + (error instanceof Error ? error.message : 'Upload failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Instagrammable</CardTitle>
          <CardDescription>Upload your image with a prompt</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Input
                id="prompt"
                type="text"
                placeholder="Enter your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                disabled={loading}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('Successfully') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default App

