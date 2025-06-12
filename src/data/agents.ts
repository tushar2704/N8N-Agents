// N8N Agents Directory Data Structure
// This file contains the structured data representing all available N8N workflows

export interface WorkflowFile {
  name: string
  filename: string
  type: 'json' | 'txt'
  description?: string
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  workflows: WorkflowFile[]
  count: number
}

/**
 * Complete N8N Agents Directory Data
 * Generated from the actual directory structure
 */
export const categories: Category[] = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    description: 'Intelligent automation workflows powered by AI and ML technologies',
    icon: '🤖',
    count: 10,
    workflows: [
      { name: 'Auto-tag Blog Posts', filename: 'auto-tag_blog_posts.json', type: 'json' },
      { name: 'Customer Sentiment Analysis', filename: 'customer_sentiment_analysis.json', type: 'json' },
      { name: 'Daily Content Ideas', filename: 'daily_content_ideas.json', type: 'json' },
      { name: 'Image Captioning', filename: 'image_captioning.json', type: 'json' },
      { name: 'Product Description Generator', filename: 'product_description_generator.json', type: 'json' },
      { name: 'Resume Screening', filename: 'resume_screening.json', type: 'json' },
      { name: 'Summarize Customer Emails', filename: 'summarize_customer_emails.json', type: 'json' },
      { name: 'Ticket Urgency Classification', filename: 'ticket_urgency_classification.json', type: 'json' },
      { name: 'Translate Form Submissions', filename: 'translate_form_submissions.json', type: 'json' },
      { name: 'Voice Note Transcription', filename: 'voice_note_transcription.json', type: 'json' }
    ]
  },
  {
    id: 'ai-research',
    name: 'AI Research & Data Analysis',
    description: 'Advanced AI research workflows with RAG, vector databases, and data analysis',
    icon: '🔬',
    count: 35,
    workflows: [
      { name: 'Analyze TradingView Charts with Chrome Extension', filename: 'Analyze tradingview.com charts with Chrome extension, N8N and OpenAI.txt', type: 'txt' },
      { name: 'Automated Hugging Face Paper Summary', filename: 'Automated Hugging Face Paper Summary Fetching & Categorization Workflow.txt', type: 'txt' },
      { name: 'Autonomous AI Crawler', filename: 'Autonomous AI crawler.txt', type: 'txt' },
      { name: 'Build Image Search with AI Object Detection', filename: 'Build Your Own Image Search Using AI Object Detection, CDN and ElasticSearchBuild Your Own Image Search Using AI Object Detection, CDN and ElasticSearch.txt', type: 'txt' },
      { name: 'Financial Documents Assistant with Qdrant', filename: 'Build a Financial Documents Assistant using Qdrant and Mistral.ai.txt', type: 'txt' }
    ]
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    description: 'Smart farming and agricultural automation workflows',
    icon: '🌾',
    count: 10,
    workflows: [
      { name: 'Commodity Price Tracker', filename: 'commodity_price_tracker.json', type: 'json' },
      { name: 'Crop Yield Predictor', filename: 'crop_yield_predictor.json', type: 'json' },
      { name: 'Drone Image Crop Health', filename: 'drone_image_crop_health.json', type: 'json' },
      { name: 'Farm Equipment Maintenance Reminder', filename: 'farm_equipment_maintenance_reminder.json', type: 'json' },
      { name: 'Greenhouse Climate Controller', filename: 'greenhouse_climate_controller.json', type: 'json' },
      { name: 'Harvest Logbook', filename: 'harvest_logbook.json', type: 'json' },
      { name: 'Irrigation Schedule Optimizer', filename: 'irrigation_schedule_optimizer.json', type: 'json' },
      { name: 'Pest Outbreak Alert', filename: 'pest_outbreak_alert.json', type: 'json' },
      { name: 'Soil Nutrient Analysis', filename: 'soil_nutrient_analysis.json', type: 'json' },
      { name: 'Weather Impact Report', filename: 'weather_impact_report.json', type: 'json' }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Connected car and automotive industry automation workflows',
    icon: '🚗',
    count: 10,
    workflows: [
      { name: 'ADAS Event Annotator', filename: 'adas_event_annotator.json', type: 'json' },
      { name: 'Autonomous Vehicle Log Summarizer', filename: 'autonomous_vehicle_log_summarizer.json', type: 'json' },
      { name: 'Car Insurance Quote Generator', filename: 'car_insurance_quote_generator.json', type: 'json' },
      { name: 'Connected Car Alert', filename: 'connected_car_alert.json', type: 'json' },
      { name: 'Dealer Lead Qualifier', filename: 'dealer_lead_qualifier.json', type: 'json' },
      { name: 'EV Battery Degradation Report', filename: 'ev_battery_degradation_report.json', type: 'json' },
      { name: 'Fleet Fuel Efficiency Report', filename: 'fleet_fuel_efficiency_report.json', type: 'json' },
      { name: 'Recall Notice Tracker', filename: 'recall_notice_tracker.json', type: 'json' },
      { name: 'Ride-share Surge Predictor', filename: 'ride‑share_surge_predictor.json', type: 'json' },
      { name: 'VIN Decoder', filename: 'vin_decoder.json', type: 'json' }
    ]
  },
  {
    id: 'email-automation',
    name: 'Email Automation',
    description: 'Powerful email processing and automation workflows',
    icon: '📧',
    count: 10,
    workflows: [
      { name: 'Auto Archive Promotions', filename: 'auto_archive_promotions.json', type: 'json' },
      { name: 'Auto Reply to FAQs', filename: 'auto_reply_to_faqs.json', type: 'json' },
      { name: 'Daily Email Digest', filename: 'daily_email_digest.json', type: 'json' },
      { name: 'Follow-up Emails', filename: 'follow-up_emails.json', type: 'json' },
      { name: 'Forward Attachments', filename: 'forward_attachments.json', type: 'json' },
      { name: 'Lead to HubSpot', filename: 'lead_to_hubspot.json', type: 'json' },
      { name: 'MailChimp Campaign Tracking', filename: 'mailchimp_campaign_tracking.json', type: 'json' },
      { name: 'Parse Invoice Emails', filename: 'parse_invoice_emails.json', type: 'json' },
      { name: 'Product Launch Email', filename: 'product_launch_email.json', type: 'json' },
      { name: 'SendGrid Bounce Alert', filename: 'sendgrid_bounce_alert.json', type: 'json' }
    ]
  },
  {
    id: 'finance-accounting',
    name: 'Finance & Accounting',
    description: 'Financial automation and accounting workflow solutions',
    icon: '💰',
    count: 8,
    workflows: [
      { name: 'Currency Rate Monitor', filename: 'currency_rate_monitor.json', type: 'json' },
      { name: 'Monthly Expense Report', filename: 'monthly_expense_report.json', type: 'json' },
      { name: 'OCR Receipts to Notion', filename: 'ocr_receipts_to_notion.json', type: 'json' },
      { name: 'PayPal to Airtable', filename: 'paypal_to_airtable.json', type: 'json' },
      { name: 'Stripe to QuickBooks', filename: 'stripe_to_quickbooks.json', type: 'json' },
      { name: 'Transaction Logs Backup', filename: 'transaction_logs_backup.json', type: 'json' },
      { name: 'Unpaid Invoice Reminder', filename: 'unpaid_invoice_reminder.json', type: 'json' },
      { name: 'Weekly Shopify Sales Summary', filename: 'weekly_shopify_sales_summary.json', type: 'json' }
    ]
  },
  {
    id: 'gaming',
    name: 'Gaming',
    description: 'Gaming industry automation and community management workflows',
    icon: '🎮',
    count: 10,
    workflows: [
      { name: 'Achievement Suggestion Engine', filename: 'achievement_suggestion_engine.json', type: 'json' },
      { name: 'Discord Guild Welcome Bot', filename: 'discord_guild_welcome_bot.json', type: 'json' },
      { name: 'Esports Match Alert', filename: 'esports_match_alert.json', type: 'json' },
      { name: 'Game Bug Triage', filename: 'game_bug_triage.json', type: 'json' },
      { name: 'In-game Event Reminder', filename: 'in‑game_event_reminder.json', type: 'json' },
      { name: 'Loot-box Probability Calculator', filename: 'loot‑box_probability_calculator.json', type: 'json' },
      { name: 'Patch Note Summarizer', filename: 'patch_note_summarizer.json', type: 'json' },
      { name: 'Player Sentiment Dashboard', filename: 'player_sentiment_dashboard.json', type: 'json' },
      { name: 'Twitch Clip Highlights Script', filename: 'twitch_clip_highlights_script.json', type: 'json' },
      { name: 'Virtual Economy Price Tracker', filename: 'virtual_economy_price_tracker.json', type: 'json' }
    ]
  },
  {
    id: 'energy',
    name: 'Energy',
    description: 'Energy management and renewable energy automation workflows',
    icon: '⚡',
    count: 10,
    workflows: [
      { name: 'Battery Health Monitor', filename: 'battery_health_monitor.json', type: 'json' },
      { name: 'Carbon Footprint Estimator', filename: 'carbon_footprint_estimator.json', type: 'json' },
      { name: 'Energy Consumption Anomaly Detector', filename: 'energy_consumption_anomaly_detector.json', type: 'json' },
      { name: 'EV Charging Station Locator', filename: 'ev_charging_station_locator.json', type: 'json' },
      { name: 'Fuel Price Monitor', filename: 'fuel_price_monitor.json', type: 'json' },
      { name: 'Grid Load Alert', filename: 'grid_load_alert.json', type: 'json' },
      { name: 'Power Outage SMS', filename: 'power_outage_sms.json', type: 'json' },
      { name: 'Renewable Incentive Tracker', filename: 'renewable_incentive_tracker.json', type: 'json' },
      { name: 'Solar Output Forecaster', filename: 'solar_output_forecaster.json', type: 'json' },
      { name: 'Wind Farm Maintenance Scheduler', filename: 'wind_farm_maintenance_scheduler.json', type: 'json' }
    ]
  }
]

/**
 * Get all categories with their workflow counts
 */
export function getAllCategories(): Category[] {
  return categories
}

/**
 * Get a specific category by ID
 */
export function getCategoryById(id: string): Category | undefined {
  return categories.find(category => category.id === id)
}

/**
 * Get total number of workflows across all categories
 */
export function getTotalWorkflowCount(): number {
  return categories.reduce((total, category) => total + category.count, 0)
}

/**
 * Search workflows across all categories
 */
export function searchWorkflows(query: string): { category: Category; workflow: WorkflowFile }[] {
  const results: { category: Category; workflow: WorkflowFile }[] = []
  const lowercaseQuery = query.toLowerCase()
  
  categories.forEach(category => {
    category.workflows.forEach(workflow => {
      if (workflow.name.toLowerCase().includes(lowercaseQuery) ||
          workflow.filename.toLowerCase().includes(lowercaseQuery)) {
        results.push({ category, workflow })
      }
    })
  })
  
  return results
}