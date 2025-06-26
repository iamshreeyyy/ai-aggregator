"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { google } from "@ai-sdk/google"

interface AIResponse {
  provider: string
  response: string
  error?: string
  responseTime: number
}

export async function generateParallelResponses(prompt: string): Promise<AIResponse[]> {
  const startTime = Date.now()

  // Create promises for both AI providers
  const openaiPromise = generateOpenAIResponse(prompt)
  const googlePromise = generateGoogleResponse(prompt)

  // Wait for both responses in parallel
  const [openaiResult, googleResult] = await Promise.allSettled([openaiPromise, googlePromise])

  const results: AIResponse[] = []

  // Process OpenAI result
  if (openaiResult.status === "fulfilled") {
    results.push({
      provider: "OpenAI",
      response: openaiResult.value.response,
      responseTime: openaiResult.value.responseTime,
    })
  } else {
    results.push({
      provider: "OpenAI",
      response: "",
      error: openaiResult.reason?.message || "Unknown error occurred",
      responseTime: Date.now() - startTime,
    })
  }

  // Process Google AI result
  if (googleResult.status === "fulfilled") {
    results.push({
      provider: "Google AI",
      response: googleResult.value.response,
      responseTime: googleResult.value.responseTime,
    })
  } else {
    results.push({
      provider: "Google AI",
      response: "",
      error: googleResult.reason?.message || "Unknown error occurred",
      responseTime: Date.now() - startTime,
    })
  }

  return results
}

async function generateOpenAIResponse(prompt: string) {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      maxTokens: 1000,
    })

    return {
      response: text,
      responseTime: Date.now() - startTime,
    }
  } catch (error) {
    throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

async function generateGoogleResponse(prompt: string) {
  const startTime = Date.now()

  try {
    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
      maxTokens: 1000,
    })

    return {
      response: text,
      responseTime: Date.now() - startTime,
    }
  } catch (error) {
    throw new Error(`Google AI API Error: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
