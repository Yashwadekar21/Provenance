window.MOCK_RESPONSES = [
  {
    triggers: ["gcp", "aws", "cloud"],
    confidence: "92%",
    answer: "Google Cloud Platform (GCP) was selected over AWS primarily due to lower projected operating cost, stronger Kubernetes alignment, and simpler team ownership.",
    chain: [
      "[Rising infra costs]",
      "[Evaluate AWS vs GCP]",
      "[GCP scored better on K8s + cost]",
      "[Decision: Adopt GCP]"
    ],
    sources: [
      { label: "Slack Thread #123", href: "#" },
      { label: "Gmail: Vendor Selection", href: "#" },
      { label: "DevOps Meeting (02/10/2024)", href: "#" }
    ],
    graph: {
      center: "Decision: GCP",
      reasons: ["Lower Cost", "K8s Integration", "Easy Ownership"]
    },
    suggestions: [
      "Why did we reject AWS reserved pricing?",
      "Who approved the final cloud migration?",
      "What risks were identified for GCP?"
    ]
  },
  {
    triggers: ["stripe", "paypal", "payment"],
    confidence: "89%",
    answer: "Stripe was chosen over PayPal because of better API ergonomics, cleaner subscription workflows, and stronger webhook reliability for our backend.",
    chain: [
      "[Checkout failures increased]",
      "[Stripe vs PayPal trial]",
      "[Stripe had better developer velocity]",
      "[Decision: Standardize on Stripe]"
    ],
    sources: [
      { label: "Slack: #payments-arch", href: "#" },
      { label: "Email: Finance vendor review", href: "#" }
    ],
    graph: {
      center: "Decision: Stripe",
      reasons: ["API Simplicity", "Webhook Reliability", "Subscription Fit"]
    },
    suggestions: [
      "What alternatives were rejected?",
      "What was the migration timeline?"
    ]
  }
];

window.DEFAULT_RESPONSE = {
  confidence: "84%",
  answer: "I found relevant internal decision context. The selected option optimized long-term maintainability, cost, and delivery speed given team constraints.",
  chain: [
    "[Problem identified]",
    "[Alternatives reviewed]",
    "[Trade-offs documented]",
    "[Final decision approved]"
  ],
  sources: [
    { label: "Slack: #engineering", href: "#" },
    { label: "Gmail: Architecture thread", href: "#" }
  ],
  graph: {
    center: "Decision",
    reasons: ["Cost", "Reliability", "Delivery Speed"]
  },
  suggestions: [
    "What evidence supported this decision?",
    "Which team members were involved?"
  ]
};
