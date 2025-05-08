import { RequestHandler } from 'express';
import { ServerError } from '../types/types';
import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemContent = `
        You are a smart travel planner and map assistant. Based on the user's input, generate a travel recommendation for a specific destination.
        
        You must include:
        - The city name.
        - A brief overall reason why this city is recommended.
        - A list of main attractions in or around the city (minimum 3). Each item should include:
          - name
          - coordinates (latitude and longitude)
          - a short reason why this place is recommended
        - A list of recommended hotels (minimum 3). Each item should include:
          - name
          - coordinates (latitude and longitude)
          - a short reason for the recommendation (e.g. location, price, view, amenities)
        - A list of recommended restaurants (minimum 3). Each item should include:
          - name
          - coordinates (latitude and longitude)
          - a short reason for the recommendation (e.g. cuisine type, popularity, view, uniqueness)
        - Any time-related information if the user provided it (e.g. season, month, specific date)
        
        If the user mentions a location or region (even vaguely), you must base your recommendations within that area.
        Do not suggest destinations outside of the user's described geographic intent.
        
        The response must be returned in this exact JSON format:
        
        {
          "city": "City Name",
          "reason": "Short reason why this city is recommended",
          "mainAttractions": [
            {
              "name": "Attraction Name",
              "coordinates": {
                "latitude": [number],
                "longitude": [number]
              },
              "reason": "Why this attraction is recommended"
            }
          ],
          "hotels": [
            {
              "name": "Hotel Name",
              "coordinates": {
                "latitude": [number],
                "longitude": [number]
              },
              "reason": "Why this hotel is recommended"
            }
          ],
          "restaurants": [
            {
              "name": "Restaurant Name",
              "coordinates": {
                "latitude": [number],
                "longitude": [number]
              },
              "reason": "Why this restaurant is recommended"
            }
          ],
          "time": "Optional time string if user provided it"
        }
        
        Only return valid JSON. Do not include any explanation or commentary outside the JSON.
        `;

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
          content: systemContent,
        },
        {
          role: 'user',
          content: userQuery,
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
