
# Screenplay Writer Application

![Screenplay Writer Logo](https://i.imgur.com/xRv5T3U.png)

A modern, intuitive web application for writing and managing film and TV screenplays with real-time voice-to-text capability.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [Understanding Screenplay Format](#understanding-screenplay-format)
5. [How to Use the App](#how-to-use-the-app)
6. [Voice-to-Text Feature](#voice-to-text-feature)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Saving and Exporting](#saving-and-exporting)
9. [Technical Details](#technical-details)
10. [Support & Feedback](#support--feedback)

## Introduction

Screenplay Writer is a powerful tool designed for both amateur and professional screenwriters. It automatically formats your screenplay according to industry standards while providing an intuitive interface and collaborative features to streamline your creative process.

## Getting Started

1. **Create an Account**: Sign up or log in to save your work and access it from any device.
2. **Create a New Script**: Click "New Script" to start a fresh screenplay.
3. **Start Writing**: Add scenes and begin crafting your story.

## Features

- **Real-time formatting**: Automatic industry-standard screenplay formatting
- **Voice-to-Text**: Dictate your screenplay in English or Tamil
- **Scene Management**: Easily add, edit, and rearrange scenes
- **Cloud Saving**: All your work is automatically saved
- **Export to PDF**: Generate professional-looking PDF documents
- **Drag & Drop Scenes**: Rearrange scenes by dragging them to new positions
- **Multi-language Support**: Voice dictation in English and Tamil

## Understanding Screenplay Format

### Script Elements

A screenplay consists of several standard elements:

1. **Scene Heading (Slug Line)**: Describes the location and time of day
2. **Action**: Describes what happens in the scene
3. **Character**: The name of the character who speaks
4. **Dialogue**: The words spoken by a character
5. **Parenthetical**: Direction for how dialogue should be delivered
6. **Transition**: Indicates how we move from one scene to another

### Scene Heading Format

Scene headings follow a specific format:

```
INT./EXT. LOCATION - TIME OF DAY
```

For example:
- `INT. KITCHEN - DAY` (Interior scene in a kitchen during the day)
- `EXT. BEACH - SUNSET` (Exterior scene at a beach during sunset)
- `INT./EXT. CAR - NIGHT` (Scene that includes both inside and outside of a car at night)

#### Components Explained:

- **INT.** stands for "interior" – a scene that takes place indoors
- **EXT.** stands for "exterior" – a scene that takes place outdoors
- **LOCATION** is where the scene takes place (e.g., LIVING ROOM, PARK, OFFICE)
- **TIME OF DAY** typically includes: DAY, NIGHT, MORNING, EVENING, DUSK, DAWN, etc.

## How to Use the App

### Creating a New Scene

1. Click the "Add Scene" button
2. Start with a scene heading (e.g., "INT. BEDROOM - NIGHT")
3. Add action descriptions
4. Add character names and dialogue

### Editing a Scene

1. Click the pencil icon on any scene card
2. Modify any element (scene heading, action, character, dialogue)
3. Click "Done" to save changes

### Example Workflow

Here's a simple example of creating a scene:

1. Add a scene heading: `INT. COFFEE SHOP - MORNING`
2. Add an action: `The café is bustling with morning customers. SARAH (30s, professional) sits alone at a corner table, typing intensely on her laptop.`
3. Add a character: `BARISTA`
4. Add dialogue: `Your usual today, Sarah?`
5. Add another character: `SARAH`
6. Add dialogue: `Yes, please. And maybe something stronger than coffee.`

### Scene Types Explained

- **Scene Heading**: Establishes where and when the scene takes place
- **Action**: Describes what happens (visual elements, character movements, etc.)
- **Character**: Names should be in ALL CAPS when first introduced
- **Dialogue**: The words spoken by characters
- **Parenthetical**: Direction for how dialogue is delivered (e.g., `(whispering)`)
- **Transition**: How we move to the next scene (e.g., CUT TO:, DISSOLVE TO:)

## Voice-to-Text Feature

Our application includes a powerful voice dictation feature that allows you to speak your screenplay rather than typing it:

1. Click the microphone icon next to any text field
2. Select your preferred language (English or Tamil)
3. Start speaking clearly
4. The text will appear in real-time
5. Click the stop button (microphone with a slash) when finished

### Language Support

- **English (en-US)**: American English
- **Tamil (ta-IN)**: Tamil language

## Keyboard Shortcuts

- `Tab`: Move between elements
- `Enter`: Create a new element
- `Ctrl+S`: Save script
- `Ctrl+E`: Export to PDF
- `Ctrl+N`: New scene

## Saving and Exporting

### Saving Your Script

- Scripts are automatically saved to the cloud when logged in
- Click the "Save" button to manually save your work

### Exporting to PDF

- Click the "Export" button in the header
- Your screenplay will be formatted according to industry standards
- The PDF will be generated for download

## Technical Details

This application is built with:

- React for the user interface
- Firebase for authentication and data storage
- Web Speech API for voice recognition
- PDF generation for exports
- Tailwind CSS and shadcn/ui for styling

## Support & Feedback

For support or to provide feedback, please contact us at support@screenplaywriter.com

---

© 2025 Screenplay Writer. All rights reserved.
