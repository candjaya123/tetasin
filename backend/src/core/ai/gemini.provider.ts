import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './ai.provider.interface';

@Injectable()
export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Note: In production, this should throw an error. 
      // For initialization we can just log a warning if not provided yet.
      console.warn('GEMINI_API_KEY is missing in environment variables');
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async extractReceipt(imageBuffer: Buffer, mimeType: string): Promise<any> {
    if (!this.genAI) throw new Error('Gemini API is not configured');

    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Ekstrak informasi dari gambar struk/nota ini.
    Kembalikan dalam format JSON murni:
    {
      "vendor_name": { "value": string, "confidence": "high"|"medium"|"low" },
      "total_amount": { "value": number, "confidence": "high"|"medium"|"low" },
      "date": { "value": string, "confidence": "high"|"medium"|"low" },
      "suggested_coa": { "value": string, "confidence": "high"|"medium"|"low" }
    }
    Berikan keyakinan "low" jika tulisan buram atau meragukan. Kembalikan HANYA JSON.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    try {
      const jsonStr = text.replace(/```json|```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      throw new Error('Failed to parse AI response as JSON: ' + text);
    }
  }

  async generateContent(prompt: string, modelName = 'gemini-2.5-flash-lite'): Promise<string> {
    if (!this.genAI) throw new Error('Gemini API is not configured');

    // Try preferred model first, then fallback
    const models = [modelName, 'gemini-2.5-flash', 'gemini-1.0-pro'];

    for (const model of models) {
      try {
        const generativeModel = this.genAI.getGenerativeModel({ model });
        const result = await generativeModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (e: any) {
        const status = e?.status || e?.httpStatus || 0;
        const isRateLimit = status === 429 || e?.message?.includes('429') || e?.message?.includes('quota');
        const isNotFound = status === 404 || e?.message?.includes('404') || e?.message?.includes('not found');

        if (isNotFound) {
          // Model deprecated, try next
          console.warn(`Model ${model} not found, trying next...`);
          continue;
        }

        if (isRateLimit) {
          // Rate limit — propagate with clear message
          throw new Error('AI_RATE_LIMIT');
        }

        // Other errors — rethrow
        throw e;
      }
    }

    throw new Error('All Gemini models unavailable. Please try again later.');
  }
}
