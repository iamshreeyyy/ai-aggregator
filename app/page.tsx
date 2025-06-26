"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Sparkles, Brain, Zap } from "lucide-react"
import { generateParallelResponses } from "./actions"

interface AIResponse {
  provider: string
  response: string
  error?: string
  responseTime: number
}

export default function AIAggregator() {
  const [prompt, setPrompt] = useState("")
  const [responses, setResponses] = useState<AIResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsLoading(true)
    setResponses([])

    try {
      const results = await generateParallelResponses(prompt)
      setResponses(results)
    } catch (error) {
      console.error("Error generating responses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return <Brain className="w-5 h-5" />
      case "Google AI":
        return <Sparkles className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "OpenAI":
        return "bg-green-500"
      case "Google AI":
        return "bg-blue-500"
      default:
        return "bg-purple-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Response Aggregator</h1>
          <p className="text-slate-600 text-lg">Compare responses from multiple AI models in parallel</p>
        </div>

        {/* Input Form */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-purple-600" />
              Enter Your Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask anything... e.g., 'Explain quantum computing in simple terms' or 'Write a creative story about space exploration'"
                className="min-h-[120px] resize-none border-slate-200 focus:border-purple-400 focus:ring-purple-400"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Responses...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Generate Parallel Responses
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {["OpenAI", "Google AI"].map((provider) => (
              <Card key={provider} className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getProviderIcon(provider)}
                      {provider}
                    </div>
                    <Badge variant="secondary" className="animate-pulse">
                      Thinking...
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Responses */}
        {responses.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {responses.map((response, index) => (
              <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getProviderIcon(response.provider)}
                      {response.provider}
                    </div>
                    <div className="flex items-center gap-2">
                      {response.error ? (
                        <Badge variant="destructive">Error</Badge>
                      ) : (
                        <Badge variant="secondary" className={`text-white ${getProviderColor(response.provider)}`}>
                          {response.responseTime}ms
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {response.error ? (
                    <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="font-medium">Error occurred:</p>
                      <p className="text-sm mt-1">{response.error}</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">{response.response}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && responses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to Compare AI Responses</h3>
            <p className="text-slate-500">Enter a prompt above to see parallel responses from OpenAI and Google AI</p>
          </div>
        )}
      </div>
    </div>
  )
}
