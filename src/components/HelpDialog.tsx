
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Book, Search, Mic, Keyboard, Save, FileDown, Code, MessageSquare, ScrollText } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const HelpDialog = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="h-4 w-4 mr-2" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" /> 
            Screenplay Writer Help Guide
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            <TabsTrigger value="overview" className="flex items-center gap-1">
              <ScrollText className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="format" className="flex items-center gap-1">
              <Code className="h-4 w-4" /> Screenplay Format
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-1">
              <Search className="h-4 w-4" /> How to Use
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-1">
              <Mic className="h-4 w-4" /> Voice Tools
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="flex items-center gap-1">
              <Keyboard className="h-4 w-4" /> Shortcuts
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-1">
              <FileDown className="h-4 w-4" /> Saving/Exporting
            </TabsTrigger>
          </TabsList>
          
          <div className="border rounded-lg p-1">
            <ScrollArea className="h-[65vh] pr-4">
              <div className="px-2 py-4">
                <TabsContent value="overview" className="prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 max-w-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="flex items-center gap-2 text-3xl font-bold mb-4 text-primary">
                        Screenplay Writer Application
                      </h1>
                      <p className="text-lg text-muted-foreground mb-6">
                        A modern, intuitive web application for writing and managing film and TV screenplays with real-time voice-to-text capability.
                      </p>
                    </div>
                    <img src="https://i.imgur.com/xRv5T3U.png" alt="Logo" className="w-20 h-20" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <Card className="border border-primary/20 shadow-sm">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                          <Search className="h-5 w-5 text-primary" /> Features Overview
                        </h3>
                        <ul className="list-disc pl-5 space-y-2">
                          <li><span className="font-medium">Real-time formatting</span>: Automatic industry-standard screenplay formatting</li>
                          <li><span className="font-medium">Voice-to-Text</span>: Dictate your screenplay in English or Tamil</li>
                          <li><span className="font-medium">Scene Management</span>: Easily add, edit, and rearrange scenes</li>
                          <li><span className="font-medium">Cloud Saving</span>: All your work is automatically saved</li>
                          <li><span className="font-medium">Export to PDF</span>: Generate professional-looking PDF documents</li>
                          <li><span className="font-medium">Multi-language Support</span>: Voice dictation in English and Tamil</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20 shadow-sm">
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                          <MessageSquare className="h-5 w-5 text-primary" /> Getting Started
                        </h3>
                        <ol className="list-decimal pl-5 space-y-3">
                          <li>
                            <span className="font-medium">Create an Account</span>
                            <p className="text-sm text-muted-foreground mt-1">Sign up or log in to save your work and access it from any device.</p>
                          </li>
                          <li>
                            <span className="font-medium">Create a New Script</span>
                            <p className="text-sm text-muted-foreground mt-1">Click "New Script" to start a fresh screenplay.</p>
                          </li>
                          <li>
                            <span className="font-medium">Start Writing</span>
                            <p className="text-sm text-muted-foreground mt-1">Add scenes and begin crafting your story.</p>
                          </li>
                        </ol>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 bg-muted/40 p-4 rounded-lg border border-muted">
                    <h3 className="text-lg font-medium mb-2">About This Guide</h3>
                    <p>
                      This guide provides comprehensive information about the Screenplay Writer application. 
                      Use the tabs above to navigate to specific sections about screenplay formatting, 
                      how to use the app, voice-to-text features, keyboard shortcuts, and more.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="format" className="prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 max-w-none">
                  <h2 className="text-2xl font-bold text-primary mb-4">Understanding Screenplay Format</h2>
                  
                  <p className="mb-6">
                    Proper screenplay formatting is essential in the film industry. Our app automatically formats your screenplay according to industry standards.
                  </p>
                  
                  <div className="bg-muted/40 p-4 rounded-lg border mb-6">
                    <h3 className="text-xl font-medium mb-2">Script Elements</h3>
                    <p>A screenplay consists of several standard elements:</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="font-bold text-primary">Scene Heading (Slug Line)</div>
                        <p className="text-sm">Describes the location and time of day</p>
                        <div className="mt-2 bg-background p-2 rounded font-mono text-xs border">INT. KITCHEN - DAY</div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="font-bold text-primary">Action</div>
                        <p className="text-sm">Describes what happens in the scene</p>
                        <div className="mt-2 bg-background p-2 rounded font-mono text-xs border">JOHN walks slowly to the window and peers outside.</div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="font-bold text-primary">Character</div>
                        <p className="text-sm">The name of the character who speaks</p>
                        <div className="mt-2 bg-background p-2 rounded font-mono text-xs border">SARAH</div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="font-bold text-primary">Dialogue</div>
                        <p className="text-sm">The words spoken by a character</p>
                        <div className="mt-2 bg-background p-2 rounded font-mono text-xs border">I don't think we should go in there.</div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="font-bold text-primary">Parenthetical</div>
                        <p className="text-sm">Direction for how dialogue should be delivered</p>
                        <div className="mt-2 bg-background p-2 rounded font-mono text-xs border">(whispering)</div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="font-bold text-primary">Transition</div>
                        <p className="text-sm">Indicates how we move from one scene to another</p>
                        <div className="mt-2 bg-background p-2 rounded font-mono text-xs border">CUT TO:</div>
                      </CardContent>
                    </Card>
                  </div>

                  <h3 className="text-xl font-medium mb-3">Scene Heading Format</h3>
                  <div className="mb-6">
                    <p className="mb-2">Scene headings follow a specific format:</p>
                    <div className="bg-background p-3 rounded-md font-mono text-sm border mb-2">
                      INT./EXT. LOCATION - TIME OF DAY
                    </div>
                    <p className="mt-4 mb-2">For example:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><code className="px-2 py-1 bg-background rounded border">INT. KITCHEN - DAY</code> (Interior scene in a kitchen during the day)</li>
                      <li><code className="px-2 py-1 bg-background rounded border">EXT. BEACH - SUNSET</code> (Exterior scene at a beach during sunset)</li>
                      <li><code className="px-2 py-1 bg-background rounded border">INT./EXT. CAR - NIGHT</code> (Scene that includes both inside and outside of a car at night)</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-4 rounded-lg border">
                    <h4 className="font-medium mb-2">Components Explained:</h4>
                    <ul className="list-disc pl-6 space-y-1">
                      <li><strong className="text-primary">INT.</strong> stands for "interior" – a scene that takes place indoors</li>
                      <li><strong className="text-primary">EXT.</strong> stands for "exterior" – a scene that takes place outdoors</li>
                      <li><strong className="text-primary">LOCATION</strong> is where the scene takes place (e.g., LIVING ROOM, PARK, OFFICE)</li>
                      <li><strong className="text-primary">TIME OF DAY</strong> typically includes: DAY, NIGHT, MORNING, EVENING, DUSK, DAWN, etc.</li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="usage" className="prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 max-w-none">
                  <h2 className="text-2xl font-bold text-primary mb-4">How to Use the App</h2>

                  <div className="space-y-6">
                    <section className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="text-xl font-medium mb-3">Creating a New Scene</h3>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Click the <span className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs">+ Add Scene</span> button</li>
                        <li>Start with a scene heading (e.g., "INT. BEDROOM - NIGHT")</li>
                        <li>Add action descriptions</li>
                        <li>Add character names and dialogue</li>
                      </ol>
                    </section>

                    <section className="bg-muted/30 p-4 rounded-lg border">
                      <h3 className="text-xl font-medium mb-3">Editing a Scene</h3>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Click the pencil icon on any scene card</li>
                        <li>Modify any element (scene heading, action, character, dialogue)</li>
                        <li>Click "Done" to save changes</li>
                      </ol>
                    </section>

                    <section>
                      <h3 className="text-xl font-medium mb-3">Example Workflow</h3>
                      <p className="mb-2">Here's a simple example of creating a scene:</p>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted px-4 py-2 font-medium">Create a Coffee Shop Scene</div>
                        <div className="p-4 space-y-4">
                          <div>
                            <div className="text-sm font-medium text-primary mb-1">1. Add a scene heading:</div>
                            <code className="block px-3 py-2 bg-background rounded border">INT. COFFEE SHOP - MORNING</code>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary mb-1">2. Add an action:</div>
                            <code className="block px-3 py-2 bg-background rounded border">The café is bustling with morning customers. SARAH (30s, professional) sits alone at a corner table, typing intensely on her laptop.</code>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary mb-1">3. Add a character:</div>
                            <code className="block px-3 py-2 bg-background rounded border">BARISTA</code>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary mb-1">4. Add dialogue:</div>
                            <code className="block px-3 py-2 bg-background rounded border">Your usual today, Sarah?</code>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary mb-1">5. Add another character:</div>
                            <code className="block px-3 py-2 bg-background rounded border">SARAH</code>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-primary mb-1">6. Add dialogue:</div>
                            <code className="block px-3 py-2 bg-background rounded border">Yes, please. And maybe something stronger than coffee.</code>
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 max-w-none">
                  <h2 className="text-2xl font-bold text-primary mb-4">Voice-to-Text Feature</h2>
                  
                  <div className="bg-muted/30 p-4 rounded-lg border mb-6">
                    <p className="text-lg">
                      Our application includes a powerful voice dictation feature that allows you to speak your screenplay rather than typing it.
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-medium mb-3">How to Use Voice Dictation</h3>
                    
                    <Card className="border border-primary/20 mb-4">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary rounded-full p-2 text-primary-foreground">
                            <Mic className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">Start Recording</h4>
                            <p className="text-sm text-muted-foreground">Click the microphone icon next to any text field</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary rounded-full p-2 text-secondary-foreground">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M19 10L5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Select Language</h4>
                            <p className="text-sm text-muted-foreground">Choose English or Tamil from the dropdown</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-muted rounded-full p-2">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Speak Clearly</h4>
                            <p className="text-sm text-muted-foreground">The text will appear in real-time as you speak</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-destructive rounded-full p-2 text-destructive-foreground">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 18.75C15.3137 18.75 18 16.0637 18 12.75V11.25M12 18.75C8.68629 18.75 6 16.0637 6 12.75V11.25M12 18.75V22.5M8.25 22.5H15.75M12 15.75C10.3431 15.75 9 14.4069 9 12.75V4.5C9 2.84315 10.3431 1.5 12 1.5C13.6569 1.5 15 2.84315 15 4.5V12.75C15 14.4069 13.6569 15.75 12 15.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="5" y1="19" x2="19" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Stop Recording</h4>
                            <p className="text-sm text-muted-foreground">Click the stop button when finished</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <h3 className="text-xl font-medium mb-3">Language Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="border border-primary/20">
                        <CardContent className="pt-6">
                          <h4 className="font-medium flex items-center gap-2">
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">en-US</span>
                            English (United States)
                          </h4>
                          <p className="text-sm text-muted-foreground mt-2">American English recognition for natural dictation.</p>
                        </CardContent>
                      </Card>
                      <Card className="border border-primary/20">
                        <CardContent className="pt-6">
                          <h4 className="font-medium flex items-center gap-2">
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">ta-IN</span>
                            Tamil (India)
                          </h4>
                          <p className="text-sm text-muted-foreground mt-2">Tamil language recognition for regional script writing.</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="shortcuts" className="prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 max-w-none">
                  <h2 className="text-2xl font-bold text-primary mb-4">Keyboard Shortcuts</h2>
                  
                  <p className="mb-6">
                    Speed up your workflow by using these keyboard shortcuts:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Save script</span>
                          <kbd className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted border rounded-md">Ctrl+S</kbd>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Export to PDF</span>
                          <kbd className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted border rounded-md">Ctrl+E</kbd>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">New scene</span>
                          <kbd className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted border rounded-md">Ctrl+N</kbd>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Move between elements</span>
                          <kbd className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted border rounded-md">Tab</kbd>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Create new element</span>
                          <kbd className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted border rounded-md">Enter</kbd>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="export" className="prose dark:prose-invert prose-headings:mb-2 prose-headings:mt-4 max-w-none">
                  <h2 className="text-2xl font-bold text-primary mb-4">Saving and Exporting</h2>
                  
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xl font-medium mb-3">Saving Your Script</h3>
                      <Card className="border border-primary/20">
                        <CardContent className="pt-6 flex gap-4">
                          <div className="bg-primary/10 rounded-full p-3 h-fit">
                            <Save className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="mb-3">Scripts are automatically saved to the cloud when you're logged in.</p>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>Your work is saved as you type</li>
                              <li>Click the <span className="font-medium">Save</span> button to manually save your work</li>
                              <li>All saved scripts appear in the "My Scripts" section</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </section>

                    <section>
                      <h3 className="text-xl font-medium mb-3">Exporting to PDF</h3>
                      <Card className="border border-primary/20">
                        <CardContent className="pt-6 flex gap-4">
                          <div className="bg-primary/10 rounded-full p-3 h-fit">
                            <FileDown className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="mb-3">Generate a properly formatted PDF of your screenplay:</p>
                            <ul className="list-disc pl-6 space-y-2">
                              <li>Click the <span className="font-medium">Export</span> button in the header</li>
                              <li>Your screenplay will be formatted according to industry standards</li>
                              <li>A print dialog will appear allowing you to save as PDF</li>
                              <li>The PDF will contain all your scenes with correct formatting</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </section>

                    <div className="bg-muted p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Formatting in Exports</h4>
                      <p className="text-sm">
                        When exporting to PDF, the application automatically applies industry-standard formatting:
                      </p>
                      <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                        <li>1-inch margins all around</li>
                        <li>12-point Courier font</li>
                        <li>Proper indentation for dialogue, character names, etc.</li>
                        <li>Scene headings in proper format and style</li>
                        <li>Page numbers in the upper right corner</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>
        
        <div className="mt-4 text-xs text-muted-foreground text-center border-t pt-2">
          © 2025 Screenplay Writer. All rights reserved.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;

