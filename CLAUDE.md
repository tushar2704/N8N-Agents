# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of 200+ ready-to-import n8n workflow templates organized by industry and use case. The repository contains JSON workflow files and descriptive text files showing actual workflow configurations for n8n automation platform.

## Repository Structure

- **JSON Files**: n8n workflow templates (*.json) that can be directly imported into n8n
- **Text Files**: Detailed workflow descriptions and configurations (*.txt) 
- **Category Folders**: Organized by domain (AI_ML, Email_Automation, Social_Media, etc.)
- **README Files**: Each category has a README.md listing the tech stack used in each template

## File Types and Formats

### JSON Workflow Files
- Located in category folders (e.g., `AI_ML/`, `Email_Automation/`)
- Direct n8n imports with node configurations, credentials placeholders, and workflow logic
- Contain node definitions, connections, and parameter settings

### Text Workflow Files  
- Located in specialized folders (e.g., `OpenAI_and_LLMs/`, `Gmail_and_Email_Automation/`)
- Detailed workflow descriptions with complete JSON configurations
- Include setup instructions and use case explanations

## Technology Stack

The workflows utilize:
- **Vector Stores**: Pinecone, Weaviate, Supabase Vector, Redis
- **Embeddings**: OpenAI, Cohere, Hugging Face
- **LLM Chat**: OpenAI GPT-4(o), Anthropic Claude 3, Hugging Face Inference  
- **Memory**: Zep Memory, Window Buffer
- **Integrations**: Slack, Google Sheets, Airtable, Notion, Discord, Telegram, WhatsApp

## Working with Workflows

When examining workflows:
1. JSON files are n8n node configurations - focus on the "parameters" and "type" fields
2. Text files contain complete workflow exports with metadata
3. Check README.md files in each category for tech stack details
4. Many workflows are incomplete and marked as needing contribution

## Common Node Types

- `n8n-nodes-base.webhook` - HTTP triggers
- `@n8n/n8n-nodes-langchain` - AI/LLM operations
- Text splitters, embeddings, and vector store operations
- Integration nodes for various platforms (Gmail, Slack, etc.)