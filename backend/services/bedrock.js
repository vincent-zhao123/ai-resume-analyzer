const {
    BedrockRuntimeClient,
    InvokeModelCommand,
  } = require("@aws-sdk/client-bedrock-runtime");
  
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
  });
  
  function extractJson(text) {
    return text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  }
  
  async function analyzeResumeWithBedrock(resumeText, jobDescription) {
    const prompt = `
  You are an AI resume analyzer.
  
  Compare the resume against the job description.
  
  Return ONLY valid JSON. Do not include markdown. Do not include explanation outside JSON.
  
  Required JSON structure:
  {
    "matchScore": number,
    "summary": string,
    "strengths": string[],
    "skillGaps": string[],
    "atsKeywords": string[],
    "rewrittenBullets": string[],
    "interviewQuestions": string[],
    "cloudExplanation": {
      "awsServicesUsed": string[],
      "aiTechniquesUsed": string[],
      "dataFlow": string[]
    }
  }
  
  Resume:
  ${resumeText}
  
  Job Description:
  ${jobDescription}
  `;
  
    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: [
              {
                text: prompt,
              },
            ],
          },
        ],
        inferenceConfig: {
          max_new_tokens: 2000,
          temperature: 0.2,
        },
      }),
    });
  
    const response = await client.send(command);
  
    const responseBody = JSON.parse(
      Buffer.from(response.body).toString("utf8")
    );
  
    const text = responseBody.output.message.content[0].text;
  
    console.log("Nova raw response:");
    console.log(text);
  
    return JSON.parse(extractJson(text));
  }
  
  module.exports = {
    analyzeResumeWithBedrock,
  };