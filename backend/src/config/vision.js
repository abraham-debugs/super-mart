import vision from '@google-cloud/vision';

let visionClient = null;

export function configureVision(credentials) {
  if (!credentials || credentials.trim() === '') {
    console.warn('Cloud Vision API credentials not provided. Image search will be disabled.');
    return null;
  }

  try {
    // Parse credentials if they're a string
    const parsedCredentials = typeof credentials === 'string' 
      ? JSON.parse(credentials) 
      : credentials;

    visionClient = new vision.ImageAnnotatorClient({
      credentials: parsedCredentials,
    });

    console.log('Cloud Vision API configured successfully');
    return visionClient;
  } catch (error) {
    console.error('Failed to configure Cloud Vision API:', error);
    return null;
  }
}

export function getVisionClient() {
  return visionClient;
}

export async function analyzeImage(imageBuffer) {
  if (!visionClient) {
    throw new Error('Cloud Vision API is not configured');
  }

  try {
    // Perform label detection, object detection, and text detection
    const [labelResult] = await visionClient.labelDetection(imageBuffer);
    const [objectResult] = await visionClient.objectLocalization(imageBuffer);
    const [textResult] = await visionClient.textDetection(imageBuffer);
    const [webResult] = await visionClient.webDetection(imageBuffer);

    const labels = labelResult.labelAnnotations || [];
    const objects = objectResult.localizedObjectAnnotations || [];
    const texts = textResult.textAnnotations || [];
    const webEntities = webResult.webDetection?.webEntities || [];

    // Extract relevant information
    const detectedLabels = labels.map(label => ({
      description: label.description,
      score: label.score,
      confidence: Math.round(label.score * 100)
    }));

    const detectedObjects = objects.map(obj => ({
      name: obj.name,
      score: obj.score,
      confidence: Math.round(obj.score * 100)
    }));

    const detectedText = texts.length > 0 ? texts[0].description : '';

    const searchTerms = [
      ...detectedLabels.slice(0, 5).map(l => l.description),
      ...detectedObjects.slice(0, 5).map(o => o.name),
      ...webEntities.slice(0, 3).map(e => e.description).filter(Boolean)
    ];

    return {
      labels: detectedLabels,
      objects: detectedObjects,
      text: detectedText,
      webEntities: webEntities.slice(0, 5).map(e => ({
        description: e.description,
        score: e.score
      })),
      searchTerms: [...new Set(searchTerms)], // Remove duplicates
      primaryTerm: detectedObjects[0]?.name || detectedLabels[0]?.description || ''
    };
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw error;
  }
}

