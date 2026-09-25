export type Category =
  "Models" | "Code" | "Data" | "Media" | "Robotics" | "Enterprise";
export type ValuationType =
  | "Confirmed funding round"
  | "Tender offer"
  | "Secondary transaction"
  | "Reported fundraising discussions"
  | "Acquisition valuation"
  | "Estimate";
export interface Valuation {
  amount: number;
  date: string;
  type: ValuationType;
  source: string;
  sourceUrl: string;
  round: string;
  raised?: number;
}
export interface Company {
  id: string;
  name: string;
  domain: string;
  category: Category;
  founded: number;
  description: string;
  buildingSeed: number;
  history: Valuation[];
  investors: string[];
  employees: number | null;
  revenue: number | null;
}
export const SNAPSHOT = "2025-09-30";
export const districts: Record<
  Category,
  { color: string; center: [number, number]; label: string }
> = {
  Models: { color: "#8bd9bd", center: [-30, -36], label: "MODEL DISTRICT" },
  Code: { color: "#a59bea", center: [30, -36], label: "DEV DISTRICT" },
  Data: { color: "#83b9dd", center: [-30, 12], label: "DATA DISTRICT" },
  Media: { color: "#e4ac92", center: [30, 12], label: "MEDIA DISTRICT" },
  Robotics: { color: "#d7c388", center: [-30, 52], label: "ROBOTICS DISTRICT" },
  Enterprise: {
    color: "#8fbcac",
    center: [30, 52],
    label: "ENTERPRISE DISTRICT",
  },
};
const v = (
  amount: number,
  date: string,
  sourceUrl: string,
  round: string,
  raised?: number,
  type: ValuationType = "Confirmed funding round",
): Valuation => ({
  amount,
  date,
  sourceUrl,
  source: new URL(sourceUrl).hostname.replace("www.", ""),
  round,
  raised,
  type,
});
const c = (
  id: string,
  name: string,
  domain: string,
  category: Category,
  founded: number,
  description: string,
  history: Valuation[],
  investors: string[],
): Company => ({
  id,
  name,
  domain,
  category,
  founded,
  description,
  history,
  investors,
  buildingSeed:
    [...id].reduce((a, x) => (Math.imul(a, 31) + x.charCodeAt(0)) >>> 0, 7) >>>
    0,
  employees: null,
  revenue: null,
});
export const companies: Company[] = [
  c(
    "openai",
    "OpenAI",
    "openai.com",
    "Models",
    2015,
    "Frontier intelligence. Models and tools that power a new generation of software.",
    [
      v(
        157,
        "2024-10-02",
        "https://openai.com/index/scale-the-benefits-of-ai/",
        "Funding round",
        6.6,
      ),
      v(
        300,
        "2025-03-31",
        "https://openai.com/index/march-funding-updates/",
        "Announced financing",
        40,
      ),
    ],
    ["SoftBank", "Microsoft", "Thrive Capital"],
  ),
  c(
    "anthropic",
    "Anthropic",
    "anthropic.com",
    "Models",
    2021,
    "AI research and safety. The team behind Claude.",
    [
      v(
        61.5,
        "2025-03-03",
        "https://www.anthropic.com/news/series-e",
        "Series E",
        3.5,
      ),
      v(
        183,
        "2025-09-02",
        "https://www.anthropic.com/news/anthropic-raises-series-f-at-usd183b-post-money-valuation",
        "Series F",
        13,
      ),
    ],
    ["ICONIQ", "Fidelity", "Lightspeed"],
  ),
  c(
    "xai",
    "xAI",
    "x.ai",
    "Models",
    2023,
    "Frontier models and large-scale compute, creators of Grok.",
    [
      v(
        45,
        "2024-12-25",
        "https://www.kingdom.com.sa/news/kingdom-holding-company-increases-investment-in-xai-to-usd-800-million-in-series-c-financing-round",
        "Series C",
        6,
      ),
      v(
        80,
        "2025-03-28",
        "https://www.axios.com/2025/03/28/musk-x-xai",
        "X combination",
        undefined,
        "Acquisition valuation",
      ),
    ],
    ["a16z", "Sequoia", "Kingdom Holding"],
  ),
  c(
    "mistral",
    "Mistral AI",
    "mistral.ai",
    "Models",
    2023,
    "Open-weight models and enterprise intelligence from Paris.",
    [
      v(
        6.2,
        "2024-06-11",
        "https://www.cnbc.com/2024/06/11/mistral-ai-raises-645-million-at-a-6-billion-valuation.html",
        "Series B",
        0.645,
      ),
    ],
    ["General Catalyst", "a16z"],
  ),
  c(
    "cohere",
    "Cohere",
    "cohere.com",
    "Models",
    2019,
    "Secure language models built for enterprise work.",
    [v(5.5, "2024-07-22", "https://cohere.com/blog/series-d", "Series D", 0.5)],
    ["PSP Investments", "NVIDIA"],
  ),
  c(
    "cursor",
    "Cursor",
    "cursor.com",
    "Code",
    2022,
    "An AI-native code editor, built by Anysphere.",
    [
      v(
        2.5,
        "2025-01-16",
        "https://cursor.com/blog/series-b",
        "Series B",
        0.105,
      ),
      v(9.9, "2025-06-06", "https://cursor.com/blog/series-c", "Series C", 0.9),
    ],
    ["Thrive", "Accel", "a16z"],
  ),
  c(
    "replit",
    "Replit",
    "replit.com",
    "Code",
    2016,
    "Turn ideas into software with collaborative AI development.",
    [
      v(
        1.16,
        "2023-04-25",
        "https://blog.replit.com/b-extension",
        "Series B extension",
        0.0974,
      ),
    ],
    ["a16z", "Khosla Ventures"],
  ),
  c(
    "cognition",
    "Cognition",
    "cognition.ai",
    "Code",
    2023,
    "Applied AI research and autonomous software engineering.",
    [
      v(
        2,
        "2024-04-24",
        "https://www.cognition.ai/blog/funding",
        "Series B",
        0.175,
      ),
    ],
    ["Founders Fund"],
  ),
  c(
    "databricks",
    "Databricks",
    "databricks.com",
    "Data",
    2013,
    "A unified platform for data, analytics and artificial intelligence.",
    [
      v(
        43,
        "2023-09-14",
        "https://www.databricks.com/company/newsroom/press-releases/databricks-raises-over-500-million-series-i-funding-43-billion",
        "Series I",
        0.5,
      ),
      v(
        62,
        "2024-12-17",
        "https://www.databricks.com/company/newsroom/press-releases/databricks-raising-10b-series-j-investment-62b-valuation",
        "Series J",
        10,
      ),
    ],
    ["Thrive", "a16z", "Insight Partners"],
  ),
  c(
    "scale",
    "Scale AI",
    "scale.com",
    "Data",
    2016,
    "Data infrastructure and evaluation for frontier AI systems.",
    [v(13.8, "2024-05-21", "https://scale.com/blog/series-f", "Series F", 1)],
    ["Accel", "NVIDIA", "Amazon"],
  ),
  c(
    "together",
    "Together AI",
    "together.ai",
    "Data",
    2022,
    "Cloud infrastructure for open-source model training and inference.",
    [
      v(
        3.3,
        "2025-02-20",
        "https://www.prnewswire.com/news-releases/together-ai-raises-305m-series-b-to-scale-ai-acceleration-cloud-for-open-source-and-enterprise-ai-302380967.html",
        "Series B",
        0.305,
      ),
    ],
    ["General Catalyst", "Prosperity7"],
  ),
  c(
    "runway",
    "Runway",
    "runwayml.com",
    "Media",
    2018,
    "A new creative toolkit for moving images and world models.",
    [
      v(
        3,
        "2025-04-03",
        "https://runwayml.com/news/runway-series-d-funding",
        "Series D",
        0.308,
      ),
    ],
    ["General Atlantic", "NVIDIA"],
  ),
  c(
    "elevenlabs",
    "ElevenLabs",
    "elevenlabs.io",
    "Media",
    2022,
    "Expressive voice synthesis and a platform for AI audio.",
    [
      v(
        3.3,
        "2025-01-30",
        "https://elevenlabs.io/blog/series-c",
        "Series C",
        0.18,
      ),
      v(
        6.6,
        "2025-09-08",
        "https://elevenlabs.io/blog/announcing-an-employee-tender",
        "Announced employee tender",
        undefined,
        "Tender offer",
      ),
    ],
    ["a16z", "ICONIQ"],
  ),
  c(
    "synthesia",
    "Synthesia",
    "synthesia.io",
    "Media",
    2017,
    "AI video communication with realistic digital avatars.",
    [
      v(
        2.1,
        "2025-01-15",
        "https://www.synthesia.io/post/series-d",
        "Series D",
        0.18,
      ),
    ],
    ["NEA", "GV"],
  ),
  c(
    "suno",
    "Suno",
    "suno.com",
    "Media",
    2022,
    "Generative music tools that turn ideas into songs.",
    [
      v(
        0.5,
        "2024-05-21",
        "https://www.axios.com/2024/05/21/suno-ai-music-funding",
        "Series B",
        0.125,
      ),
    ],
    ["Lightspeed", "Founder Collective"],
  ),
  c(
    "figure",
    "Figure",
    "figure.ai",
    "Robotics",
    2022,
    "General-purpose humanoid robots for the physical world.",
    [
      v(
        2.6,
        "2024-02-29",
        "https://www.figure.ai/news/series-b",
        "Series B",
        0.675,
      ),
      v(
        39,
        "2025-09-16",
        "https://www.figure.ai/news/series-c",
        "Committed Series C",
        1,
      ),
    ],
    ["Parkway", "Brookfield", "NVIDIA"],
  ),
  c(
    "physical",
    "Physical Intelligence",
    "physicalintelligence.company",
    "Robotics",
    2024,
    "General-purpose robot foundation models.",
    [
      v(
        2.4,
        "2024-11-04",
        "https://www.physicalintelligence.company/blog/financing",
        "Seed financing",
        0.4,
      ),
    ],
    ["Thrive", "Lux", "Jeff Bezos"],
  ),
  c(
    "anduril",
    "Anduril",
    "anduril.com",
    "Robotics",
    2017,
    "Autonomous systems and advanced defense manufacturing.",
    [
      v(
        14,
        "2024-08-07",
        "https://www.anduril.com/article/anduril-raises-1-5-billion-to-rebuild-the-arsenal-of-democracy/",
        "Series F",
        1.5,
      ),
    ],
    ["Founders Fund", "Sands Capital"],
  ),
  c(
    "harvey",
    "Harvey",
    "harvey.ai",
    "Enterprise",
    2022,
    "Professional-grade AI for complex legal work.",
    [
      v(
        5,
        "2025-06-23",
        "https://www.harvey.ai/blog/harvey-raises-series-e",
        "Series E",
        0.3,
      ),
    ],
    ["Kleiner Perkins", "Coatue"],
  ),
  c(
    "glean",
    "Glean",
    "glean.com",
    "Enterprise",
    2019,
    "Connect enterprise knowledge with AI search and agents.",
    [
      v(
        7.2,
        "2025-06-10",
        "https://www.glean.com/press/glean-raises-150m-series-f-at-7-2b-valuation-to-accelerate-enterprise-ai-agent-innovation-globally",
        "Series F",
        0.15,
      ),
    ],
    ["Wellington", "Sequoia"],
  ),
];
