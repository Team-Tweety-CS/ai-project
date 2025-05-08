import { RequestHandler } from 'express';
import { ServerError } from '../types/types';
import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const queryOpenAIChat: RequestHandler = async (_req, res, next) => {
  const { userQuery } = _req.body;
  console.log(userQuery);
  if (!userQuery) {
    const error: ServerError = {
      log: 'queryOpenAIChat did not receive a user query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [
        {
          role: 'system',
          content: `
          You are a smart travel planner and map assistant. 
          Based on the user's input, you must generate a travel recommendation that includes:
          - A destination (city or landmark) with its name and a brief reason why it is recommended.
          - The geographic coordinates (latitude and longitude) of the destination.
          - Any relevant time information if provided by the user (e.g., month, season, or specific dates).
          The response must be returned in the following JSON format:
          
          {
            "city": "City Name",
            "reason": "Short reason why this city is recommended",
            "mainAttractions": [
              {
                "name": "Attraction Name 1",
                "coordinates": {
                  "latitude": [number],
                  "longitude": [number]
                }
              },
              {
                "name": "Attraction Name 2",
                "coordinates": {
                  "latitude": [number],
                  "longitude": [number]
                }
              }
            ],
            "time": "optional time string if provided"
          }
          
          Only provide one recommendation. If user query is ambiguous, make your best assumption.
          `,
        },
        {
          role: 'user',
          content: `The user query is: ${userQuery}`,
        },
      ],
    });

    const reply = completion.choices[0].message.content;
    console.log('userQuery', userQuery);
    console.log('result', reply);
    res.locals.openaiResult = reply!;

    return next();
  } catch (err) {
    console.error('Error generating genres from ChatGPT:', err);
    return next(err);
  }
};
