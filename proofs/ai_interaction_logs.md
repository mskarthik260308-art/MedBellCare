# Google AI Usage & Architecture Logs

## Overview
This document summarizes how Google AI models (Gemini 2.5 Pro / Flash & Speech Engine) were utilized to design, build, and optimize **MedBellCare**.

## AI Interaction Prompts & Workflows

### 1. Senior-Accessible UI & Architecture Design
- **Prompt Objective**: Design a senior-friendly UI for medication management with custom pill graphics, high-contrast dark theme, and family caregiver remote monitoring.
- **AI Contribution**: 
  - Modeled color palette (Emerald, Cyan, Amber, Rose, Purple) and dark slate glassmorphism layout tokens.
  - Recommended oversized touch targets, distinct pill shapes (Capsule, Tablet, Oval, Hexagon, Liquid, Inhaler), and live preview renderers.

### 2. Audio & Voice Synthesis Integration
- **Prompt Objective**: Integrate voice-guided medicine reminders using Google Web Speech API and custom voice recording.
- **AI Contribution**:
  - Structured `speechService.js` to parse prescription parameters (`name`, `dosage`, `notes`) into natural spoken sentences.
  - Integrated Web Audio API chime synthesis for fallback alarms.

### 3. Clinical Vitals & Analytics
- **Prompt Objective**: Build dynamic adherence tracking, vitals log, and doctor PDF report generation.
- **AI Contribution**:
  - Designed real-time adherence calculation algorithms for 7-day, 30-day, and all-time compliance.
  - Formatted print-friendly CSS and HTML structure for physician consult reports.
