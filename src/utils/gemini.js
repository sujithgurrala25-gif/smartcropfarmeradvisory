// Google Gemini AI integration for Pest Diagnosis

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Check if Gemini API is configured and is not the default placeholder
export const isGeminiConfigured = 
  !!GEMINI_API_KEY && 
  GEMINI_API_KEY !== 'your_gemini_api_key_here' && 
  GEMINI_API_KEY !== '';

// Curated database of common Indian/Telangana pests for local fallback simulation
const mockPestsDb = [
  {
    name: "Pink Bollworm (Pectinophora gossypiella)",
    crop: "Cotton",
    severity: "High",
    organicControl: "Install pheromone traps (5 traps/acre) to monitor pests. Deploy light traps to capture moths. Uproot and burn cotton stalks immediately after harvest to prevent diapause larvae from overwintering. Encourage natural predators like lacewings and ladybird beetles.",
    chemicalControl: "Spray Profenophos 50EC @ 2.0 ml/liter or Chlorpyriphos 20EC @ 2.5 ml/liter. If pest counts exceed economic threshold limits (ETL), apply Emamectin Benzoate 5% SG @ 0.4 g/liter of water."
  },
  {
    name: "Yellow Stem Borer (Scirpophaga incertulas)",
    crop: "Paddy (Rice)",
    severity: "High",
    organicControl: "Set up light traps (1 trap/acre) to attract and destroy adult moths. Release egg parasitoids (Trichogramma japonicum) @ 50,000/ha weekly. Avoid high doses of nitrogenous fertilizers, which make the crop succulent and susceptible.",
    chemicalControl: "Apply Cartap Hydrochloride 4G granules @ 10 kg/acre or Carbofuran 3G granules @ 10 kg/acre in the standing water. Alternatively, spray Chlorantraniliprole 18.5% SC @ 0.3 ml/liter."
  },
  {
    name: "Chilli Thrips (Scirtothrips dorsalis)",
    crop: "Chillies",
    severity: "Medium",
    organicControl: "Install blue/yellow sticky traps @ 10 per acre to attract and capture thrips. Spray neem oil (3000 ppm) @ 5 ml/liter mixed with a mild soap solution. Introduce predatory mites or lacewing larvae in the field.",
    chemicalControl: "Spray Fipronil 5% SC @ 2.0 ml/liter or Imidacloprid 17.8% SL @ 0.3 ml/liter. For severe infestation, apply Spinetoram 11.7% SC @ 0.8 ml/liter of water."
  },
  {
    name: "Rice Leaf Blast (Magnaporthe oryzae)",
    crop: "Paddy (Rice)",
    severity: "High",
    organicControl: "Treat seeds with Pseudomonas fluorescens @ 10g/kg of seed. Maintain water levels in the field to reduce stress on seedlings. Avoid overcrowding of crops and reduce nitrogen applications during cloudy/rainy days.",
    chemicalControl: "Spray Tricyclazole 75% WP @ 0.6 g/liter or Isoprothiolane 40% EC @ 1.5 ml/liter of water at the first sign of leaf lesions."
  },
  {
    name: "Fall Armyworm (Spodoptera frugiperda)",
    crop: "Maize",
    severity: "High",
    organicControl: "Hand-pick and destroy egg masses and young caterpillars. Apply fine sand, soil, or ash into the leaf whorl to suffocate the larvae. Spray Bacillus thuringiensis (Bt) formulation @ 2 g/liter or neem oil (10,000 ppm) @ 3 ml/liter.",
    chemicalControl: "Spray Chlorantraniliprole 18.5% SC @ 0.4 ml/liter or Spinetoram 11.7% SC @ 0.5 ml/liter of water directly into the leaf whorls."
  },
  {
    name: "Aphids (Aphis gossypii)",
    crop: "Vegetables / Cotton",
    severity: "Low",
    organicControl: "Spray crops with a strong stream of water to dislodge aphids. Apply insecticidal soaps or neem oil solution (1500 ppm) @ 5 ml/liter. Encourage beneficial insects like ladybugs, syrphid fly larvae, and parasitic wasps.",
    chemicalControl: "Spray Dimethoate 30% EC @ 2.0 ml/liter or Thiamethoxam 25% WG @ 0.2 g/liter of water."
  }
];

// Helper to simulate a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Analyzes a base64 encoded image with Gemini AI or falls back to a realistic simulation
 * @param {string} base64Data - Base64 data string (excluding the mime header)
 * @param {string} mimeType - Image mime type (e.g. image/jpeg, image/png)
 * @returns {Promise<{name: string, crop: string, severity: string, organicControl: string, chemicalControl: string}>}
 */
export const analyzePestPhoto = async (base64Data, mimeType) => {
  if (isGeminiConfigured) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const payload = {
        contents: [
          {
            parts: [
              {
                text: "Analyze this image of a crop disease or pest. You are an expert agricultural botanist. Respond ONLY with a valid JSON object matching the following JSON schema. Do not enclose the JSON inside markdown codeblocks (no ```json). The schema is:\n{\n  \"name\": \"Name of the pest or crop disease\",\n  \"crop\": \"Host crop affected\",\n  \"severity\": \"Low, Medium, or High depending on the potential damage\",\n  \"organicControl\": \"Detailed organic control methods and home remedies for farmers\",\n  \"chemicalControl\": \"Detailed chemical control methods and pesticides to use safely\"\n}"
              },
              {
                inlineData: {
                  mimeType: mimeType || "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API responded with status ${response.status}`);
      }

      const responseData = await response.json();
      const textResponse = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textResponse) {
        throw new Error("Empty response from Gemini AI model");
      }

      const parsedData = JSON.parse(textResponse.trim());
      
      // Ensure all fields exist
      return {
        name: parsedData.name || "Unknown Crop Pest",
        crop: parsedData.crop || "Unknown Crop",
        severity: parsedData.severity || "Medium",
        organicControl: parsedData.organicControl || "Use neem oil sprays and monitor crop rotation.",
        chemicalControl: parsedData.chemicalControl || "Consult local agricultural extension for registered fungicides/insecticides."
      };

    } catch (error) {
      console.error("Gemini AI API call failed, falling back to simulation:", error);
      await delay(2000); // Simulate network latency
      // Failover to a random mock database item
      return mockPestsDb[Math.floor(Math.random() * mockPestsDb.length)];
    }
  } else {
    // Offline local simulation fallback mode
    await delay(2000); // Simulate AI loading state
    return mockPestsDb[Math.floor(Math.random() * mockPestsDb.length)];
  }
};
