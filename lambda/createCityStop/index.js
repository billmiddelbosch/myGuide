// Import de AWS SDK
import axios from 'axios';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
AWS.config.update({region: 'eu-west-2'});
const dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

// CHECK if a stop with the same name, city and tourType already exists
async function findExistingStop(name, city) {
  const params = {
    TableName: 'cityStops',
    IndexName: 'stopCity-tourType-index',
    KeyConditionExpression: 'stopCity = :city',
    FilterExpression: 'stopName = :name',
    ExpressionAttributeValues: {
      ':city': { S: city },
      ':name': { S: name }
    },
    ProjectionExpression: 'stopID'
  };

  const result = await dynamodb.query(params).promise();
  return result.Items && result.Items.length > 0 ? result.Items[0].stopID.S : null;
}

// CREATE cityStops table entries
async function saveStop(name, description, city, tourType, stopLat, stopLng) {

  // Prevent duplicates — return the existing ID if the stop already exists
  const existingId = await findExistingStop(name, city);
  if (existingId) {
    console.log(`Stop already exists, skipping save: ${name} (${city}) → ${existingId}`);
    return { statusCode: 200, body: existingId };
  }

  console.log(`Opslaan van stop: ${name}, ${description}, ${city}, ${tourType}, ${stopLat}, ${stopLng}`);

  const id = uuidv4(); // genereer unieke ID

  let params = {
    TableName: 'cityStops',
    Item: {
      "stopID": {
        "S": id
      },
      "stopCity": {
        "S": city
      },
      "tourType": {
        "S": tourType
      },
      "stopName": {
        "S": name
      },
      "stopDecription": {
        "S": description
      },
      "stopLat": {
        "S": String(stopLat)
      },
      "stopLng": {
        "S": String(stopLng)
      },
      "lastUpdated": {
        "S": new Date().toISOString()
      },
      "createdAt": {
        "S": new Date().toISOString()
      }
    }
  }

  try {
    await dynamodb.putItem(params).promise();

    return {
      statusCode: 200,
      body: id,
    };
  } catch (error) {
    console.error('Fout bij opslaan:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Fout bij opslaan in DynamoDB' }),
    };
  }

}


// MAIN Handler voor de Lambda-functie
export const handler = async (event) => {

  /// SET VARIABELEN
  const stopCity = event.params.querystring.stopCity
  const prompt = event.params.querystring.prompt.replace("<<stad>>", stopCity);
  const tourType = event.params.querystring.tourType

  if (!prompt | !stopCity | !tourType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Bad Request: Prompt en City zijn required' }),
      headers: {
        'Access-Control-Allow-Origin': '*',  // Beperk de toegang tot je eigen domein
        'Access-Control-Allow-Methods': 'GET',
      },
    };
  } 

  // GENEREREN van de Google AI response
  try {
    console.log("start main");

    // const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";
    // const baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    // const responseGoogleAI = await axios.post(
    //   baseUrl,
    //   {
    //     contents: 
    //       {
    //         parts: [{ text: prompt }]
    //       }
    //     ,
    //     generationConfig: {
    //       maxOutputTokens: 512,
    //       thinkingConfig: {
    //         thinkingBudget: 0   // Disable thinking for simple tasks (saves cost)
    //       },        
    //       temperature: 0.5
    //     }    
    //   },
    //   {
    //     headers: {
    //       "x-goog-api-key": "AIzaSyDLfrc6QRudzU3o-aPng6xJvbhzwBRU4qs",
    //       "Content-Type": "application/json"
    //     }
    //   }
    // );


    // // Als we resultaten hebben, slaan we ze op in de database
    // if (!responseGoogleAI.data || !responseGoogleAI.data.candidates || responseGoogleAI.data.candidates.length === 0) {
    //   return {
    //     statusCode: 404,
    //     body: JSON.stringify({ message: 'No candidates found in response' }),
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',  // Beperk de toegang tot je eigen domein
    //       'Access-Control-Allow-Methods': 'POST',
    //     },
    //   };
    // } 

    // const googleResponse = responseGoogleAI.data.candidates[0].content.parts[0].text;
    const key = 'AIzaSyDlrxzsPxCFR_YZESrvezNpWzSjZMC3hTQ'

    const searchResponse = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      {
        textQuery: `top 10 ${tourType} bezienswaardigheden in ${stopCity}`,
        languageCode: "nl",
        maxResultCount: 10
      },
      {
        headers: {
          "X-Goog-Api-Key": "AIzaSyD26RA-Gb-tv2s0r-PT9Gn6kHaZVY2NrSc",
          // "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.editorialSummary",
          "X-Goog-FieldMask": "places.id,places.displayName,places.location",
          "Content-Type": "application/json"
        }
      }
    );

    const places = searchResponse.data.places ?? [];

    if (places.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Geen resultaten gevonden voor ${stad}` })
      };
    }

    // Step 2: Map results, with AI fallback for missing descriptions
    const stops = await Promise.all(
      places.map(async (place) => {
        // const description = place.editorialSummary?.text
        //   ?? "";

        return {
          name: place.displayName?.text,
          description: place.displayName?.text,
          latitude: place.location?.latitude,
          longitude: place.location?.longitude
        };
      })
    );

    console.log("Stops:", stops)

    // // Zet om naar array
    // const locationList = googleResponse.split(',');
    // console.log ("Location List:", locationList);
    // if (locationList.length % 4 !== 0) {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ message: 'Invalid response format from Google AI' }),
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',  // Beperk de toegang tot je eigen domein
    //       'Access-Control-Allow-Methods': 'POST',
    //     },
    //   };
    // }
    // // Maak JSON-array
    // const jsonArray = [];
    // for (let i = 0; i < locationList.length; i += 4) {
    //   jsonArray.push({
    //     name: locationList[i],
    //     description: locationList[i + 1],
    //     latitude: locationList[i + 2],
    //     longitude: locationList[i + 3],
    //   });
    // }
    // console.log("JSON Array:", jsonArray);

    let stopsArray = [];
    try {
      for (const location of stops) {
        const stopName = location.name;
        const stopDescription = location.description;
        const stopLat = location.latitude;
        const stopLng = location.longitude;
        const id = await saveStop(stopName, stopDescription, stopCity, tourType, stopLat, stopLng);
        stopsArray.push({
          latitude: location.latitude,
          longitude: location.longitude,
          name: stopName,
          description: stopDescription,
          id: id.body
        });
      }
    } catch (e) {
      // Fout bij het opslaan van de stop
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error saving stops', error: e.message }),
        headers: {
          'Access-Control-Allow-Origin': '*',  // Beperk de toegang tot je eigen domein
          'Access-Control-Allow-Methods': 'POST',
        },
      };
    }

    // Als we resultaten hebben, geef ze terug
    return {
      statusCode: 200,
      body: stopsArray,
      headers: {
        'Access-Control-Allow-Origin': '*',  // Beperk de toegang tot je eigen domein
        'Access-Control-Allow-Methods': 'POST',
      },
    };

    } catch (error) {
      console.error("Error:", error.message);
      return {
        statusCode: error.response?.status || 500,
        body: JSON.stringify({
          message: 'Failed to get response from Google AI',
          error: error.message,
        }),
        headers: {
          'Access-Control-Allow-Origin': '*',  // Beperk de toegang tot je eigen domein
          'Access-Control-Allow-Methods': 'POST',
        },
      };
    }
};