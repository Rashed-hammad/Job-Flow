import Anthropic from "@anthropic-ai/sdk";
import JobApplication from "../models/JobApplication.js";
import Cv from "../models/Cv.js";
import { getBucket } from "../config/gridfs.js";

const scoreSchema = {
  type: "object",
  properties: {
    score: {
      type: "integer",
      description: "Match score from 0 to 100, where 100 is a perfect match",
    },
    strengths: {
      type: "array",
      items: { type: "string" },
      description: "Specific ways the CV matches the job description",
    },
    gaps: {
      type: "array",
      items: { type: "string" },
      description: "Specific ways the CV falls short of the job description",
    },
    explanation: {
      type: "string",
      description: "A short overall summary explaining the score",
    },
  },
  required: ["score", "strengths", "gaps", "explanation"],
  additionalProperties: false,
};

export const scoreMatch = async (req, res, next) => {
  try {
    const job = await JobApplication.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!job) {
      return res.status(404).json({ message: "Job application not found" });
    }

    if (!job.jobDescription) {
      return res.status(400).json({
        message: "This job application has no job description to score against",
      });
    }

    const cv = await Cv.findOne({ _id: req.body.cvId, user: req.user._id });
    if (!cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    const chunks = [];
    await new Promise((resolve, reject) => {
      getBucket()
        .openDownloadStream(cv.fileId)
        .on("data", (chunk) => chunks.push(chunk))
        .on("error", reject)
        .on("end", resolve);
    });
    const pdfBase64 = Buffer.concat(chunks).toString("base64");

    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        format: { type: "json_schema", schema: scoreSchema },
        effort: "medium",
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text: `Here is a job description for a "${job.role}" role at "${job.company}":\n\n${job.jobDescription}\n\nScore how well the attached CV matches this job description. Be specific and honest about both strengths and gaps.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const result = JSON.parse(textBlock.text);

    res.json(result);
  } catch (error) {
    next(error);
  }
};
