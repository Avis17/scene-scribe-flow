
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

const HelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Screenplay Writer Help Guide</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full pr-4">
          <div className="prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 max-w-none">
            <h1 className="flex items-center">
              Screenplay Writer Application
              <img src="https://i.imgur.com/xRv5T3U.png" alt="Logo" className="ml-3 h-8" />
            </h1>

            <p>A modern, intuitive web application for writing and managing film and TV screenplays with real-time voice-to-text capability.</p>

            <h2>Table of Contents</h2>
            <ol>
              <li><a href="#introduction">Introduction</a></li>
              <li><a href="#getting-started">Getting Started</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#understanding-screenplay-format">Understanding Screenplay Format</a></li>
              <li><a href="#how-to-use-the-app">How to Use the App</a></li>
              <li><a href="#voice-to-text-feature">Voice-to-Text Feature</a></li>
              <li><a href="#keyboard-shortcuts">Keyboard Shortcuts</a></li>
              <li><a href="#saving-and-exporting">Saving and Exporting</a></li>
              <li><a href="#technical-details">Technical Details</a></li>
              <li><a href="#support-feedback">Support & Feedback</a></li>
            </ol>

            <h2 id="introduction">Introduction</h2>
            <p>Screenplay Writer is a powerful tool designed for both amateur and professional screenwriters. It automatically formats your screenplay according to industry standards while providing an intuitive interface and collaborative features to streamline your creative process.</p>

            <h2 id="getting-started">Getting Started</h2>
            <ol>
              <li><strong>Create an Account</strong>: Sign up or log in to save your work and access it from any device.</li>
              <li><strong>Create a New Script</strong>: Click "New Script" to start a fresh screenplay.</li>
              <li><strong>Start Writing</strong>: Add scenes and begin crafting your story.</li>
            </ol>

            <h2 id="features">Features</h2>
            <ul>
              <li><strong>Real-time formatting</strong>: Automatic industry-standard screenplay formatting</li>
              <li><strong>Voice-to-Text</strong>: Dictate your screenplay in English or Tamil</li>
              <li><strong>Scene Management</strong>: Easily add, edit, and rearrange scenes</li>
              <li><strong>Cloud Saving</strong>: All your work is automatically saved</li>
              <li><strong>Export to PDF</strong>: Generate professional-looking PDF documents</li>
              <li><strong>Drag & Drop Scenes</strong>: Rearrange scenes by dragging them to new positions</li>
              <li><strong>Multi-language Support</strong>: Voice dictation in English and Tamil</li>
            </ul>

            <h2 id="understanding-screenplay-format">Understanding Screenplay Format</h2>
            
            <h3>Script Elements</h3>
            <p>A screenplay consists of several standard elements:</p>
            <ol>
              <li><strong>Scene Heading (Slug Line)</strong>: Describes the location and time of day</li>
              <li><strong>Action</strong>: Describes what happens in the scene</li>
              <li><strong>Character</strong>: The name of the character who speaks</li>
              <li><strong>Dialogue</strong>: The words spoken by a character</li>
              <li><strong>Parenthetical</strong>: Direction for how dialogue should be delivered</li>
              <li><strong>Transition</strong>: Indicates how we move from one scene to another</li>
            </ol>

            <h3>Scene Heading Format</h3>
            <p>Scene headings follow a specific format:</p>
            <pre><code>INT./EXT. LOCATION - TIME OF DAY</code></pre>
            <p>For example:</p>
            <ul>
              <li><code>INT. KITCHEN - DAY</code> (Interior scene in a kitchen during the day)</li>
              <li><code>EXT. BEACH - SUNSET</code> (Exterior scene at a beach during sunset)</li>
              <li><code>INT./EXT. CAR - NIGHT</code> (Scene that includes both inside and outside of a car at night)</li>
            </ul>

            <h4>Components Explained:</h4>
            <ul>
              <li><strong>INT.</strong> stands for "interior" – a scene that takes place indoors</li>
              <li><strong>EXT.</strong> stands for "exterior" – a scene that takes place outdoors</li>
              <li><strong>LOCATION</strong> is where the scene takes place (e.g., LIVING ROOM, PARK, OFFICE)</li>
              <li><strong>TIME OF DAY</strong> typically includes: DAY, NIGHT, MORNING, EVENING, DUSK, DAWN, etc.</li>
            </ul>

            <h2 id="how-to-use-the-app">How to Use the App</h2>

            <h3>Creating a New Scene</h3>
            <ol>
              <li>Click the "Add Scene" button</li>
              <li>Start with a scene heading (e.g., "INT. BEDROOM - NIGHT")</li>
              <li>Add action descriptions</li>
              <li>Add character names and dialogue</li>
            </ol>

            <h3>Editing a Scene</h3>
            <ol>
              <li>Click the pencil icon on any scene card</li>
              <li>Modify any element (scene heading, action, character, dialogue)</li>
              <li>Click "Done" to save changes</li>
            </ol>

            <h3>Example Workflow</h3>
            <p>Here's a simple example of creating a scene:</p>
            <ol>
              <li>Add a scene heading: <code>INT. COFFEE SHOP - MORNING</code></li>
              <li>Add an action: <code>The café is bustling with morning customers. SARAH (30s, professional) sits alone at a corner table, typing intensely on her laptop.</code></li>
              <li>Add a character: <code>BARISTA</code></li>
              <li>Add dialogue: <code>Your usual today, Sarah?</code></li>
              <li>Add another character: <code>SARAH</code></li>
              <li>Add dialogue: <code>Yes, please. And maybe something stronger than coffee.</code></li>
            </ol>

            <h3>Scene Types Explained</h3>
            <ul>
              <li><strong>Scene Heading</strong>: Establishes where and when the scene takes place</li>
              <li><strong>Action</strong>: Describes what happens (visual elements, character movements, etc.)</li>
              <li><strong>Character</strong>: Names should be in ALL CAPS when first introduced</li>
              <li><strong>Dialogue</strong>: The words spoken by characters</li>
              <li><strong>Parenthetical</strong>: Direction for how dialogue is delivered (e.g., <code>(whispering)</code>)</li>
              <li><strong>Transition</strong>: How we move to the next scene (e.g., CUT TO:, DISSOLVE TO:)</li>
            </ul>

            <h2 id="voice-to-text-feature">Voice-to-Text Feature</h2>
            <p>Our application includes a powerful voice dictation feature that allows you to speak your screenplay rather than typing it:</p>
            <ol>
              <li>Click the microphone icon next to any text field</li>
              <li>Select your preferred language (English or Tamil)</li>
              <li>Start speaking clearly</li>
              <li>The text will appear in real-time</li>
              <li>Click the stop button (microphone with a slash) when finished</li>
            </ol>

            <h3>Language Support</h3>
            <ul>
              <li><strong>English (en-US)</strong>: American English</li>
              <li><strong>Tamil (ta-IN)</strong>: Tamil language</li>
            </ul>

            <h2 id="keyboard-shortcuts">Keyboard Shortcuts</h2>
            <ul>
              <li><code>Tab</code>: Move between elements</li>
              <li><code>Enter</code>: Create a new element</li>
              <li><code>Ctrl+S</code>: Save script</li>
              <li><code>Ctrl+E</code>: Export to PDF</li>
              <li><code>Ctrl+N</code>: New scene</li>
            </ul>

            <h2 id="saving-and-exporting">Saving and Exporting</h2>

            <h3>Saving Your Script</h3>
            <ul>
              <li>Scripts are automatically saved to the cloud when logged in</li>
              <li>Click the "Save" button to manually save your work</li>
            </ul>

            <h3>Exporting to PDF</h3>
            <ul>
              <li>Click the "Export" button in the header</li>
              <li>Your screenplay will be formatted according to industry standards</li>
              <li>The PDF will be generated for download</li>
            </ul>

            <h2 id="technical-details">Technical Details</h2>
            <p>This application is built with:</p>
            <ul>
              <li>React for the user interface</li>
              <li>Firebase for authentication and data storage</li>
              <li>Web Speech API for voice recognition</li>
              <li>PDF generation for exports</li>
              <li>Tailwind CSS and shadcn/ui for styling</li>
            </ul>

            <h2 id="support-feedback">Support & Feedback</h2>
            <p>For support or to provide feedback, please contact us at support@screenplaywriter.com</p>

            <hr />

            <p className="text-sm">© 2025 Screenplay Writer. All rights reserved.</p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
